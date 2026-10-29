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
  const occurrenceBoundaryNode = await occurrenceBoundary.elementHandle();
  expect(occurrenceBoundaryNode).not.toBeNull();
  const originalOccurrenceBoundary = (await occurrenceBoundaryNode!.textContent())?.trim() ?? "";
  const originalOccurrenceState = occurrenceTruthState(originalOccurrenceBoundary);
  expect(originalOccurrenceState).not.toBeNull();
  await occurrenceBoundaryNode!.evaluate((node) => { node.textContent = "These are live animal positions."; });
  expect(occurrenceTruthState((await occurrenceBoundaryNode!.textContent()) ?? "")).toBeNull();
  expect(await occurrenceBoundaryNode!.evaluate((node) => node.isConnected)).toBe(true);
  await occurrenceBoundaryNode!.evaluate((node, value) => { node.textContent = value; }, originalOccurrenceBoundary);
  expect(occurrenceTruthState((await occurrenceBoundaryNode!.textContent()) ?? "")).toBe(originalOccurrenceState);
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
    const boundaryNode = await boundary.elementHandle();
    expect(boundaryNode).not.toBeNull();
    const original = (await boundaryNode!.textContent())?.trim() ?? "";
    expect(occurrenceTruthState(original)).toBe(scenario.state);

    if (scenario.state === "NO_PUBLIC_RECORDS") {
      await expect(boundary).toContainText("Nothing from this response is plotted");
      await expect(boundary).toContainText("requires rights review");
    }

    await boundaryNode!.evaluate((node) => { node.textContent = "These are live animal positions."; });
    expect(occurrenceTruthState((await boundaryNode!.textContent()) ?? "")).toBeNull();
    expect(await boundaryNode!.evaluate((node) => node.isConnected)).toBe(true);
    await boundaryNode!.evaluate((node, value) => { node.textContent = value; }, original);
    expect(occurrenceTruthState((await boundaryNode!.textContent()) ?? "")).toBe(scenario.state);
    await page.unroute(occurrenceUrl);
  }
});

