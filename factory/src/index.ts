import { Agent, callable, routeAgentRequest } from "agents";
import { selectHourlyBatch } from "./batcher";
import type { LearningCandidate, Outcome, ProjectProjection, WorkPackage } from "./contracts";

interface FactoryState {
  mode: "SHADOW" | "ACTIVE";
  hourlyScheduleId?: string;
  lastBatchAt?: string;
  lastBatchIds: string[];
}

export class ProductionFactoryAgent extends Agent<Cloudflare.Env, FactoryState> {
  initialState: FactoryState = {
    mode: "SHADOW",
    lastBatchIds: [],
  };

  async onStart() {
    this.sql`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        payload TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `;
    this.sql`
      CREATE TABLE IF NOT EXISTS work_packages (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        status TEXT NOT NULL,
        payload TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `;
    this.sql`
      CREATE TABLE IF NOT EXISTS outcomes (
        work_package_id TEXT PRIMARY KEY,
        payload TEXT NOT NULL,
        completed_at TEXT NOT NULL
      )
    `;
    this.sql`
      CREATE TABLE IF NOT EXISTS learning_candidates (
        id TEXT PRIMARY KEY,
        work_package_id TEXT NOT NULL,
        status TEXT NOT NULL,
        payload TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `;
    this.sql`
      CREATE TABLE IF NOT EXISTS write_locks (
        scope TEXT PRIMARY KEY,
        work_package_id TEXT NOT NULL,
        acquired_at TEXT NOT NULL,
        expires_at TEXT NOT NULL
      )
    `;

    if (!this.state.hourlyScheduleId) {
      const { id } = await this.schedule("0 * * * *", "runHour", {});
      this.setState({ ...this.state, hourlyScheduleId: id });
    }
  }

  @callable()
  setMode(mode: "SHADOW" | "ACTIVE") {
    this.setState({ ...this.state, mode });
    return this.state;
  }

  @callable()
  upsertProject(project: ProjectProjection) {
    const now = new Date().toISOString();
    this.sql`
      INSERT INTO projects (id, payload, updated_at)
      VALUES (${project.id}, ${JSON.stringify(project)}, ${now})
      ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at
    `;
    return project.id;
  }

  @callable()
  upsertWorkPackage(pkg: WorkPackage) {
    const now = new Date().toISOString();
    this.sql`
      INSERT INTO work_packages (id, project_id, status, payload, updated_at)
      VALUES (${pkg.id}, ${pkg.projectId}, ${pkg.status}, ${JSON.stringify(pkg)}, ${now})
      ON CONFLICT(id) DO UPDATE SET
        project_id = excluded.project_id,
        status = excluded.status,
        payload = excluded.payload,
        updated_at = excluded.updated_at
    `;
    return pkg.id;
  }

  async runHour() {
    this.releaseExpiredLocks();

    const projects = new Map(
      this.sql<{ id: string; payload: string }>`SELECT id, payload FROM projects`
        .map((row) => [row.id, JSON.parse(row.payload) as ProjectProjection] as const),
    );

    const ready = this.sql<{ payload: string }>`SELECT payload FROM work_packages WHERE status = 'READY'`
      .map((row) => JSON.parse(row.payload) as WorkPackage);

    const batch = selectHourlyBatch(projects, ready, 10);
    const dispatched: string[] = [];

    for (const pkg of batch.packages) {
      if (!this.acquireWriteLocks(pkg)) continue;
      this.markStatus(pkg, "DISPATCHED");
      dispatched.push(pkg.id);

      // SHADOW proves selection, locks, persistence and learning without executing external side effects.
      if (this.state.mode === "ACTIVE") {
        await this.queue("executePackage", { workPackageId: pkg.id });
      }
    }

    this.setState({
      ...this.state,
      lastBatchAt: batch.generatedAt,
      lastBatchIds: dispatched,
    });

    return { ...batch, packages: batch.packages.filter((pkg) => dispatched.includes(pkg.id)) };
  }

