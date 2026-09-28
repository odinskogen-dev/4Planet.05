import {
  getIdentityClient,
  identityConstants,
  type FourPlanetSession,
} from "@/identity/identityClient";
import type { PantryItem } from "@/food/pantry-decision.js";

export type FoodPantryMemory = {
  id: string;
  pantry: PantryItem[];
  budgetNok: number | null;
  createdAt: string;
};

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
