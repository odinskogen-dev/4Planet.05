import { Agent, callable, getAgentByName, routeAgentRequest } from "agents";
import { selectHourlyBatch } from "./batcher";
import { releasableBlockedPackageIds } from "./dependencyRelease";
import { evaluateMaterialProgress } from "./evaluator";
import { evaluateFactoryActivation, type FactoryActivationEvidence } from "./activationGate";
import { runActivationGateSimulation } from "./activationSimulation";
import { validateBrainProjection, type BrainProjectionSnapshot } from "./brainProjection";
import { compileLearningCandidate } from "./learningCompiler";
import { compileApprovedProjectIntake, type ApprovedProjectIntake } from "./projectIntake";
import { decideInFlightRecovery } from "./recovery";
import {
  createShadowCanaryPackages,
  createShadowCanaryProject,
  SHADOW_BROWSER_PACKAGE_ID,
  SHADOW_BROWSER_WORKFLOW_ID,
  SHADOW_SOURCE_PACKAGE_ID,
  SHADOW_SOURCE_WORKFLOW_ID,
} from "./shadowCanary";
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
  lastBrainProjectionAt?: string;
  lastProjectIntakeAt?: string;
}

const CANARY_WORKFLOWS = [SHADOW_SOURCE_WORKFLOW_ID, SHADOW_BROWSER_WORKFLOW_ID] as const;
const CANARY_PACKAGES = [SHADOW_SOURCE_PACKAGE_ID, SHADOW_BROWSER_PACKAGE_ID] as const;

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
    this.sql`
      CREATE TABLE IF NOT EXISTS projection_receipts (
        id TEXT PRIMARY KEY,
        payload TEXT NOT NULL,
        ingested_at TEXT NOT NULL
      )
    `;
    this.sql`
      CREATE TABLE IF NOT EXISTS project_intake_receipts (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        payload TEXT NOT NULL,
        compiled_at TEXT NOT NULL
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
  simulateActivationGate() {
    return runActivationGateSimulation();
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

  /**
   * Deployed SHADOW canary. It deliberately runs only two fixed read-only packages:
   * source verification and browser QA. It proves Agent → Workflow → sub-agent →
   * real tool → persisted outcome → evaluator/learning without granting ACTIVE.
   */
  async ensureShadowCanary() {
    if (this.state.mode !== "SHADOW") throw new Error("SHADOW canary is allowed only while Factory mode is SHADOW");

    const nowIso = new Date().toISOString();
    this.upsertProject(createShadowCanaryProject(nowIso));
    const packages = createShadowCanaryPackages(nowIso);
    for (const pkg of packages) {
      if (!this.getWorkPackage(pkg.id) && !this.getRecordedOutcome(pkg.id)) this.upsertWorkPackage(pkg);
    }

    for (let index = 0; index < packages.length; index += 1) {
      const pkg = packages[index];
      const workflowId = CANARY_WORKFLOWS[index];
      if (this.getRecordedOutcome(pkg.id) || this.getWorkflow(workflowId)) continue;
      await this.runWorkflow(
        "WORK_PACKAGE_WORKFLOW",
        { workPackageId: pkg.id },
        {
          id: workflowId,
          metadata: { canary: true, projectId: pkg.projectId, section: pkg.section },
          agentBinding: "PRODUCTION_FACTORY",
        },
      );
    }

    return this.getShadowCanaryStatus();
  }

  async getShadowCanaryStatus() {
    const workflows = [];
    for (const instanceId of CANARY_WORKFLOWS) {
      const tracked = this.getWorkflow(instanceId);
      if (tracked && (tracked.status === "queued" || tracked.status === "running")) {
        try {
          await this.getWorkflowStatus("WORK_PACKAGE_WORKFLOW", instanceId);
        } catch {
          // Tracking is still returned below. A status-refresh failure must not fabricate success.
        }
      }
      workflows.push(this.getWorkflow(instanceId) ?? null);
    }

    const outcomes = CANARY_PACKAGES.map((workPackageId) => this.getRecordedOutcome(workPackageId) ?? null);
    const learning = this.sql<{ id: string; work_package_id: string; status: string; created_at: string }>`
      SELECT id, work_package_id, status, created_at
      FROM learning_candidates
      WHERE work_package_id IN (${SHADOW_SOURCE_PACKAGE_ID}, ${SHADOW_BROWSER_PACKAGE_ID})
      ORDER BY created_at ASC
    `;
    const accepted = outcomes.filter((outcome) => outcome?.status === "ACCEPTED").length;
    const complete = workflows.filter((workflow) => workflow?.status === "complete").length;

    return {
      mode: this.state.mode,
      canary: "SHADOW_READ_ONLY_V01",
      ready: accepted === 2 && complete === 2 && learning.length >= 1,
      workflows,
      outcomes,
      learning,
    };
  }

  getRuntimeHealth() {
    const queue = this.sql<{ status: string; count: number }>`
      SELECT status, COUNT(*) AS count
      FROM work_packages
      GROUP BY status
      ORDER BY status
    `;
    const lineProjects = this.sql<{ payload: string }>`SELECT payload FROM projects`
      .map((row) => JSON.parse(row.payload) as ProjectProjection)
      .filter((project) => Boolean(project.productionLine));
    return {
      service: "4PLANET Production Factory GOLD",
      mode: this.state.mode,
      hourlyScheduleConfigured: Boolean(this.state.hourlyScheduleId),
      lastBatchAt: this.state.lastBatchAt ?? null,
      lastBrainProjectionAt: this.state.lastBrainProjectionAt ?? null,
      queue,
      productionLineProjects: lineProjects.map((project) => project.productionLine),
      workerCount: this.listSubAgents().length,
      noLiveAuthority: true,
    };
  }

  /**
   * One-way BRAIN → Factory projection ingestion. This writes only the local
   * scheduling cache and receipt; it cannot mutate BRAIN or promote authority.
   */
  @callable()
  ingestBrainSnapshot(snapshot: BrainProjectionSnapshot, packages: WorkPackage[] = []) {
    const validated = validateBrainProjection(snapshot);
    const now = Date.now();
    const retrievedAtMs = Date.parse(validated.retrievedAt);
    if (retrievedAtMs > now + 5 * 60 * 1000) throw new Error("BRAIN projection retrievedAt is implausibly in the future");
    if (now - retrievedAtMs > 6 * 60 * 60 * 1000) throw new Error("BRAIN projection is stale for Factory ingestion");

    const projectIds = new Set(validated.projects.map((project) => project.id));
    const unresolved = packages.filter((pkg) => !projectIds.has(pkg.projectId)).map((pkg) => pkg.id);
    if (unresolved.length > 0) throw new Error(`BRAIN projection cannot resolve work packages: ${unresolved.join(", ")}`);

    for (const project of validated.projects) this.upsertProject(project);
    for (const pkg of packages) this.upsertWorkPackage(pkg);

    const ingestedAt = new Date(now).toISOString();
    const receipt = {
      authority: validated.authority,
      readOnly: true as const,
      sourceRefs: [...validated.sourceRefs],
      snapshotRetrievedAt: validated.retrievedAt,
      ingestedAt,
      projectIds: validated.projects.map((project) => project.id),
      workPackageIds: packages.map((pkg) => pkg.id),
    };
    const receiptId = `brain-${validated.retrievedAt}-${validated.projects.length}`;
    this.sql`
      INSERT INTO projection_receipts (id, payload, ingested_at)
      VALUES (${receiptId}, ${JSON.stringify(receipt)}, ${ingestedAt})
      ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, ingested_at = excluded.ingested_at
    `;
    this.setState({ ...this.state, lastBrainProjectionAt: ingestedAt });
    return receipt;
  }

  /**
   * Founder-approved idea → project → bounded work packages. If a current Project
   * belongs to an approved production line, the same entry point compiles the
   * reusable Reference → Transfer → QA → Learning sequence. No parallel queue.
   */
  @callable()
  ingestApprovedProject(input: ApprovedProjectIntake) {
    const compiled = compileApprovedProjectIntake(input);
    this.upsertProject(compiled.project);
    for (const pkg of compiled.packages) this.upsertWorkPackage(pkg);

    const receiptId = `${compiled.project.id}:${compiled.receipt.compiledAt}`;
    this.sql`
      INSERT INTO project_intake_receipts (id, project_id, payload, compiled_at)
      VALUES (${receiptId}, ${compiled.project.id}, ${JSON.stringify(compiled.receipt)}, ${compiled.receipt.compiledAt})
    `;
    this.setState({ ...this.state, lastProjectIntakeAt: compiled.receipt.compiledAt });
    return compiled;
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
    this.recoverInterruptedWork();
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
            agentBinding: "PRODUCTION_FACTORY",
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
    const recorded = this.getRecordedOutcome(workPackageId);
    if (recorded) return recorded;

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

    const learning = compileLearningCandidate(pkg, outcome, evaluation);
    if (learning.accepted && learning.candidate) this.recordLearning(learning.candidate);

    if (nextStatus === "ACCEPTED") {
      const projectRow = this.sql<{ payload: string }>`SELECT payload FROM projects WHERE id = ${pkg.projectId}`[0];
      if (projectRow) {
        const project = JSON.parse(projectRow.payload) as ProjectProjection;
        this.upsertProject({ ...project, lastMaterialProgressAt: outcome.completedAt });
      }
      this.releaseSatisfiedDependencies(pkg.projectId);
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
      outcomes: this.sql<{ work_package_id: string; completed_at: string }>`SELECT work_package_id, completed_at FROM outcomes ORDER BY completed_at DESC LIMIT 20`,
      learning: this.sql<{ id: string; status: string; created_at: string }>`SELECT id, status, created_at FROM learning_candidates ORDER BY created_at DESC LIMIT 20`,
      locks: this.sql<{ scope: string; work_package_id: string; expires_at: string }>`SELECT scope, work_package_id, expires_at FROM write_locks`,
      projectionReceipts: this.sql<{ id: string; ingested_at: string }>`SELECT id, ingested_at FROM projection_receipts ORDER BY ingested_at DESC LIMIT 5`,
      workers: this.listSubAgents(),
    };
  }

  private getWorkPackage(id: string): WorkPackage | undefined {
    const row = this.sql<{ payload: string }>`SELECT payload FROM work_packages WHERE id = ${id}`[0];
    return row ? (JSON.parse(row.payload) as WorkPackage) : undefined;
  }

  private getRecordedOutcome(workPackageId: string): Outcome | undefined {
    const row = this.sql<{ payload: string }>`SELECT payload FROM outcomes WHERE work_package_id = ${workPackageId}`[0];
    return row ? (JSON.parse(row.payload) as Outcome) : undefined;
  }

  private recoverInterruptedWork() {
    const rows = this.sql<{ payload: string; updated_at: string }>`
      SELECT payload, updated_at FROM work_packages WHERE status IN ('DISPATCHED', 'RUNNING')
    `;
    const now = Date.now();

    for (const row of rows) {
      const pkg = JSON.parse(row.payload) as WorkPackage;
      const recorded = this.getRecordedOutcome(pkg.id);
      const decision = decideInFlightRecovery(
        { status: pkg.status, updatedAt: row.updated_at, hasRecordedOutcome: Boolean(recorded) },
        now,
      );

      if (decision === "FINALIZE_RECORDED_OUTCOME" && recorded) {
        void this.finalizeWorkflowOutcome(recorded);
        continue;
      }
      if (decision === "RECOVER_TO_READY") {
        this.releaseLocksFor(pkg.id);
        this.markStatus(pkg, "READY");
      }
    }
  }

  /**
   * Production-line progression law: an accepted stage unlocks only blocked
   * packages whose every declared dependency is ACCEPTED. A project-level
   * Founder/blocker gate still wins, so dependency completion can never bypass it.
   */
  private releaseSatisfiedDependencies(projectId: string) {
    const projectRow = this.sql<{ payload: string }>`SELECT payload FROM projects WHERE id = ${projectId}`[0];
    if (!projectRow) return;
    const project = JSON.parse(projectRow.payload) as ProjectProjection;
    if (project.blockedReason || project.founderGate) return;

    const rows = this.sql<{ id: string; status: WorkPackage["status"]; payload: string }>`
      SELECT id, status, payload FROM work_packages WHERE project_id = ${projectId}
    `;
    const statuses = new Map(rows.map((row) => [row.id, row.status] as const));
    const packages = rows.map((row) => JSON.parse(row.payload) as WorkPackage);
    const releasable = new Set(releasableBlockedPackageIds(packages, statuses));

    for (const pkg of packages) {
      if (releasable.has(pkg.id)) this.markStatus(pkg, "READY");
    }
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
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/__factory/health") {
      const agent = await getAgentByName(env.PRODUCTION_FACTORY, "shadow-primary");
      return Response.json(await agent.getRuntimeHealth());
    }

    if (request.method === "GET" && url.pathname === "/__factory/canary") {
      const agent = await getAgentByName(env.PRODUCTION_FACTORY, "shadow-primary");
      await agent.ensureShadowCanary();
      return Response.json(await agent.getShadowCanaryStatus());
    }

    return (await routeAgentRequest(request, env)) ?? new Response("4PLANET Production Factory GOLD", { status: 200 });
  },
};