export const APPROVED_FACTORY_AI_MODEL = "@cf/zai-org/glm-4.7-flash";

// Cloudflare published model envelope/pricing used for a deliberately conservative
// pre-call budget reservation. The context maximum is treated as if it were all
// billable input AND the configured output maximum were also fully consumed.
export const FACTORY_MODEL_MAX_CONTEXT_TOKENS = 131_072;
export const FACTORY_MAX_COMPLETION_TOKENS = 2_400;
export const FACTORY_INPUT_USD_PER_MILLION_TOKENS = 0.06;
export const FACTORY_OUTPUT_USD_PER_MILLION_TOKENS = 0.40;

// Current controlled worker topology: PRODUCT_DESIGN x2, CODE_QA x2, and one
// worker each for RESEARCH_DATA, USER_DISTRIBUTION, CAPITAL, LEARNING,
// BRAIN_CONTROL = 9 durable worker slots.
export const FACTORY_AI_WORKER_SLOTS = 9;
export const MAX_RESERVED_AI_CALLS_PER_WORKER_PER_UTC_MONTH = 50;
export const FACTORY_INTERNAL_AI_SPEND_CEILING_USD = 5;

export const WORST_CASE_USD_PER_RESERVED_MODEL_CALL =
  (FACTORY_MODEL_MAX_CONTEXT_TOKENS / 1_000_000) * FACTORY_INPUT_USD_PER_MILLION_TOKENS
  + (FACTORY_MAX_COMPLETION_TOKENS / 1_000_000) * FACTORY_OUTPUT_USD_PER_MILLION_TOKENS;

export const WORST_CASE_FACTORY_AI_USD_PER_UTC_MONTH =
  WORST_CASE_USD_PER_RESERVED_MODEL_CALL
  * MAX_RESERVED_AI_CALLS_PER_WORKER_PER_UTC_MONTH
  * FACTORY_AI_WORKER_SLOTS;

export function modelIsBudgetApproved(model: string | undefined): boolean {
  return !model || model === APPROVED_FACTORY_AI_MODEL;
}

export function monthlyReservationAllowed(currentReservedCalls: number, requestedCalls: number): boolean {
  if (!Number.isInteger(currentReservedCalls) || currentReservedCalls < 0) return false;
  if (!Number.isInteger(requestedCalls) || requestedCalls < 1) return false;
  return currentReservedCalls + requestedCalls <= MAX_RESERVED_AI_CALLS_PER_WORKER_PER_UTC_MONTH;
}

if (WORST_CASE_FACTORY_AI_USD_PER_UTC_MONTH >= FACTORY_INTERNAL_AI_SPEND_CEILING_USD) {
  throw new Error(
    `Factory AI budget policy invalid: worst-case monthly envelope $${WORST_CASE_FACTORY_AI_USD_PER_UTC_MONTH.toFixed(4)} is not below $${FACTORY_INTERNAL_AI_SPEND_CEILING_USD}.`,
  );
}
