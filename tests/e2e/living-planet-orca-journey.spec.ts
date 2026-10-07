import { test, expect } from "@playwright/test";

const journey = [
  { path: "/species/orca", label: "SPECIES" },
  { path: "/livingsystems/species/orca", label: "LIVING SYSTEMS" },
  { path: "/atlas/whales", label: "ATLAS" },
  { path: "/actors/orca", label: "ACTOR" },
  { path: "/impact/actions/bay-of-biscay-survey", label: "IMPACT" },
];

test("Living Planet Orca flagship journey stays connected, truthful and usable", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(String(error)));

  const species = await page.goto("/species/orca", { waitUntil: "domcontentloaded" });
  expect(species?.ok()).toBeTruthy();
  await expect(page.getByRole("heading", { name: "Orca", exact: true })).toBeVisible();
  const continuation = page.getByTestId("species-to-ls");
  await expect(continuation).toHaveAttribute("href", "/livingsystems/species/orca");

  const living = await page.goto("/livingsystems/species/orca", { waitUntil: "domcontentloaded" });
  expect(living?.ok()).toBeTruthy();
  await expect(page.getByText("ONE ORCA · SHARED INTELLIGENCE", { exact: true })).toBeVisible();
  await expect(page.getByText("taxon:gbif:2440483", { exact: true })).toBeVisible();
  await expect(page.locator('a[href="/atlas/whales"]')).toBeVisible();
  await expect(page.locator('a[href="/actors/orca"]')).toBeVisible();
  await expect(page.locator('a[href="/impact/actions/bay-of-biscay-survey"]')).toBeVisible();
  await expect(page.getByText(/not presented as a universal Orca-conservation solution/i)).toBeVisible();

  for (const stop of journey) {
    const response = await page.goto(stop.path, { waitUntil: "domcontentloaded" });
    expect(response?.ok(), stop.label + " route should return HTTP 2xx").toBeTruthy();
    await expect(page.locator("h1").first(), stop.label + " should expose a visible primary heading").toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, stop.label + " should not horizontally overflow").toBeLessThanOrEqual(2);
  }

  expect(errors, "No uncaught browser errors across the flagship journey").toEqual([]);
});
