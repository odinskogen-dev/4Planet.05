import { mkdirSync } from "node:fs";
import { test, expect } from "@playwright/test";

const OUT = "artifacts/sapiens-food-story";
mkdirSync(OUT, { recursive: true });

test("Homo sapiens × FOOD stays human-first, legible and progressively spatial", async ({ page }, testInfo) => {
  await page.goto("/sandbox/s4piens", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "You are here.", level: 2 })).toBeVisible();
  await expect(page.getByText(/SPECIES · HOMO SAPIENS/i)).toBeVisible();
  await expect(page.getByText(/semantic map, not a personal footprint score/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /EAT.*FOOD_/i })).toBeVisible();
  await expect(page.getByText(/HOMO SAPIENS · GBIF 10856082/i)).toBeVisible();
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-01-human-space.png` });

  await page.getByRole("button", { name: /EAT.*FOOD_/i }).click();
  await expect(page.getByText(/Nutrition is a biological dependency/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /FOLLOW FOOD_/i }).first()).toBeVisible();
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-02-food-node-open.png` });

  const foodChapter = page.getByRole("heading", { name: "Follow one meal.", level: 2 });
  await foodChapter.scrollIntoViewIfNeeded();
  await expect(foodChapter).toBeVisible();
  await expect(page.getByText(/What does a meal touch/i)).toBeVisible();
  await expect(page.getByLabel("FOOD journey stages").getByRole("button")).toHaveCount(7);
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-03-food-chain.png` });

  const earthChapter = page.getByRole("heading", { name: "Now put it on Earth.", level: 2 });
  await earthChapter.scrollIntoViewIfNeeded();
  await expect(earthChapter).toBeVisible();
  await expect(page.getByText(/Climate TRACE v7 agriculture source records/i)).toBeVisible();
  await expect(page.getByText(/not live plumes/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /OPEN SHARED ATLAS/i })).toBeVisible();
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-04-earth-space.png` });

  const pressureChapter = page.getByRole("heading", { name: "Where does demand meet pressure?", level: 2 });
  await pressureChapter.scrollIntoViewIfNeeded();
  await expect(pressureChapter).toBeVisible();
  await expect(page.getByRole("button", { name: "DEPENDENCY", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "PRESSURE", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "RESPONSE", exact: true })).toBeVisible();
  await expect(page.getByText(/co-location proves ecological causation/i)).toBeVisible();
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-05-pressure-space.png` });

  const lifeChapter = page.getByRole("heading", { name: "Then find the living system.", level: 2 });
  await lifeChapter.scrollIntoViewIfNeeded();
  await expect(lifeChapter).toBeVisible();
  await expect(page.getByRole("link", { name: /OPEN LIVING SYSTEMS/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /EXPLORE SPECIES/i })).toBeVisible();
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-06-life-space.png` });

  const responseChapter = page.getByRole("heading", { name: "Where can the system change?", level: 2 });
  await responseChapter.scrollIntoViewIfNeeded();
  await expect(responseChapter).toBeVisible();
  await expect(page.getByText(/RESPONSE ≠ OUTCOME/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /OPEN FOOD_ MISSION/i })).toBeVisible();
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-07-response-space.png` });

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(3);
});
