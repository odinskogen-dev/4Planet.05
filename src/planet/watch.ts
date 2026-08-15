/* ═══════════════════════════════════════════════════════════════════════════
   4PLANET_ — ADAPTATION LAYER — WATCH MATCHING
   STATUS: ADAPTATION. (Brief §40, §51)

   Brief §40: "The system must be capable of explaining: WHY AM I SEEING THIS?"

   That single requirement is what separates WATCH from a feed, so it is enforced
   structurally: a WatchMatch cannot be constructed without a `why` string. There
   is no code path in this file that produces an unexplained item.

   THE THREE MATCH KINDS THAT REAL DATA CAN SUPPORT TODAY
   ─────────────────────────────────────────────────────
   PLACE          A signal in the pool occurred within a followed Place's radius.
                  Real. Cheap. Honest.

   LIVING_SYSTEM  A signal occurred in a place that a followed Living System is
                  represented in. Indirect — and the UI says so, in the `why`.

   DIRECT         You follow a Taxon, and GBIF holds occurrence records of that
                  taxon dated within the window. These are OBSERVATION RECORDS,
                  not events. The `why` says that out loud, because the difference
                  matters and a feed that blurs it is lying.

   Mandate: "In this build, use only match logic supported by real available data.
   If no real matched changes exist, show a truthful empty state." Both are done.
   Nothing is simulated to make WATCH look busy.

   NOT SUPPORTED YET, AND DELIBERATELY ABSENT:
     RELATIONSHIP MATCH   — needs a resolved relationship graph in BRAIN.
     PUBLIC DECISION      — needs the DECISIONS connector. Not built.
   ═══════════════════════════════════════════════════════════════════════════ */

import type { DataStatus, Follow, ObservationItem, WatchMatch } from "./types";
import type { SignalPool } from "./signals";
import { CLASS_LABEL } from "./signals";
import { distanceKm, placeById, placeRadiusKm } from "./places";
import { systemById } from "./livingSystems";
import { sourceKeyOf } from "./ids";
import { taxonOccurrencesSince } from "./connectors";

/** How far back WATCH looks for taxon observation records. */
export const WATCH_WINDOW_DAYS = 90;

const windowStart = () => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - WATCH_WINDOW_DAYS);
  return d.toISOString().slice(0, 10);
};

/* ── PLACE + LIVING SYSTEM MATCHES (synchronous, from the loaded pool) ────── */

export const matchPool = (pool: SignalPool, follows: Follow[]): WatchMatch[] => {
  const out: WatchMatch[] = [];
  const claimed = new Set<string>(); // one signal appears once, under its strongest reason

  const push = (m: WatchMatch) => {
    const key = m.signal!.id;
    if (claimed.has(key)) return;
    claimed.add(key);
    out.push(m);
  };

  // PLACE is the strongest and most legible reason, so it claims first.
  for (const f of follows.filter((x) => x.type === "PLACE")) {
    const place = placeById(f.id);
    if (!place) continue;
    const radius = placeRadiusKm(place);
    for (const s of pool.signals) {
      const d = distanceKm({ lat: place.lat, lng: place.lng }, { lat: s.lat, lng: s.lng });
      if (d > radius) continue;
      push({
        itemClass: "SIGNAL",
        signal: s,
        follow: f,
        kind: "PLACE",
        distanceKm: d,
        lat: s.lat,
        lng: s.lng,
        occurredAt: s.provenance.occurredAt,
        why: `${CLASS_LABEL[s.cls]} recorded ${Math.round(d)} km from ${place.name}, which you follow.`,
      });
    }
  }

  // LIVING SYSTEM is indirect. The explanation must admit that.
  for (const f of follows.filter((x) => x.type === "LIVING_SYSTEM")) {
    const sys = systemById(f.id);
    if (!sys?.placeIds?.length) continue;
    for (const pid of sys.placeIds) {
      const place = placeById(pid);
      if (!place) continue;
      const radius = placeRadiusKm(place);
      for (const s of pool.signals) {
        const d = distanceKm({ lat: place.lat, lng: place.lng }, { lat: s.lat, lng: s.lng });
        if (d > radius) continue;
        push({
          itemClass: "SIGNAL",
          signal: s,
          follow: f,
          kind: "LIVING_SYSTEM",
          distanceKm: d,
          lat: s.lat,
          lng: s.lng,
          occurredAt: s.provenance.occurredAt,
          why: `${CLASS_LABEL[s.cls]} near ${place.name} — one of the places where ${sys.name}, which you follow, is represented in 4PLANET. This is an indirect connection, not a measured effect on the system.`,
        });
      }
    }
  }

  return out.sort(
    (a, b) => (Date.parse(b.occurredAt ?? "") || 0) - (Date.parse(a.occurredAt ?? "") || 0),
  );
};

