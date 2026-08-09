import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

const proofDir = "artifacts/oslofjorden-product-proof";

async function capture(page: import("@playwright/test").Page, name: string, fullPage = true) {
  mkdirSync(proofDir, { recursive: true });
  await page.screenshot({ path: `${proofDir}/${name}.png`, fullPage });
}

const oslofjordHero = (page: import("@playwright/test").Page) => page.getByRole("heading", { level: 1, name: "OSLO FJORDEN.", exact: true });

async function expectRealHeroLoaded(page: import("@playwright/test").Page) {
  const hero = page.locator('img[alt="Oslofjord seen from a ferry in August 2022"]');
  await expect(hero).toHaveAttribute("src", /\/assets\/places\/oslofjorden\/hero-oslofjorden-cc0-1920\.jpg/);
  await expect.poll(async () => hero.evaluate((el: HTMLImageElement) => ({ complete: el.complete, width: el.naturalWidth })), { timeout: 15000 }).toEqual(expect.objectContaining({ complete: true, width: expect.any(Number) }));
  expect(await hero.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(100);
}

async function expectSourceRecordsReady(page: import("@playwright/test").Page) {
  const ready = page.locator('[data-source-records-ready="true"]');
  await expect(ready).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/GBIF RECORD \//).first()).toBeVisible();
  return ready;
}

test("Oslofjorden journey contains real bounded LIFE evidence", async ({ page }) => {
  await page.goto("/place/oslofjorden");
  await expect(oslofjordHero(page)).toBeVisible();
  for (const [name, value] of [["European sprat", "261 million"], ["Atlantic herring", "75 million"], ["European anchovy", "50 million"]]) {
    await expect(page.getByText(name, { exact: true })).toBeVisible();
    await expect(page.getByText(value, { exact: true })).toBeVisible();
  }
  await expect(page.getByText(/not a live count/i).first()).toBeVisible();
});

test("source-bounded Inner Oslofjord GBIF records still load at record level", async ({ page }) => {
  await page.goto("/place/oslofjorden");
  await expect(page.getByText("REAL SOURCE RECORDS / HISTORICAL OCCURRENCES", { exact: true })).toBeVisible();
  await expectSourceRecordsReady(page);
  await expect(page.getByText("SOURCE QUERY COUNT", { exact: true })).toBeVisible();
  await expect(page.getByText(/not live organism positions/i).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /OPEN SOURCE RECORD/i }).first()).toHaveAttribute("href", /gbif\.org\/occurrence\//);
});

test("Oslofjorden identity, waterbody status and biodiversity-query roles stay visibly separate", async ({ page }) => {
  await page.goto("/place/oslofjorden");
  await expect(page.getByText(/MRGID 3379/).first()).toBeVisible();
  await expect(page.getByText("BIODIVERSITY QUERY", { exact: true })).toBeVisible();
  await expect(page.getByText("WATERBODY STATUS AREA", { exact: true })).toBeVisible();
  await expect(page.getByText("DISPLAY AREA", { exact: true })).toBeVisible();
  await expect(page.getByText(/VANNMILJØ \/ WATERBODY 0101020601-C/i)).toBeVisible();
  await expect(page.getByText(/does not turn that polygon into a universal fjord outline/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /One place\. Several spatial jobs/i })).toBeVisible();
});

test("runtime local LIFE adapter exposes either source records or an explicit source failure", async ({ page }) => {
  await page.goto("/place/oslofjorden");
  const status = page.getByText(/^VANNMILJØ REGISTRATIONS \/ /).last();
  await expect(status).toBeVisible({ timeout: 15000 });
  await expect.poll(async () => (await status.textContent()) ?? "", { timeout: 15000 }).not.toMatch(/LOADING$/);
  const text = (await status.textContent()) ?? "";
  if (text.includes("LIVE SOURCE")) {
    await expect(page.getByText(/Registration ≠ current position/i)).toBeVisible();
    await expect(page.getByText(/Loaded count ≠ abundance/i)).toBeVisible();
    await expect(page.getByText(/Reuse is under NLOD 2\.0 with attribution/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /VANNMILJØ API \/ SOURCE/i })).toHaveAttribute("href", /vannmiljoapi\.miljodirektoratet\.no/);
  } else {
    expect(text).toMatch(/SOURCE UNAVAILABLE|TIMEOUT|INVALID RESPONSE/);
    await expect(page.getByText(/No local-life absence is inferred/i)).toBeVisible();
  }
});

test("ATLAS and SPECIES open the same source-aware Oslofjord context", async ({ page }) => {
  await page.goto("/atlas?journey=oslofjorden&z=6.40&c=10.62,59.67");
  await expect(page.getByText("OSLOFJORDEN / ATLAS / SHARED PLACE MODEL", { exact: true })).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/MRGID 3379 remains semantic identity/i)).toBeVisible();

  await page.goto("/species?place=place%3Amarine-regions%3A3379&journey=oslofjorden");
  await expect(page.getByText("OSLOFJORDEN / SPECIES / SHARED PLACE MODEL", { exact: true })).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/WaterBodyID 0101020601-C/i)).toBeVisible();
});

