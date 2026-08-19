import { mkdirSync } from "node:fs";
import { test, expect } from "@playwright/test";

const OUT = "artifacts/labs";
mkdirSync(OUT, { recursive: true });

test("LABS routes a human through the project maze without inventing live truth", async ({ page }, testInfo) => {
  await page.goto("/labs", { waitUntil: "domcontentloaded" });

  await expect(page.getByText("4PLANET LABS", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/PROJECT MAZE \/ CONTROL MAP/i)).toBeVisible();
  await expect(page.getByText(/MANUAL BRAIN PROJECTION · READ ONLY/i).first()).toBeVisible();
  await expect(page.getByText(/BRAIN remains the authority/i)).toBeVisible();
  await expect(page.getByText(/FOUNDER COMMAND/i).first()).toBeVisible();

  const whiteButton = page.getByRole("button", { name: "WHITE" });
  await expect(whiteButton).toBeVisible();
  await whiteButton.click();
  await expect(page.locator(".labs-shell")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "DARK" }).click();
  await expect(page.locator(".labs-shell")).toHaveAttribute("data-theme", "dark");

  const fourPlanet = page.locator(".labs-universe-head").filter({ hasText: "4PLANET" }).first();
  await expect(fourPlanet).toBeVisible();
  await expect(page.locator(".labs-project-box").filter({ hasText: "NATUREBRAIN" }).first()).toBeVisible();
  await expect(page.locator(".labs-domain-head").filter({ hasText: "S4PIENS" }).first()).toBeVisible();
  await expect(page.locator(".labs-mission-row").filter({ hasText: "FOOD" }).first()).toBeVisible();
  await expect(page.locator(".labs-universe-head").filter({ hasText: "ODIN" }).first()).toBeVisible();
  await expect(page.locator(".labs-universe-head").filter({ hasText: "P4NTHER" }).first()).toBeVisible();
  await expect(page.locator(".labs-universe-head").filter({ hasText: "SANDBOX / LABS" }).first()).toBeVisible();

  await fourPlanet.click();
  await page.waitForURL(/\/labs\?project=4planet/);
  await expect(page.getByRole("heading", { name: "4PLANET", level: 1 })).toBeVisible();
  for (const label of ["WHY IT EXISTS", "CURRENT TRUTH", "NEXT MILESTONE", "AXE / AI FORWARD PLAN", "DONE / MILESTONES", "ROADMAP", "PROCESSES", "ACTIVE TASKS", "FOUNDER DECISIONS", "LINKED ASSETS", "EVIDENCE / AUTHORITY"]) {
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
  }

  const earth = page.locator(".labs-project-box").filter({ hasText: "E4RTH" }).first();
  await expect(earth).toBeVisible();
  await earth.click();
  await page.waitForURL(/project=4planet%2Fe4rth/);
  await expect(page.getByRole("heading", { name: "E4RTH", level: 1 })).toBeVisible();

  const species = page.locator(".labs-project-box").filter({ hasText: "SPECIES" }).first();
  await expect(species).toBeVisible();
  const viewport = page.viewportSize();
  if (viewport && viewport.width > 760) {
    await species.hover();
    await expect(species.locator(".labs-box-hover")).toBeVisible();
    await expect(species.locator(".labs-box-hover").getByText("WHY", { exact: true })).toBeVisible();
    await expect(species.locator(".labs-box-hover").getByText("NEXT", { exact: true })).toBeVisible();
  }

  await species.click();
  await page.waitForURL(/project=4planet%2Fe4rth%2Fspecies/);
  await expect(page.getByRole("heading", { name: "SPECIES", level: 1 })).toBeVisible();
  await expect(page.getByText(/Jaguar and Orca are Product Gold References/i)).toBeVisible();
  await expect(page.getByText("LINKED ASSETS", { exact: true }).first()).toBeVisible();

  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-labs-species.png`, fullPage: true });
});
