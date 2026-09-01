import { Agent } from "agents";
import type { Outcome, Section, WorkPackage } from "./contracts";
import { executeReadOnlyPackage } from "./readOnlyExecution";
import { executeAutonomousPackage, type AutonomousWorkPackage } from "./autonomousExecution";
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

const MAX_RESERVED_AI_CALLS_PER_WORKER_PER_UTC_DAY = 6;
const MAX_AI_ATTEMPTS_PER_PACKAGE = 2;

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
    this.sql`
      CREATE TABLE IF NOT EXISTS ai_usage (
        utc_day TEXT PRIMARY KEY,
        reserved_calls INTEGER NOT NULL,
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

    const autonomous = (pkg as AutonomousWorkPackage).autonomous;
    if (autonomous) {
      const requestedAttempts = Math.max(1, Math.min(autonomous.maxCorrectionAttempts ?? MAX_AI_ATTEMPTS_PER_PACKAGE, MAX_AI_ATTEMPTS_PER_PACKAGE));
      if (!this.reserveAiBudget(requestedAttempts)) {
        return this.finish(
          pkg,
          "BLOCKED",
          `ZERO_CASH_FREE_TIER_FAIL_CLOSED: worker daily AI reservation cap reached (${MAX_RESERVED_AI_CALLS_PER_WORKER_PER_UTC_DAY}).`,
          ["No Workers AI call attempted", "WAIT until next UTC quota window"],
          "Factory never buys additional AI capacity automatically.",
        );
      }

      try {
        const executed = await executeAutonomousPackage(this.env, pkg);
        if (executed) return this.persistOutcome(pkg, executed);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown autonomous execution failure";
        return this.finish(
          pkg,
          "BLOCKED",
          `Autonomous TEST adapter failed safely: ${message}`,
          ["No LIVE authority", "No automatic spend"],
          "Candidate execution remains fail-closed.",
        );
      }
    }

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

  private reserveAiBudget(calls: number): boolean {
    const utcDay = new Date().toISOString().slice(0, 10);
    const row = this.sql<{ reserved_calls: number }>`SELECT reserved_calls FROM ai_usage WHERE utc_day = ${utcDay}`[0];
    const current = Number(row?.reserved_calls ?? 0);
    if (current + calls > MAX_RESERVED_AI_CALLS_PER_WORKER_PER_UTC_DAY) return false;
    const next = current + calls;
    const updatedAt = new Date().toISOString();
    this.sql`
      INSERT INTO ai_usage (utc_day, reserved_calls, updated_at)
      VALUES (${utcDay}, ${next}, ${updatedAt})
      ON CONFLICT(utc_day) DO UPDATE SET reserved_calls = excluded.reserved_calls, updated_at = excluded.updated_at
    `;
    return true;
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
