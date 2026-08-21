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
  await expect(page.locator(".nature-premium__panel")).toBeHidden();

  const viewport = page.viewportSize();
  if (viewport && viewport.width <= 760) {
    await expect(page.locator(".nature-context-ribbon")).toBeHidden();
    await expect(page.locator(".nature-premium__audio")).toBeHidden();
    const visibleHotspots = page.locator('.nature-premium-hotspot:visible');
    expect(await visibleHotspots.count(), `${label} mobile hotspot budget`).toBeLessThanOrEqual(2);
  }
}

async function exercisePremiumHotspot(page: Page, hotspotName: RegExp, expectedTitle: RegExp) {
  const hotspot = page.getByRole("button", { name: hotspotName }).first();
  await expect(hotspot).toBeVisible();
  await hotspot.click();
  const premium = page.locator(".nature-premium");
  await expect(premium).toHaveAttribute("data-detail-open", "true");
  await expect(page.locator(".nature-premium__detail-title")).toContainText(expectedTitle);
  await page.locator('.nature-premium__detail button[aria-label="Close hotspot detail"]').click();
  await expect(premium).toHaveAttribute("data-detail-open", "false");
}

test("Jaguar Gold Browser Journey stays world-first and travels through distinct scenes", async ({ page }, testInfo) => {
  await page.goto("/journey/jaguar/");
  await page.waitForLoadState("domcontentloaded");

  const root = page.locator("#browser-experience");
  await expect(root).toHaveAttribute("data-species-id", "jaguar");
  await expect(root).toHaveAttribute("data-premium-version", "17");
  await expect(root).toHaveAttribute("data-jaguar3d-mode", /manual-study|disabled/);

  const enter = page.locator(".nature-entry__button");
  await expect(enter).toBeVisible();
  await expect(page.locator(".nature-premium__enter")).toHaveCount(0);
  await enter.click();
  await expect(root).toHaveAttribute("data-entered", "true");

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
  if (viewport && viewport.width <= 760) {
    await expect(legacyCard).toBeHidden();
  }

  if (viewport && viewport.width > 760) {
    await expect(root).toHaveAttribute("data-jaguar3d-mode", "manual-study");
    await expect(root).toHaveAttribute("data-jaguar3d-active", "false");
    const controlledSubject = page.locator(".nature-subject");
    await expect(controlledSubject).toBeVisible();
    await expect(controlledSubject).toHaveAttribute("data-three-replaced", "false");

    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent("4planet:nature-world-interaction", {
        detail: { action: "focus", active: true }
      }));
    });

    await page.waitForTimeout(3_000);
    let threeState = await root.getAttribute("data-jaguar3d");
    if (threeState === "loading") {
      await page.waitForFunction(() => {
        const el = document.querySelector("#browser-experience");
        const state = el?.getAttribute("data-jaguar3d");
        return state !== "loading";
      }, undefined, { timeout: 5_000 }).catch(() => undefined);
      threeState = await root.getAttribute("data-jaguar3d");
    }
    expect(["ready", "loading", "failed", null]).toContain(threeState);

    if (threeState === "ready") {
      await expect(root).toHaveAttribute("data-jaguar3d-active", "true", { timeout: 5_000 });
      const threeStudy = page.locator('.nature-3d-subject[data-visible="true"][data-ready="true"]');
      await expect(threeStudy).toBeVisible();
      await expect(threeStudy.locator("canvas")).toBeVisible();
      await expect(page.locator(".nature-3d-subject__meta")).toContainText(/POLY BY GOOGLE|CC BY 3\.0/i);
      await expectViewportSafe(page, threeStudy, "MEET LIFE optional 3D Jaguar study");
      const box = await threeStudy.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width * 0.45, box.y + box.height * 0.48);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width * 0.63, box.y + box.height * 0.48, { steps: 5 });
        await page.mouse.up();
        await expect(threeStudy).toHaveAttribute("data-dragging", "false");
      }
    } else {
      await expect(root).toHaveAttribute("data-jaguar3d-active", "false");
      await expect(controlledSubject).toBeVisible();
      await expect(controlledSubject).toHaveAttribute("data-three-replaced", "false");
    }

    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent("4planet:nature-world-interaction", {
        detail: { action: "focus", active: false }
      }));
    });
    await expect(root).toHaveAttribute("data-jaguar3d-active", "false");
  } else {
    await expect(root).not.toHaveAttribute("data-jaguar3d-active", "true");
  }

  const next = page.locator(".nature-journey-hud__next");

  await next.click();
  await expect(root).toHaveAttribute("data-scene-state", "dependency");
  await expect(page.locator(".nature-journey-hud__title")).toContainText(/Follow the relationship/i);
  await expect(legacyCard).toHaveAttribute("data-type", "relationship");
  await expect(page.locator(".nature-world-card__title")).toContainText(/Capybara/i);
  if (viewport && viewport.width <= 760) {
    await expect(legacyCard).toBeVisible();
    await expectViewportSafe(page, legacyCard, "FOLLOW RELATIONSHIP prey card");
  }
  await expectJourneyFrameSafe(page, root, "FOLLOW RELATIONSHIP");
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-gold-v18-02-prey.png`, fullPage: true });

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
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-gold-v18-05-response.png`, fullPage: true });

  await sound.click();
  await expect(sound).toHaveText(/TURN SOUND ON/i);
  await expect(sound).toHaveAttribute("aria-pressed", "false");
});
