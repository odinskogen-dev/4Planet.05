import type { Follow } from "@/planet/types";
import type { AtlasSavedView } from "@/planet/atlasViews";
import { identityConstants, type FourPlanetSession } from "@/identity/identityClient";

export type AtlasAccountState = {
  follows: Follow[];
  savedViews: AtlasSavedView[];
  updatedAt?: string;
};

const endpoint = `${identityConstants.supabaseUrl}/rest/v1/four_planet_atlas_state`;

function headers(session: FourPlanetSession) {
  return {
    Authorization: `Bearer ${session.access_token}`,
    apikey: identityConstants.publishableKey,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

function validFollows(value: unknown): Follow[] {
  return Array.isArray(value)
    ? value.filter((item: any) => item && typeof item.id === "string" && typeof item.type === "string").slice(0, 200)
    : [];
}

function validViews(value: unknown): AtlasSavedView[] {
  return Array.isArray(value)
    ? value
        .filter((item: any) => item && typeof item.id === "string" && typeof item.label === "string" && typeof item.href === "string")
        .slice(0, 30)
    : [];
}

export async function readAtlasAccountState(session: FourPlanetSession): Promise<AtlasAccountState | null> {
  const response = await fetch(
    `${endpoint}?user_id=eq.${encodeURIComponent(session.user.id)}&select=follows,saved_views,updated_at`,
    { headers: headers(session), cache: "no-store" },
  );
  if (!response.ok) throw new Error("Could not load ATLAS account state");
  const rows = await response.json();
  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row) return null;
  return {
    follows: validFollows(row.follows),
    savedViews: validViews(row.saved_views),
    updatedAt: typeof row.updated_at === "string" ? row.updated_at : undefined,
  };
}

export async function writeAtlasAccountState(session: FourPlanetSession, state: AtlasAccountState) {
  const response = await fetch(`${endpoint}?on_conflict=user_id`, {
    method: "POST",
    headers: {
      ...headers(session),
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      user_id: session.user.id,
      follows: validFollows(state.follows),
      saved_views: validViews(state.savedViews),
      updated_at: new Date().toISOString(),
    }),
  });
  if (!response.ok) throw new Error("Could not save ATLAS account state");
}
