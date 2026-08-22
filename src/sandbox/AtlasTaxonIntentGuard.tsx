import { useEffect } from "react";

const ORCA_INTENT = {
  id: "taxon:gbif:2440483",
  label: "Orca",
  scientific: "Orcinus orca",
  aliases: new Set(["orca", "killer whale", "orcinus orca"]),
  context: {
    id: "bay-of-biscay-proof-context",
    label: "BAY OF BISCAY · PROOF CONTEXT",
    center: [-5.0, 45.5] as [number, number],
    zoom: 4.2,
    boundary: "Context region only. It is not a range map, live animal position, abundance estimate or proof of local presence.",
  },
};

const SEARCH_LABEL = "Search the living planet — life, places and living systems";
const CAMERA_RETRY_MS = 250;
const CAMERA_RETRY_WINDOW_MS = 20_000;
let cameraRetryTimer: number | null = null;
let cameraRetryDeadline = 0;

function normalise(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function hasOrcaIntent(url = new URL(window.location.href)) {
  return url.searchParams.get("intent") === "taxon" && url.searchParams.get("entity") === ORCA_INTENT.id;
}

function buildSpeciesHref() {
  const returnTo = new URL(window.location.href);
  returnTo.searchParams.delete("record");
  return `/species/orca?entity=${encodeURIComponent(ORCA_INTENT.id)}&returnTo=${encodeURIComponent(`${returnTo.pathname}${returnTo.search}${returnTo.hash}`)}`;
}

function activateOrcaIntent() {
  const url = new URL(window.location.href);
  url.searchParams.set("entity", ORCA_INTENT.id);
  url.searchParams.set("intent", "taxon");
  url.searchParams.set("context", ORCA_INTENT.context.id);
  url.searchParams.set("z", ORCA_INTENT.context.zoom.toFixed(2));
  url.searchParams.set("c", `${ORCA_INTENT.context.center[0].toFixed(2)},${ORCA_INTENT.context.center[1].toFixed(2)}`);
  url.searchParams.delete("record");
  url.searchParams.delete("f");
  window.location.assign(url.toString());
}

function makeCanonicalResult() {
  const row = document.createElement("div");
  row.className = "ritem atlas-taxon-intent-result";
  row.setAttribute("role", "option");
  row.setAttribute("tabindex", "0");
  row.setAttribute("data-atlas-taxon-intent", ORCA_INTENT.id);
  row.setAttribute("aria-label", `Open canonical ${ORCA_INTENT.label} taxon`);
  row.innerHTML = `
    <span class="rdot" style="background:#3AE86F"></span>
    <span class="rmain">
      <span class="rname">${ORCA_INTENT.label}</span>
      <div class="rsub">${ORCA_INTENT.scientific} · CANONICAL TAXON · GBIF 2440483</div>
      <div class="liwhy">ENTITY INTENT PRESERVED · observations remain source records, never range or live tracking</div>
    </span>
    <span class="liend">OPEN TAXON →</span>`;
  const activate = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    activateOrcaIntent();
  };
  row.addEventListener("click", activate, true);
  row.addEventListener("keydown", (event) => {
    const key = (event as KeyboardEvent).key;
    if (key === "Enter" || key === " ") activate(event);
  }, true);
  return row;
}

function installCanonicalResult(query: string) {
  const results = document.querySelector<HTMLElement>(".results");
  if (!results) return;
  const existing = results.querySelector<HTMLElement>("[data-atlas-taxon-intent]");
  const matches = ORCA_INTENT.aliases.has(normalise(query));
  if (!matches) {
    existing?.remove();
    return;
  }
  if (existing) return;

  const row = makeCanonicalResult();
  const firstLifeGroup = Array.from(results.querySelectorAll<HTMLElement>(".rgrp"))
    .find((node) => node.textContent?.includes("LIFE"));
  if (firstLifeGroup) firstLifeGroup.insertAdjacentElement("afterend", row);
  else results.prepend(row);
}

function installContextBadge() {
  if (!hasOrcaIntent()) return;
  const existing = document.querySelector<HTMLElement>("[data-atlas-intent-context]");
  if (existing) {
    const speciesLink = existing.querySelector<HTMLAnchorElement>("[data-atlas-species-handoff]");
    if (speciesLink) speciesLink.href = buildSpeciesHref();
    return;
  }

  // Mount independently of World internals. PublicWorld may replace its map
  // subtree while resolving the entity, but the taxon boundary and handoff must survive.
  const badge = document.createElement("aside");
  badge.className = "atlas-intent-context";
  badge.setAttribute("data-atlas-intent-context", ORCA_INTENT.context.id);
  badge.setAttribute("aria-label", "Taxon spatial context boundary");
  badge.innerHTML = `
    <span>${ORCA_INTENT.label.toUpperCase()} · TAXON INTENT</span>
    <b>${ORCA_INTENT.context.label}</b>
    <small>${ORCA_INTENT.context.boundary}</small>
    <a data-atlas-species-handoff href="${buildSpeciesHref()}">OPEN ORCA IN SPECIES →</a>`;
  document.body.appendChild(badge);
}

