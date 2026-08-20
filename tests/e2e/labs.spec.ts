import { mkdirSync } from "node:fs";
import { test, expect } from "@playwright/test";

const OUT = "artifacts/labs";
mkdirSync(OUT, { recursive: true });

async function expectViewportContained(page: import("@playwright/test").Page) {
  const widths = await page.evaluate(() => ({ viewport: window.innerWidth, doc: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
  expect(widths.doc).toBeLessThanOrEqual(widths.viewport);
  expect(widths.body).toBeLessThanOrEqual(widths.viewport);
}

test("LABS Gold overview keeps the visual maze but makes portfolio controls useful", async ({ page }, testInfo) => {
  await page.goto("/labs", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("4PLANET LABS", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/PROJECT MAZE \/ CONTROL MAP/i)).toBeVisible();
  await expect(page.getByText(/ALL 4PLANET PROJECTS \+ CONTROLLED TRACKS/i)).toBeVisible();
  await expect(page.locator(".labs-snapshot")).toContainText("20 AUG 2026");

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
  for (const title of ["STRATEGY + GOALS", "EXTERNAL PROOF", "COMPANY + TRUST", "SOLUTIONS", "ECONOMY_", "TREE OF LIFE", "ATLAS", "SPECIES", "FOOD"]) {
    await expect(index.locator("a").filter({ hasText: title }).first()).toBeVisible();
  }

  const search = page.locator(".labs-index-tools input");
  await search.fill("TREE OF LIFE");
  await expect(index.locator("a")).toHaveCount(1);
  await expect(index.locator("a").first()).toContainText("TREE OF LIFE");
  await search.fill("ECONOMY_");
  await expect(index.locator("a").first()).toContainText("ECONOMY_");
  await search.fill("");

  const leading = page.locator(".labs-leading-product-grid .labs-project-box");
  for (const title of ["ONE INTERFACE", "ATLAS", "SPECIES", "LIVING SYSTEMS", "IMPACT"]) {
    await expect(leading.filter({ hasText: title }).first()).toBeVisible();
  }

  if (testInfo.project.name.includes("390") || testInfo.project.name.includes("430")) {
    await expect(page.locator(".labs-page--portfolio .labs-inspector")).toBeHidden();
    await expectViewportContained(page);
  }

  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-labs-gold-overview.png`, fullPage: true });
});

test("ONE INTERFACE detail leads with an active preview, goals, economics and plain-language state", async ({ page }, testInfo) => {
  await page.goto("/labs?project=4planet%2Fproduct%2Fone-interface", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "ONE INTERFACE", level: 1 })).toBeVisible();

  const primary = page.locator(".labs-gold-actions a.is-primary");
  await expect(primary).toHaveText(/OPEN CURRENT PREVIEW/i);
  await expect(primary).toHaveAttribute("href", "https://80023f08.4planet-05.pages.dev");

  for (const label of ["MAIN GOAL", "CURRENT STATE", "NEXT GATE", "ECONOMICS", "SUCCESS LOOKS LIKE", "ECONOMIC GOAL"]) {
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
  }
  await expect(page.getByText(/Founder visual/i).first()).toBeVisible();
  await expect(page.getByText(/No product-specific revenue\/cash verified/i)).toBeVisible();

  const technical = page.locator("details").filter({ hasText: "TECHNICAL EVIDENCE" });
  await expect(technical).not.toHaveAttribute("open", "");
  const visibleText = await page.locator("body").innerText();
  expect(visibleText).not.toMatch(/\b[a-f0-9]{40}\b/i);
  expect(visibleText).not.toContain("0338e94");

  if (testInfo.project.name.includes("390") || testInfo.project.name.includes("430")) await expectViewportContained(page);
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-labs-gold-one-interface.png`, fullPage: true });
});

test("ECONOMY and TREE OF LIFE are first-class findable LABS views with correct boundaries", async ({ page }, testInfo) => {
  await page.goto("/labs?project=4planet%2Feconomy", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "ECONOMY_", level: 1 })).toBeVisible();
  await expect(page.getByText(/DEMO \/ NOT LIVE/i).first()).toBeVisible();
  await expect(page.getByText(/100%/).first()).toBeVisible();
  await expect(page.locator(".labs-gold-actions a").filter({ hasText: "OPEN ECONOMY_ PR #2" })).toHaveAttribute("href", "https://github.com/odinskogen-dev/4PLANET-05/pull/2");

  await page.goto("/labs?project=4planet%2Ftree-of-life", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "TREE OF LIFE", level: 1 })).toBeVisible();
  await expect(page.getByText(/not a fifth product or a new truth system/i).first()).toBeVisible();
  await expect(page.getByText(/No depicted relationship is money, partnership, delivery or impact/i)).toBeVisible();
  await expect(page.locator(".labs-gold-actions a").filter({ hasText: "OPEN TREE OF LIFE PR #80" })).toHaveAttribute("href", "https://github.com/odinskogen-dev/4Planet.05/pull/80");

  if (testInfo.project.name.includes("390") || testInfo.project.name.includes("430")) await expectViewportContained(page);
});

