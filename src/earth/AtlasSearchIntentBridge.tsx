import { useEffect } from "react";
import { LAYERS } from "./layers";

export type AtlasLayerIntent = {
  layerId: string;
  label: string;
  source: string;
  aliases: string[];
};

const INTENTS: AtlasLayerIntent[] = [
  { layerId: "fires", label: "ACTIVE FIRES", source: "NASA GIBS / MODIS", aliases: ["fire", "fires", "wildfire", "wildfires", "active fires", "thermal anomalies"] },
  { layerId: "events", label: "FIRE + EVENTS", source: "NASA EONET", aliases: ["natural events", "events", "storms", "volcanoes", "open events"] },
  { layerId: "quakes", label: "EARTHQUAKES", source: "USGS", aliases: ["earthquake", "earthquakes", "quake", "quakes", "seismic"] },
  { layerId: "forest", label: "FOREST LOSS", source: "Global Forest Watch / UMD", aliases: ["forest loss", "deforestation", "tree cover loss", "forest change"] },
  { layerId: "emissions", label: "CLIMATE TRACE", source: "Climate TRACE", aliases: ["emissions", "climate trace", "greenhouse gas", "co2 emissions", "industrial emissions", "power plant emissions"] },
  { layerId: "emodnet-bathymetry", label: "OCEAN · BATHYMETRY", source: "EMOdnet Bathymetry", aliases: ["bathymetry", "ocean depth", "seabed depth", "sea floor", "seafloor"] },
  { layerId: "emodnet-seabed-habitats", label: "SEABED · HABITATS 2025", source: "EMOdnet Seabed Habitats", aliases: ["seabed habitat", "seabed habitats", "benthic habitat", "benthic habitats", "euseamap"] },
  { layerId: "emodnet-dissolved-oxygen-climatology", label: "OCEAN · OXYGEN CLIMATOLOGY", source: "EMOdnet Chemistry", aliases: ["dissolved oxygen", "ocean oxygen", "oxygen climatology", "marine oxygen"] },
  { layerId: "emodnet-fishing-vessel-density", label: "FISHING · VESSEL DENSITY", source: "EMOdnet Human Activities", aliases: ["fishing vessels", "fishing vessel density", "vessel density", "fishing density", "fishing activity"] },
  { layerId: "coral", label: "CORAL HEAT STRESS", source: "NOAA Coral Reef Watch", aliases: ["coral heat", "coral heat stress", "coral reef heat", "coral bleaching risk"] },
  { layerId: "sst", label: "OCEAN · SEA SURFACE TEMP", source: "NASA GIBS / GHRSST", aliases: ["sea surface temperature", "ocean temperature", "sst", "marine heat"] },
  { layerId: "seaice", label: "SEA ICE", source: "NASA GIBS / AMSRU2", aliases: ["sea ice", "arctic ice", "polar ice"] },
  { layerId: "ndvi", label: "VEGETATION · NDVI", source: "NASA GIBS / MODIS", aliases: ["vegetation", "ndvi", "plant cover", "greenness"] },
  { layerId: "aerosol", label: "AIR · AEROSOLS", source: "NASA GIBS / MODIS", aliases: ["aerosols", "aerosol", "smoke", "dust", "air pollution"] },
  { layerId: "precip", label: "PRECIPITATION", source: "NASA GIBS / IMERG", aliases: ["precipitation", "rain", "rainfall", "snowfall"] },
  { layerId: "night", label: "NASA · NIGHT LIGHTS", source: "NASA GIBS / Black Marble", aliases: ["night lights", "city lights", "light footprint"] },
  { layerId: "biodiv", label: "BIODIVERSITY DENSITY", source: "GBIF", aliases: ["biodiversity", "biodiversity density", "species density", "life density"] },
  { layerId: "whales", label: "WH4LES", source: "OBIS", aliases: ["whale records", "whales", "cetaceans", "cetacean records", "dolphin records"] },
  { layerId: "species", label: "SPECIES", source: "GBIF", aliases: ["species observations", "species records", "occurrence records", "biodiversity records"] },
];