  async executePackage(input: { workPackageId: string }) {
    const row = this.sql<{ payload: string }>`SELECT payload FROM work_packages WHERE id = ${input.workPackageId}`[0];
    if (!row) return;

    const pkg = JSON.parse(row.payload) as WorkPackage;
    this.markStatus(pkg, "RUNNING");

    // Adapter execution is deliberately fail-closed in V01.
    // GitHub / research / data / capital / user-proof adapters must be explicitly connected and tested.
    const outcome: Outcome = {
      workPackageId: pkg.id,
      status: "BLOCKED",
      evidence: [],
      materialDelta: "No external adapter connected in V01 shadow scaffold.",
      expected: pkg.definitionOfDone.join("; "),
      actual: "Durable orchestration reached adapter boundary safely.",
      limitation: "Connect and test section adapter before ACTIVE execution.",
      completedAt: new Date().toISOString(),
    };
    this.recordOutcome(outcome);
    this.markStatus(pkg, "BLOCKED");
    this.releaseLocksFor(pkg.id);
  }

  @callable()
  recordOutcome(outcome: Outcome) {
    this.sql`
      INSERT INTO outcomes (work_package_id, payload, completed_at)
      VALUES (${outcome.workPackageId}, ${JSON.stringify(outcome)}, ${outcome.completedAt})
      ON CONFLICT(work_package_id) DO UPDATE SET payload = excluded.payload, completed_at = excluded.completed_at
    `;
    return outcome.workPackageId;
  }

  @callable()
  recordLearning(candidate: LearningCandidate) {
    this.sql`
      INSERT INTO learning_candidates (id, work_package_id, status, payload, created_at)
      VALUES (${candidate.id}, ${candidate.workPackageId}, ${candidate.status}, ${JSON.stringify(candidate)}, ${candidate.createdAt})
      ON CONFLICT(id) DO UPDATE SET status = excluded.status, payload = excluded.payload
    `;
    return candidate.id;
  }

  @callable()
  getFactoryState() {
    return {
      state: this.state,
      projects: this.sql<{ id: string; payload: string }>`SELECT id, payload FROM projects`.map((r) => JSON.parse(r.payload)),
      ready: this.sql<{ id: string; status: string }>`SELECT id, status FROM work_packages WHERE status IN ('READY','DISPATCHED','RUNNING','BLOCKED')`,
      locks: this.sql<{ scope: string; work_package_id: string; expires_at: string }>`SELECT scope, work_package_id, expires_at FROM write_locks`,
    };
  }

  private acquireWriteLocks(pkg: WorkPackage): boolean {
    const now = Date.now();
    const expiresAt = new Date(now + 55 * 60 * 1000).toISOString();
    const acquiredAt = new Date(now).toISOString();

    for (const scope of pkg.writeScopes) {
      const conflict = this.sql<{ scope: string }>`
        SELECT scope FROM write_locks
        WHERE expires_at > ${acquiredAt}
          AND (${scope} = scope OR ${scope} LIKE scope || '/%' OR scope LIKE ${scope} || '/%')
        LIMIT 1
      `[0];
      if (conflict) return false;
    }

    for (const scope of pkg.writeScopes) {
      this.sql`
        INSERT INTO write_locks (scope, work_package_id, acquired_at, expires_at)
        VALUES (${scope}, ${pkg.id}, ${acquiredAt}, ${expiresAt})
      `;
    }
    return true;
  }

  private releaseExpiredLocks() {
    const now = new Date().toISOString();
    this.sql`DELETE FROM write_locks WHERE expires_at <= ${now}`;
  }

  private releaseLocksFor(workPackageId: string) {
    this.sql`DELETE FROM write_locks WHERE work_package_id = ${workPackageId}`;
  }

  private markStatus(pkg: WorkPackage, status: WorkPackage["status"]) {
    const next = { ...pkg, status };
    const now = new Date().toISOString();
    this.sql`
      UPDATE work_packages
      SET status = ${status}, payload = ${JSON.stringify(next)}, updated_at = ${now}
      WHERE id = ${pkg.id}
    `;
  }
}

export default {
  async fetch(request: Request, env: Cloudflare.Env) {
    return (await routeAgentRequest(request, env)) ?? new Response("4PLANET Production Factory V01", { status: 200 });
  },
};
