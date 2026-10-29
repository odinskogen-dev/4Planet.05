import { mkdirSync } from "node:fs";
import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:4173";
const OUTPUT = "artifacts/product-proof";

mkdirSync(OUTPUT, { recursive: true });

type DefinitionPair = { term: string; value: string };

function hasDefinitionPair(pairs: DefinitionPair[], term: string, value: string) {
  return pairs.some((pair) => pair.term === term && pair.value === value);
}

async function readDefinitionPairs(list: import("@playwright/test").Locator) {
  return list.locator(":scope > div").evaluateAll((rows) =>
    rows.map((row) => ({
      term: row.querySelector("dt")?.textContent?.trim() ?? "",
      value: row.querySelector("dd")?.textContent?.trim() ?? "",
    })),
  );
}

type OccurrenceTruthState = "PUBLIC_RECORDS" | "NO_PUBLIC_RECORDS" | "SOURCE_UNAVAILABLE";

const OCCURRENCE_TRUTH_PATTERN =
  /reported observations are not current position, abundance or complete range|nothing from this response is plotted|GBIF observation source is currently unavailable or returned no matching records/i;

function occurrenceTruthState(text: string): OccurrenceTruthState | null {
  if (/reported observations are not current position, abundance or complete range/i.test(text)) return "PUBLIC_RECORDS";
  if (/nothing from this response is plotted/i.test(text) && /rights review/i.test(text)) return "NO_PUBLIC_RECORDS";
  if (/GBIF observation source is currently unavailable or returned no matching records/i.test(text) && /no public observation is implied or plotted/i.test(text)) return "SOURCE_UNAVAILABLE";
  return null;
}

function findOccurrenceBoundary(section: import("@playwright/test").Locator) {
  return section.locator("p").filter({ hasText: OCCURRENCE_TRUTH_PATTERN }).first();
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

async function settleVisuals(page: import("@playwright/test").Page) {
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}" });
  await page.waitForTimeout(800);
}

