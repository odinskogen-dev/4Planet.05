import { mkdirSync } from "node:fs";
import { test, expect } from "@playwright/test";

const OUT = "artifacts/jaguar-world";
mkdirSync(OUT, { recursive: true });

test("Jaguar Species World exposes Atlas, evidence, living web, ecosystem and motion without breaking truth boundaries", async ({ page }, testInfo) => {
  await page.goto("/species/jaguar", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "JAGUAR", level: 1 })).toBeVisible();
  await expect(page.getByText(/GOLD REFERENCE 02/i)).toBeVisible();
  await expect(page.getByText(/Observation ≠ range ≠ population ≠ live tracking/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /share this species/i })).toBeVisible();

  const atlas = page.getByRole("heading", { name: /Where has jaguar been recorded/i });
  await atlas.scrollIntoViewIfNeeded();
  await expect(atlas).toBeVisible();
  await expect(page.getByText(/ATLAS_ · SPECIES WINDOW · OBSERVATIONS/i)).toBeVisible();
  await expect(page.getByText(/not a range map, population estimate or live tracking feed/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /OPEN JAGUAR IN FULL ATLAS/i })).toBeVisible();

  const evidence = page.getByRole("heading", { name: /The evidence stays with the animal/i });
  await evidence.scrollIntoViewIfNeeded();
  await expect(evidence).toBeVisible();
  await expect(page.getByText(/SPECIES_ · EVIDENCE/i)).toBeVisible();
  await expect(page.getByText(/current presence, abundance or population status/i).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Panthera — Jaguar/i }).first()).toHaveAttribute("href", /panthera\.org\/cat\/jaguar/);

  const foodWeb = page.getByRole("heading", { name: /Predator becomes relationship/i });
  await foodWeb.scrollIntoViewIfNeeded();
  await expect(foodWeb).toBeVisible();
  const capybara = page.getByRole("button", { name: /CAPYBARAS/i });
  await capybara.click();
  await expect(page.getByText(/documented prey example/i).first()).toBeVisible();
  await expect(page.getByText(/FULL 4PLANET SPECIES PROFILE NOT YET IN GOLD SET/i)).toBeVisible();

  const motion = page.getByRole("heading", { name: /Not stock decoration\. A living animal/i });
  await motion.scrollIntoViewIfNeeded();
  await expect(motion).toBeVisible();
  await expect(page.locator("video")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Load and play jaguar video/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /SOURCE \+ LICENCE/i }).first()).toHaveAttribute("href", /commons\.wikimedia\.org/);

  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-jaguar.png`, fullPage: true });

  const ecosystemLink = page.getByRole("link", { name: /AMAZON RAINFOREST/i }).first();
  await ecosystemLink.scrollIntoViewIfNeeded();
  await ecosystemLink.click();
  await page.waitForURL(/\/ecosystems\/amazon-rainforest/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: /AMAZON RAINFOREST/i, level: 1 })).toBeVisible();
  await expect(page.getByText(/A region, not one uniform ecosystem/i)).toBeVisible();
  await expect(page.getByText(/PUBLIC ECOSYSTEM INTELLIGENCE ≠ FIELD AUTHORITY OR REPRESENTATION/i)).toBeVisible();
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-amazon.png`, fullPage: true });
});