test("Relationship Reveal exposes two bounded source-aware threads", async ({ page }) => {
  await page.goto("/place/oslofjorden");
  await expect(page.getByText("TWO SOURCE-AWARE THREADS", { exact: true })).toBeVisible();
  await expect(page.getByText("THREAD A / THE LIFE BELOW VISIBILITY", { exact: true })).toBeVisible();
  await expect(page.getByText("THREAD B / PRESSURE TO HABITAT", { exact: true })).toBeVisible();
  await expect(page.getByText("Phytoplankton", { exact: true })).toBeVisible();
  await expect(page.getByText(/high nitrogen acts together with other factors/i).first()).toBeVisible();
});

test("pressure, actor and solution sections preserve evidence boundaries", async ({ page }) => {
  await page.goto("/place/oslofjorden");
  await expect(page.getByRole("heading", { name: /There is no single cause/i })).toBeVisible();
  for (const pressure of ["Nutrient loading / nitrogen", "Agriculture + wastewater", "Low bottom-water oxygen", "Fishing pressure", "Habitat degradation + physical disturbance"]) await expect(page.getByText(pressure, { exact: true })).toBeVisible();
  await expect(page.getByText("ACTORS / NOT PARTNERS", { exact: true })).toBeVisible();
  await expect(page.getByText("RESPONSES / EFFECT NOT ASSUMED", { exact: true })).toBeVisible();
});

test("real consultation action is visible with proof boundary", async ({ page }) => {
  await page.goto("/place/oslofjorden");
  await expect(page.getByRole("heading", { name: "Comment on the proposed Oslofjord plan" })).toBeVisible();
  await expect(page.getByText(/DEADLINE 2026-09-15/)).toBeVisible();
  await expect(page.getByRole("link", { name: /OPEN OFFICIAL PROCESS/i })).toHaveAttribute("href", /regjeringen\.no/);
  await expect(page.getByText(/does not claim that one response will change policy or improve ecological condition/i)).toBeVisible();
});

test("higher Oslofjord proof states remain absent", async ({ page }) => {
  await page.goto("/place/oslofjorden");
  await expect(page.getByText(/No Oslofjorden Partner Report, Assessed Outcome or Verified Outcome is claimed/i)).toBeVisible();
});

test("front door uses a repository-controlled rights-classified Oslofjord photograph", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/REAL OSLOFJORD PHOTO/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /Leonhard Lenz.*CC0.*SOURCE/i })).toHaveAttribute("href", /commons\.wikimedia\.org/);
  await expectRealHeroLoaded(page);
  await capture(page, "front-door-real-oslofjord-desktop");
});

test("Follow persists locally and bounded Watch establishes a baseline without false removals", async ({ page }) => {
  await page.goto("/place/oslofjorden");
  const follow = page.getByRole("button", { name: "FOLLOW OSLOFJORDEN ON THIS DEVICE" });
  await follow.click();
  expect(await page.evaluate(() => localStorage.getItem("4planet.follows.v1"))).toContain("place:marine-regions:3379");
  await expect(page.getByText(/FOLLOW → SOURCE CHANGE → RETURN/i)).toBeVisible();
  await expect(page.getByText(/Baseline established|Checking the same source contract|source has not returned/i).last()).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/capped source window.*ignored rather than labelled deleted or removed/i)).toBeVisible({ timeout: 15000 });
  await page.reload();
  await expect(page.getByRole("button", { name: /FOLLOWING OSLOFJORDEN ON THIS DEVICE/i })).toBeVisible();
});

test("Oslofjorden remains usable at 390px mobile with stable visual proof", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/place/oslofjorden");
  await expect(oslofjordHero(page)).toBeVisible();
  await expectRealHeroLoaded(page);
  await capture(page, "oslofjorden-mobile-hero-390x844", false);
  await expect(page.getByText("European sprat", { exact: true })).toBeVisible();
  const sourceRecords = await expectSourceRecordsReady(page);
  await sourceRecords.scrollIntoViewIfNeeded();
  await capture(page, "oslofjorden-mobile-source-records-390x844", false);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBeTruthy();
});

test("participant test and review workflow stay local and visibly separate human evidence from QA", async ({ page }) => {
  await page.goto("/labs/oslofjorden-validation");
  await expect(page.getByText(/HUMAN RESULTS NOT RUN BY 4PLANET/i)).toBeVisible();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /START FIVE SECONDS/i }).click();
  await expect(page.getByRole("heading", { name: /What is happening here\?/i })).toBeVisible();
  await expect(page.getByText("STIMULUS HIDDEN", { exact: true })).toBeVisible({ timeout: 7000 });
  await page.getByLabel(/What do you think 4PLANET is/i).fill("A public-interest product for understanding a living place.");
  expect(await page.evaluate(() => localStorage.getItem("4planet.oslofjorden.validation.v1"))).toContain("public-interest product");

  await page.goto("/labs/oslofjorden-validation/review");
  await expect(page.getByText(/HUMAN VALIDATION STATUS \/ NOT RUN/i)).toBeVisible();
  await expect(page.getByText(/No participant exports are loaded/i)).toBeVisible();
  await expect(page.getByText(/IMPORT PARTICIPANT JSON/i)).toBeVisible();
});
