import { mkdirSync } from "node:fs";
import { test, expect } from "@playwright/test";

const OUT = "artifacts/labs";
mkdirSync(OUT, { recursive: true });

test("LABS project universe routes a human from portfolio to 4PLANET and SPECIES without inventing live truth", async ({ page }, testInfo) => {
  await page.goto("/labs", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "LABS", level: 1 })).toBeVisible();
  await expect(page.getByText(/PROJECT UNIVERSES/i)).toBeVisible();
  await expect(page.getByText(/MANUAL BRAIN PROJECTION · READ ONLY/i)).toBeVisible();
  await expect(page.getByText(/BRAIN remains the authority/i)).toBeVisible();

  const themeButton = page.getByRole("button", { name: /Switch to light mode/i });
  await expect(themeButton).toBeVisible();
  await themeButton.click();
  await expect(page.locator(".labs-shell")).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("button", { name: /Switch to dark mode/i })).toBeVisible();

  const fourPlanet = page.locator(".labs-universe-head").filter({ hasText: "4PLANET" }).first();
  await expect(fourPlanet).toBeVisible();
  await fourPlanet.click();
  await page.waitForURL(/\/labs\?project=4planet/);

  await expect(page.getByRole("heading", { name: "4PLANET", level: 1 })).toBeVisible();
  for (const label of ["WHY IT EXISTS", "CURRENT TRUTH", "NEXT MILESTONE", "AXE / AI FORWARD PLAN", "DONE / MILESTONES", "ROADMAP", "PROCESSES", "ACTIVE TASKS", "FOUNDER DECISIONS", "EVIDENCE / AUTHORITY"]) {
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
  }

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
  await page.waitForURL(/project=4planet%2Fspecies/);
  await expect(page.getByRole("heading", { name: "SPECIES", level: 1 })).toBeVisible();
  await expect(page.getByText(/Jaguar and Orca are Product Gold References/i)).toBeVisible();
  await expect(page.getByText(/No Founder decision is projected as blocking/i)).toHaveCount(0);

  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-labs-species.png`, fullPage: true });
});
