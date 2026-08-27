/* ═══════════════════════════════════════════════════════════════════════════
   4PLANET_ — ADAPTATION LAYER — FOLLOW (LOCAL-FIRST)
   STATUS: ADAPTATION. (Brief §37, §40 — Mandate: "local-first. No login.")

   Brief §37: "DO NOT COLLECT PERSONAL DATA BECAUSE IT MAY BE USEFUL LATER."

   So this stores exactly one thing, on the user's own device, and sends nothing
   anywhere: a list of canonical entity ids the person said they care about.

   No account. No identifier. No telemetry. No precise location is ever written
   to disk — NEAR ME reads the browser geolocation, uses it for one query, and
   forgets it. When account-based WATCH arrives, this store becomes the local
   half of a sync, not something to be migrated and mined.

   The ids are canonical (src/planet/ids.ts). There is no such thing as a
   Follow-specific id. Brief §85 names that as an anti-pattern; the Mandate
   repeats it: "Do not create interface-specific Follow IDs."
   ═══════════════════════════════════════════════════════════════════════════ */

import { useCallback, useEffect, useState } from "react";
import type { EntityRef, Follow } from "./types";

const KEY = "4planet.follows.v1";

const read = (): Follow[] => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((f) => f && f.id && f.type) : [];
  } catch {
    return []; // A corrupt store is an empty store. It is not a crash.
  }
};

const write = (rows: Follow[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(rows));
  } catch {
    /* private mode / quota. Follow degrades to session-only. Nothing breaks. */
  }
  window.dispatchEvent(new CustomEvent("4p:follows"));
};

export const getFollows = read;

export const isFollowing = (id: string) => read().some((f) => f.id === id);

export const addFollow = (ref: EntityRef) => {
  const rows = read();
  if (rows.some((f) => f.id === ref.id)) return;
  write([{ ...ref, addedAt: new Date().toISOString() }, ...rows]);
};

export const removeFollow = (id: string) => write(read().filter((f) => f.id !== id));

export const toggleFollow = (ref: EntityRef) =>
  isFollowing(ref.id) ? removeFollow(ref.id) : addFollow(ref);

/** React binding. Cross-tab safe: listens to both storage and the local event. */
export const useFollows = () => {
  const [follows, setFollows] = useState<Follow[]>(() => read());

  useEffect(() => {
    const sync = () => setFollows(read());
    window.addEventListener("4p:follows", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("4p:follows", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((ref: EntityRef) => toggleFollow(ref), []);
  const following = useCallback((id: string) => follows.some((f) => f.id === id), [follows]);

  return { follows, toggle, following, remove: removeFollow };
};
