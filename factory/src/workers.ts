import { Agent } from "agents";
import type { Outcome, Section, WorkPackage } from "./contracts";
import { checkPackageAdapterScope } from "./sectionAdapters";

interface WorkerState {
  role: Section | "UNASSIGNED";
  completed: number;
  accepted: number;
  rejected: number;
  blocked: number;
  lastWorkPackageId?: string;
}

abstract class SectionWorker extends Agent<Cloudflare.Env, WorkerState> {
  abstract readonly section: Section;

  initialState: WorkerState = {
    role: "UNASSIGNED",
    completed: 0,
    accepted: 0,
    rejected: 0,
    blocked: 0,
  };

  async onStart() {
    if (this.state.role === "UNASSIGNED") this.setState({ ...this.state, role: this.section });
    this.sql`
      CREATE TABLE IF NOT EXISTS work_history (
        work_package_id TEXT PRIMARY KEY,
        payload TEXT NOT NULL,
        outcome TEXT,
        updated_at TEXT NOT NULL
      )
    `;
  }

  async runPackage(pkg: WorkPackage): Promise<Outcome> {
    if (pkg.section !== this.section) {
      return this.finish(pkg, "REJECTED", "Package section does not match worker role.");
    }

    const adapterScope = checkPackageAdapterScope(pkg);
    if (!adapterScope.ok) {
      const rejected = adapterScope.rejectedScopes.length
        ? adapterScope.rejectedScopes.join(", ")
        : "section policy forbids execution";
      return this.finish(
        pkg,
        "REJECTED",
        `Section adapter policy rejected write scope(s): ${rejected}. Mode=${adapterScope.mode}.`,
      );
    }

    const now = new Date().toISOString();
    this.sql`
      INSERT INTO work_history (work_package_id, payload, updated_at)
      VALUES (${pkg.id}, ${JSON.stringify(pkg)}, ${now})
      ON CONFLICT(work_package_id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at
    `;

    // V01 now has a machine-enforced section adapter policy, but deliberately
    // stops before connecting external execution tools. Tool/model bindings are
    // added only after shadow evidence proves the policy is sufficient.
    return this.finish(
      pkg,
      "BLOCKED",
      `Adapter scope accepted in ${adapterScope.mode} mode; external section execution adapter remains disconnected.`,
    );
  }

  private finish(pkg: WorkPackage, status: Outcome["status"], materialDelta: string): Outcome {
    const outcome: Outcome = {
      workPackageId: pkg.id,
      status,
      evidence: [],
      materialDelta,
      expected: pkg.definitionOfDone.join("; "),
      actual: materialDelta,
      completedAt: new Date().toISOString(),
    };

    this.sql`
      UPDATE work_history
      SET outcome = ${JSON.stringify(outcome)}, updated_at = ${outcome.completedAt}
      WHERE work_package_id = ${pkg.id}
    `;

    this.setState({
      ...this.state,
      role: this.section,
      completed: this.state.completed + 1,
      accepted: this.state.accepted + (status === "ACCEPTED" ? 1 : 0),
      rejected: this.state.rejected + (status === "REJECTED" ? 1 : 0),
      blocked: this.state.blocked + (status === "BLOCKED" ? 1 : 0),
      lastWorkPackageId: pkg.id,
    });
    return outcome;
  }
}

export class ProductDesignWorker extends SectionWorker {
  readonly section = "PRODUCT_DESIGN" as const;
}

export class CodeQaWorker extends SectionWorker {
  readonly section = "CODE_QA" as const;
}

export class ResearchDataWorker extends SectionWorker {
  readonly section = "RESEARCH_DATA" as const;
}

export class UserDistributionWorker extends SectionWorker {
  readonly section = "USER_DISTRIBUTION" as const;
}

export class CapitalWorker extends SectionWorker {
  readonly section = "CAPITAL" as const;
}

export class LearningWorker extends SectionWorker {
  readonly section = "LEARNING" as const;
}

export class BrainControlWorker extends SectionWorker {
  readonly section = "BRAIN_CONTROL" as const;
}