/* ── DIRECT TAXON MATCHES (async — one GBIF query per followed taxon) ───────
   P0 (V38R): these are OBSERVATIONS, not Signals. An occurrence stays an
   Occurrence. And a failed GBIF call is reported as SOURCE_UNAVAILABLE, never
   silently folded into "no matches" (Brief §29). */

export interface TaxaWatchResult {
  matches: WatchMatch[];
  /** Per followed-taxon source status, so the UI never turns a failure into zero. */
  status: DataStatus;
  failedTaxa: string[];
}

export const matchTaxa = async (follows: Follow[]): Promise<TaxaWatchResult> => {
  const taxa = follows.filter((f) => f.type === "TAXON");
  if (!taxa.length) return { matches: [], status: "NOT_CHECKED", failedTaxa: [] };
  const since = windowStart();

  const failedTaxa: string[] = [];

  const results = await Promise.all(
    taxa.map(async (f): Promise<WatchMatch[]> => {
      const key = sourceKeyOf(f.id);
      const r = await taxonOccurrencesSince(key, since, 40);
      if (!r.ok) {
        failedTaxa.push(f.label);
        return []; // failure is recorded in failedTaxa, not disguised as empty
      }

      return r.data.rows.map((o): WatchMatch => {
        const observation: ObservationItem = {
          id: `observation:gbif:${o.sourceRecordId ?? `${key}@${o.lat},${o.lng}`}`,
          taxon: { id: f.id, type: "TAXON", label: f.label, sub: f.sub },
          occurrence: o,
          provenance: {
            sourceId: "gbif",
            sourceRecordId: o.sourceRecordId,
            sourceUrl: o.sourceUrl,
            interpretation: "SOURCE_RECORD",
            confidence: "HIGH",
            occurredAt: o.eventDate,
            checkedAt: new Date().toISOString(),
          },
        };
        return {
          itemClass: "OBSERVATION",
          observation,
          follow: f,
          kind: "DIRECT",
          lat: o.lat,
          lng: o.lng,
          occurredAt: o.eventDate,
          why: `${f.label}, which you follow, was recorded here and reported to GBIF. This is an observation record — it means somebody looked, not that anything changed. It is not a signal.`,
        };
      });
    }),
  );

  const matches = results
    .flat()
    .sort((a, b) => (Date.parse(b.occurredAt ?? "") || 0) - (Date.parse(a.occurredAt ?? "") || 0));

  // Honest status: if every taxon query failed, that is SOURCE_UNAVAILABLE, not
  // "no observations". If some failed, we still say so via failedTaxa.
  const status: DataStatus =
    failedTaxa.length === taxa.length
      ? "SOURCE_UNAVAILABLE"
      : matches.length
        ? "LIVE"
        : "NO_RECORDS";

  return { matches, status, failedTaxa };
};

/**
 * Honest empty state copy. The Mandate specifies the sentiment; this is it.
 * Note the second line — the absence of matches is a statement about our
 * coverage, not about the world. Brief §29.
 */
export const EMPTY_WATCH = {
  headline: "NO NEW MATCHED SIGNALS FROM CONNECTED SOURCES.",
  body: "This does not mean nothing happened where you are watching. It means none of the sources 4PLANET currently reads reported anything matching your follows in this window.",
};