test("mobile proof preserves navigation, source limits, local Watch and route-correct footers", async ({ page }) => {
  const configuredViewport = page.viewportSize();
  expect(configuredViewport).not.toBeNull();

  await page.goto(`${BASE}/`);
  await verifySharedNavigation(page);
  await expect(page.locator("main")).toBeVisible();

  const homeFooter = page.locator("footer").last();
  await homeFooter.scrollIntoViewIfNeeded();
  await expect(homeFooter).toBeVisible();

  const homeFooterGrid = homeFooter.locator(".foot-grid").first();
  await expect(homeFooterGrid).toBeVisible();
  const homePrivacyLink = homeFooter.getByRole("link", { name: "PRIVACY", exact: true });
  await expect(homePrivacyLink).toHaveAttribute("href", "/privacy");

  const privacyRow = homePrivacyLink.locator("..");
  const privacyRowHandle = await privacyRow.elementHandle();
  expect(privacyRowHandle).not.toBeNull();
  const originalPrivacyRowMarkup = await privacyRowHandle!.evaluate((node) => node.innerHTML);
  try {
    await homePrivacyLink.evaluate((node) => node.remove());
    await expect(homeFooter.getByRole("link", { name: "PRIVACY", exact: true })).toHaveCount(0);
  } finally {
    await privacyRowHandle!.evaluate((node, markup) => { node.innerHTML = markup; }, originalPrivacyRowMarkup);
  }
  expect(await privacyRowHandle!.evaluate((node) => node.isConnected)).toBe(true);
  await expect(homeFooter.getByRole("link", { name: "PRIVACY", exact: true })).toHaveAttribute("href", "/privacy");

  const homeLayout = await page.evaluate(() => {
    const footerGrid = document.querySelector<HTMLElement>(".foot-grid");
    if (!footerGrid) return null;
    return {
      columns: getComputedStyle(footerGrid).gridTemplateColumns.split(" ").filter(Boolean).length,
      pageWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    };
  });
  expect(homeLayout).not.toBeNull();
  expect(homeLayout!.columns).toBe(homeLayout!.viewportWidth <= 420 ? 1 : 2);
  expect(homeLayout!.pageWidth).toBeLessThanOrEqual(homeLayout!.viewportWidth + 1);
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

  const compactFooter = page.locator("footer").last();
  await compactFooter.scrollIntoViewIfNeeded();
  await expect(compactFooter).toBeVisible();
  await expect(page.locator(".foot-grid")).toHaveCount(0);
  const compactNavigation = compactFooter.getByRole("navigation");
  await expect(compactNavigation).toBeVisible();
  const atlasJourneyLink = compactNavigation.getByRole("link", { name: "ATLAS", exact: true });
  const atlasJourneyHref = await atlasJourneyLink.getAttribute("href");
  expect(atlasJourneyHref).not.toBeNull();
  const atlasJourneyUrl = new URL(atlasJourneyHref!, BASE);
  expect(atlasJourneyUrl.pathname).toBe("/atlas");
  expect(atlasJourneyUrl.searchParams.get("entity")).toBe("taxon:gbif:2440483");
  expect(atlasJourneyUrl.searchParams.get("journey")).toBe("orca-gbif");

  const hasOrcaJourneyContext = (href: string | null, pathname: string) => {
    if (!href) return false;
    const url = new URL(href, BASE);
    return url.pathname === pathname
      && url.searchParams.get("entity") === "taxon:gbif:2440483"
      && url.searchParams.get("journey") === "orca-gbif";
  };

  const speciesJourneyLink = compactNavigation.getByRole("link", { name: "SPECIES", exact: true });
  const originalSpeciesJourneyHref = await speciesJourneyLink.getAttribute("href");
  expect(hasOrcaJourneyContext(originalSpeciesJourneyHref, "/species")).toBe(true);
  try {
    await speciesJourneyLink.evaluate((node) => {
      node.setAttribute("href", "/species?entity=taxon%3Agbif%3A999&journey=orca-gbif");
    });
    expect(hasOrcaJourneyContext(await speciesJourneyLink.getAttribute("href"), "/species")).toBe(false);

    await speciesJourneyLink.evaluate((node) => {
      node.setAttribute("href", "/species?entity=taxon%3Agbif%3A2440483&journey=wrong-journey");
    });
    expect(hasOrcaJourneyContext(await speciesJourneyLink.getAttribute("href"), "/species")).toBe(false);
  } finally {
    await speciesJourneyLink.evaluate((node, href) => {
      if (href) node.setAttribute("href", href);
    }, originalSpeciesJourneyHref);
  }
  expect(hasOrcaJourneyContext(await speciesJourneyLink.getAttribute("href"), "/species")).toBe(true);

  for (const [name, path] of [
    ["ABOUT", "/about"],
    ["PRIVACY", "/privacy"],
  ] as const) {
    await expect(compactNavigation.getByRole("link", { name, exact: true })).toHaveAttribute("href", path);
  }
  const compactLayout = await page.evaluate(() => ({
    pageWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  expect(compactLayout.pageWidth).toBeLessThanOrEqual(compactLayout.viewportWidth + 1);

  const originalCompactMarkup = await compactFooter.innerHTML();
  await compactNavigation.evaluate((node) => node.remove());
  await expect(compactFooter.getByRole("navigation")).toHaveCount(0);
  await compactFooter.evaluate((node, markup) => { node.innerHTML = markup; }, originalCompactMarkup);
  await expect(compactFooter.getByRole("navigation")).toBeVisible();

  const forcedOverflow = await page.evaluate(() => {
    const probe = document.createElement("div");
    probe.dataset.footerOverflowProbe = "true";
    probe.style.width = "calc(100vw + 32px)";
    probe.style.height = "1px";
    document.body.appendChild(probe);
    return {
      pageWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    };
  });
  expect(forcedOverflow.pageWidth).toBeGreaterThan(forcedOverflow.viewportWidth + 1);
  await page.locator('[data-footer-overflow-probe="true"]').evaluate((node) => node.remove());
  const restoredOverflow = await page.evaluate(() => ({
    pageWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  expect(restoredOverflow.pageWidth).toBeLessThanOrEqual(restoredOverflow.viewportWidth + 1);

  await settleVisuals(page);
  await compactFooter.screenshot({ path: `${OUTPUT}/05b-orca-footer-mobile.png` });
  await page.screenshot({ path: `${OUTPUT}/05-orca-source-proof-mobile.png` });
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