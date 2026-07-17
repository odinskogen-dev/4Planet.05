/* ═══════════════════════════════════════════════════════════════════════════
   4PLANET_ — ADAPTATION LAYER — SIGNAL POOL
   STATUS: ADAPTATION. NOT THE CANONICAL SIGNAL CONTRACT. (Brief §38)

   One pool. NOW reads it. WATCH matches against it. ATLAS plots it. PLACE
   filters it by geography. That is the whole point: in V36, "events" and
   "quakes" were two map layers that knew nothing about each other and nothing
   about anything else. Here they are the same kind of object, and every other
   lens can therefore see them.

   WHAT IS AND IS NOT A SIGNAL HERE
   ────────────────────────────────
   IN:  NASA EONET open natural events  → FIRE_ACTIVITY | NATURAL_EVENT
        USGS earthquakes, past 24h      → SEISMIC

   OUT: Forest loss. Global Forest Watch ships an annual raster, not per-event
        records. There is no honest way to turn a tile into a dated event, so
        FOREST DISTURBANCE stays a map layer and does NOT enter NOW. The Brief
        (§95) names it as a required signal class; we cannot deliver it truthfully
        with the sources V36 has. This is a documented gap, not an oversight —
        see ADAPTATION.md. Filling it needs NASA FIRMS or GLAD alerts.

   OUT BY DEFAULT: species observations. They ARE a Brief §95 signal class and
        they are supported — but a GBIF occurrence is a record that somebody
        looked, not news that something changed. Firing 100k occurrence records
        into a "what is happening" feed would be exactly the "AUTOMATED DRAMA"
        the Brief forbids in §50. So observations enter the signal pool ONLY
        through WATCH, scoped to an entity a human explicitly chose to follow,
        and labelled OBSERVATION RECORD rather than event.

   NOTHING IS PROMOTED TO ALERT. Brief §39 requires a defined methodology for
   promotion. We have none, so significance is UNCLASSIFIED on every record and
   the interface never manufactures urgency.
   ═══════════════════════════════════════════════════════════════════════════ */

import type { DataStatus, Signal, SignalClass } from "./types";
import { eonetSignals, usgsSignals } from "./connectors";
import { distanceKm } from "./places";

export interface SignalPool {
  signals: Signal[];
  /** Per-source status. Brief §29: a failed source is not an empty world. */
  status: Record<string, DataStatus>;
  fetchedAt: string | null;
}

export const EMPTY_POOL: SignalPool = { signals: [], status: {}, fetchedAt: null };

const time = (s: Signal): number => {
  const t = s.provenance.occurredAt ?? s.provenance.sourcePublishedAt;
  const n = t ? Date.parse(t) : NaN;
  return Number.isFinite(n) ? n : 0;
};

export const loadSignalPool = async (): Promise<SignalPool> => {
  const [eonet, usgs] = await Promise.all([eonetSignals(), usgsSignals()]);

  const signals: Signal[] = [];
  const status: Record<string, DataStatus> = {};

  if (eonet.ok) {
    signals.push(...eonet.data);
    status.eonet = eonet.data.length ? "LIVE" : "NO_RECORDS";
  } else {
    status.eonet = "SOURCE_UNAVAILABLE";
  }

  if (usgs.ok) {
    signals.push(...usgs.data);
    status.usgs = usgs.data.length ? "LIVE" : "NO_RECORDS";
  } else {
    status.usgs = "SOURCE_UNAVAILABLE";
  }

  // Sources we deliberately do not read as signals. Stated, not hidden.
  status.gfw = "NO_COVERAGE"; // raster only, no per-event feed
  status.wdpa = "NOT_CHECKED"; // no API token registered

  signals.sort((a, b) => time(b) - time(a));
  return { signals, status, fetchedAt: new Date().toISOString() };
};

export const signalById = (pool: SignalPool, id: string) =>
  pool.signals.find((s) => s.id === id);

export const signalsNear = (
  pool: SignalPool,
  at: { lat: number; lng: number },
  radiusKm: number,
): Array<Signal & { distanceKm: number }> =>
  pool.signals
    .map((s) => ({ ...s, distanceKm: distanceKm(at, { lat: s.lat, lng: s.lng }) }))
    .filter((s) => s.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

export const signalsOfClass = (pool: SignalPool, cls: SignalClass) =>
  pool.signals.filter((s) => s.cls === cls);

export const CLASS_LABEL: Record<SignalClass, string> = {
  FIRE_ACTIVITY: "FIRE ACTIVITY",
  NATURAL_EVENT: "NATURAL EVENT",
  SEISMIC: "SEISMIC",
};

/** Observations are not signals. This label is used by WATCH's observation items. */
export const OBSERVATION_LABEL = "OBSERVATION RECORD";

/**
 * What this class of signal does and does not mean. Rendered in the UI, always.
 * Brief §31: OBSERVATION ≠ SIGNAL, SIGNAL ≠ ALERT.
 */
export const CLASS_CAVEAT: Record<SignalClass, string> = {
  FIRE_ACTIVITY:
    "An open fire event in NASA's tracker. A thermal detection is heat — it is not automatically an ecological catastrophe, and some systems burn naturally.",
  NATURAL_EVENT:
    "An event currently open in NASA's curated tracker. Open status is editorial: it means NASA is still following it, not that it is escalating.",
  SEISMIC:
    "A recorded earthquake. This is a geophysical fact. 4PLANET draws no ecological conclusion from it.",
};

/** Shown on WATCH observation items. Brief §31: an observation is not a change. */
export const OBSERVATION_CAVEAT =
  "Somebody recorded this organism at this place and reported it. That is all it means. It is not evidence of increase, decline or change — and it is not a signal.";

export const timeAgo = (iso?: string): string => {
  if (!iso) return "TIME UNKNOWN";
  const ms = Date.now() - Date.parse(iso);
  if (!Number.isFinite(ms) || ms < 0) return "TIME UNKNOWN";
  const h = Math.floor(ms / 3.6e6);
  if (h < 1) return `${Math.max(1, Math.floor(ms / 6e4))} MIN AGO`;
  if (h < 48) return `${h} H AGO`;
  return `${Math.floor(h / 24)} D AGO`;
};
