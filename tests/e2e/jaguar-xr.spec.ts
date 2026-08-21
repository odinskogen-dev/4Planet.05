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

test("Jaguar v25 renders local interactive 3D on desktop and mobile, then travels through distinct scenes", async ({ page }, testInfo) => {
  await page.goto("/journey/jaguar/");
  await page.waitForLoadState("domcontentloaded");

  const root = page.locator("#browser-experience");
  await expect(root).toHaveAttribute("data-species-id", "jaguar");
  await expect(root).toHaveAttribute("data-premium-version", "17");
  await expect(root).toHaveAttribute("data-creature-engine", "v19");
  await expect(root).toHaveAttribute("data-creature-preferred-asset", "ear-rodriguez-jaguar");
  await expect(root).toHaveAttribute("data-jaguar-local-runtime", "v25");
  await expect(root).toHaveAttribute("data-jaguar3d", "local-proxy-ready");
  await expect(root).toHaveAttribute("data-runtime-controller", "v21");
  await expect(root).toHaveAttribute("data-runtime-budget", /full|balanced|lite/);
  await expect(page.locator("iframe")).toHaveCount(0);

  await expect(page.locator(".nature-depth-room")).toBeVisible();
  await expect(page.locator(".nature-audio-provenance-v19")).toHaveCount(1);

  const enter = page.locator(".nature-entry__button");
  await expect(enter).toBeVisible();
  await enter.click();
  await expect(root).toHaveAttribute("data-entered", "true");
  await expect(root).toHaveAttribute("data-creature-phase", /emerge|walk|stop|breathe|observe|reveal|hold/, { timeout: 3_000 });
  await expect(root).toHaveAttribute("data-jaguar3d-active", "true");

  const creature = page.locator('.nature-3d-subject--v25[data-visible="true"][data-ready="true"]');
  await expect(creature).toBeVisible();
  const canvas = creature.locator("canvas");
  await expect(canvas).toBeVisible();
  const canvasBox = await canvas.boundingBox();
  expect(canvasBox?.width || 0, "local 3D canvas width").toBeGreaterThan(100);
  expect(canvasBox?.height || 0, "local 3D canvas height").toBeGreaterThan(100);

  const photo = page.locator(".nature-subject");
  await expect(photo).toHaveCSS("visibility", "hidden");

  const look = creature.getByRole("button", { name: "LOOK AT ME" });
  const move = creature.getByRole("button", { name: "MOVE" });
  await expect(look).toBeVisible();
  await expect(move).toBeVisible();
  await look.click();
  await expect(root).toHaveAttribute("data-jaguar-attention", /visitor|rest/);
  await move.click();
  await expect(root).toHaveAttribute("data-jaguar-attention", /motion|rest/);

  const creatureBox = await creature.boundingBox();
  if (creatureBox) {
    await page.mouse.move(creatureBox.x + creatureBox.width * .48, creatureBox.y + creatureBox.height * .45);
    await page.mouse.down();
    await page.mouse.move(creatureBox.x + creatureBox.width * .57, creatureBox.y + creatureBox.height * .45, { steps: 4 });
    await page.mouse.up();
    await expect(creature).toHaveAttribute("data-dragging", "false");
  }

  const viewport = page.viewportSize();
  if (viewport && viewport.width <= 760) {
    await expect(creature).toHaveCSS("display", "block");
    await expect(page.locator(".nature-world-card")).toBeHidden();
  }

  await expect(page.locator(".nature-journey-hud__title")).toContainText(/Meet one life/i);
  await exercisePremiumHotspot(page, /JAGUAR/i, /JAGUAR/i);
  await expectJourneyFrameSafe(page, root, "MEET LIFE");
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-v25-01-local-3d.png`, fullPage: true });

  const next = page.locator(".nature-journey-hud__next");
  await next.click();
  await expect(root).toHaveAttribute("data-scene-state", "dependency");
  await expect(root).toHaveAttribute("data-creature-phase", "dormant");
  await expect(root).toHaveAttribute("data-jaguar3d-active", "false");
  await expect(creature).toBeHidden();
  await expect(page.locator(".nature-journey-hud__title")).toContainText(/Follow the relationship/i);
  await expect(page.locator(".nature-depth-room__far")).toHaveCSS("display", "none");
  await expectJourneyFrameSafe(page, root, "FOLLOW RELATIONSHIP");

  await next.click();
  await expect(root).toHaveAttribute("data-scene-state", "habitat");
  await expect(page.locator(".nature-journey-hud__title")).toContainText(/animal is not the whole story/i);
  await expectJourneyFrameSafe(page, root, "CONNECTED HABITAT");

  await next.click();
  await expect(root).toHaveAttribute("data-scene-state", "pressure");
  await expect(page.locator(".nature-journey-hud__title")).toContainText(/landscape changes/i);
  await expectJourneyFrameSafe(page, root, "PRESSURE");

  await next.click();
  await expect(root).toHaveAttribute("data-scene-state", "response");
  await expect(page.locator(".nature-journey-hud__title")).toContainText(/Pressure is not the destination/i);
  await expectJourneyFrameSafe(page, root, "RESPOND");
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-v25-05-response.png`, fullPage: true });

  const sound = page.locator(".nature-sound");
  await expect(sound).toBeVisible();
  await sound.click();
  await expect(sound).toHaveText(/TURN SOUND ON/i);
});