const norm = (value: string) => value.trim().toLowerCase().replace(/[\s_-]+/g, " ");

export function atlasLayerIntentMatches(query: string): AtlasLayerIntent[] {
  const q = norm(query);
  if (q.length < 2) return [];
  const available = new Set(LAYERS.map((layer) => layer.id));
  return INTENTS
    .filter((intent) => available.has(intent.layerId))
    .map((intent) => {
      const exact = intent.aliases.some((alias) => norm(alias) === q);
      const prefix = intent.aliases.some((alias) => norm(alias).startsWith(q) || q.startsWith(norm(alias)));
      const contains = intent.aliases.some((alias) => norm(alias).includes(q) || q.includes(norm(alias)));
      return { intent, score: exact ? 300 : prefix ? 200 : contains ? 100 : 0 };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.intent.label.localeCompare(b.intent.label))
    .slice(0, 4)
    .map((row) => row.intent);
}

function activateLayer(layerId: string) {
  const url = new URL(window.location.href);
  const explicit = (url.searchParams.get("l") || "").split(",").filter(Boolean);
  const active = new Set(explicit.length ? explicit : ["bluemarble"]);
  active.add(layerId);
  url.searchParams.set("l", Array.from(active).join(","));
  window.location.assign(url.toString());
}

function makeIntentRow(intent: AtlasLayerIntent) {
  const row = document.createElement("div");
  row.className = "ritem atlas-intent-result";
  row.setAttribute("role", "option");
  row.tabIndex = 0;
  row.dataset.atlasIntentLayer = intent.layerId;

  const dot = document.createElement("span");
  dot.className = "rdot";
  dot.style.background = "#2E2EFF";

  const main = document.createElement("span");
  main.className = "rmain";
  const name = document.createElement("span");
  name.className = "rname";
  name.textContent = intent.label;
  const sub = document.createElement("div");
  sub.className = "rsub";
  sub.textContent = `DATA LAYER · ${intent.source}`;
  main.append(name, sub);
  row.append(dot, main);

  const open = () => activateLayer(intent.layerId);
  row.addEventListener("click", open);
  row.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open();
    }
  });
  return row;
}

/**
 * Adds data-layer intent to the ONE existing ATLAS search input. It does not
 * create another search UI, place registry, identity model or layer engine.
 * A selected result rewrites the canonical existing `l=` URL state and lets
 * World restore the layer through its normal source/truth machinery.
 */
export function AtlasSearchIntentBridge() {
  useEffect(() => {
    let frame = 0;

    const render = () => {
      frame = 0;
      const input = document.querySelector<HTMLInputElement>('input[aria-label^="Search the living planet"]');
      const results = document.querySelector<HTMLElement>(".results");
      if (!input || !results) return;

      results.querySelectorAll("[data-atlas-intent-bridge]").forEach((node) => node.remove());
      const matches = atlasLayerIntentMatches(input.value);
      if (!matches.length) return;

      const fragment = document.createDocumentFragment();
      const group = document.createElement("div");
      group.className = "rgrp";
      group.dataset.atlasIntentBridge = "group";
      group.textContent = "DATA LAYERS · ACTIVATE";
      fragment.append(group);
      for (const match of matches) {
        const row = makeIntentRow(match);
        row.dataset.atlasIntentBridge = "result";
        fragment.append(row);
      }
      results.prepend(fragment);
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(render);
    };

    const onInput = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches?.('input[aria-label^="Search the living planet"]')) schedule();
    };

    document.addEventListener("input", onInput, true);
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    schedule();

    return () => {
      document.removeEventListener("input", onInput, true);
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      document.querySelectorAll("[data-atlas-intent-bridge]").forEach((node) => node.remove());
    };
  }, []);

  return null;
}
