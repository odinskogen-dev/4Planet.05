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
