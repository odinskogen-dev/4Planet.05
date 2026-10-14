import fs from "node:fs";
import path from "node:path";
import type { BrowserContext, Page } from "@playwright/test";

/**
 * IMPACT fixture mode (IMPACT_FIXTURE=1): NATUREBRAIN projection payloads are served
 * from tests/fixtures/impact — produced by scripts/impact-projection-harness.mjs from
 * the real migrations (+ the clearly-labelled AXE test seed). Without the flag the
 * specs run against the real NATUREBRAIN behind BASE_URL (e.g. test.4planet.org).
 */
export const IMPACT_FIXTURE = process.env.IMPACT_FIXTURE === "1";

const dir = path.join(process.cwd(), "tests/fixtures/impact");
const load = (name: string) => JSON.parse(fs.readFileSync(path.join(dir, name), "utf8"));

export type ImpactFixtureMode = "v01-only" | "v02" | "v02-with-axe-seed" | "unavailable";

export async function serveImpactFixture(target: BrowserContext | Page, mode: ImpactFixtureMode = "v01-only") {
  const v01 = load("impact-lan-gold-v01.json");
  const v02 = mode === "v02" ? load("impact-lan-v02.json") : mode === "v02-with-axe-seed" ? load("impact-lan-v02-with-seeds.json") : null;
  await target.route("**/rest/v1/rpc/impact_lan_v02", (route) => {
    if (mode === "unavailable") return route.fulfill({ status: 503, body: "unavailable" });
    if (!v02) return route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ code: "PGRST202", message: "Could not find the function public.impact_lan_v02" }) });
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(v02) });
  });
  await target.route("**/rest/v1/rpc/impact_lan_gold_v01", (route) =>
    mode === "unavailable"
      ? route.fulfill({ status: 503, body: "unavailable" })
      : route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(v01) }));
  // Keep fixture runs hermetic: third-party fonts/SDK/analytics are not part of this proof.
  await target.route(/^https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.jsdelivr\.net|unpkg\.com|www\.googletagmanager\.com|eu\.i\.posthog\.com)\//, (route) => route.abort());
}
