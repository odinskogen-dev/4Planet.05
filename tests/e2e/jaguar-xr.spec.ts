import { expect, test, type Locator, type Page } from "@playwright/test";

const OUT = "artifacts/jaguar-xr";

async function expectViewportSafe(page: Page, locator: Locator, label: string) {
  const viewport = page.viewportSize();
  const box = await locator.boundingBox();
  expect(box, `${label} should have a rendered box`).toBeTruthy();
  if (!viewport || !box) return;
  expect(box.x, `${label} left edge`).toBeGreaterThanOrEqual(-2);
  expect(box.y, `${label} top edge`).toBeGreaterThanOrEqual(-2);
  expect(box.x + box.width, `${label} right edge`).toBeLessThanOrEqual(viewport.width + 2);
  expect(box.y + box.height, `${label} bottom edge`).toBeLessThanOrEqual(viewport.height + 2);
}

async function expectJourneyFrameSafe(page: Page, root: Locator, label: string) {
  await expect(root).toBeVisible();
  const hud = page.locator(".nature-journey-hud");
  await expect(hud).toBeVisible();
  await expectViewportSafe(page, hud, `${label} HUD`);

  const viewport = page.viewportSize();
  const premiumPanel = page.locator(".nature-premium__panel");
  if (viewport && viewport.width <= 760) {
    await expect(premiumPanel).toBeHidden();
    await expect(page.locator(".nature-context-ribbon")).toBeHidden();
    await expect(page.locator(".nature-premium__audio")).toBeHidden();
    const visibleHotspots = page.locator('.nature-premium-hotspot:visible');
    expect(await visibleHotspots.count(), `${label} mobile hotspot budget`).toBeLessThanOrEqual(2);
  } else {
    await expect(premiumPanel).toHaveCSS("opacity", "0");
    await expect(premiumPanel).toHaveCSS("pointer-events", "none");
  }
}

async function exercisePremiumHotspot(page: Page, hotspotName: RegExp, expectedTitle: RegExp) {
  const hotspot = page.locator('.nature-premium-hotspot').filter({ hasText: hotspotName }).first();
  await expect(hotspot).toBeVisible();
  await hotspot.click();
  const premium = page.locator(".nature-premium");
  await expect(premium).toHaveAttribute("data-detail-open", "true");
  await expect(page.locator(".nature-premium__detail-title")).toContainText(expectedTitle);
  await page.locator('.nature-premium__detail button[aria-label="Close hotspot detail"]').click();
  await expect(premium).toHaveAttribute("data-detail-open", "false");
}

