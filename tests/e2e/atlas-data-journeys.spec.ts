import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://127.0.0.1:4173";

test("ATLAS lab scene can open a real observation context and continue into SPECIES", async ({ page }) => {
  await page.goto(`${BASE}/atlas-data-sandbox?scene=OCEAN_HABITAT&record=orca-bundled`, {
    waitUntil: "domcontentloaded",
  });

  await expect(page.locator("html")).toHaveAttribute("data-atlas-lab-scene", "OCEAN_HABITAT");
  await expect(page.getByText(/BUNDLED SOURCE SNAPSHOT · NOT LIVE/i)).toBeVisible();
  await expect(page.getByText(/HISTORICAL OBSERVATION, NOT THE ANIMAL'S CURRENT POSITION/i)).toBeVisible();

  const speciesLink = page.getByRole("link", { name: "Open Orca in SPECIES →" });
  await expect(speciesLink).toBeVisible();
  await speciesLink.click();

  await expect(page).toHaveURL(/\/species\/orca/);
  await expect.poll(() => new URL(page.url()).searchParams.has("returnTo"), { timeout: 10_000 }).toBeTruthy();
  await expect(page.getByText("Orca", { exact: true }).first()).toBeVisible();
});

test("Orca search preserves canonical taxon intent, bounded Bay context and SPECIES return path", async ({ page }) => {
  await page.goto(`${BASE}/atlas-data-sandbox?scene=OCEAN_HABITAT`, { waitUntil: "domcontentloaded" });

  const search = page.getByLabel("Search the living planet — life, places and living systems");
  await expect(search).toBeVisible();
  await search.fill("orca");

  const canonical = page.getByRole("option", { name: "Open canonical Orca taxon" });
  await expect(canonical).toBeVisible();
  await expect(canonical).toContainText("Orcinus orca");
  await expect(canonical).toContainText("CANONICAL TAXON · GBIF 2440483");
  await canonical.click();

  await expect.poll(() => {
    const url = new URL(page.url());
    return {
      entity: url.searchParams.get("entity"),
      intent: url.searchParams.get("intent"),
      context: url.searchParams.get("context"),
      record: url.searchParams.get("record"),
    };
  }, { timeout: 10_000 }).toEqual({
    entity: "taxon:gbif:2440483",
    intent: "taxon",
    context: "bay-of-biscay-proof-context",
    record: null,
  });

  const boundary = page.getByLabel("Taxon spatial context boundary");
  await expect(boundary).toBeVisible();
  await expect(boundary).toContainText("ORCA · TAXON INTENT");
  await expect(boundary).toContainText("BAY OF BISCAY · PROOF CONTEXT");
  await expect(boundary).toContainText(/not a range map, live animal position, abundance estimate or proof of local presence/i);

  const speciesLink = boundary.getByRole("link", { name: "OPEN ORCA IN SPECIES →" });
  await expect(speciesLink).toBeVisible();
  const href = await speciesLink.getAttribute("href");
  expect(href).toContain("/species/orca");
  expect(href).toContain("returnTo=");
  expect(href).toContain("entity%3Dtaxon%253Agbif%253A2440483");

  await speciesLink.click();
  await expect(page).toHaveURL(/\/species\/orca/);
  await expect.poll(() => new URL(page.url()).searchParams.get("entity"), { timeout: 10_000 }).toBe("taxon:gbif:2440483");
  await expect.poll(() => new URL(page.url()).searchParams.get("returnTo"), { timeout: 10_000 }).toContain("/atlas-data-sandbox");
});

test("canonical ATLAS Living Systems search remains intact with lab layers installed", async ({ page }) => {
  await page.goto(`${BASE}/atlas-data-sandbox?scene=OCEAN_CONDITION`, { waitUntil: "domcontentloaded" });

  const search = page.getByLabel("Search the living planet — life, places and living systems");
  await expect(search).toBeVisible();
  await search.fill("Cold Coastal Sea");

  await expect(page.getByText("LIVING SYSTEMS · SEEDED", { exact: true })).toBeVisible();
  const result = page.getByRole("option").filter({ hasText: "Cold Coastal Sea" });
  await expect(result).toBeVisible();
  await result.click();

  await expect(page.getByText("LIVING SYSTEM", { exact: true })).toBeVisible();
  await expect(page.getByText("Cold Coastal Sea", { exact: true })).toBeVisible();
  await expect(page.getByText(/Living system · northern marine/i)).toBeVisible();
});
