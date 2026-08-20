import { mkdirSync } from "node:fs";
import { test, expect } from "@playwright/test";

const OUT = "artifacts/labs";
mkdirSync(OUT, { recursive: true });

async function expectViewportContained(page: import("@playwright/test").Page) {
  const widths = await page.evaluate(() => ({ viewport: window.innerWidth, doc: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
  expect(widths.doc).toBeLessThanOrEqual(widths.viewport);
  expect(widths.body).toBeLessThanOrEqual(widths.viewport);
}

test("LABS Gold overview preserves the maze and exposes the current portfolio", async ({ page }, testInfo) => {
  await page.goto("/labs", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("4PLANET LABS", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/PROJECT MAZE \/ CONTROL MAP/i)).toBeVisible();
  await expect(page.getByText(/ALL 4PLANET PROJECTS \+ CONTROLLED TRACKS/i)).toBeVisible();
  await expect(page.locator(".labs-snapshot")).toContainText("21 AUG 2026");

  for (const label of ["PROJECT HOMES", "ACTIVE NOW", "PRODUCT SURFACES", "LAB / PROTOTYPES", "OPEN CONFLICTS"]) {
    await expect(page.locator(".labs-command-card").filter({ hasText: label }).first()).toBeVisible();
  }

  const urlBefore = page.url();
  await page.locator(".labs-command-card").filter({ hasText: "ACTIVE NOW" }).click();
  await expect(page).toHaveURL(urlBefore);
  await expect(page.locator("#project-index")).toBeVisible();
  await expect(page.locator(".labs-index-tools button.is-active")).toHaveText("ACTIVE");

  await page.locator(".labs-index-tools button").filter({ hasText: /^ALL$/ }).click();
  const index = page.locator(".labs-index-list");
  for (const title of ["STRATEGY + GOALS", "EXTERNAL PROOF", "COMPANY + TRUST", "SOLUTIONS", "ECONOMY_", "SONIC", "TREE OF LIFE", "CREATOR ENGINE", "ATLAS", "SPECIES", "FOOD"]) {
    await expect(index.locator("a").filter({ hasText: title }).first()).toBeVisible();
  }

  const search = page.locator(".labs-index-tools input");
  await search.fill("CREATOR ENGINE");
  await expect(index.locator("a")).toHaveCount(1);
  await expect(index.locator("a").first()).toContainText("CREATOR ENGINE");
  await search.fill("SONIC");
  await expect(index.locator("a").first()).toContainText("SONIC");
  await search.fill("");

  const leading = page.locator(".labs-leading-product-grid .labs-project-box");
  for (const title of ["ONE INTERFACE", "ATLAS", "SPECIES", "LIVING SYSTEMS", "IMPACT"]) {
    await expect(leading.filter({ hasText: title }).first()).toBeVisible();
  }

  if (testInfo.project.name.includes("390") || testInfo.project.name.includes("430")) {
    await expect(page.locator(".labs-page--portfolio .labs-inspector")).toBeHidden();
    await expectViewportContained(page);
  }

  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-labs-v6-overview.png`, fullPage: true });
});

test("ONE INTERFACE detail leads with a usable current preview and full project contract", async ({ page }, testInfo) => {
  await page.goto("/labs?project=4planet%2Fproduct%2Fone-interface", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "ONE INTERFACE", level: 1 })).toBeVisible();

  const primary = page.locator(".labs-gold-actions a.is-primary");
  await expect(primary).toHaveText(/OPEN CURRENT PREVIEW/i);
  await expect(primary).toHaveAttribute("href", "https://e32a35e9.4planet-05.pages.dev");

  for (const label of ["PROJECT BRIEF", "CURRENT STATE", "WHY THIS PROJECT EXISTS", "OWNER / OPERATING MODEL", "GOAL CONTRACT", "MAIN GOAL", "SUCCESS / PROOF", "ECONOMIC GOAL", "EXECUTION", "WORK NOW", "WORK NEXT", "FOUNDER GATE", "WBS / PROCESS COVERAGE", "MONEY + PROOF", "ECONOMICS", "MONEY TRUTH", "EVIDENCE / PROOF"]) {
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
  }
  await expect(page.getByText(/Founder visual/i).first()).toBeVisible();
  await expect(page.getByText(/No product-specific revenue or cash is verified/i)).toBeVisible();

  const technical = page.locator("details").filter({ hasText: "TECHNICAL / RECOVERY EVIDENCE" });
  await expect(technical).not.toHaveAttribute("open", "");
  const visibleText = await page.locator("body").innerText();
  expect(visibleText).not.toMatch(/\b[a-f0-9]{40}\b/i);

  if (testInfo.project.name.includes("390") || testInfo.project.name.includes("430")) await expectViewportContained(page);
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-labs-v6-one-interface.png`, fullPage: true });
});

test("ECONOMY fails closed on its broken digital home and TREE OF LIFE stays bounded", async ({ page }, testInfo) => {
  await page.goto("/labs?project=4planet%2Feconomy", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "ECONOMY_", level: 1 })).toBeVisible();
  await expect(page.getByText(/DEMO \/ NOT LIVE/i).first()).toBeVisible();
  await expect(page.getByText(/100% reconciliation/i).first()).toBeVisible();
  await expect(page.getByText("NO VERIFIED FOUNDER-FACING LINK YET", { exact: true })).toBeVisible();
  await expect(page.locator("a[href*='4PLANET-05/pull/2']")).toHaveCount(0);

  await page.goto("/labs?project=4planet%2Ftree-of-life", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "TREE OF LIFE", level: 1 })).toBeVisible();
  await expect(page.getByText(/another product or truth store/i).first()).toBeVisible();
  await expect(page.getByText(/No depicted relationship is money, partnership, delivery or impact/i).first()).toBeVisible();
  await expect(page.locator(".labs-gold-actions a").filter({ hasText: "OPEN TREE OF LIFE PR #80" })).toHaveAttribute("href", "https://github.com/odinskogen-dev/4Planet.05/pull/80");

  if (testInfo.project.name.includes("390") || testInfo.project.name.includes("430")) await expectViewportContained(page);
});

