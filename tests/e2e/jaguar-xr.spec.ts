import { mkdirSync } from "node:fs";
import { test, expect } from "@playwright/test";

const OUT = "artifacts/jaguar-xr";
mkdirSync(OUT, { recursive: true });

test("Jaguar immersive loads canonical Nature Renderer and works without WebXR", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/xr/jaguar/", { waitUntil: "domcontentloaded" });

  const root = page.locator("#browser-experience");
  await expect(root).toHaveAttribute("data-entity-id", "taxon:gbif:5219426", { timeout: 20_000 });
  await expect(root).toHaveAttribute("data-manifest-version", "v0.4");
  await expect(root).toHaveAttribute("data-truth-feed", "canonical-adapter");
  await expect(page.locator(".brand")).toHaveAttribute("href", "/species/jaguar");
  await expect(page.locator(".nature-entry__title")).toContainText(/Enter the rainforest/i);
  await expect(page.locator(".nature-browser-status")).not.toContainText(/NOT AVAILABLE/i);
  await expect(page.locator(".nature-footer")).toContainText(/AMAZONIA SOUNDSCAPE/i);
  await expect(page.locator('.nature-node[data-node-id="jaguar-identity"]')).toHaveCount(1);
  await expect(page.locator('.nature-node[data-node-id="jaguar-solutions-transition"]')).toHaveAttribute("data-relation-class", "RESPONSE");

  await page.locator(".nature-entry__button").click();
  await expect(root).toHaveAttribute("data-entered", "true");
  await expect(root).toHaveAttribute("data-audio-profile", "amazonia-procedural-v05", { timeout: 5_000 });
  await expect(page.locator(".nature-entry")).toHaveCSS("visibility", "hidden", { timeout: 5_000 });
  await expect(page.locator(".nature-subject__name")).toContainText(/JAGUAR/i);

  const pressure = page.locator('.nature-node[data-node-id="jaguar-habitat-loss-fragmentation"]');
  await pressure.click({ force: true });
  const chapter = page.locator(".nature-chapter");
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

  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-jaguar-browser-immersive.png`, fullPage: true });
  expect(errors, `page errors: ${errors.join(" | ")}`).toEqual([]);
});
