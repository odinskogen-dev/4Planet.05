import { mkdirSync } from "node:fs";
import { test, expect, type Locator, type Page } from "@playwright/test";

const OUT = "artifacts/jaguar-xr";
mkdirSync(OUT, { recursive: true });

async function expectSettled(root: Locator, index: number) {
  await expect(root).toHaveAttribute("data-cinematic-settled", "true", { timeout: 20_000 });
  await expect(root).toHaveAttribute("data-cinematic-settled-index", String(index), { timeout: 20_000 });
}

async function expectViewportSafe(page: Page, locator: Locator, label: string) {
  const viewport = page.viewportSize();
  const box = await locator.boundingBox();
  expect(viewport, `${label}: viewport should exist`).not.toBeNull();
  expect(box, `${label}: element should be measurable`).not.toBeNull();
  expect(box!.x, `${label}: left edge may not clip`).toBeGreaterThanOrEqual(-1);
  expect(box!.x + box!.width, `${label}: right edge may not clip`).toBeLessThanOrEqual(viewport!.width + 1);
}

async function expectJourneyFrameSafe(page: Page, root: Locator, label: string) {
  await expectViewportSafe(page, root, `${label} root`);
  await expectViewportSafe(page, page.locator(".nature-journey-hud"), `${label} HUD`);
  const card = page.locator(".nature-world-card[data-visible=true]");
  if (await card.count()) await expectViewportSafe(page, card, `${label} world card`);
  const scrollX = await page.evaluate(() => window.scrollX);
  expect(scrollX, `${label}: journey must not horizontally scroll`).toBe(0);
}

