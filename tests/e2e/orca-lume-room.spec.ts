import { mkdirSync } from "node:fs";
import { test, expect, type Locator, type Page } from "@playwright/test";

const OUT = "artifacts/orca-human-gold";
mkdirSync(OUT, { recursive: true });

test.setTimeout(90_000);

async function expectViewportSafe(page: Page, locator: Locator, label: string) {
  const viewport = page.viewportSize();
  const box = await locator.boundingBox();
  expect(viewport, `${label}: viewport should exist`).not.toBeNull();
  expect(box, `${label}: element should be measurable`).not.toBeNull();
  expect(box!.x, `${label}: left edge`).toBeGreaterThanOrEqual(-2);
  expect(box!.x + box!.width, `${label}: right edge`).toBeLessThanOrEqual(viewport!.width + 2);
}

// Historical filename retained temporarily because the shared convergence workflow
// already points here. The product contract is intentionally no longer the old
// stacked Orca LUME route. Dedicated `/species/orca/lume` remains covered by
// `lume-room-clean.spec.ts`; this file now guards the current Human Gold journey.
test("Orca Human Gold journey is protagonist-first, truth-bounded and free of the legacy presentation stack", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));

  await page.goto("/journey/orca/", { waitUntil: "domcontentloaded" });
  const root = page.locator("#browser-experience");

  await expect(page.locator("body")).toHaveAttribute("data-browser-ready", "true", { timeout: 20_000 });
  await expect(root).toHaveAttribute("data-human-gold-candidate", "01");
  await expect(root).toHaveAttribute("data-human-quality-authority", "founder-first");
  await expect(root).toHaveAttribute("data-subject-source", "lume-orca-v1");

  await expect(page.locator(".nature-entry__title")).toHaveText("Meet the orca.");
  await expect(page.locator(".nature-entry__intro")).toContainText(/follow the living system around it/i);
  await expect(page.locator(".nature-entry__button")).toHaveText("MEET THE ORCA");
  await expect(page.locator(".nature-entry__boundary")).toContainText(/NOT LIVE TRACKING/i);

  const subject = page.locator(".nature-subject__image");
  await expect(subject).toHaveAttribute("src", /\/assets\/species\/orca\/lume-orca-v1\.png$/);
  await expect(subject).toHaveAttribute("alt", /Generated natural-history visualisation/i);
  await expect(page.locator(".nature-subject__boundary")).toContainText(/AI-GENERATED SPECIES VISUALISATION/i);
  await expect(page.locator(".nature-subject__boundary")).toContainText(/NOT EVIDENCE/i);
  await expect(page.locator(".nature-subject__boundary")).toContainText(/NOT A PHOTOGRAPH/i);

  // The Human Gold candidate deliberately rejects the old stacked presentation
  // ancestry on this route. These are absence assertions, not a loss of LUME:
  // the dedicated LUME Room route has its own independent E2E contract.
  await expect(page.locator(".light-lens-toggle")).toHaveCount(0);
  await expect(page.locator(".orca-lume-room21")).toHaveCount(0);
  await expect(page.locator(".orca-lume-intel")).toHaveCount(0);
  await expect(root).not.toHaveAttribute("data-orca-lume-installed", "true");

  const bay = page.getByRole("link", { name: "BAY OF BISCAY ECOSYSTEM" });
  await expect(bay).toHaveAttribute("href", "/ecosystem/bay-of-biscay/");

  const viewport = page.viewportSize();
  if (viewport && viewport.width <= 760) {
    // Mobile first-read stays focused on the animal. The place handoff appears
    // immediately after entry, once the user has chosen to follow the system.
    await expect(bay).toBeHidden();
  } else {
    await expect(bay).toBeVisible();
  }

  const entry = page.locator(".nature-entry__button");
  await entry.click();
  await expect(root).toHaveAttribute("data-entered", "true", { timeout: 12_000 });
  await expect(page.locator(".nature-journey-hud__title")).toContainText(/orca/i);
  await expect(page.locator(".nature-journey-hud__evidence")).toBeVisible();
  await expect(page.locator(".nature-journey-hud__next")).toBeVisible();
  await expect(bay).toBeVisible();

  if (viewport && viewport.width <= 760) {
    await expectViewportSafe(page, page.locator(".nature-journey-hud"), "mobile Human Gold journey HUD");
    await expectViewportSafe(page, subject, "mobile Orca protagonist");
    await expectViewportSafe(page, bay, "mobile Bay of Biscay handoff");
  }
  expect(await page.evaluate(() => window.scrollX)).toBe(0);

  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-orca-human-gold.png`, fullPage: true });
  expect(errors, `page errors: ${errors.join(" | ")}`).toEqual([]);
});