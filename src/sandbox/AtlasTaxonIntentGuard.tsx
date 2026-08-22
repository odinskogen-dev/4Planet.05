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

function normalise(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
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
  results.querySelector("[data-atlas-taxon-intent]")?.remove();
  if (!ORCA_INTENT.aliases.has(normalise(query))) return;

  const row = makeCanonicalResult();
  const firstLifeGroup = Array.from(results.querySelectorAll<HTMLElement>(".rgrp"))
    .find((node) => node.textContent?.includes("LIFE"));
  if (firstLifeGroup) firstLifeGroup.insertAdjacentElement("afterend", row);
  else results.prepend(row);
}

function installContextBadge() {
  const url = new URL(window.location.href);
  if (url.searchParams.get("intent") !== "taxon" || url.searchParams.get("entity") !== ORCA_INTENT.id) return;
  if (document.querySelector("[data-atlas-intent-context]") || !document.querySelector(".world")) return;

  const badge = document.createElement("aside");
  badge.className = "atlas-intent-context";
  badge.setAttribute("data-atlas-intent-context", ORCA_INTENT.context.id);
  badge.setAttribute("aria-label", "Taxon spatial context boundary");
  badge.innerHTML = `
    <span>${ORCA_INTENT.label.toUpperCase()} · TAXON INTENT</span>
    <b>${ORCA_INTENT.context.label}</b>
    <small>${ORCA_INTENT.context.boundary}</small>`;
  document.querySelector(".world")?.appendChild(badge);
}

function stabiliseContextCamera() {
  const url = new URL(window.location.href);
  if (url.searchParams.get("intent") !== "taxon" || url.searchParams.get("entity") !== ORCA_INTENT.id) return;
  const map = (window as typeof window & { __4planet_map?: any }).__4planet_map;
  const panel = document.querySelector<HTMLElement>(".ctx");
  if (!map || !panel || !panel.textContent?.includes(ORCA_INTENT.label)) return;

  const observationSection = Array.from(panel.querySelectorAll<HTMLElement>(".sec"))
    .find((section) => section.textContent?.includes("RECORDED OBSERVATIONS"));
  if (!observationSection || observationSection.textContent?.includes("···")) return;
  if (document.documentElement.dataset.atlasTaxonContextStabilised === "true") return;

  document.documentElement.dataset.atlasTaxonContextStabilised = "true";
  map.stop?.();
  map.easeTo?.({
    center: ORCA_INTENT.context.center,
    zoom: ORCA_INTENT.context.zoom,
    duration: 700,
    essential: true,
  });
}

export default function AtlasTaxonIntentGuard() {
  useEffect(() => {
    let query = "";
    const input = document.querySelector<HTMLInputElement>(`input[aria-label="${SEARCH_LABEL}"]`);
    if (!input) return;

    const sync = () => {
      query = input.value;
      installCanonicalResult(query);
      installContextBadge();
      stabiliseContextCamera();
    };

    const onInput = () => sync();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || !ORCA_INTENT.aliases.has(normalise(input.value))) return;
      event.preventDefault();
      event.stopPropagation();
      activateOrcaIntent();
    };

    input.addEventListener("input", onInput);
    input.addEventListener("keydown", onKeyDown, true);

    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    sync();

    return () => {
      input.removeEventListener("input", onInput);
      input.removeEventListener("keydown", onKeyDown, true);
      observer.disconnect();
      document.querySelector("[data-atlas-taxon-intent]")?.remove();
      document.querySelector("[data-atlas-intent-context]")?.remove();
      delete document.documentElement.dataset.atlasTaxonContextStabilised;
    };
  }, []);

  return null;
}
