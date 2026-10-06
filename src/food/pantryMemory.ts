import {
  getIdentityClient,
  identityConstants,
  type FourPlanetSession,
} from "@/identity/identityClient";
import type { PantryItem } from "@/food/pantry-decision.js";
import { foodDecisionCoreContext } from "@/data/corePrimitives";

export type FoodPantryMemory = {
  id: string;
  pantry: PantryItem[];
  budgetNok: number | null;
  createdAt: string;
};

export type FoodValueEventType =
  | "food_identity_ready"
  | "food_activation"
  | "food_value_reached"
  | "food_context_saved"
  | "food_context_returned"
  | "food_second_value_reached"
  | "food_decision_saved";

export type FoodDecisionSummary = {
  optionId: string;
  sourceRef: string | null;
  status: string;
  missingCount: number;
  unknownCount: number;
  comparedOptionIds: string[];
};

type FoodValuePayload = Record<string, string | number | boolean | null>;

const FOOD_VALUE_PAYLOAD_KEYS = new Set([
  "loop",
  "stage",
  "returning",
  "elapsed_ms",
  "item_count",
  "option_count",
  "missing_count",
  "unknown_count",
  "decision_status",
  "source_state",
  "helpful",
]);

type MemoryRow = {
  id: string;
  value?: {
    namespace?: string;
    pantry?: unknown;
    budgetNok?: unknown;
    dataState?: string;
  } | null;
  created_at?: string | null;
};

function headers(session: FourPlanetSession, extra: Record<string, string> = {}) {
  return {
    Authorization: `Bearer ${session.access_token}`,
    apikey: identityConstants.publishableKey,
    Accept: "application/json",
    ...extra,
  };
}

function cleanPantry(value: unknown): PantryItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      name: typeof item.name === "string" ? item.name.trim().slice(0, 100) : "",
      amount: item.amount === null ? null : typeof item.amount === "number" && Number.isFinite(item.amount) && item.amount >= 0 ? item.amount : null,
      unit: item.unit === "g" || item.unit === "ml" || item.unit === "stk" ? item.unit : "g",
    }))
    .filter((item) => item.name.length > 0)
    .slice(0, 40);
}

export async function currentFoodPantrySession() {
  const client = await getIdentityClient();
  const result = await client.auth.getSession();
  if (result.error || !result.data.session) return null;
  return result.data.session;
}

