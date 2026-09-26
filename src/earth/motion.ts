/**
 * ATLAS motion choreography — the "awe" seed for the Orca vertical slice.
 *
 * Small, self-contained helpers so the deterministic journey can land like a
 * cinematic camera rather than a jump. Everything degrades gracefully when the
 * user prefers reduced motion: no easing, no pulse, just the final state.
 *
 * NOTE (Control Addendum, 9 Aug 2026): these durations are EXPERIMENTAL, not
 * canon. Final timing is chosen after the exact-SHA preview / physical-mobile
 * feel review. Kept here as named tokens so the Awe Lighthouse pass can turn them
 * into shared motion primitives without hunting through World.tsx.
 */

export const MOTION = {
  /** cinematic landing, phase 1 (wide approach) — EXPERIMENTAL */
  landApproachMs: 1500,
  /** cinematic landing, phase 2 (soft settle) — EXPERIMENTAL */
  landSettleMs: 900,
  /** beat between camera settle and panel arrival — EXPERIMENTAL */
  panelBeatMs: 180,
  /** focus pulse: how many "breaths" before it rests — bounded, not infinite */
  pulseBreaths: 3,
  /** focus pulse: one breath period (ms) */
  pulsePeriodMs: 1240,
} as const;

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

type FlyMap = {
  jumpTo: (o: { center: [number, number]; zoom: number }) => void;
  flyTo: (o: Record<string, unknown>) => void;
  getZoom: () => number;
  once: (ev: string, cb: () => void) => void;
  off: (ev: string, cb: () => void) => void;
};

/** A handle the caller can use to cancel an in-flight landing. */
export interface Cancellable {
  cancel: () => void;
  done: Promise<"settled" | "cancelled">;
}

/**
 * A two-phase cinematic landing on a target: a gentle pull-in, then a soft
 * settle. Falls back to an instant jump under reduced motion.
 *
 * Cancellation-safe: the returned handle's cancel() detaches the pending
 * moveend listeners so a stale promise can never fire the panel-open later, even
 * if the user interacts, the route changes, or a competing camera motion starts.
 * `done` resolves with "settled" or "cancelled" so callers only act on "settled".
 */
export function cinematicLanding(
  map: FlyMap,
  target: { lng: number; lat: number; zoom: number },
): Cancellable {
  if (prefersReducedMotion()) {
    map.jumpTo({ center: [target.lng, target.lat], zoom: target.zoom });
    return { cancel: () => {}, done: Promise.resolve("settled") };
  }

  let cancelled = false;
  let phase1: (() => void) | null = null;
  let phase2: (() => void) | null = null;

  const detach = () => {
    if (phase1) { try { map.off("moveend", phase1); } catch { /* map gone */ } phase1 = null; }
    if (phase2) { try { map.off("moveend", phase2); } catch { /* map gone */ } phase2 = null; }
  };

  const done = new Promise<"settled" | "cancelled">((resolve) => {
    phase1 = () => {
      if (phase1) { map.off("moveend", phase1); phase1 = null; }
      if (cancelled) { resolve("cancelled"); return; }
      // Phase 2 — the soft settle onto the exact record.
      map.flyTo({
        center: [target.lng, target.lat],
        zoom: target.zoom,
        speed: 0.5, curve: 1.2, duration: MOTION.landSettleMs, essential: true,
      });
      phase2 = () => {
        if (phase2) { map.off("moveend", phase2); phase2 = null; }
        resolve(cancelled ? "cancelled" : "settled");
      };
      map.once("moveend", phase2);
    };

    // Phase 1 — a lower, wider approach so the settle has somewhere to go.
    map.flyTo({
      center: [target.lng, target.lat],
      zoom: Math.max(target.zoom - 1.4, 2),
      speed: 0.7, curve: 1.6, duration: MOTION.landApproachMs, essential: true,
    });
    map.once("moveend", phase1);
  });

  return {
    cancel: () => { cancelled = true; detach(); },
    done,
  };
}
