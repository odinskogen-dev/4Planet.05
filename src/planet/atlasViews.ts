/* ATLAS saved views — recovered selectively from V37CX My Atlas.
   Follow/Watch already supersedes the donor's duplicate saved-species/place lists,
   so TEST KING only recovers the genuinely missing primitive: named map views.
   Local device only. No account, sync or server-side tracking is implied. */

export interface AtlasSavedView {
  id: string;
  label: string;
  href: string;
  savedAt: string;
}

export interface AtlasSavedViewsState {
  version: 1;
  views: AtlasSavedView[];
}

const KEY = "4planet-atlas-saved-views-v1";
const empty = (): AtlasSavedViewsState => ({ version: 1, views: [] });
const asRecord = (v: unknown): Record<string, unknown> => v && typeof v === "object" ? v as Record<string, unknown> : {};

export function readAtlasSavedViews(): AtlasSavedViewsState {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = asRecord(JSON.parse(raw));
    if (parsed.version !== 1 || !Array.isArray(parsed.views)) return empty();
    const views = parsed.views
      .map(asRecord)
      .filter((v) => typeof v.id === "string" && typeof v.label === "string" && typeof v.href === "string" && String(v.href).startsWith("/atlas"))
      .slice(0, 30)
      .map((v) => ({ id: String(v.id), label: String(v.label), href: String(v.href), savedAt: typeof v.savedAt === "string" ? v.savedAt : "" }));
    return { version: 1, views };
  } catch {
    return empty();
  }
}

export function writeAtlasSavedViews(state: AtlasSavedViewsState) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY, JSON.stringify({ version: 1, views: state.views.slice(0, 30) })); }
  catch { /* private/locked storage: fail closed without breaking ATLAS */ }
}

function cameraHref(): string {
  const url = new URL(window.location.href);
  const map = (window as any).__4planet_map;
  try {
    const center = map?.getCenter?.();
    const zoom = Number(map?.getZoom?.());
    if (center && Number.isFinite(center.lng) && Number.isFinite(center.lat)) url.searchParams.set("c", `${center.lng.toFixed(3)},${center.lat.toFixed(3)}`);
    if (Number.isFinite(zoom)) url.searchParams.set("z", zoom.toFixed(2));
  } catch { /* current URL remains a valid bounded fallback */ }
  return `${url.pathname}${url.search}`;
}

export function captureAtlasView(): AtlasSavedView {
  const params = new URLSearchParams(window.location.search);
  const focus = params.get("entity");
  const mode = params.get("m") || "PLANET";
  const now = new Date();
  return {
    id: `view-${Date.now().toString(36)}`,
    label: focus ? `${mode} · ${focus.replace(/^.*:/, "")}` : `${mode} · ${now.toLocaleDateString()}`,
    href: cameraHref(),
    savedAt: now.toISOString(),
  };
}

export function addCurrentAtlasView(state: AtlasSavedViewsState): AtlasSavedViewsState {
  const next = captureAtlasView();
  const out = { version: 1 as const, views: [next, ...state.views.filter((v) => v.href !== next.href)].slice(0, 30) };
  writeAtlasSavedViews(out);
  return out;
}

export function removeAtlasView(state: AtlasSavedViewsState, id: string): AtlasSavedViewsState {
  const out = { version: 1 as const, views: state.views.filter((v) => v.id !== id) };
  writeAtlasSavedViews(out);
  return out;
}