test("Jaguar Gold v23 keeps the world first, adds live Ear 3D, adapts performance and travels through distinct scenes", async ({ page }, testInfo) => {
  await page.goto("/journey/jaguar/");
  await page.waitForLoadState("domcontentloaded");

  const root = page.locator("#browser-experience");
  await expect(root).toHaveAttribute("data-species-id", "jaguar");
  await expect(root).toHaveAttribute("data-premium-version", "17");
  await expect(root).toHaveAttribute("data-creature-engine", "v19");
  await expect(root).toHaveAttribute("data-creature-preferred-asset", "ear-rodriguez-jaguar");
  await expect(root).toHaveAttribute("data-creature-preferred-binary", "FOUNDER_SUPPLIED_VERIFIED_PENDING_REPO_BINARY_INGEST");
  await expect(root).toHaveAttribute("data-jaguar3d-mode", "creature-choreography-v19");
  await expect(root).toHaveAttribute("data-jaguar-live-bridge", "v23");
  await expect(root).toHaveAttribute("data-runtime-controller", "v21");
  await expect(root).toHaveAttribute("data-runtime-budget", /full|balanced|lite/);
  const runtimeBudget = await root.getAttribute("data-runtime-budget");

  await expect(page.locator(".nature-depth-room")).toBeVisible();
  await expect(page.locator(".nature-depth-room__far")).toBeVisible();
  const foregroundLeft = page.locator(".nature-depth-room__foreground-left");
  if (runtimeBudget === "lite") await expect(foregroundLeft).toBeHidden();
  else await expect(foregroundLeft).toBeVisible();
  await expect(page.locator(".nature-audio-provenance-v19")).toHaveCount(1);

  const enter = page.locator(".nature-entry__button");
  await expect(enter).toBeVisible();
  await enter.click();
  await expect(root).toHaveAttribute("data-entered", "true");
  await expect(root).toHaveAttribute("data-creature-phase", /emerge|walk|stop|breathe|observe|reveal|hold/, { timeout: 3_000 });
  await expect(root).toHaveAttribute("data-creature-audio", "designed-not-field");

  const sound = page.locator(".nature-sound");
  await expect(sound).toBeVisible();
  await expect(sound).toHaveText(/TURN SOUND OFF/i);
  await expect(sound).toHaveAttribute("aria-pressed", "true");

  const legacyCard = page.locator(".nature-world-card");
  await expect(legacyCard).toHaveAttribute("data-type", "identity");
  await expect(page.locator(".nature-world-card__title")).toContainText(/Jaguar/i);
  await expect(page.locator(".nature-world-card__scientific")).toContainText(/Panthera onca/i);

  await expect(root).toHaveAttribute("data-scene-state", "identity");
  await expect(page.locator(".nature-journey-hud__title")).toContainText(/Meet one life/i);
  await expect(page.locator(".nature-premium__title")).toContainText(/Meet one life/i);
  await exercisePremiumHotspot(page, /JAGUAR/i, /JAGUAR/i);
  await expectJourneyFrameSafe(page, root, "MEET LIFE");

  const viewport = page.viewportSize();
  if (viewport && viewport.width <= 760) await expect(legacyCard).toBeHidden();

  if (viewport && viewport.width > 760 && runtimeBudget !== "lite") {
    const live = page.locator(".nature-ear-live-v23");
    await expect(live).toHaveCount(1);
    await expect(live.getByRole("button", { name: "LOOK AT ME" })).toHaveCount(1);
    await expect(live.getByRole("button", { name: "MOVE" })).toHaveCount(1);
    await expect(live.locator(".nature-ear-live-v23__credit")).toContainText(/EAR\.RODRIGUEZ/i);

    // External Sketchfab availability is deliberately not a release gate. If it
    // reaches ready state in CI, exercise both bounded interactions; otherwise
    // the controlled photo fallback must remain available.
    await page.waitForTimeout(1_800);
    const state = await root.getAttribute("data-jaguar3d");
    expect(["ear-live-bridge", "preferred-pending", "failed", null]).toContain(state);
    if (state === "ear-live-bridge") {
      await expect(root).toHaveAttribute("data-jaguar3d-active", "true");
      await live.getByRole("button", { name: "LOOK AT ME" }).click();
      await expect(root).toHaveAttribute("data-jaguar-attention", /visitor|rest/);
      await live.getByRole("button", { name: "MOVE" }).click();
      await expect(root).toHaveAttribute("data-jaguar-attention", /motion|rest/);
    } else {
      await expect(page.locator(".nature-subject")).toBeVisible();
    }
  }

  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-gold-v23-01-encounter.png`, fullPage: true });

  const next = page.locator(".nature-journey-hud__next");
  await next.click();
  await expect(root).toHaveAttribute("data-scene-state", "dependency");
  await expect(root).toHaveAttribute("data-creature-phase", "dormant");
  await expect(page.locator(".nature-journey-hud__title")).toContainText(/Follow the relationship/i);
  await expect(legacyCard).toHaveAttribute("data-type", "relationship");
  await expect(page.locator(".nature-world-card__title")).toContainText(/Capybara/i);
  await expect(page.locator(".nature-depth-room__far")).toHaveCSS("display", "none");
  if (viewport && viewport.width <= 760) {
    // Founder mobile rule: the relationship stays in the scene + hotspots; do
    // not stack a second legacy prey card above the authored story HUD.
    await expect(legacyCard).toBeHidden();
  }
  await expectJourneyFrameSafe(page, root, "FOLLOW RELATIONSHIP");

  await next.click();
  await expect(root).toHaveAttribute("data-scene-state", "habitat");
  await expect(page.locator(".nature-journey-hud__title")).toContainText(/animal is not the whole story/i);
  if (viewport && viewport.width <= 760) await expect(legacyCard).toBeHidden();
  await expectJourneyFrameSafe(page, root, "CONNECTED HABITAT");

  await next.click();
  await expect(root).toHaveAttribute("data-scene-state", "pressure");
  await expect(page.locator(".nature-journey-hud__title")).toContainText(/landscape changes/i);
  if (viewport && viewport.width <= 760) await expect(legacyCard).toBeHidden();
  await expectJourneyFrameSafe(page, root, "PRESSURE");

  await next.click();
  await expect(root).toHaveAttribute("data-scene-state", "response");
  await expect(page.locator(".nature-journey-hud__title")).toContainText(/Pressure is not the destination/i);
  if (viewport && viewport.width <= 760) await expect(legacyCard).toBeHidden();
  await expectJourneyFrameSafe(page, root, "RESPOND");
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-gold-v23-05-response.png`, fullPage: true });

  await sound.click();
  await expect(sound).toHaveText(/TURN SOUND ON/i);
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  await expect(root).toHaveAttribute("data-field-audio", /paused|ready|blocked-or-unavailable|failed-optional/);
});