test("Jaguar Browser Journey v1.1 travels through distinct scenes with authored world interactions before evidence", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/journey/jaguar/", { waitUntil: "domcontentloaded" });

  const root = page.locator("#browser-experience");
  await expect(root).toHaveAttribute("data-entity-id", "taxon:gbif:5219426", { timeout: 20_000 });
  await expect(root).toHaveAttribute("data-manifest-version", "v1.1");
  await expect(root).toHaveAttribute("data-truth-feed", "canonical-adapter");
  await expect(root).toHaveAttribute("data-cinematic-engine", "v1.1");
  await expect(root).toHaveAttribute("data-interaction-engine", "v1.3");
  await expect(root).toHaveAttribute("data-performance-tier", /full|lite/);
  await expect(page.locator(".brand")).toHaveAttribute("href", "/species/jaguar");
  await expect(page.locator(".nature-entry__title")).toContainText(/Enter the rainforest/i);
  await expect(page.locator(".nature-browser-status")).toContainText(/BROWSER JOURNEY|SOURCE-AWARE/i);
  await expect(page.locator(".nature-footer")).toContainText(/JOURNEY ENGINE/i);
  await expect(page.locator('.nature-node[data-node-id="jaguar-solutions-transition"]')).toHaveAttribute("data-relation-class", "RESPONSE");

  await page.locator(".nature-entry__button").click();
  await expect(root).toHaveAttribute("data-entered", "true");
  // Jaguar consumes the shared world-aware audio engine. Forest is the intentional
  // world profile; Orca uses ocean. Keep readiness/playing assertions semantic and
  // do not pin the retired Jaguar-only Amazonia audio implementation name.
  await expect(root).toHaveAttribute("data-audio-profile", "forest-procedural-v06", { timeout: 5_000 });
  await expect(root).toHaveAttribute("data-audio-ready", "true", { timeout: 5_000 });
  await expect(root).toHaveAttribute("data-audio-playing", "true", { timeout: 5_000 });
  await expect(page.locator(".nature-entry")).toHaveCSS("visibility", "hidden", { timeout: 5_000 });
  await expect(page.locator(".nature-subject__name")).toContainText(/JAGUAR/i);
  await expect(root).toHaveAttribute("data-scene-state", "identity", { timeout: 5_000 });
  await expect(root).toHaveAttribute("data-cinematic-scene", "identity", { timeout: 15_000 });
  await expect(root).toHaveAttribute("data-chapter-media-ready", "true", { timeout: 15_000 });
  await expect(page.locator(".nature-journey-hud__title")).toContainText(/Meet one life/i);
  await expectSettled(root, 0);

  const card = page.locator(".nature-world-card");
  await expect(card).toHaveAttribute("data-visible", "true", { timeout: 8_000 });
  await expect(card).toHaveAttribute("data-type", "identity");
  await expect(page.locator(".nature-world-card__title")).toContainText(/Jaguar/i);
  await expect(page.locator(".nature-world-card__scientific")).toContainText(/Panthera onca/i);
  await page.locator(".nature-world-card__primary").click();
  await expect(root).toHaveAttribute("data-world-interaction", "focus");
  await expectJourneyFrameSafe(page, root, "MEET LIFE");

  const viewport = page.viewportSize();
  if (viewport && viewport.width > 760) {
    await expect(root).toHaveAttribute("data-jaguar3d", "ready", { timeout: 20_000 });
    await expect(root).toHaveAttribute("data-jaguar3d-active", "true", { timeout: 5_000 });
    const threeStudy = page.locator('.nature-3d-subject[data-visible="true"][data-ready="true"]');
    await expect(threeStudy).toBeVisible();
    await expect(threeStudy.locator("canvas")).toBeVisible();
    await expect(page.locator(".nature-3d-subject__meta")).toContainText(/POLY BY GOOGLE|CC BY 3\.0/i);
    await expectViewportSafe(page, threeStudy, "MEET LIFE 3D Jaguar");

    const box = await threeStudy.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width * 0.45, box.y + box.height * 0.48);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.63, box.y + box.height * 0.48, { steps: 5 });
      await page.mouse.up();
      await expect(threeStudy).toHaveAttribute("data-dragging", "false");
    }
    await page.screenshot({ path: `${OUT}/${testInfo.project.name}-journey-v14-01-meet-3d.png`, fullPage: true });
  } else {
    await expect(root).not.toHaveAttribute("data-jaguar3d-active", "true");
    await page.screenshot({ path: `${OUT}/${testInfo.project.name}-journey-v14-01-meet-mobile.png`, fullPage: true });
  }

  const next = page.locator(".nature-journey-hud__next");
  await next.click();
  await expect(root).toHaveAttribute("data-scene-state", "dependency");
  await expect(root).toHaveAttribute("data-cinematic-index", "1", { timeout: 15_000 });
  await expect(page.locator(".nature-journey-hud__title")).toContainText(/Follow the relationship/i);
  await expectSettled(root, 1);
  await expect(card).toHaveAttribute("data-visible", "true", { timeout: 8_000 });
  await expect(card).toHaveAttribute("data-type", "relationship");
  await expect(page.locator(".nature-world-card__title")).toContainText(/Capybara/i);
  await expect(page.locator(".nature-world-card__scientific")).toContainText(/Hydrochoerus hydrochaeris/i);
  await expect(page.locator(".nature-world-card__relationship")).toContainText(/DOCUMENTED JAGUAR PREY/i);
  await expect(page.locator(".nature-world-card__image")).toHaveAttribute("src", /Capybara/);
  await page.locator(".nature-world-card__primary").click();
  await expect(root).toHaveAttribute("data-world-interaction", "trace");
  await expectJourneyFrameSafe(page, root, "FOLLOW PREY");
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-journey-v14-02-prey.png`, fullPage: true });

  await next.click();
  await expect(root).toHaveAttribute("data-scene-state", "habitat");
  await expect(root).toHaveAttribute("data-cinematic-index", "2", { timeout: 15_000 });
  await expect(page.locator(".nature-journey-hud__title")).toContainText(/not the whole story/i);
  await expectSettled(root, 2);
  await expect(card).toHaveAttribute("data-visible", "true", { timeout: 8_000 });
  await expect(card).toHaveAttribute("data-type", "system");
  await page.locator(".nature-world-card__primary").click();
  await expect(root).toHaveAttribute("data-world-interaction", "system");
  await expectJourneyFrameSafe(page, root, "CONNECTED HABITAT");
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-journey-v14-03-habitat.png`, fullPage: true });

  await next.click();
  await expect(root).toHaveAttribute("data-scene-state", "pressure");
  await expect(root).toHaveAttribute("data-cinematic-index", "3", { timeout: 15_000 });
  await expect(root).toHaveAttribute("data-journey-node", "jaguar-habitat-loss-fragmentation");
  await expect(page.locator(".nature-journey-hud__title")).toContainText(/landscape changes/i);
  await expectSettled(root, 3);
  await expect(card).toHaveAttribute("data-visible", "true", { timeout: 8_000 });
  await expect(card).toHaveAttribute("data-type", "pressure");
  await page.locator(".nature-world-card__primary").click();
  await expect(root).toHaveAttribute("data-world-interaction", "pressure");
  await expectJourneyFrameSafe(page, root, "UNDER PRESSURE");

  const chapter = page.locator(".nature-chapter");
  await expect(chapter).not.toHaveClass(/is-open/);
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-journey-v14-04-pressure.png`, fullPage: true });

  // Evidence remains an explicit secondary action after the world interaction.
  await page.locator(".nature-journey-hud__evidence").click();
  await expect(chapter).toHaveClass(/is-open/);
  await expect(page.locator("#nature-chapter-title")).toContainText(/PRESSURE/i);
  await expect(page.locator("#nature-chapter-kicker")).toContainText(/PRESSURE · KNOWN/i);
  await expect(page.locator("#nature-chapter-source")).toContainText(/PANTHERA/i);
  await expect(page.locator("#nature-chapter-boundary")).toContainText(/local diagnosis|place-specific evidence/i);

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
  await expect(card).toHaveAttribute("data-visible", "true", { timeout: 8_000 });
  await expect(card).toHaveAttribute("data-type", "response");
  await expect(page.locator(".nature-world-card__primary")).toContainText(/SOLUTIONS/i);
  await expectJourneyFrameSafe(page, root, "RESPOND");
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-journey-v14-05-response.png`, fullPage: true });

  expect(errors, `page errors: ${errors.join(" | ")}`).toEqual([]);
});
