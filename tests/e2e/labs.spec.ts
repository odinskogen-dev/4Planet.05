import { mkdirSync } from "node:fs";
import { test, expect } from "@playwright/test";

const OUT = "artifacts/labs";
mkdirSync(OUT, { recursive: true });

test("LABS preserves the founder-loved maze, surfaces leading products and opens premium project control without inventing live truth", async ({ page }, testInfo) => {
  await page.goto("/labs", { waitUntil: "domcontentloaded" });

  await expect(page.getByText("4PLANET LABS", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/PROJECT MAZE \/ CONTROL MAP/i)).toBeVisible();

  const truthStrip = page.locator(".labs-freshness").first();
  await expect(truthStrip).toBeVisible();
  await expect(truthStrip.getByText(/MANUAL BRAIN PROJECTION · READ ONLY/i)).toBeVisible();
  await expect(truthStrip.getByText(/BRAIN remains the authority/i)).toBeVisible();
  await expect(truthStrip.getByText(/20 AUG RECONCILIATION/i)).toBeVisible();
  await expect(page.getByText(/SNAPSHOT 20 AUG 2026/i)).toHaveCount(1);
  await expect(page.getByText(/FOUNDER COMMAND/i).first()).toBeVisible();

  const fourPlanetHeading = page.locator(".labs-universe--4planet h2").first();
  await expect(fourPlanetHeading).toBeVisible();
  await expect(fourPlanetHeading).toHaveCSS("color", "rgb(57, 255, 120)");

  const shell = page.locator(".labs-shell").first();
  expect(await shell.evaluate((element) => getComputedStyle(element).getPropertyValue("--accent-brand").trim())).toBe("#39ff78");
  expect(await shell.evaluate((element) => getComputedStyle(element).getPropertyValue("--accent-product").trim())).toBe("#39ff78");

  const whiteButton = page.getByRole("button", { name: "WHITE" });
  await expect(whiteButton).toBeVisible();
  await whiteButton.click();
  await expect(shell).toHaveAttribute("data-theme", "light");
  await expect(fourPlanetHeading).toHaveCSS("color", "rgb(46, 46, 255)");
  expect(await shell.evaluate((element) => getComputedStyle(element).getPropertyValue("--accent-brand").trim())).toBe("#2e2eff");
  expect(await shell.evaluate((element) => getComputedStyle(element).getPropertyValue("--accent-product").trim())).toBe("#2e2eff");
  await page.getByRole("button", { name: "DARK" }).click();
  await expect(shell).toHaveAttribute("data-theme", "dark");
  await expect(fourPlanetHeading).toHaveCSS("color", "rgb(57, 255, 120)");

  await expect(page.getByText("ORGANISATION + SHARED MACHINE", { exact: true })).toBeVisible();
  await expect(page.getByText("LEADING PRODUCT SURFACES", { exact: true })).toBeVisible();
  const leading = page.locator(".labs-leading-product-grid .labs-project-box");
  for (const title of ["ONE INTERFACE", "ATLAS", "SPECIES", "LIVING SYSTEMS", "IMPACT"]) {
    await expect(leading.filter({ hasText: title }).first()).toBeVisible();
  }

  await expect(page.locator(".labs-project-box").filter({ hasText: "NATUREBRAIN" }).first()).toBeVisible();
  await expect(page.locator(".labs-domain-head").filter({ hasText: "S4PIENS" }).first()).toBeVisible();
  await expect(page.locator(".labs-mission-row").filter({ hasText: "FOOD" }).first()).toBeVisible();
  await expect(page.locator(".labs-universe-head").filter({ hasText: "ODIN" }).first()).toBeVisible();
  await expect(page.locator(".labs-universe-head").filter({ hasText: "P4NTHER" }).first()).toBeVisible();
  await expect(page.locator(".labs-universe-head").filter({ hasText: "SANDBOX / LABS" }).first()).toBeVisible();

  await expect(page.getByText("EARLY STAGE / CODE + SYSTEM LABS", { exact: true })).toBeVisible();
  for (const title of [
    "ATLAS DATA LAB",
    "NATURE XR",
    "JAGUAR JOURNEY",
    "S4PIENS / FOOD GOLD",
    "PICK_",
    "TREE OF LIFE",
    "CHOICE",
    "PLANETARY MAP",
  ]) {
    await expect(page.locator(".labs-project-box--early").filter({ hasText: title }).first()).toBeVisible();
  }
  await expect(page.getByText(/8 bounded tracks/i)).toBeVisible();

  if (testInfo.project.name === "mobile-390") {
    await expect(page.locator(".labs-page--portfolio .labs-inspector")).toBeHidden();
    const earlyColumns = await page.locator(".labs-early-grid").evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").filter(Boolean).length);
    expect(earlyColumns).toBe(2);
    const viewportContainment = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
    }));
    expect(viewportContainment.document).toBeLessThanOrEqual(viewportContainment.viewport);
    expect(viewportContainment.body).toBeLessThanOrEqual(viewportContainment.viewport);
  }

  const fourPlanet = page.locator(".labs-universe-head").filter({ hasText: "4PLANET" }).first();
  await fourPlanet.click();
  await page.waitForURL(/\/labs\?project=4planet/);
  await expect(page.getByRole("heading", { name: "4PLANET", level: 1 })).toBeVisible();

  for (const label of [
    "GOALS",
    "PHASES / ROADMAP",
    "PRODUCTION CONTROL",
    "PROCESS OVERVIEW",
    "UPCOMING TASKS / PRODUCTIONS",
    "PROJECT FEED",
    "FOUNDER DECISIONS",
    "CHECKPOINT LOG",
    "LINKED ASSETS",
    "EVIDENCE / AUTHORITY / FRESHNESS",
  ]) {
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
  }

  await expect(page.getByText("30 DAYS · 17 SEP", { exact: true })).toBeVisible();
  await expect(page.getByText("90 DAYS · 16 NOV", { exact: true })).toBeVisible();
  await expect(page.getByText(/≥1,000 real users/)).toBeVisible();
  await expect(page.getByText(/first-money target ≥NOK1\.5m/)).toBeVisible();
  await expect(page.getByText("CURRENT TRUTH", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("NEXT PIPE", { exact: true })).toBeVisible();
  await expect(page.getByText("FOUNDER PORT", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/LEADING ONE · 4PLANET/i).first()).toBeVisible();

  const earth = page.locator(".labs-project-link-grid a").filter({ hasText: "E4RTH" }).first();
  await expect(earth).toBeVisible();
  await earth.click();
  await page.waitForURL(/project=4planet%2Fe4rth/);
  await expect(page.getByRole("heading", { name: "E4RTH", level: 1 })).toBeVisible();
  await expect(page.getByText("GOALS", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("PROCESS OVERVIEW", { exact: true }).first()).toBeVisible();

  const species = page.locator(".labs-project-link-grid a").filter({ hasText: "SPECIES" }).first();
  await expect(species).toBeVisible();
  await species.click();
  await page.waitForURL(/project=4planet%2Fe4rth%2Fspecies/);
  await expect(page.getByRole("heading", { name: "SPECIES", level: 1 })).toBeVisible();
  await expect(page.getByText(/Jaguar Habitat World v1 is live on 4planet\.org/i).first()).toBeVisible();
  await expect(page.getByText(/Orca remains the truth\/dependency flagship/i).first()).toBeVisible();
  await expect(page.getByText("UPCOMING TASKS / PRODUCTIONS", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("LINKED ASSETS", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/EAR-SPECIES-01-G01/i).first()).toBeVisible();
  await expect(page.getByText(/LEADING ONE · SPECIES/i).first()).toBeVisible();
  await expect(page.getByText(/MISSION PAGE · SPECIES/i).first()).toBeVisible();

  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-labs-species-v4.png`, fullPage: true });
});
