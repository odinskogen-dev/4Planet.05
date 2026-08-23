import { mkdirSync } from "node:fs";
import { test, expect, type Locator, type Page } from "@playwright/test";

const OUT = "artifacts/orca-lume-19";
mkdirSync(OUT, { recursive: true });

async function expectViewportSafe(page: Page, locator: Locator, label: string) {
  const viewport = page.viewportSize();
  const box = await locator.boundingBox();
  expect(viewport, `${label}: viewport should exist`).not.toBeNull();
  expect(box, `${label}: element should be measurable`).not.toBeNull();
  expect(box!.x, `${label}: left edge`).toBeGreaterThanOrEqual(-2);
  expect(box!.x + box!.width, `${label}: right edge`).toBeLessThanOrEqual(viewport!.width + 2);
}

test("Orca LUME preserves GOLD truth while making luminous projection the default Journey lens", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));

  await page.goto("/journey/orca/", { waitUntil: "domcontentloaded" });
  const root = page.locator("#browser-experience");

  await expect(root).toHaveAttribute("data-entity-id", "taxon:gbif:2440483", { timeout: 20_000 });
  await expect(root).toHaveAttribute("data-premium-layer", "premium-v17-orca-transfer", { timeout: 10_000 });
  await expect(root).toHaveAttribute("data-lume-default", "true");
  await expect(root).toHaveAttribute("data-light-lens", "true", { timeout: 10_000 });
  await expect(root).toHaveAttribute("data-orca-lume-installed", "true");

  const toggle = page.locator(".light-lens-toggle");
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(toggle).toContainText(/REAL WORLD/i);

  await expect(page.locator(".orca-lume-photo")).toHaveCount(1);
  await expect(page.locator(".orca-lume-wireframe")).toHaveCount(1);
  await expect(page.locator(".orca-lume-intel")).toBeVisible();
  await expect(page.locator(".orca-lume-intel__primary")).toContainText(/Orcinus orca/i);
  await expect(page.locator(".orca-lume-intel__secondary")).toContainText(/GBIF 2440483/i);
  await expect(page.locator(".orca-lume-intel")).toContainText(/POPULATION \/ POD/i);
  await expect(page.locator(".orca-lume-acoustic__meta")).toContainText(/NOT FIELD AUDIO/i);
  await expect(page.locator(".orca-lume-photo figcaption")).toContainText(/NOAA · PUBLIC DOMAIN/i);

  await page.locator(".nature-entry__button").click();
  await expect(root).toHaveAttribute("data-entered", "true");
  await expect(root).toHaveAttribute("data-audio-profile", "ocean-procedural-v06", { timeout: 8_000 });
  await expect(root).toHaveAttribute("data-scene-state", "identity");
  await expect(root).toHaveAttribute("data-orca-lume-scene", "identity");

  const echo = page.locator(".orca-lume-echo-trigger");
  await expect(echo).toBeVisible();
  await echo.click();
  await expect(root).toHaveAttribute("data-echo-active", "true");
  await expect(page.locator(".orca-lume-acoustic__wave")).toHaveAttribute("data-pulse", "true");

  const next = page.locator(".nature-journey-hud__next");
  await next.click();
  await expect(root).toHaveAttribute("data-scene-state", "dependency");
  await expect(root).toHaveAttribute("data-orca-lume-scene", "dependency");
  await expect(page.locator(".orca-lume-intel__primary")).toContainText(/Diet depends on population/i);
  await expect(page.locator('[data-lume-rail="dependency"]')).toHaveAttribute("data-active", "true");

  await next.click();
  await expect(root).toHaveAttribute("data-scene-state", "habitat");
  await expect(page.locator(".orca-lume-intel__primary")).toContainText(/not a migration track/i);
  await expect(page.locator(".orca-lume-intel__secondary")).toContainText(/OCCURRENCE ≠ RANGE/i);

  await next.click();
  await expect(root).toHaveAttribute("data-scene-state", "pressure");
  await expect(page.locator(".orca-lume-intel__secondary")).toContainText(/PRESSURE CATEGORY ≠ EXPOSURE LEVEL OR EFFECT/i);

  await next.click();
  await expect(root).toHaveAttribute("data-scene-state", "response");
  await expect(page.locator(".orca-lume-intel__secondary")).toContainText(/NO UNIVERSAL FIX · NO OUTCOME CLAIM/i);

  const viewport = page.viewportSize();
  if (viewport && viewport.width <= 760) {
    await expectViewportSafe(page, page.locator(".orca-lume-intel"), "mobile LUME intelligence");
  }
  expect(await page.evaluate(() => window.scrollX)).toBe(0);

  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-orca-lume-response.png`, fullPage: true });

  await toggle.click();
  await expect(root).toHaveAttribute("data-light-lens", "false");
  await expect(toggle).toContainText(/LIGHT LENS/i);
  await toggle.click();
  await expect(root).toHaveAttribute("data-light-lens", "true");

  expect(errors, `page errors: ${errors.join(" | ")}`).toEqual([]);
});
