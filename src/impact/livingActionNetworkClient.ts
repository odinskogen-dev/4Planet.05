/* ═══════════════════════════════════════════════════════════════════════════
   4PLANET IMPACT — NATUREBRAIN runtime client
   Reads the controlled public projection directly over PostgREST with the
   public publishable key (no SDK download needed for a public read).

   Order: public.impact_lan_v02()  →  public.impact_lan_gold_v01() (fallback).
   v01 remains the guaranteed contract for the four Gold objects; v02 is the
   scalable contract AXE publishes into by data alone.

   There is no static copy of project truth in the frontend. If NATUREBRAIN is
   unreachable the UI says SOURCE UNAVAILABLE — never "zero projects".
   ═══════════════════════════════════════════════════════════════════════════ */
import { useEffect, useState } from "react";
import { identityConstants } from "@/identity/identityClient";
import { index, normaliseV01, normaliseV02, type ImpactGraph, type ImpactIndex } from "./livingActionNetworkGraph";

export const IMPACT_PROJECTIONS = ["impact_lan_v02", "impact_lan_gold_v01"] as const;

class ProjectionMissing extends Error {}

async function rpc(name: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(`${identityConstants.supabaseUrl}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: identityConstants.publishableKey,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: "{}",
    signal,
  });
  if (response.status === 404) throw new ProjectionMissing(name);
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    // PostgREST reports an unknown function as PGRST202 (sometimes with 400/404).
    if (/PGRST202|Could not find the function/i.test(body)) throw new ProjectionMissing(name);
    throw new Error(`NATUREBRAIN ${name} failed (${response.status})`);
  }
  return response.json();
}

export async function readImpactGraph(signal?: AbortSignal): Promise<ImpactGraph> {
  try {
    return normaliseV02(await rpc("impact_lan_v02", signal));
  } catch (error) {
    if (!(error instanceof ProjectionMissing)) {
      // v02 exists but failed: still try the guaranteed v01 contract before giving up.
      if ((error as Error)?.name === "AbortError") throw error;
    }
  }
  return normaliseV01(await rpc("impact_lan_gold_v01", signal));
}

/* One in-flight read per page session; navigation between templates reuses it. */
let cached: Promise<ImpactIndex> | null = null;
let resolved: ImpactIndex | null = null;

export function loadImpactIndex(): Promise<ImpactIndex> {
  if (!cached) {
    cached = readImpactGraph()
      .then((graph) => {
        resolved = index(graph);
        return resolved;
      })
      .catch((error) => {
        cached = null; // allow a retry on the next mount
        throw error;
      });
  }
  return cached;
}

export type ImpactLoadState =
  | { state: "LOADING"; idx: null }
  | { state: "READY"; idx: ImpactIndex }
  | { state: "ERROR"; idx: null };

export function useImpactIndex(): ImpactLoadState & { retry: () => void } {
  const [value, setValue] = useState<ImpactLoadState>(() => (resolved ? { state: "READY", idx: resolved } : { state: "LOADING", idx: null }));
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (resolved) {
      setValue({ state: "READY", idx: resolved });
      return;
    }
    let alive = true;
    setValue({ state: "LOADING", idx: null });
    loadImpactIndex()
      .then((idx) => alive && setValue({ state: "READY", idx }))
      .catch(() => alive && setValue({ state: "ERROR", idx: null }));
    return () => {
      alive = false;
    };
  }, [attempt]);
  return { ...value, retry: () => setAttempt((n) => n + 1) };
}

/* Canonical public routes — the only URL grammar templates use. */
export const impactRoutes = {
  home: "/impact",
  project: (slug: string) => `/impact/project/${slug}`,
  actor: (slug: string) => `/impact/actors/${slug}`,
  issue: (slug: string) => `/impact/issue/${slug}`,
  solution: (slug: string) => `/impact/solution/${slug}`,
  method: "/impact#method",
} as const;

/** Back-compat for callers of the v01 helpers. */
export const impactProjectSlug = (id: string) => id.split(":").pop() || id;
export const impactActorSlug = (id: string) => id.split(":").pop() || id;