export async function loadFoodPantryMemory(session: FourPlanetSession): Promise<FoodPantryMemory | null> {
  const params = new URLSearchParams({
    user_id: `eq.${session.user.id}`,
    memory_type: "eq.durable_fact",
    state: "eq.active",
    deleted_at: "is.null",
    select: "id,value,created_at",
    order: "created_at.desc",
    limit: "20",
  });
  const response = await fetch(`${identityConstants.supabaseUrl}/rest/v1/four_sapien_embla_memories?${params.toString()}`, {
    headers: headers(session),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("PANTRY_READ_FAILED");
  const rows = (await response.json()) as MemoryRow[];
  const row = rows.find((candidate) => candidate.value?.namespace === "food_pantry_v1");
  if (!row) return null;
  const budget = row.value?.budgetNok;
  return {
    id: row.id,
    pantry: cleanPantry(row.value?.pantry),
    budgetNok: typeof budget === "number" && Number.isFinite(budget) && budget >= 0 ? budget : null,
    createdAt: row.created_at || "",
  };
}

export async function saveFoodPantryMemory(
  session: FourPlanetSession,
  pantry: PantryItem[],
  budgetNok: number | null,
  supersedesId?: string | null,
): Promise<FoodPantryMemory> {
  const clean = cleanPantry(pantry);
  const response = await fetch(`${identityConstants.supabaseUrl}/rest/v1/four_sapien_embla_memories`, {
    method: "POST",
    headers: headers(session, {
      "Content-Type": "application/json",
      Prefer: "return=representation",
    }),
    body: JSON.stringify({
      user_id: session.user.id,
      memory_type: "durable_fact",
      content: "Confirmed FOOD pantry",
      value: {
        namespace: "food_pantry_v1",
        pantry: clean,
        budgetNok,
        dataState: "user_confirmed",
        purchasedIsNotConsumed: true,
      },
      state: "active",
      confirmation_state: "user_confirmed",
      provenance: {
        source: "4SAPIEN FOOD",
        privacy: "private_person",
        evidence_class: "USER_CONFIRMED",
        revision: "pantry_v1",
      },
      supersedes_id: supersedesId || null,
    }),
  });
  if (!response.ok) throw new Error("PANTRY_WRITE_FAILED");
  const rows = (await response.json()) as MemoryRow[];
  const inserted = rows[0];
  if (!inserted?.id) throw new Error("PANTRY_WRITE_READBACK_FAILED");

  const readback = await fetch(
    `${identityConstants.supabaseUrl}/rest/v1/four_sapien_embla_memories?id=eq.${encodeURIComponent(inserted.id)}&user_id=eq.${session.user.id}&select=id,value,created_at`,
    { headers: headers(session), cache: "no-store" },
  );
  if (!readback.ok) throw new Error("PANTRY_WRITE_READBACK_FAILED");
  const verifiedRows = (await readback.json()) as MemoryRow[];
  const verified = verifiedRows[0];
  if (!verified || verified.value?.namespace !== "food_pantry_v1") throw new Error("PANTRY_WRITE_READBACK_FAILED");

  if (supersedesId) {
    const patch = await fetch(
      `${identityConstants.supabaseUrl}/rest/v1/four_sapien_embla_memories?id=eq.${encodeURIComponent(supersedesId)}&user_id=eq.${session.user.id}&state=eq.active`,
      {
        method: "PATCH",
        headers: headers(session, {
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        }),
        body: JSON.stringify({ state: "superseded", updated_at: new Date().toISOString() }),
      },
    );
    if (!patch.ok) throw new Error("PANTRY_PRIOR_REVISION_REVIEW_REQUIRED");
  }

  return {
    id: verified.id,
    pantry: cleanPantry(verified.value?.pantry),
    budgetNok,
    createdAt: verified.created_at || "",
  };
}


function privacySafeFoodPayload(payload: FoodValuePayload) {
  return Object.fromEntries(
    Object.entries(payload)
      .filter(([key, value]) => FOOD_VALUE_PAYLOAD_KEYS.has(key) && (
        value === null ||
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ))
      .map(([key, value]) => [
        key,
        typeof value === "string" ? value.slice(0, 80) : value,
      ]),
  );
}

export async function recordFoodValueEvent(
  session: FourPlanetSession,
  eventType: FoodValueEventType,
  payload: FoodValuePayload = {},
) {
  const response = await fetch(`${identityConstants.supabaseUrl}/rest/v1/four_sapien_embla_events`, {
    method: "POST",
    headers: headers(session, {
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    }),
    body: JSON.stringify({
      user_id: session.user.id,
      event_type: eventType,
      world: "food",
      source: "4sapien_food_value_loop_v2",
      payload: privacySafeFoodPayload(payload),
    }),
  });
  if (!response.ok) throw new Error("FOOD_VALUE_EVENT_WRITE_FAILED");
}

export async function recordHumanUtilityMeasurement(
  session: FourPlanetSession,
  measurementEvent: "useful_outcome" | "return_intent" | "wtp" | "price_reaction" | "payment_intent",
  measurementValue: string,
  priceNok: number | null = null,
) {
  const response = await fetch(`${identityConstants.supabaseUrl}/functions/v1/embla-core-preview`, {
    method: "POST",
    headers: headers(session, {
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({
      measurement_event: measurementEvent,
      measurement_value: measurementValue.slice(0, 80),
      price_nok: Number.isFinite(priceNok) ? priceNok : null,
    }),
  });
  if (!response.ok) throw new Error("HUMAN_UTILITY_MEASUREMENT_WRITE_FAILED");
  const payload = (await response.json()) as { ok?: boolean; state?: string };
  if (!payload?.ok || payload.state !== "MEASUREMENT_RECORDED") {
    throw new Error("HUMAN_UTILITY_MEASUREMENT_READBACK_FAILED");
  }
}

export async function saveFoodDecision(
  session: FourPlanetSession,
  summary: FoodDecisionSummary,
) {
  const core = foodDecisionCoreContext(session.user.id, summary.sourceRef);
  const evidenceState = core.evidence[0]?.source_state ?? "UNKNOWN";
  const response = await fetch(`${identityConstants.supabaseUrl}/rest/v1/four_sapien_decisions`, {
    method: "POST",
    headers: headers(session, {
      "Content-Type": "application/json",
      Prefer: "return=representation",
    }),
    body: JSON.stringify({
      user_id: session.user.id,
      world: "food",
      title: "FOOD meal choice",
      question: "What can I make with what I have?",
      options: summary.comparedOptionIds.slice(0, 10).map((id) => ({ id })),
      decision: summary.optionId,
      status: "decided",
      evidence: [{
        source_ref: summary.sourceRef,
        source_state: evidenceState,
        missing_count: summary.missingCount,
        unknown_count: summary.unknownCount,
      }],
      provenance: {
        source: "4SAPIEN FOOD",
        privacy: "private_person",
        evidence_class: "USER_DECISION",
        loop: "food_first_value_v2",
        core,
      },
      decided_at: new Date().toISOString(),
    }),
  });
  if (!response.ok) throw new Error("FOOD_DECISION_WRITE_FAILED");
  const rows = (await response.json()) as Array<{ id?: string }>;
  if (!rows[0]?.id) throw new Error("FOOD_DECISION_WRITE_READBACK_FAILED");
  return rows[0].id;
}

export async function removeFoodPantryMemory(session: FourPlanetSession, id: string) {
  const response = await fetch(
    `${identityConstants.supabaseUrl}/rest/v1/four_sapien_embla_memories?id=eq.${encodeURIComponent(id)}&user_id=eq.${session.user.id}&state=eq.active`,
    {
      method: "PATCH",
      headers: headers(session, {
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      }),
      body: JSON.stringify({
        state: "deleted",
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    },
  );
  if (!response.ok) throw new Error("PANTRY_DELETE_FAILED");
}
