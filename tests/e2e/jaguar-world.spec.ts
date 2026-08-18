import { mkdirSync } from "node:fs";
import { test, expect } from "@playwright/test";

const OUT = "artifacts/jaguar-world";
mkdirSync(OUT, { recursive: true });

test("Jaguar Species World stays life-first while Atlas, evidence, relationships and cause paths remain truthful", async ({ page }, testInfo) => {
  await page.goto("/species/jaguar", { waitUntil: "domcontentloaded" });
  const hero = page.locator("article > header").first();
  await expect(page.getByRole("heading", { name: "JAGUAR", level: 1 })).toBeVisible();
  await expect(page.getByText(/4PLANET SPECIES_ · E4RTH_/i)).toBeVisible();
  await expect(page.getByText(/largest cat in the Western Hemisphere/i).first()).toBeVisible();
  await expect(page.getByText(/GOLD REFERENCE 02/i)).toHaveCount(0);
  await expect(page.getByRole("link", { name: /EXPLORE WHERE IT'S BEEN RECORDED/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /share this species/i })).toBeVisible();
  await expect(hero.getByText(/PANTANAL · SPECIES PORTRAIT/i)).toBeVisible();
  await expect(hero.locator('source[media="(max-width: 640px)"]')).toHaveAttribute("srcset", "/assets/species/jaguar/SP-005-mobile.jpg");
  await hero.screenshot({ path: `${OUT}/${testInfo.project.name}-jaguar-hero.png` });

  const atlas = page.getByRole("heading", { name: /Where has jaguar been recorded/i });
  await atlas.scrollIntoViewIfNeeded();
  await expect(atlas).toBeVisible();
  await expect(page.getByText(/02_ WHERE · ATLAS_ · REPORTED OBSERVATIONS/i)).toBeVisible();
  await expect(page.getByText(/not a range map, population estimate or live tracking feed/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /OPEN JAGUAR IN FULL ATLAS/i })).toBeVisible();
  await expect(page.getByText(/REPORTED OCCURRENCE · GBIF/i)).toBeVisible();
  await page.locator("#atlas-window").screenshot({ path: `${OUT}/${testInfo.project.name}-jaguar-atlas.png` });

  const ecosystem = page.getByRole("heading", { name: /The jaguar does not exist alone/i });
  await ecosystem.scrollIntoViewIfNeeded();
  await expect(ecosystem).toBeVisible();
  await expect(page.getByRole("link", { name: /AMAZON RAINFOREST/i }).first()).toBeVisible();

  const foodWeb = page.getByRole("heading", { name: /Predator becomes relationship/i });
  await foodWeb.scrollIntoViewIfNeeded();
  await expect(foodWeb).toBeVisible();
  const capybara = page.getByRole("button", { name: /CAPYBARAS/i });
  await capybara.click();
  await expect(page.getByText(/documented prey example/i).first()).toBeVisible();
  await expect(page.getByText(/FULL 4PLANET SPECIES PROFILE NOT YET IN GOLD SET/i)).toBeVisible();

  const evidence = page.getByRole("heading", { name: /The evidence stays with the animal/i });
  await evidence.scrollIntoViewIfNeeded();
  await expect(evidence).toBeVisible();
  await expect(page.getByText(/SPECIES_ · EVIDENCE/i)).toBeVisible();
  await expect(page.getByText(/current presence, abundance or population status/i).first()).toBeVisible();
  await expect(page.getByText(/SOURCE-BACKED SPECIES CONTEXT ≠ LOCAL PRESENCE/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /Panthera — Jaguar/i }).first()).toHaveAttribute("href", /panthera\.org\/cat\/jaguar/);

  const pressure = page.getByRole("heading", { name: /Threats have causes/i });
  await pressure.scrollIntoViewIfNeeded();
  await expect(pressure).toBeVisible();
  await expect(page.getByText(/SPECIES_ · PRESSURE → CAUSE/i)).toBeVisible();
  await expect(page.getByText("HUMAN SYSTEM", { exact: true })).toHaveCount(3);
  await expect(page.getByText(/HUMAN SYSTEM ≠ DEFAULT/i)).toBeVisible();
  await expect(page.getByText(/DIRECT KILLING \+ ILLEGAL TRADE/i)).toHaveCount(0);

  const motion = page.getByRole("heading", { name: /See the animal move/i });
  await motion.scrollIntoViewIfNeeded();
  await expect(motion).toBeVisible();
  await expect(page.locator("video")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Load and play jaguar video/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /SOURCE \+ LICENCE/i }).first()).toHaveAttribute("href", /commons\.wikimedia\.org/);

  const ecosystemLink = page.getByRole("link", { name: /AMAZON RAINFOREST/i }).first();
  await ecosystemLink.scrollIntoViewIfNeeded();
  await ecosystemLink.click();
  await page.waitForURL(/\/ecosystems\/amazon-rainforest/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: /AMAZON RAINFOREST/i, level: 1 })).toBeVisible();
  await expect(page.getByText(/A region, not one uniform ecosystem/i)).toBeVisible();
  await expect(page.getByText(/PUBLIC ECOSYSTEM INTELLIGENCE ≠ FIELD AUTHORITY OR REPRESENTATION/i)).toBeVisible();
});
