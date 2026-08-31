import { Agent } from "agents";
import type { Outcome, Section, WorkPackage } from "./contracts";
import { executeReadOnlyPackage } from "./readOnlyExecution";
import { checkPackageAdapterScope } from "./sectionAdapters";
import { evaluateZeroLoss } from "./zeroLoss";

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

    const zeroLoss = evaluateZeroLoss(pkg);
    if (!zeroLoss.ready) {
      return this.finish(pkg, "BLOCKED", `ZERO LOSS blocked execution: ${zeroLoss.missing.join(", ")}.`);
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

    // V01 real execution starts with reversible read-only evidence adapters.
    // Arbitrary code/file writes still fail closed until their own adapter proof.
    try {
      const executed = await executeReadOnlyPackage(this.env, pkg);
      if (executed) return this.persistOutcome(pkg, executed);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown bounded execution failure";
      return this.finish(
        pkg,
        "BLOCKED",
        `Bounded execution adapter failed safely: ${message}`,
        [],
        "No material result was accepted; package remains blocked until the adapter succeeds or the package is corrected.",
      );
    }

    return this.finish(
      pkg,
      "BLOCKED",
      `ZERO LOSS and ${adapterScope.mode} scope passed; no proven execution adapter is configured for this package.`,
      [],
      "The worker intentionally refuses to simulate or invent execution.",
    );
  }

  private finish(
    pkg: WorkPackage,
    status: Outcome["status"],
    materialDelta: string,
    evidence: string[] = [],
    limitation?: string,
  ): Outcome {
    return this.persistOutcome(pkg, {
      workPackageId: pkg.id,
      status,
      evidence,
      materialDelta,
      expected: pkg.definitionOfDone.join("; "),
      actual: materialDelta,
      limitation,
      completedAt: new Date().toISOString(),
    });
  }

  private persistOutcome(pkg: WorkPackage, outcome: Outcome): Outcome {
    this.sql`
      UPDATE work_history
      SET outcome = ${JSON.stringify(outcome)}, updated_at = ${outcome.completedAt}
      WHERE work_package_id = ${pkg.id}
    `;

    this.setState({
      ...this.state,
      role: this.section,
      completed: this.state.completed + 1,
      accepted: this.state.accepted + (outcome.status === "ACCEPTED" ? 1 : 0),
      rejected: this.state.rejected + (outcome.status === "REJECTED" ? 1 : 0),
      blocked: this.state.blocked + (outcome.status === "BLOCKED" ? 1 : 0),
      lastWorkPackageId: pkg.id,
    });
    return outcome;
  }
}

export class ProductDesignWorker extends SectionWorker { readonly section = "PRODUCT_DESIGN" as const; }
export class CodeQaWorker extends SectionWorker { readonly section = "CODE_QA" as const; }
export class ResearchDataWorker extends SectionWorker { readonly section = "RESEARCH_DATA" as const; }
export class UserDistributionWorker extends SectionWorker { readonly section = "USER_DISTRIBUTION" as const; }
export class CapitalWorker extends SectionWorker { readonly section = "CAPITAL" as const; }
export class LearningWorker extends SectionWorker { readonly section = "LEARNING" as const; }
export class BrainControlWorker extends SectionWorker { readonly section = "BRAIN_CONTROL" as const; }
