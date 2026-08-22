import { mkdirSync } from "node:fs";
import { test, expect } from "@playwright/test";

const OUT = "artifacts/sapiens-food-story";
mkdirSync(OUT, { recursive: true });

async function openChapter(page: import("@playwright/test").Page, index: number, heading: RegExp | string) {
  await page.getByRole("button", { name: new RegExp(`Open chapter ${String(index).padStart(2, "0")}`, "i") }).click();
  await expect(page.getByRole("heading", { name: heading, level: 2 })).toBeVisible();
}

test("S4PIENS FOOD Gold uses the current Earth-first story space and progressively reveals human systems, FOOD, pressure, evidence, life and response", async ({ page }, testInfo) => {
  await page.goto("/sandbox/s4piens", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "You are here.", level: 1 })).toBeVisible();
  await expect(page.getByText(/4PLANET_ \/ S4PIENS_ \/ HUMAN SYSTEMS ATLAS/i)).toBeVisible();
  await expect(page.getByLabel(/S4PIENS Atlas — NASA Blue Marble Earth/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /OPEN GOLD SPECIES CARD/i })).toBeVisible();
  await expect(page.getByText(/START WITH EARTH · THE PLANET IS THE SHARED SPATIAL CANVAS/i)).toBeVisible();
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-01-earth-first.png` });

  await openChapter(page, 2, /One species\.\s*Many systems\./i);
  await expect(page.getByRole("button", { name: /^Homo sapiens$/i })).toBeVisible();
  for (const need of [/FOOD_.*EAT/i, /WATER.*DRINK/i, /EN4RGY_.*POWER/i, /BUILT SYSTEM.*SHELTER/i, /F4SHION_.*WEAR/i, /MOBILITY.*MOVE/i]) {
    await expect(page.getByRole("button", { name: need })).toBeVisible();
  }
  await expect(page.getByText(/PLANET → HUMAN = DEPENDENCY/i)).toBeVisible();
  await page.getByRole("button", { name: /FOOD_.*EAT/i }).click();
  await expect(page.getByRole("heading", { name: "Follow one meal.", level: 2 })).toBeVisible();
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-02-human-to-food.png` });

  await expect(page.getByLabel("FOOD journey stages").getByRole("button")).toHaveCount(7);
  await expect(page.getByRole("button", { name: /01.*DEMAND \+ DIET/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /07.*LOSS \+ WASTE/i })).toBeVisible();
  await page.getByRole("button", { name: /04.*PROCESSING/i }).click();
  await expect(page.getByRole("heading", { name: "PROCESSING", level: 3 })).toBeVisible();
  await expect(page.getByText(/One meal is never only one place/i)).toBeVisible();
  await expect(page.getByText(/HUMAN NEED → VALUE CHAIN → PLACE → PRESSURE → LIFE → RESPONSE/i)).toBeVisible();
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-03-food-journey.png` });

  await openChapter(page, 4, /The chain becomes visible when data layers meet the story\./i);
  await expect(page.getByRole("button", { name: "DEPENDENCY", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "PRESSURE", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "RESPONSE", exact: true })).toBeVisible();
  await expect(page.getByLabel(/FOOD pressure Atlas with NASA Blue Marble and Climate TRACE source records/i)).toBeVisible();
  await expect(page.getByText(/Co-location is useful evidence — but it is not causation/i)).toBeVisible();
  await expect(page.getByText(/NOT LOCAL CAUSAL PROOF/i)).toBeVisible();
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-04-pressure.png` });

  await openChapter(page, 5, /Evidence before interpretation\./i);
  await expect(page.getByText(/Missing or failed sources stay missing — never rendered as zero/i)).toBeVisible();
  await expect(page.getByText(/CO-LOCATION ≠ CAUSATION/i)).toBeVisible();
  await expect(page.getByText(/OBSERVATION DENSITY ≠ ABUNDANCE/i)).toBeVisible();
  await expect(page.getByText(/RIGHTS REVIEW/i).first()).toBeVisible();
  await expect(page.getByText(/Trase/i).first()).toBeAttached();
  await expect(page.getByText(/GLORIA/i).first()).toBeAttached();
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-05-evidence.png` });

  await openChapter(page, 6, /Find what the system depends on — and what it can pressure\./i);
  for (const node of [/LIVING FOUNDATION.*SOILS/i, /DEPENDENCY.*FRESHWATER/i, /CONDITION.*CLIMATE/i, /RECORDED LIFE.*BIODIVERSITY/i, /LAND SYSTEM.*FORESTS/i, /SEAFOOD.*MARINE SYSTEMS/i]) {
    await expect(page.getByRole("button", { name: node })).toBeVisible();
  }
  await page.getByRole("button", { name: /RECORDED LIFE.*BIODIVERSITY/i }).click();
  await expect(page.getByRole("link", { name: /OPEN LIVING SYSTEMS/i })).toBeVisible();
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-06-living-system.png` });

  await openChapter(page, 7, /Then find leverage\./i);
  await expect(page.getByText(/RESPONSE ≠ OUTCOME/i)).toBeVisible();
  await expect(page.getByText(/INTERVENTION HYPOTHESIS/i).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /OPEN FOOD_ MISSION/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /FOOD_ proves the grammar\. The same map can scale\./i, level: 3 })).toBeVisible();
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-07-solutions.png` });

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
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-08-homo-sapiens-gold.png` });

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
