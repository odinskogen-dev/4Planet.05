import {
  EMODNET_DISSOLVED_OXYGEN_CLIMATOLOGY,
  EMODNET_FISHING_VESSEL_DENSITY,
  type SandboxRasterDescriptor,
} from "@/sandbox/atlasDataSources";

export type AtlasTimeOption = {
  value: string;
  label: string;
  caveat?: string;
};

export type AtlasTimeAxis = {
  layerId: string;
  label: string;
  semantic: "YEAR" | "MONTH_CLIMATOLOGY" | "DATE" | "LATEST_AVAILABLE";
  descriptor: SandboxRasterDescriptor;
  defaultValue: string;
  options: AtlasTimeOption[];
  explanation: string;
};

const years = Array.from({ length: 8 }, (_, i) => 2017 + i);
const months = [
  ["01", "JAN"], ["02", "FEB"], ["03", "MAR"], ["04", "APR"],
  ["05", "MAY"], ["06", "JUN"], ["07", "JUL"], ["08", "AUG"],
  ["09", "SEP"], ["10", "OCT"], ["11", "NOV"], ["12", "DEC"],
] as const;

export const ATLAS_TIME_AXES: AtlasTimeAxis[] = [
  {
    layerId: EMODNET_FISHING_VESSEL_DENSITY.id,
    label: "FISHING VESSEL DENSITY",
    semantic: "YEAR",
    descriptor: EMODNET_FISHING_VESSEL_DENSITY,
    defaultValue: "2023-01-01T00:00:00Z",
    options: years.map((year) => ({
      value: `${year}-01-01T00:00:00Z`,
      label: String(year),
      caveat: year === 2024
        ? "Provider metadata reports reduced satellite-data density during part of 2024."
        : undefined,
    })),
    explanation: "Annual average AIS-derived vessel density. This is historical activity context, not live fishing.",
  },
  {
    layerId: EMODNET_DISSOLVED_OXYGEN_CLIMATOLOGY.id,
    label: "OCEAN OXYGEN · SURFACE",
    semantic: "MONTH_CLIMATOLOGY",
    descriptor: EMODNET_DISSOLVED_OXYGEN_CLIMATOLOGY,
    defaultValue: "08",
    options: months.map(([value, label]) => ({ value, label })),
    explanation: "Monthly climatology at the surface. Moving month changes the long-term seasonal pattern, not a live reading.",
  },
];

export function timeAxisForLayer(layerId: string) {
  return ATLAS_TIME_AXES.find((axis) => axis.layerId === layerId) || null;
}

const STORAGE_KEY = "4planet.atlas.data-lab.time.v1";

export function readStoredAtlasTime(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function storeAtlasTime(state: Record<string, string>) {
  if (typeof window === "undefined") return;
  try { window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* optional persistence */ }
  document.documentElement.setAttribute("data-atlas-time-state", JSON.stringify(state));
}
