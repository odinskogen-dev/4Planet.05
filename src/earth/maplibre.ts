// Shared bundler entry: every map gets the same same-origin module worker.
// Keep attribution and CSP unchanged; this is candidate compatibility wiring.
import * as maplibregl from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

maplibregl.setWorkerUrl(workerUrl);

export * from "maplibre-gl";
