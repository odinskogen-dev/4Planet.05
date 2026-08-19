import { mkdirSync } from "node:fs";
import { test, expect, type Locator } from "@playwright/test";

const OUT = "artifacts/jaguar-xr";
mkdirSync(OUT, { recursive: true });

async function expectSettled(root: Locator, index: number) {
  await expect(root).toHaveAttribute("data-cinematic-settled", "true", { timeout: 20_000 });
  await expect(root).toHaveAttribute("data-cinematic-settled-index", String(index), { timeout: 20_000 });
}

test("Jaguar Browser Journey v1.1 travels through distinct scenes before evidence", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/journey/jaguar/", { waitUntil: "domcontentloaded" });

  const root = page.locator("#browser-experience");
  await expect(root).toHaveAttribute("data-entity-id", "taxon:gbif:5219426", { timeout: 20_000 });
  await expect(root).toHaveAttribute("data-manifest-version", "v1.1");
  await expect(root).toHaveAttribute("data-truth-feed", "canonical-adapter");
  await expect(root).toHaveAttribute("data-cinematic-engine", "v1.1");
  await expect(root).toHaveAttribute("data-performance-tier", /full|lite/);
  await expect(page.locator(".brand")).toHaveAttribute("href", "/species/jaguar");
  await expect(page.locator(".nature-entry__title")).toContainText(/Enter the rainforest/i);
  await expect(page.locator(".nature-browser-status")).toContainText(/BROWSER JOURNEY|SOURCE-AWARE/i);
  await expect(page.locator(".nature-footer")).toContainText(/JOURNEY ENGINE/i);
  await expect(page.locator('.nature-node[data-node-id="jaguar-solutions-transition"]')).toHaveAttribute("data-relation-class", "RESPONSE");

  await page.locator(".nature-entry__button").click();
  await expect(root).toHaveAttribute("data-entered", "true");
  await expect(root).toHaveAttribute("data-audio-profile", "amazonia-procedural-v11", { timeout: 5_000 });
  await expect(page.locator(".nature-entry")).toHaveCSS("visibility", "hidden", { timeout: 5_000 });
  await expect(page.locator(".nature-subject__name")).toContainText(/JAGUAR/i);
  await expect(root).toHaveAttribute("data-scene-state", "identity", { timeout: 5_000 });
  await expect(root).toHaveAttribute("data-cinematic-scene", "identity", { timeout: 15_000 });
  await expect(root).toHaveAttribute("data-chapter-media-ready", "true", { timeout: 15_000 });
  await expect(page.locator(".nature-journey-hud__title")).toContainText(/Meet one life/i);
  await expectSettled(root, 0);
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-journey-v11-01-meet.png`, fullPage: true });

  const next = page.locator(".nature-journey-hud__next");
  await next.click();
  await expect(root).toHaveAttribute("data-scene-state", "dependency");
  await expect(root).toHaveAttribute("data-cinematic-index", "1", { timeout: 15_000 });
  await expect(page.locator(".nature-journey-hud__title")).toContainText(/Follow the relationship/i);
  await expectSettled(root, 1);
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-journey-v11-02-prey.png`, fullPage: true });

  await next.click();
  await expect(root).toHaveAttribute("data-scene-state", "habitat");
  await expect(root).toHaveAttribute("data-cinematic-index", "2", { timeout: 15_000 });
  await expect(page.locator(".nature-journey-hud__title")).toContainText(/not the whole story/i);
  await expectSettled(root, 2);
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-journey-v11-03-habitat.png`, fullPage: true });

  await next.click();
  await expect(root).toHaveAttribute("data-scene-state", "pressure");
  await expect(root).toHaveAttribute("data-cinematic-index", "3", { timeout: 15_000 });
  await expect(root).toHaveAttribute("data-journey-node", "jaguar-habitat-loss-fragmentation");
  await expect(page.locator(".nature-journey-hud__title")).toContainText(/landscape changes/i);
  await expectSettled(root, 3);
  const chapter = page.locator(".nature-chapter");
  await expect(chapter).not.toHaveClass(/is-open/);
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-journey-v11-04-pressure.png`, fullPage: true });

  // Evidence remains an explicit secondary action.
  await page.locator(".nature-journey-hud__evidence").click();
  await expect(chapter).toHaveClass(/is-open/);
  await expect(page.locator("#nature-chapter-title")).toContainText(/PRESSURE/i);
  await expect(page.locator("#nature-chapter-kicker")).toContainText(/PRESSURE · KNOWN/i);
  await expect(page.locator("#nature-chapter-source")).toContainText(/PANTHERA/i);
  await expect(page.locator("#nature-chapter-boundary")).toContainText(/local diagnosis|place-specific evidence/i);

  const viewport = page.viewportSize();
  if (viewport && viewport.width <= 760) {
    const box = await chapter.boundingBox();
    expect(box, "mobile truth panel should be measurable").not.toBeNull();
    expect(box!.width, "mobile truth panel should read as a full bottom sheet").toBeGreaterThan(viewport.width * 0.88);
  }

  await page.locator("#nature-chapter-close").click();
  await next.click();
  await expect(root).toHaveAttribute("data-scene-state", "response");
  await expect(root).toHaveAttribute("data-cinematic-index", "4", { timeout: 15_000 });
  await expect(page.locator(".nature-journey-hud__title")).toContainText(/not the destination/i);
  await expectSettled(root, 4);
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-journey-v11-05-response.png`, fullPage: true });

  expect(errors, `page errors: ${errors.join(" | ")}`).toEqual([]);
});
