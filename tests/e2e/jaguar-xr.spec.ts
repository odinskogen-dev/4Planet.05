import { mkdirSync } from "node:fs";
import { test, expect } from "@playwright/test";

const OUT = "artifacts/jaguar-xr";
mkdirSync(OUT, { recursive: true });

test("Jaguar Journey v1.1 travels through distinct scenes before evidence", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/xr/jaguar/", { waitUntil: "domcontentloaded" });

  const root = page.locator("#browser-experience");
  await expect(root).toHaveAttribute("data-entity-id", "taxon:gbif:5219426", { timeout: 20_000 });
  await expect(root).toHaveAttribute("data-journey-version", "v1.1");
  await expect(root).toHaveAttribute("data-truth-feed", "canonical-adapter");
  await expect(page.locator(".brand")).toHaveAttribute("href", "/species/jaguar");
  await expect(page.locator(".nature-entry__title")).toContainText(/Enter the rainforest/i);
  await expect(page.locator(".nature-browser-status")).not.toContainText(/NOT AVAILABLE/i);
  await expect(page.locator(".nature-footer")).toContainText(/JAGUAR GOLD PROTOTYPE v1.1/i);
  await expect(page.locator(".nature-progress__step")).toHaveCount(6);

  await page.locator(".nature-entry__button").click();
  await expect(root).toHaveAttribute("data-entered", "true");
  await expect(root).toHaveAttribute("data-journey-chapter", "enter-canopy", { timeout: 5_000 });
  await expect(root).toHaveAttribute("data-scene-state", "place");
  await expect(root).toHaveAttribute("data-audio-profile", /amazonia-procedural-v11:canopy/, { timeout: 5_000 });
  await expect(page.locator(".nature-entry")).toHaveCSS("visibility", "hidden", { timeout: 5_000 });
  await expect(page.locator(".nature-nodes .nature-node")).toHaveCount(0);
  await expect(page.locator(".nature-journey-hud__title")).toContainText(/Enter the rainforest/i);

  // 01 — MEET LIFE. This is a new authored scene, not a panel state.
  await page.locator(".nature-journey-hud__next").click();
  await expect(root).toHaveAttribute("data-journey-chapter", "meet-jaguar");
  await expect(root).toHaveAttribute("data-scene-state", "species");
  await expect(page.locator(".nature-journey-hud__title")).toContainText(/Meet the jaguar/i);
  await expect(page.locator('.nature-node[data-node-id="jaguar-identity"]')).toHaveCount(1);
  await expect(page.locator(".nature-nodes .nature-node")).toHaveCount(2);
  await expect(page.locator(".nature-subject__name")).toContainText(/JAGUAR/i);
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-jaguar-journey-01-meet.png`, fullPage: true });

  // 02 — FOLLOW PREY.
  await page.locator(".nature-journey-hud__next").click();
  await expect(root).toHaveAttribute("data-journey-chapter", "follow-prey");
  await expect(root).toHaveAttribute("data-scene-state", "dependency");
  await expect(root).toHaveAttribute("data-audio-profile", /water-edge/, { timeout: 4_000 });
  await expect(page.locator(".nature-journey-hud__title")).toContainText(/Follow a relationship/i);
  await expect(page.locator(".nature-nodes .nature-node")).toHaveCount(2);

  // 03 — CONNECTED HABITAT.
  await page.locator(".nature-journey-hud__next").click();
  await expect(root).toHaveAttribute("data-journey-chapter", "connected-habitat");
  await expect(root).toHaveAttribute("data-scene-state", "living_system");
  await expect(page.locator(".nature-journey-hud__title")).toContainText(/not the whole story/i);

  // 04 — UNDER PRESSURE. Evidence remains an explicit secondary action.
  await page.locator(".nature-journey-hud__next").click();
  await expect(root).toHaveAttribute("data-journey-chapter", "under-pressure");
  await expect(root).toHaveAttribute("data-scene-state", "pressure");
  await expect(root).toHaveAttribute("data-audio-profile", /pressure/, { timeout: 4_000 });
  await expect(page.locator(".nature-journey-hud__title")).toContainText(/broken apart/i);
  const chapter = page.locator(".nature-chapter");
  await expect(chapter).not.toHaveClass(/is-open/);

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
    await expect(root).toHaveAttribute("data-model-mode", /photo-fallback|off/);
  }

  await page.locator("#nature-chapter-close").click();

  // 05 — RESPOND.
  await page.locator(".nature-journey-hud__next").click();
  await expect(root).toHaveAttribute("data-journey-chapter", "respond");
  await expect(root).toHaveAttribute("data-scene-state", "response");
  await expect(root).toHaveAttribute("data-audio-profile", /response/, { timeout: 4_000 });
  await expect(page.locator(".nature-journey-hud__title")).toContainText(/not the destination/i);
  await expect(page.locator('.nature-node[data-node-id="jaguar-solutions-transition"]')).toHaveCount(1);

  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-jaguar-journey-05-response.png`, fullPage: true });
  expect(errors, `page errors: ${errors.join(" | ")}`).toEqual([]);
});
