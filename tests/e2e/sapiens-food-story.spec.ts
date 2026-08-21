import { mkdirSync } from "node:fs";
import { test, expect } from "@playwright/test";

const OUT = "artifacts/sapiens-food-story";
mkdirSync(OUT, { recursive: true });

async function openChapter(page: import("@playwright/test").Page, label: RegExp, heading: string) {
  await page.getByRole("button", { name: label }).click();
  await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
}

test("S4PIENS FOOD Gold uses a human-first story space and progressively reveals Earth, pressure, life and response", async ({ page }, testInfo) => {
  await page.goto("/sandbox/s4piens", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "You are here.", level: 1 })).toBeVisible();
  await expect(page.getByText(/4PLANET_ \/ S4PIENS_ \/ HUMAN SYSTEMS ATLAS/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /SPECIES: HOMO SAPIENS/i })).toBeVisible();
  for (const need of [/FOOD_: EAT/i, /WATER: DRINK/i, /EN4RGY_: POWER/i, /BUILT SYSTEM: SHELTER/i, /F4SHION_: WEAR/i, /MOBILITY: MOVE/i]) {
    await expect(page.getByRole("button", { name: need })).toBeVisible();
  }
  await page.getByRole("button", { name: /FOOD_: EAT/i }).click();
  await expect(page.getByText(/Nutrition is a biological dependency/i).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /OPEN SPECIES/i })).toBeVisible();
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-01-human-first.png` });

  await openChapter(page, /Open chapter 02/i, "Follow one meal.");
  await expect(page.getByLabel("FOOD journey stages").getByRole("button")).toHaveCount(7);
  await expect(page.getByRole("button", { name: /01: DEMAND \+ DIET/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /07: LOSS \+ WASTE/i })).toBeVisible();
  await page.getByRole("button", { name: /04: PROCESSING/i }).click();
  await expect(page.getByText(/Milling, slaughter, refrigeration and manufacturing/i).first()).toBeVisible();
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-02-food-orbit.png` });

  await openChapter(page, /Open chapter 03/i, "Now put it on Earth.");
  await expect(page.getByText(/NASA EARTH/i)).toBeVisible();
  await expect(page.getByLabel(/S4PIENS Atlas — NASA Earth/i)).toBeVisible();
  await expect(page.getByText(/Climate TRACE agriculture source records/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /OPEN SHARED ATLAS/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /What's the pressure/i, level: 3 })).toBeVisible();
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-03-atlas-arrival.png` });

  await openChapter(page, /Open chapter 04/i, "Where does demand meet pressure?");
  await expect(page.getByRole("button", { name: "DEPENDENCY", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "PRESSURE", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "RESPONSE", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /LAND CONVERSION/i })).toBeVisible();
  await expect(page.getByText(/Local ecological outcome requires stronger evidence/i)).toBeVisible();
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-04-pressure.png` });

  await openChapter(page, /Open chapter 05/i, "Then find the living system.");
  for (const node of [/LIVING FOUNDATION: SOILS/i, /DEPENDENCY: FRESHWATER/i, /CONDITION: CLIMATE/i, /LIFE: BIODIVERSITY/i, /LAND SYSTEM: FORESTS/i, /SEAFOOD: MARINE SYSTEMS/i]) {
    await expect(page.getByRole("button", { name: node })).toBeVisible();
  }
  await page.getByRole("button", { name: /LIFE: BIODIVERSITY/i }).click();
  await expect(page.getByText(/GBIF records are observations, not population estimates/i).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /OPEN LIVING SYSTEMS/i })).toBeVisible();
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-05-living-system.png` });

  await openChapter(page, /Open chapter 06/i, "Where can the system change?");
  await expect(page.getByText(/RESPONSE ≠ OUTCOME/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /LAND: AVOID HABITAT CONVERSION/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /WASTE: REDUCE FOOD LOSS \+ WASTE/i })).toBeVisible();
  await page.getByRole("button", { name: /WASTE: REDUCE FOOD LOSS \+ WASTE/i }).click();
  await expect(page.getByText(/Where in the chain is avoidable loss carrying the most embedded resources/i).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /OPEN FOOD_ MISSION/i })).toBeVisible();
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-06-response.png` });

  await expect(page.getByRole("heading", { name: /One human need touches almost the whole planet/i })).toBeAttached();
  await expect(page.getByRole("heading", { name: /Evidence before interpretation/i })).toBeAttached();
  await expect(page.getByText(/RIGHTS REVIEW/i).first()).toBeAttached();
  await expect(page.getByText(/Trase/i).first()).toBeAttached();
  await expect(page.getByText(/GLORIA/i).first()).toBeAttached();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(3);
});

test("Homo sapiens Species route holds the same premium Gold grammar", async ({ page }, testInfo) => {
  await page.goto("/species/homo-sapiens", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Homo sapiens", level: 1 })).toBeVisible();
  await expect(page.getByText(/SPECIES · GBIF 10856082 · IDENTITY KNOWN/i)).toBeVisible();
  await expect(page.getByText(/We are not outside the living system/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /OPEN HUMAN SYSTEMS ATLAS/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /SEE IN ATLAS/i })).toBeVisible();
  await expect(page.getByText(/DEPENDENCY · PLANET → HUMAN/i)).toBeVisible();
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-07-homo-sapiens-gold.png` });

  await expect(page.getByRole("heading", { name: /Start with what a human needs/i })).toBeAttached();
  await expect(page.getByText(/GOLD STANDARD · FOOD_/i).first()).toBeAttached();
  await expect(page.getByText(/UNKNOWN WITHOUT MORE EVIDENCE/i)).toBeAttached();
  await expect(page.getByRole("heading", { name: /Follow one meal through the planet/i })).toBeAttached();
  await expect(page.getByText("32%", { exact: true })).toBeAttached();
  await expect(page.getByText("72%", { exact: true })).toBeAttached();
  await expect(page.getByText("1.05B t", { exact: true })).toBeAttached();
  await expect(page.getByText(/FAO · FAOSTAT/i)).toBeAttached();
  await expect(page.getByText(/UNEP · Food Waste Index 2024/i)).toBeAttached();
  await expect(page.getByRole("link", { name: /ENTER FOOD_ GOLD JOURNEY/i })).toBeAttached();
  await expect(page.getByRole("link", { name: /SOURCE · GBIF · HOMO SAPIENS/i })).toBeAttached();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(3);
});
