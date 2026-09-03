import { Agent } from "agents";
import type { Outcome, Section, WorkPackage } from "./contracts";
import { executeReadOnlyPackage } from "./readOnlyExecution";
import { executeAutonomousPackage, type AutonomousWorkPackage } from "./autonomousExecution";
import { executeClaudeProductReview, isClaudeProductWorkPackage } from "./claudeProductWorker";
import { checkPackageAdapterScope } from "./sectionAdapters";
import { evaluateZeroLoss } from "./zeroLoss";
import { effectiveResourceBudget } from "./hardeningControl";
import { factoryCandidateBranch, shouldReserveAiForCandidate, type CandidateCheckState } from "./aiReservation";
import {
  APPROVED_FACTORY_AI_MODEL,
  MAX_RESERVED_AI_CALLS_PER_WORKER_PER_UTC_MONTH,
  WORST_CASE_FACTORY_AI_USD_PER_UTC_MONTH,
  modelIsBudgetApproved,
  monthlyReservationAllowed,
} from "./aiBudgetPolicy";

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
const REPOSITORY = "odinskogen-dev/4Planet.05";

type AiReservationDecision = "RESERVED" | "DAILY_CAP" | "MONTHLY_CAP";

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
    this.sql`
      CREATE TABLE IF NOT EXISTS ai_monthly_usage (
        utc_month TEXT PRIMARY KEY,
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

    if (isClaudeProductWorkPackage(pkg)) {
      try {
        const executed = await executeClaudeProductReview(this.env, pkg);
        return this.persistOutcome(pkg, executed);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown Claude Product Worker failure";
        return this.finish(
          pkg,
          "BLOCKED",
          `Claude Product Worker failed safely: ${message}`,
          ["No duplicate dispatch authority", "No LIVE authority", "No Claude OAuth token exposed to Factory runtime"],
          "Claude specialist execution remains fail-closed.",
        );
      }
    }

    const autonomous = (pkg as AutonomousWorkPackage).autonomous;
    if (autonomous) {
      const configuredModel = (this.env as Cloudflare.Env & { FACTORY_AI_MODEL?: string }).FACTORY_AI_MODEL?.trim();
      if (!modelIsBudgetApproved(configuredModel)) {
        return this.finish(
          pkg,
          "BLOCKED",
          `FACTORY_PAID_AI_HARD_CAP_FAIL_CLOSED: model override ${configuredModel} is outside the approved cost envelope.`,
          [
            `Approved model=${APPROVED_FACTORY_AI_MODEL}`,
            `Worst-case Factory monthly envelope USD=${WORST_CASE_FACTORY_AI_USD_PER_UTC_MONTH.toFixed(4)}`,
            "No model call attempted",
          ],
          "A different model requires a new explicit pricing calculation and governed budget policy before use.",
        );
      }

      const budget = effectiveResourceBudget(pkg.resourceBudget);
      const requestedAttempts = Math.max(
        1,
        Math.min(
          autonomous.maxCorrectionAttempts ?? budget.maxCorrectionAttempts,
          MAX_AI_ATTEMPTS_PER_PACKAGE,
          budget.maxAttempts,
          budget.maxCorrectionAttempts,
          budget.maxModelCalls,
        ),
      );
      if (budget.maxModelCalls < 1 || budget.maxAttempts < 1) {
        return this.finish(
          pkg,
          "BLOCKED",
          "RESOURCE_BUDGET_FAIL_CLOSED: autonomous execution has no authorised attempt/model-call capacity.",
          ["No model call attempted"],
          "Increase the bounded Work Package budget only through governed planning; this does not authorise cash spend.",
        );
      }

      const reserveAi = await this.needsAiReservation(pkg, autonomous);
      if (reserveAi) {
        const reservation = this.reserveAiBudget(requestedAttempts);
        if (reservation !== "RESERVED") {
          const monthly = reservation === "MONTHLY_CAP";
          return this.finish(
            pkg,
            "BLOCKED",
            monthly
              ? `FACTORY_PAID_AI_HARD_CAP_FAIL_CLOSED: worker monthly AI reservation cap reached (${MAX_RESERVED_AI_CALLS_PER_WORKER_PER_UTC_MONTH}).`
              : `ZERO_CASH_DAILY_FAIL_CLOSED: worker daily AI reservation cap reached (${MAX_RESERVED_AI_CALLS_PER_WORKER_PER_UTC_DAY}).`,
            [
              "No Workers AI call attempted",
              monthly ? "WAIT until next UTC month budget window" : "WAIT until next UTC day quota window",
              `Worst-case Factory monthly envelope USD=${WORST_CASE_FACTORY_AI_USD_PER_UTC_MONTH.toFixed(4)} (<5)`,
            ],
            "Factory cannot buy, expand, or bypass AI capacity automatically.",
          );
        }
      }

      try {
        const boundedPkg = autonomous.maxCorrectionAttempts === requestedAttempts
          ? pkg
          : ({ ...pkg, autonomous: { ...autonomous, maxCorrectionAttempts: requestedAttempts } } as AutonomousWorkPackage);
        const executed = await executeAutonomousPackage(this.env, boundedPkg);
        if (executed) return this.persistOutcome(pkg, executed);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown autonomous execution failure";
        return this.finish(
          pkg,
          "BLOCKED",
          `Autonomous TEST adapter failed safely: ${message}`,
          ["No LIVE authority", "No automatic spend", `RESOURCE-BUDGET attempts<=${requestedAttempts}`],
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

  private async needsAiReservation(pkg: WorkPackage, autonomous: NonNullable<AutonomousWorkPackage["autonomous"]>): Promise<boolean> {
    const token = (this.env as Cloudflare.Env & { FACTORY_GITHUB_TOKEN?: string }).FACTORY_GITHUB_TOKEN?.trim();
    if (!token) return true;

    const headers = {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "x-github-api-version": "2022-11-28",
      "user-agent": "4PLANET-Production-Factory/1.0",
    };
    const branch = factoryCandidateBranch(pkg.id, autonomous.candidateBranch);
    const encodedBranch = branch.split("/").map(encodeURIComponent).join("/");
    try {
      const response = await fetch(`https://api.github.com/repos/${REPOSITORY}/git/ref/heads/${encodedBranch}`, { headers });
      if (response.status === 404) return true;
      if (!response.ok) return true;
      const body = await response.json() as { object?: { sha?: string } };
      const candidateSha = body.object?.sha;

      if (shouldReserveAiForCandidate(candidateSha, autonomous.expectedBaseSha, "PENDING")) return true;
      if (!candidateSha) return true;

      const checksResponse = await fetch(`https://api.github.com/repos/${REPOSITORY}/commits/${candidateSha}/check-runs?per_page=100`, { headers });
      if (!checksResponse.ok) return true;
      const checks = await checksResponse.json() as {
        total_count?: number;
        check_runs?: Array<{ status?: string; conclusion?: string | null }>;
      };
      const runs = Array.isArray(checks.check_runs) ? checks.check_runs : [];
      let checkState: CandidateCheckState = "UNKNOWN";
      if ((checks.total_count ?? 0) === 0 || runs.length === 0) {
        checkState = "PENDING";
      } else {
        const terminalFailure = runs.some(
          (check) => check.status === "completed" && !["success", "neutral", "skipped"].includes(check.conclusion ?? ""),
        );
        const pending = runs.some((check) => check.status !== "completed");
        checkState = terminalFailure ? "TERMINAL" : pending ? "PENDING" : "TERMINAL";
      }
      return shouldReserveAiForCandidate(candidateSha, autonomous.expectedBaseSha, checkState);
    } catch {
      return true;
    }
  }

  private reserveAiBudget(calls: number): AiReservationDecision {
    const iso = new Date().toISOString();
    const utcDay = iso.slice(0, 10);
    const utcMonth = iso.slice(0, 7);
    const dayRow = this.sql<{ reserved_calls: number }>`SELECT reserved_calls FROM ai_usage WHERE utc_day = ${utcDay}`[0];
    const monthRow = this.sql<{ reserved_calls: number }>`SELECT reserved_calls FROM ai_monthly_usage WHERE utc_month = ${utcMonth}`[0];
    const dayCurrent = Number(dayRow?.reserved_calls ?? 0);
    const monthCurrent = Number(monthRow?.reserved_calls ?? 0);

    if (dayCurrent + calls > MAX_RESERVED_AI_CALLS_PER_WORKER_PER_UTC_DAY) return "DAILY_CAP";
    if (!monthlyReservationAllowed(monthCurrent, calls)) return "MONTHLY_CAP";

    const dayNext = dayCurrent + calls;
    const monthNext = monthCurrent + calls;
    const updatedAt = iso;
    this.sql`
      INSERT INTO ai_usage (utc_day, reserved_calls, updated_at)
      VALUES (${utcDay}, ${dayNext}, ${updatedAt})
      ON CONFLICT(utc_day) DO UPDATE SET reserved_calls = excluded.reserved_calls, updated_at = excluded.updated_at
    `;
    this.sql`
      INSERT INTO ai_monthly_usage (utc_month, reserved_calls, updated_at)
      VALUES (${utcMonth}, ${monthNext}, ${updatedAt})
      ON CONFLICT(utc_month) DO UPDATE SET reserved_calls = excluded.reserved_calls, updated_at = excluded.updated_at
    `;
    return "RESERVED";
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