test("SPECIES current state fails closed on the latest Jaguar XR regression", async ({ page }) => {
  await page.goto("/labs?project=4planet%2Fe4rth%2Fspecies", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "SPECIES", level: 1 })).toBeVisible();
  await expect(page.getByText(/latest full gate failed on the Nature XR flat-browser runtime/i).first()).toBeVisible();
  await expect(page.getByText(/Repair the current Journey\/XR exact-head failure/i).first()).toBeVisible();
  await expect(page.getByText(/Planning model: NOK 700k minimum \/ NOK 1.8m base/i)).toBeVisible();
  await expect(page.locator(".labs-gold-actions a").filter({ hasText: "OPEN SPECIES" })).toHaveAttribute("href", "https://4planet.org/species");
});

test("every project-index row resolves to a LABS detail page", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440", "Run exhaustive route sweep once.");
  await page.goto("/labs", { waitUntil: "domcontentloaded" });
  const hrefs = await page.locator(".labs-index-list > a").evaluateAll((nodes) => nodes.map((node) => (node as HTMLAnchorElement).href));
  expect(hrefs.length).toBeGreaterThanOrEqual(35);
  const unique = [...new Set(hrefs)];
  for (const href of unique) {
    const response = await page.request.get(href, { timeout: 15_000 });
    expect(response.status(), `broken internal LABS route ${href}`).toBeLessThan(400);
  }
});

test("curated public/preview links respond", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440", "Run external link health once.");
  const projectPaths = [
    "4planet",
    "4planet/product/one-interface",
    "4planet/product/atlas",
    "4planet/product/living-systems",
    "4planet/product/impact",
    "4planet/e4rth/species",
    "4planet/s4piens/food",
    "4planet/4culture/m4gazine",
    "4planet/economy",
    "4planet/digital-pitch",
    "4planet/tree-of-life",
    "4planet/product/nature-xr",
  ];
  const links = new Set<string>();
  for (const slug of projectPaths) {
    await page.goto(`/labs?project=${encodeURIComponent(slug)}`, { waitUntil: "domcontentloaded" });
    const hrefs = await page.locator(".labs-gold-actions a").evaluateAll((nodes) => nodes.map((node) => (node as HTMLAnchorElement).href));
    hrefs.forEach((href) => links.add(href));
  }
  expect(links.size).toBeGreaterThanOrEqual(12);
  for (const href of links) {
    const response = await page.request.get(href, { timeout: 20_000, failOnStatusCode: false });
    const status = response.status();
    expect(status, `broken curated link ${href} -> ${status}`).toBeGreaterThanOrEqual(200);
    expect(status, `broken curated link ${href} -> ${status}`).toBeLessThan(400);
  }
});
