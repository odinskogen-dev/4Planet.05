/* 4PLANET Brand OS tokens. Master: white / black / brand-blue #2E2EFF. */
import type { DomainKey } from "@/types";

export const T = {
  ink: "#080808",
  paper: "#FFFFFF",
  blue: "#2E2EFF",        // brand blue
  acid: "#3AE86F",        // acid green
  red: "#FF4D22",         // signal red
  pink: "#FF5ACD",        // culture pink
  line: "rgba(8,8,8,.16)",        // line-subtle
  lineStrong: "rgba(8,8,8,.30)",  // stronger hairline
  lineOnDark: "rgba(255,255,255,.22)",
  dim: "#080808",              // v25: grey abolished — was rgba(8,8,8,.60)
  faint: "rgba(8,8,8,.40)",
  radius: 0,
  sans: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  display: "'Instrument Sans', 'DM Sans', sans-serif",
  mono: "'Fragment Mono', ui-monospace, 'SF Mono', monospace",
} as const;

export const DOMAIN_ACCENT: Record<DomainKey, string> = {
  "OCE4N_": "#2E2EFF",
  "E4RTH_": "#3AE86F",
  "S4PIENS_": "#FF4D22",
  "4CULTURE_": "#FF5ACD",
};

// Immersive dark base per domain
export const DOMAIN_BASE: Record<DomainKey, string> = {
  "OCE4N_": "#04081C",
  "E4RTH_": "#000000",
  "S4PIENS_": "#17120F",
  "4CULTURE_": "#150A1C",
};

export const DOMAIN_DESC: Record<DomainKey, string> = {
  "OCE4N_": "THE LIVING OCEAN",
  "E4RTH_": "THE LIVING LAND",
  "S4PIENS_": "THE SYSTEMS WE BUILD",
  "4CULTURE_": "CULTURE FOR ACTION",
};

// ~50% of missions render as full dark worlds (shared by mission page + header context)
export const DARK_MISSIONS = new Set<string>([
  "wh4les", "cor4l", "pl4stic", "4ntarctica", "am4zonia", "rewild", "4film", "4play",
]);