function restoreContextCamera() {
  if (!hasOrcaIntent()) return false;
  const map = (window as typeof window & { __4planet_map?: any }).__4planet_map;
  if (!map) return false;
  map.stop?.();
  map.easeTo?.({
    center: ORCA_INTENT.context.center,
    zoom: ORCA_INTENT.context.zoom,
    duration: 700,
    essential: true,
  });
  return true;
}

function clearCameraRetry() {
  if (cameraRetryTimer !== null) window.clearTimeout(cameraRetryTimer);
  cameraRetryTimer = null;
  cameraRetryDeadline = 0;
}

function observationSectionReady() {
  const panel = document.querySelector<HTMLElement>(".ctx");
  if (!panel) return false;
  return Array.from(panel.querySelectorAll<HTMLElement>(".sec"))
    .some((section) => section.textContent?.includes("RECORDED OBSERVATIONS"));
}

function attemptContextStabilisation() {
  if (!hasOrcaIntent() || !observationSectionReady()) return false;
  if (!restoreContextCamera()) return false;

  document.documentElement.dataset.atlasTaxonContextStabilised = "true";
  window.setTimeout(() => {
    if (hasOrcaIntent()) restoreContextCamera();
  }, 900);
  clearCameraRetry();
  return true;
}

function stabiliseContextCamera() {
  if (!hasOrcaIntent()) {
    clearCameraRetry();
    return;
  }
  if (document.documentElement.dataset.atlasTaxonContextStabilised === "true") return;
  if (attemptContextStabilisation()) return;

  // World and MapLibre can materialise after the taxon panel. DOM mutation alone
  // is therefore not a reliable map-readiness signal. Once taxon intent exists,
  // retry for a bounded window until both the observations section and canonical
  // map instance exist. This prevents a late arbitrary occurrence camera from
  // becoming the taxon context while remaining fail-closed if the map never loads.
  if (cameraRetryTimer !== null) return;
  if (!cameraRetryDeadline) cameraRetryDeadline = Date.now() + CAMERA_RETRY_WINDOW_MS;
  const retry = () => {
    cameraRetryTimer = null;
    if (!hasOrcaIntent() || document.documentElement.dataset.atlasTaxonContextStabilised === "true") {
      clearCameraRetry();
      return;
    }
    if (attemptContextStabilisation()) return;
    if (Date.now() >= cameraRetryDeadline) {
      clearCameraRetry();
      document.documentElement.dataset.atlasTaxonContextStabilisation = "timeout";
      return;
    }
    cameraRetryTimer = window.setTimeout(retry, CAMERA_RETRY_MS);
  };
  cameraRetryTimer = window.setTimeout(retry, CAMERA_RETRY_MS);
}

export default function AtlasTaxonIntentGuard() {
  useEffect(() => {
    let scheduled = false;
    let boundInput: HTMLInputElement | null = null;

    const sync = () => {
      const input = document.querySelector<HTMLInputElement>(`input[aria-label="${SEARCH_LABEL}"]`);
      if (input) installCanonicalResult(input.value);
      installContextBadge();
      stabiliseContextCamera();
    };

    const scheduleSync = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(() => {
        scheduled = false;
        bindSearchInput();
        sync();
      });
    };

    const onInput = () => scheduleSync();
    const onKeyDown = (event: KeyboardEvent) => {
      const input = event.currentTarget as HTMLInputElement | null;
      if (!input || event.key !== "Enter" || !ORCA_INTENT.aliases.has(normalise(input.value))) return;
      event.preventDefault();
      event.stopPropagation();
      activateOrcaIntent();
    };

    const bindSearchInput = () => {
      const next = document.querySelector<HTMLInputElement>(`input[aria-label="${SEARCH_LABEL}"]`);
      if (next === boundInput) return;
      if (boundInput) {
        boundInput.removeEventListener("input", onInput);
        boundInput.removeEventListener("keydown", onKeyDown, true);
      }
      boundInput = next;
      if (boundInput) {
        boundInput.addEventListener("input", onInput);
        boundInput.addEventListener("keydown", onKeyDown, true);
      }
    };

    const observer = new MutationObserver(scheduleSync);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    bindSearchInput();
    sync();

    return () => {
      if (boundInput) {
        boundInput.removeEventListener("input", onInput);
        boundInput.removeEventListener("keydown", onKeyDown, true);
      }
      observer.disconnect();
      clearCameraRetry();
      document.querySelector("[data-atlas-taxon-intent]")?.remove();
      document.querySelector("[data-atlas-intent-context]")?.remove();
      delete document.documentElement.dataset.atlasTaxonContextStabilised;
      delete document.documentElement.dataset.atlasTaxonContextStabilisation;
    };
  }, []);

  return null;
}