async function verifySharedNavigation(page: import("@playwright/test").Page) {
  const width = page.viewportSize()?.width ?? 1440;
  await expect(page.getByRole("link", { name: "4PLANET home" })).toBeVisible();

  if (width <= 920) {
    const trigger = page.getByRole("button", { name: "Open menu" });
    await expect(trigger).toBeVisible();
    await trigger.click();

    const dialog = page.getByRole("dialog", { name: "4PLANET navigation" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("EXPLORE_", { exact: true })).toBeVisible();
    for (const name of ["ATLAS", "SPECIES", "LIVING SYSTEMS", "IMPACT"]) {
      await expect(dialog.getByRole("link", { name: new RegExp(`^${name}`) }).first()).toBeVisible();
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    return;
  }

  const trigger = page.getByRole("button", { name: "EXPLORE", exact: true });
  await expect(trigger).toBeVisible();
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");

  const region = page.getByRole("region", { name: "EXPLORE navigation" });
  await expect(region).toBeVisible();
  for (const name of ["ATLAS", "SPECIES", "LIVING SYSTEMS", "IMPACT"]) {
    await expect(region.getByRole("link", { name: new RegExp(`^${name}`) }).first()).toBeVisible();
  }
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(region).toBeHidden();
}

async function waitForAtlasRenderable(page: import("@playwright/test").Page) {
  await page.waitForFunction(() => {
    const map = (window as any).__4planet_map;
    const canvas = document.querySelector<HTMLCanvasElement>(".maplibregl-canvas");
    if (!map || !canvas || canvas.width < 100 || canvas.height < 100) return false;
    try {
      const style = map.getStyle?.();
      return map.getCanvas?.() === canvas && Array.isArray(style?.layers) && style.layers.length > 0;
    } catch {
      return false;
    }
  });
  await expect(page.locator(".maplibregl-canvas")).toBeVisible();
}

test("desktop proof captures the public entry, source-aware Orca profile and retained ATLAS context", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });

  await page.goto(`${BASE}/`);
  await verifySharedNavigation(page);
  await expect(page.locator("main")).toBeVisible();
  await settleVisuals(page);
  await page.screenshot({ path: `${OUTPUT}/01-4planet-desktop.png` });

  await page.goto(`${BASE}/species/orca?entity=taxon%3Agbif%3A2440483&journey=orca-gbif`);
  await verifySharedNavigation(page);
  await expect(page.getByRole("heading", { name: "Orca", exact: true })).toBeVisible();
  const sourceIdentityList = page.locator("dl").filter({ has: page.locator("dt", { hasText: /^Taxon$/ }) }).first();
  const sourceIdentityPairs = await readDefinitionPairs(sourceIdentityList);
  expect(hasDefinitionPair(sourceIdentityPairs, "Taxon", "ACCEPTED")).toBe(true);
  expect(hasDefinitionPair(sourceIdentityPairs, "Source identity", "GBIF 2440483")).toBe(true);

  const sourceIdentityValue = sourceIdentityList.locator("dt", { hasText: /^Source identity$/ }).locator("..").locator("dd");
  const originalSourceIdentity = (await sourceIdentityValue.textContent())?.trim() ?? "";
  await sourceIdentityValue.evaluate((node) => { node.textContent = "GBIF 0"; });
  expect(hasDefinitionPair(await readDefinitionPairs(sourceIdentityList), "Source identity", "GBIF 2440483")).toBe(false);
  await sourceIdentityValue.evaluate((node, value) => { node.textContent = value; }, originalSourceIdentity);
  expect(hasDefinitionPair(await readDefinitionPairs(sourceIdentityList), "Source identity", "GBIF 2440483")).toBe(true);

  const occurrenceSection = page.locator('[data-species-section="atlas"]');
  await expect(occurrenceSection.getByText("WHERE RECORDED", { exact: true })).toBeVisible();
  await expect(occurrenceSection.getByRole("heading", { name: "Explore reported observations." })).toBeVisible();
  await expect(occurrenceSection.getByRole("link", { name: "OPEN OBSERVATIONS IN ATLAS" })).toBeVisible();
  const occurrenceBoundary = findOccurrenceBoundary(occurrenceSection);
  await expect(occurrenceBoundary).toBeVisible();
  const originalOccurrenceBoundary = (await occurrenceBoundary.textContent())?.trim() ?? "";
  const originalOccurrenceState = occurrenceTruthState(originalOccurrenceBoundary);
  expect(originalOccurrenceState).not.toBeNull();
  await occurrenceBoundary.evaluate((node) => { node.textContent = "These are live animal positions."; });
  expect(occurrenceTruthState((await occurrenceBoundary.textContent()) ?? "")).toBeNull();
  await occurrenceBoundary.evaluate((node, value) => { node.textContent = value; }, originalOccurrenceBoundary);
  expect(occurrenceTruthState((await occurrenceBoundary.textContent()) ?? "")).toBe(originalOccurrenceState);
  await settleVisuals(page);
  await page.screenshot({ path: `${OUTPUT}/02-orca-source-proof-desktop.png`, fullPage: true });

  const watchButton = page.getByRole("button", { name: "ADD TO LOCAL WATCH" });
  await expect(watchButton).toBeVisible();
  await watchButton.click();
  await expect(page.getByRole("button", { name: "WATCHING LOCALLY" })).toBeVisible();

  await page.getByRole("link", { name: /OPEN SAME ENTITY IN ATLAS/ }).click();
  await expect(page).toHaveURL(/\/atlas\?/);
  await expect(page).toHaveURL(/entity=taxon%3Agbif%3A2440483/);
  await expect(page).toHaveURL(/journey=orca-gbif/);
  await waitForAtlasRenderable(page);
  await page.waitForTimeout(2500);
  await settleVisuals(page);
  await page.screenshot({ path: `${OUTPUT}/03-atlas-context-desktop.png` });
});

test("Orca occurrence truth keeps public, rights-review-only and unavailable states separate", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const occurrenceUrl = "**/v1/occurrence/search?taxonKey=2440483*";
  const cases: Array<{
    state: OccurrenceTruthState;
    status?: number;
    payload?: Record<string, unknown>;
  }> = [
    {
      state: "PUBLIC_RECORDS",
      payload: {
        count: 1,
        results: [{
          key: 1001,
          occurrenceStatus: "PRESENT",
          hasGeospatialIssue: false,
          decimalLatitude: 60,
          decimalLongitude: 5,
          scientificName: "Orcinus orca",
          license: "CC0",
        }],
      },
    },
    {
      state: "NO_PUBLIC_RECORDS",
      payload: {
        count: 1,
        results: [{
          key: 1002,
          occurrenceStatus: "PRESENT",
          hasGeospatialIssue: false,
          decimalLatitude: 60,
          decimalLongitude: 5,
          scientificName: "Orcinus orca",
          license: "All rights reserved",
        }],
      },
    },
    { state: "SOURCE_UNAVAILABLE", status: 503 },
  ];

  for (const scenario of cases) {
    await page.route(occurrenceUrl, async (route) => {
      if (scenario.status) await route.fulfill({ status: scenario.status, body: "{}" });
      else await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(scenario.payload) });
    }, { times: 1 });

    await page.goto(`${BASE}/species/orca?entity=taxon%3Agbif%3A2440483&journey=orca-gbif&state=${scenario.state}`);
    const section = page.locator('[data-species-section="atlas"]');
    const boundary = findOccurrenceBoundary(section);
    await expect(boundary).toBeVisible();
    const original = (await boundary.textContent())?.trim() ?? "";
    expect(occurrenceTruthState(original)).toBe(scenario.state);

    if (scenario.state === "NO_PUBLIC_RECORDS") {
      await expect(boundary).toContainText("Nothing from this response is plotted");
      await expect(boundary).toContainText("requires rights review");
    }

    await boundary.evaluate((node) => { node.textContent = "These are live animal positions."; });
    expect(occurrenceTruthState((await boundary.textContent()) ?? "")).toBeNull();
    await boundary.evaluate((node, value) => { node.textContent = value; }, original);
    expect(occurrenceTruthState((await boundary.textContent()) ?? "")).toBe(scenario.state);
    await page.unroute(occurrenceUrl);
  }
});