test("SPECIES separates accepted baseline from newer draft work and has unambiguous links", async ({ page }) => {
  await page.goto("/labs?project=4planet%2Fe4rth%2Fspecies", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "SPECIES", level: 1 })).toBeVisible();
  await expect(page.getByText(/accepted internal shared-context Jaguar baseline/i).first()).toBeVisible();
  await expect(page.getByText(/newer exact-head work remains draft/i).first()).toBeVisible();
  await expect(page.getByText(/Planning model: NOK 700k minimum \/ NOK 1.8m base/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /OPEN SPECIES PRODUCT/i })).toHaveAttribute("href", "https://4planet.org/species");
  await expect(page.getByRole("link", { name: /OPEN SPECIES MISSION/i })).toHaveAttribute("href", "https://4planet.org/missions/species");
  await expect(page.getByRole("link", { name: /OPEN ACCEPTED JAGUAR BASELINE/i })).toHaveAttribute("href", "https://756dff8b.4planet-05.pages.dev/journey/jaguar/");
});

test("SONIC and CREATOR ENGINE are real routable current projects", async ({ page }, testInfo) => {
  await page.goto("/labs?project=4planet%2Fsonic", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "SONIC", level: 1 })).toBeVisible();
  await expect(page.getByText(/No coded SONIC primitive/i).first()).toBeVisible();
  await expect(page.getByText("NO VERIFIED FOUNDER-FACING LINK YET", { exact: true })).toBeVisible();

  await page.goto("/labs?project=4planet%2Flabs-system%2Fcreator-engine", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "CREATOR ENGINE", level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /OPEN CRE4TORS_ V0.3/i })).toHaveAttribute("href", "https://e8c3e7d9.4planet-05.pages.dev/cre4tors");
  await expect(page.getByText(/real creator workflow\/economic proof remain open/i).first()).toBeVisible();

  if (testInfo.project.name.includes("390") || testInfo.project.name.includes("430")) await expectViewportContained(page);
});

test("every project-index row resolves and renders the V6 project-control skeleton", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440", "Run exhaustive project sweep once.");
  await page.goto("/labs", { waitUntil: "domcontentloaded" });
  const hrefs = await page.locator(".labs-index-list > a").evaluateAll((nodes) => nodes.map((node) => (node as HTMLAnchorElement).href));
  expect(hrefs.length).toBeGreaterThanOrEqual(35);
  const unique = [...new Set(hrefs)];
  for (const href of unique) {
    const response = await page.goto(href, { waitUntil: "domcontentloaded", timeout: 15_000 });
    expect(response?.status() ?? 200, `broken internal LABS route ${href}`).toBeLessThan(400);
    await expect(page.locator("h1").first()).toBeVisible();
    for (const label of ["PROJECT BRIEF", "GOAL CONTRACT", "EXECUTION", "MONEY + PROOF"]) {
      await expect(page.getByText(label, { exact: true }).first(), `${label} missing on ${href}`).toBeVisible();
    }
  }
});

test("all current Founder-facing project links respond", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440", "Run external link health once.");
  await page.goto("/labs", { waitUntil: "domcontentloaded" });
  const projectHrefs = await page.locator(".labs-index-list > a").evaluateAll((nodes) => nodes.map((node) => (node as HTMLAnchorElement).href));
  const links = new Set<string>();
  for (const href of [...new Set(projectHrefs)]) {
    await page.goto(href, { waitUntil: "domcontentloaded", timeout: 15_000 });
    const external = await page.locator(".labs-gold-actions a").evaluateAll((nodes) => nodes.map((node) => (node as HTMLAnchorElement).href));
    external.forEach((link) => links.add(link));
  }
  expect(links.size).toBeGreaterThanOrEqual(12);
  const all = [...links];
  for (let offset = 0; offset < all.length; offset += 6) {
    const batch = all.slice(offset, offset + 6);
    const results = await Promise.all(batch.map(async (href) => {
      const response = await page.request.get(href, { timeout: 20_000, failOnStatusCode: false });
      return { href, status: response.status() };
    }));
    for (const { href, status } of results) {
      expect(status, `broken Founder-facing link ${href} -> ${status}`).toBeGreaterThanOrEqual(200);
      expect(status, `broken Founder-facing link ${href} -> ${status}`).toBeLessThan(400);
    }
  }
});
