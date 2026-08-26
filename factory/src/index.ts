import { Agent, callable, routeAgentRequest } from "agents";
import { selectHourlyBatch } from "./batcher";
import { evaluateMaterialProgress } from "./evaluator";
import { evaluateFactoryActivation, type FactoryActivationEvidence } from "./activationGate";
import type { LearningCandidate, Outcome, ProjectProjection, Section, WorkPackage } from "./contracts";
import {
  BrainControlWorker,
  CapitalWorker,
  CodeQaWorker,
  LearningWorker,
  ProductDesignWorker,
  ResearchDataWorker,
  UserDistributionWorker,
} from "./workers";

export { WorkPackageWorkflow } from "./workflow";
export {
  BrainControlWorker,
  CapitalWorker,
  CodeQaWorker,
  LearningWorker,
  ProductDesignWorker,
  ResearchDataWorker,
  UserDistributionWorker,
} from "./workers";

interface FactoryState {
  mode: "SHADOW" | "ACTIVE";
  hourlyScheduleId?: string;
  lastBatchAt?: string;
  lastBatchIds: string[];
  lastWorkflowIds: string[];
  activationEvidence?: FactoryActivationEvidence;
}

export class ProductionFactoryAgent extends Agent<Cloudflare.Env, FactoryState> {
  initialState: FactoryState = {
    mode: "SHADOW",
    lastBatchIds: [],
    lastWorkflowIds: [],
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
  setActivationEvidence(evidence: FactoryActivationEvidence) {
    const gate = evaluateFactoryActivation(evidence);
    this.setState({ ...this.state, activationEvidence: evidence });
    return gate;
  }

  @callable()
  setMode(mode: "SHADOW" | "ACTIVE") {
    if (mode === "ACTIVE") {
      if (!this.state.activationEvidence) {
        throw new Error("Factory ACTIVE blocked: activation evidence is missing");
      }
      const gate = evaluateFactoryActivation(this.state.activationEvidence);
      if (!gate.ready) {
        throw new Error(`Factory ACTIVE blocked: ${gate.missing.join(", ")}`);
      }
    }
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

    if (this.state.mode === "SHADOW") {
      this.setState({
        ...this.state,
        lastBatchAt: batch.generatedAt,
        lastBatchIds: batch.packages.map((pkg) => pkg.id),
        lastWorkflowIds: [],
      });
      return { ...batch, mode: "SHADOW", workflowIds: [] };
    }

    const dispatchable: WorkPackage[] = [];
    for (const pkg of batch.packages) {
      if (!this.acquireWriteLocks(pkg)) continue;
      this.markStatus(pkg, "DISPATCHED");
      dispatchable.push(pkg);
    }

    const workflowIds = await Promise.all(
      dispatchable.map((pkg) =>
        this.runWorkflow(
          "WORK_PACKAGE_WORKFLOW",
          { workPackageId: pkg.id },
          {
            id: `wp-${pkg.id}-${Date.now()}`,
            metadata: { projectId: pkg.projectId, section: pkg.section, priority: pkg.priority },
          },
        ),
      ),
    );

    this.setState({
      ...this.state,
      lastBatchAt: batch.generatedAt,
      lastBatchIds: dispatchable.map((pkg) => pkg.id),
      lastWorkflowIds: workflowIds,
    });

    return { ...batch, packages: dispatchable, mode: "ACTIVE", workflowIds };
  }

  async dispatchToWorker(workPackageId: string): Promise<Outcome> {
    const pkg = this.getWorkPackage(workPackageId);
    if (!pkg) throw new Error(`Unknown work package: ${workPackageId}`);

    this.markStatus(pkg, "RUNNING");
    const workerName = this.workerName(pkg.section, pkg.id);

    switch (pkg.section) {
      case "PRODUCT_DESIGN":
        return (await this.subAgent(ProductDesignWorker, workerName)).runPackage(pkg);
      case "CODE_QA":
        return (await this.subAgent(CodeQaWorker, workerName)).runPackage(pkg);
      case "RESEARCH_DATA":
        return (await this.subAgent(ResearchDataWorker, workerName)).runPackage(pkg);
      case "USER_DISTRIBUTION":
        return (await this.subAgent(UserDistributionWorker, workerName)).runPackage(pkg);
      case "CAPITAL":
        return (await this.subAgent(CapitalWorker, workerName)).runPackage(pkg);
      case "LEARNING":
        return (await this.subAgent(LearningWorker, workerName)).runPackage(pkg);
      case "BRAIN_CONTROL":
        return (await this.subAgent(BrainControlWorker, workerName)).runPackage(pkg);
    }
  }

  async finalizeWorkflowOutcome(outcome: Outcome) {
    this.recordOutcome(outcome);
    const pkg = this.getWorkPackage(outcome.workPackageId);
    if (!pkg) return outcome.workPackageId;

    const evaluation = evaluateMaterialProgress(pkg, outcome);
    const nextStatus: WorkPackage["status"] =
      outcome.status === "BLOCKED"
        ? "BLOCKED"
        : evaluation.decision === "ACCEPT"
          ? "ACCEPTED"
          : evaluation.decision === "REJECT"
            ? "REJECTED"
            : "READY";

    this.markStatus(pkg, nextStatus);
    this.releaseLocksFor(pkg.id);

    if (nextStatus === "ACCEPTED") {
      const projectRow = this.sql<{ payload: string }>`SELECT payload FROM projects WHERE id = ${pkg.projectId}`[0];
      if (projectRow) {
        const project = JSON.parse(projectRow.payload) as ProjectProjection;
        this.upsertProject({ ...project, lastMaterialProgressAt: outcome.completedAt });
      }
    }

    return outcome.workPackageId;
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
      activationGate: this.state.activationEvidence ? evaluateFactoryActivation(this.state.activationEvidence) : null,
      projects: this.sql<{ id: string; payload: string }>`SELECT id, payload FROM projects`.map((r) => JSON.parse(r.payload)),
      work: this.sql<{ id: string; status: string }>`SELECT id, status FROM work_packages WHERE status IN ('READY','DISPATCHED','RUNNING','BLOCKED')`,
      locks: this.sql<{ scope: string; work_package_id: string; expires_at: string }>`SELECT scope, work_package_id, expires_at FROM write_locks`,
      workers: this.listSubAgents(),
    };
  }

  private getWorkPackage(id: string): WorkPackage | undefined {
    const row = this.sql<{ payload: string }>`SELECT payload FROM work_packages WHERE id = ${id}`[0];
    return row ? (JSON.parse(row.payload) as WorkPackage) : undefined;
  }

  private workerName(section: Section, workPackageId: string): string {
    const hash = [...workPackageId].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);
    const slot = section === "PRODUCT_DESIGN" || section === "CODE_QA" ? (hash % 2) + 1 : 1;
    return `${section.toLowerCase().replaceAll("_", "-")}-${slot}`;
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