test("mobile proof preserves navigation, source limits, local Watch and a readable footer", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto(`${BASE}/`);
  await verifySharedNavigation(page);
  await expect(page.locator("main")).toBeVisible();
  await settleVisuals(page);
  await page.screenshot({ path: `${OUTPUT}/04-4planet-mobile.png` });

  await page.goto(`${BASE}/species/orca?entity=taxon%3Agbif%3A2440483&journey=orca-gbif`);
  await verifySharedNavigation(page);
  await expect(page.getByRole("heading", { name: "Orca", exact: true })).toBeVisible();
  const mobileSourceIdentityList = page.locator("dl").filter({ has: page.locator("dt", { hasText: /^Taxon$/ }) }).first();
  expect(hasDefinitionPair(await readDefinitionPairs(mobileSourceIdentityList), "Taxon", "ACCEPTED")).toBe(true);
  expect(hasDefinitionPair(await readDefinitionPairs(mobileSourceIdentityList), "Source identity", "GBIF 2440483")).toBe(true);
  const mobileOccurrenceSection = page.locator('[data-species-section="atlas"]');
  await expect(mobileOccurrenceSection.getByText("WHERE RECORDED", { exact: true })).toBeVisible();
  await expect(mobileOccurrenceSection.getByRole("link", { name: "OPEN OBSERVATIONS IN ATLAS" })).toBeVisible();
  const mobileOccurrenceBoundary = findOccurrenceBoundary(mobileOccurrenceSection);
  await expect(mobileOccurrenceBoundary).toBeVisible();
  expect(occurrenceTruthState((await mobileOccurrenceBoundary.textContent()) ?? "")).not.toBeNull();
  await expect(page.getByRole("button", { name: /ADD TO LOCAL WATCH|WATCHING LOCALLY/ })).toBeVisible();
  await settleVisuals(page);

  const mobileLayout = await page.evaluate(() => {
    const footerGrid = document.querySelector<HTMLElement>(".foot-grid");
    if (!footerGrid) return null;
    return {
      columns: getComputedStyle(footerGrid).gridTemplateColumns.split(" ").filter(Boolean).length,
      pageWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    };
  });
  expect(mobileLayout).not.toBeNull();
  expect(mobileLayout!.columns).toBe(1);
  expect(mobileLayout!.pageWidth).toBeLessThanOrEqual(mobileLayout!.viewportWidth + 1);

  await page.screenshot({ path: `${OUTPUT}/05-orca-source-proof-mobile.png` });
  const footer = page.locator(".foot-grid").first();
  await footer.scrollIntoViewIfNeeded();
  await expect(footer).toBeVisible();
  await footer.screenshot({ path: `${OUTPUT}/05b-orca-footer-mobile.png` });
});

test("IMPACT direct routes remain explicit local tests with no physical delivery", async ({ page }) => {
  for (const unit of ["tree", "plastic"]) {
    await page.goto(`${BASE}/impact/lab/${unit}`);
    await verifySharedNavigation(page);
    await expect(page.getByText("TEST RECORD — NO PHYSICAL DELIVERY", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("NOT DELIVERED", { exact: false }).first()).toBeVisible();
    await settleVisuals(page);
    // Functional assertions above are the product gate. Evidence capture must not
    // fail because WebKit cannot rasterise a page taller than its 32767px texture
    // limit. A viewport screenshot preserves the visible tested state without
    // misclassifying an engine raster limit as a product regression.
    await page.screenshot({ path: `${OUTPUT}/06-${unit}-test-journey.png` });
  }
});