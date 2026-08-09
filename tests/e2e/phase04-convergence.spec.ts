import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

const proofDir = "artifacts/phase04-product-proof";

async function capture(page: import("@playwright/test").Page, name: string) {
  mkdirSync(proofDir, { recursive: true });
  await page.screenshot({ path: `${proofDir}/${name}.png`, fullPage: true });
}

test("desktop front door communicates one product family and place journey", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /What is happening here\?/i })).toBeVisible();
  await expect(page.getByText("OSLOFJORDEN / NORWAY")).toBeVisible();
  for (const job of ["ATLAS", "SPECIES", "LIVING SYSTEMS", "IMPACT"]) await expect(page.getByText(job, { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Enter Oslofjorden/i })).toBeVisible();
  await capture(page, "front-door-desktop");
});

test("Oslofjorden exposes a source-backed semantic identity without inventing display geometry or live local data", async ({ page }) => {
  await page.goto("/place/oslofjorden");
  await expect(page.getByRole("heading", { name: /OSLO\s*FJORDEN/i })).toBeVisible();
  await expect(page.getByText("MRGID 3379 · Fjord", { exact: true })).toBeVisible();
  await expect(page.getByText(/DISPLAY GEOMETRY \/ NOT YET IMPLEMENTED/i)).toBeVisible();
  await expect(page.getByText(/do not manufacture local records/i)).toBeVisible();
  await expect(page.getByText("CURATED SOURCE").first()).toBeVisible();
  await expect(page.getByText("LIVE DATA", { exact: true })).toHaveCount(0);
  await capture(page, "oslofjorden-desktop");
});

test("Relationship Reveal supports three modes and text remains the default", async ({ page }) => {
  await page.goto("/living-systems");
  await expect(page.getByRole("heading", { name: /What depends on what\?/i })).toBeVisible();
  const thread = page.getByRole("button", { name: "THREAD" });
  const orbit = page.getByRole("button", { name: "ORBIT" });
  const constellation = page.getByRole("button", { name: "CONSTELLATION" });
  await expect(thread).toHaveAttribute("aria-pressed", "true");
  await orbit.click();
  await expect(orbit).toHaveAttribute("aria-pressed", "true");
  await constellation.click();
  await expect(constellation).toHaveAttribute("aria-pressed", "true");
  await thread.click();
  await expect(page.getByRole("button", { name: /Reveal next/i })).toBeVisible();
});

test("deep mission worlds retain coded identity, plain meaning and parent", async ({ page }) => {
  for (const [route, code, plain] of [
    ["/missions/am4zonia", "AM4ZONIA_", "Amazon Rainforest Mission"],
    ["/missions/wh4les", "WH4LES_", "Whale Protection Mission"],
    ["/missions/clim4te", "CLIM4TE_", "Climate Mission"],
  ] as const) {
    await page.goto(route);
    await expect(page.getByRole("heading", { name: code })).toBeVisible();
    await expect(page.getByText(plain, { exact: false }).first()).toBeVisible();
    await expect(page.getByText(/A 4PLANET mission/i).first()).toBeVisible();
  }
});

test("mobile front door remains usable at iPhone-sized viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /What is happening here\?/i })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("button", { name: "MISSIONS" })).toBeVisible();
  await page.getByRole("button", { name: "MISSIONS" }).click();
  await expect(page.getByRole("link", { name: "AM4ZONIA_" })).toBeVisible();
  await page.getByRole("button", { name: "Close menu" }).click();
  await capture(page, "front-door-mobile-390x844");
});
