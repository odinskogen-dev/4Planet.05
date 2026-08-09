import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

const proofDir = "artifacts/oslofjorden-product-proof";

async function capture(page: import("@playwright/test").Page, name: string) {
  mkdirSync(proofDir, { recursive: true });
  await page.screenshot({ path: `${proofDir}/${name}.png`, fullPage: true });
}

test("Oslofjorden journey contains real bounded LIFE evidence", async ({ page }) => {
  await page.goto("/place/oslofjorden");
  await expect(page.getByRole("heading", { name: /OSLO\s*FJORDEN/i })).toBeVisible();
  await expect(page.getByText("European sprat", { exact: true })).toBeVisible();
  await expect(page.getByText("261 million", { exact: true })).toBeVisible();
  await expect(page.getByText("Atlantic herring", { exact: true })).toBeVisible();
  await expect(page.getByText("75 million", { exact: true })).toBeVisible();
  await expect(page.getByText("European anchovy", { exact: true })).toBeVisible();
  await expect(page.getByText("50 million", { exact: true })).toBeVisible();
  await expect(page.getByText(/not a live count/i).first()).toBeVisible();
  await expect(page.getByText("LIVE DATA", { exact: true })).toHaveCount(0);
});

test("Oslofjorden place identity does not silently become query geometry", async ({ page }) => {
  await page.goto("/place/oslofjorden");
  await expect(page.getByText(/MRGID 3379/).first()).toBeVisible();
  await expect(page.getByText("QUERY AREA", { exact: true })).toBeVisible();
  await expect(page.getByText("DISPLAY AREA", { exact: true })).toBeVisible();
  await expect(page.getByText(/A defensible biodiversity query area has not been selected/i)).toBeVisible();
});

test("pressure, actor and solution sections preserve evidence boundaries", async ({ page }) => {
  await page.goto("/place/oslofjorden");
  await expect(page.getByRole("heading", { name: /There is no single cause/i })).toBeVisible();
  for (const pressure of ["Nutrient loading / nitrogen", "Agriculture + wastewater", "Low bottom-water oxygen", "Fishing pressure", "Habitat degradation + physical disturbance"]) {
    await expect(page.getByText(pressure, { exact: true })).toBeVisible();
  }
  await expect(page.getByText("ACTORS / NOT PARTNERS", { exact: true })).toBeVisible();
  await expect(page.getByText("RESPONSES / EFFECT NOT ASSUMED", { exact: true })).toBeVisible();
  await expect(page.getByText(/No 4PLANET partnership is implied/).first()).toBeVisible();
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

test("front door includes real survey evidence but still marks hero image limitation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("261 million", { exact: true })).toBeVisible();
  await expect(page.getByText("75 million", { exact: true })).toBeVisible();
  await expect(page.getByText("50 million", { exact: true })).toBeVisible();
  await expect(page.getByText(/REAL HERO ASSET STILL REQUIRED/i)).toBeVisible();
  await capture(page, "front-door-real-proof-desktop");
});

test("Oslofjorden remains usable at 390px mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/place/oslofjorden");
  await expect(page.getByRole("heading", { name: /OSLO\s*FJORDEN/i })).toBeVisible();
  await expect(page.getByText("European sprat", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Comment on the proposed Oslofjord plan" })).toBeVisible();
  const width = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  expect(width).toBeTruthy();
  await capture(page, "oslofjorden-mobile-390x844");
});

test("private validation route stores locally, runs five-second stimulus and exports without network submission", async ({ page }) => {
  await page.goto("/labs/oslofjorden-validation");
  await expect(page.getByText(/HUMAN RESULTS NOT RUN BY 4PLANET/i)).toBeVisible();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /START FIVE SECONDS/i }).click();
  await expect(page.getByRole("heading", { name: /What is happening here\?/i })).toBeVisible();
  await expect(page.getByText("STIMULUS HIDDEN", { exact: true })).toBeVisible({ timeout: 7000 });
  await page.getByLabel(/What do you think 4PLANET is/i).fill("A public-interest product for understanding a living place.");
  const local = await page.evaluate(() => localStorage.getItem("4planet.oslofjorden.validation.v1"));
  expect(local).toContain("public-interest product");
  await expect(page.getByRole("button", { name: "EXPORT JSON" })).toBeEnabled();
});
