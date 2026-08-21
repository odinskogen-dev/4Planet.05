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

test("Jaguar MASTER v26 renders the local interactive 3D room and travels through all eight Gold frames", async ({ page }, testInfo) => {
  await page.goto("/journey/jaguar/");
  await page.waitForLoadState("domcontentloaded");

  const root = page.locator("#browser-experience");
  await expect(root).toHaveAttribute("data-species-id", "jaguar");
  await expect(root).toHaveAttribute("data-master-line", "PR79");
  await expect(root).toHaveAttribute("data-premium-version", "26");
  await expect(root).toHaveAttribute("data-creature-engine", "v19");
  await expect(root).toHaveAttribute("data-creature-preferred-asset", "ear-rodriguez-jaguar");
  await expect(root).toHaveAttribute("data-jaguar-local-runtime", "v26");
  await expect(root).toHaveAttribute("data-jaguar3d", "local-room-ready");
  await expect(root).toHaveAttribute("data-jaguar-room", "three-v26");
  await expect(root).toHaveAttribute("data-jaguar-master", "pr79-agent-jaguar-journey-v11");
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
  await expect(root).toHaveAttribute("data-audio-chapter", "identity");

  const creature = page.locator('.nature-3d-subject--room-v26[data-visible="true"][data-ready="true"]');
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

  await expect(page.locator(".nature-progress__step")).toHaveCount(8);
  await expect(page.locator(".nature-journey-hud__title")).toContainText(/Meet one life/i);
  await exercisePremiumHotspot(page, /JAGUAR/i, /JAGUAR/i);
  await expectJourneyFrameSafe(page, root, "01 ENCOUNTER");
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-v26-01-encounter.png`, fullPage: true });

  const next = page.locator(".nature-journey-hud__next");
  const frame = async (state: string, title: RegExp, label: string) => {
    await next.click();
    await expect(root).toHaveAttribute("data-scene-state", state);
    await expect(root).toHaveAttribute("data-audio-chapter", state);
    await expect(page.locator(".nature-journey-hud__title")).toContainText(title);
    await expectJourneyFrameSafe(page, root, label);
  };

  await frame("dependency", /Follow the relationship/i, "02 LIVING WEB");
  await expect(root).toHaveAttribute("data-creature-phase", "dormant");
  await expect(root).toHaveAttribute("data-jaguar3d-active", "false");
  await expect(creature).toBeHidden();
  await expect(page.locator(".nature-depth-room__far")).toHaveCSS("display", "none");

  await frame("habitat", /animal is not the whole story/i, "03 ECOSYSTEM + ATLAS");
  await frame("pressure", /landscape changes/i, "04 PRESSURE + UNDERSTANDING");
  await frame("response", /Pressure is not the destination/i, "05 SOLUTIONS");
  await frame("actors", /Solutions need accountable actors/i, "06 ACTORS");
  await expect(page.locator(".nature-premium")).toHaveAttribute("data-mode", "actors");
  await frame("action", /Action begins only when delivery is real/i, "07 ACTION + IMPACT");
  await expect(page.locator(".nature-premium")).toHaveAttribute("data-mode", "action");
  await expect(page.locator(".nature-premium")).toContainText(/NO VERIFIED UNIT ACTIVE/i);
  await frame("proof", /journey does not end at a click/i, "08 PROOF + REPORTING");
  await expect(page.locator(".nature-premium")).toHaveAttribute("data-mode", "proof");
  await expect(page.locator(".nature-premium")).toContainText(/EVIDENCE BEFORE OUTCOME|Evidence precedes/i);
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-v26-08-proof.png`, fullPage: true });

  const sound = page.locator(".nature-sound");
  await expect(sound).toBeVisible();
  await expect(sound).toHaveText(/TURN SOUND OFF/i);
  await sound.click();
  await expect(sound).toHaveText(/TURN SOUND ON/i);
  await sound.click();
  await expect(sound).toHaveText(/TURN SOUND OFF/i);
});
