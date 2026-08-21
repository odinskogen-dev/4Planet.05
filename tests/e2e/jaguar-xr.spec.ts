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
  await expectViewportSafe(page, page.locator(".nature-premium__panel"), `${label} panel`);
  await expectViewportSafe(page, page.locator(".nature-premium__progress"), `${label} progress`);
  await expectViewportSafe(page, page.locator(".nature-premium__chapter-nav"), `${label} chapter nav`);
}

async function exercisePremiumHotspot(page: Page, root: Locator, hotspotName: RegExp, expectedTitle: RegExp) {
  const hotspot = page.getByRole("button", { name: hotspotName }).first();
  await expect(hotspot).toBeVisible();
  await hotspot.click();
  await expect(root).toHaveAttribute("data-context-open", "true");
  await expect(page.locator(".nature-world-card__title")).toContainText(expectedTitle);
  await page.keyboard.press("Escape");
  await expect(root).toHaveAttribute("data-context-open", "false");
}

test("Jaguar premium Browser Journey travels through distinct scenes with authored world interaction before evidence", async ({ page }, testInfo) => {
  await page.goto("/journey/jaguar/");
  await page.waitForLoadState("domcontentloaded");

  // Runtime state contracts live on the Journey root. `.nature-world` is the
  // visual background layer only and must not become a second state surface.
  const root = page.locator("#browser-experience");
  await expect(root).toHaveAttribute("data-species-id", "jaguar");
  await expect(root).toHaveAttribute("data-premium-version", "17");
  await expect(root).toHaveAttribute("data-jaguar3d-mode", /manual-study|disabled/);

  await expect(page.locator(".nature-premium__enter")).toBeVisible();
  await page.locator(".nature-premium__enter").click();
  await expect(root).toHaveAttribute("data-entered", "true");

  const legacyCard = page.locator(".nature-world-card");
  await expect(legacyCard).toHaveAttribute("data-type", "identity");
  await expect(page.locator(".nature-world-card__title")).toContainText(/Jaguar/i);
  await expect(page.locator(".nature-world-card__scientific")).toContainText(/Panthera onca/i);

  await expect(page.locator(".nature-premium__panel")).toBeVisible();
  await expect(page.locator(".nature-premium__title")).toContainText(/Meet one life/i);
  await exercisePremiumHotspot(page, root, /JAGUAR/i, /JAGUAR/i);
  await expectJourneyFrameSafe(page, root, "MEET LIFE");

  const viewport = page.viewportSize();
  if (viewport && viewport.width > 760) {
    // Controlled species media is the default encounter. The licensed stylised 3D
    // study is a deliberate optional focus mode and may not silently replace nature.
    // External enhancement availability is not a release gate: if the pinned 3D
    // runtime/model is slow or unavailable, the controlled species media must remain.
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

    // Give the optional enhancement a bounded opportunity to resolve. If it is still
    // loading after the first grace period, wait briefly for a terminal ready/failed
    // state before choosing the assertion branch. This avoids racing a late successful
    // load into the fail-closed fallback assertion.
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
      await page.screenshot({ path: `${OUT}/${testInfo.project.name}-journey-v17-01-meet-3d-optional.png`, fullPage: true });
    } else {
      await expect(root).toHaveAttribute("data-jaguar3d-active", "false");
      await expect(controlledSubject).toBeVisible();
      await expect(controlledSubject).toHaveAttribute("data-three-replaced", "false");
      await page.screenshot({ path: `${OUT}/${testInfo.project.name}-journey-v17-01-meet-controlled-fallback.png`, fullPage: true });
    }

    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent("4planet:nature-world-interaction", {
        detail: { action: "focus", active: false }
      }));
    });
    await expect(root).toHaveAttribute("data-jaguar3d-active", "false");
    await expect(controlledSubject).toHaveAttribute("data-three-replaced", "false");
  } else {
    await expect(root).not.toHaveAttribute("data-jaguar3d-active", "true");
  }

  const next = page.getByRole("button", { name: /Next chapter/i });
  await next.click();
  await expect(page.locator(".nature-premium__title")).toContainText(/Follow the relationship/i);
  await expectJourneyFrameSafe(page, root, "FOLLOW RELATIONSHIP");

  await next.click();
  await expect(page.locator(".nature-premium__title")).toContainText(/animal is not the whole story/i);
  await expectJourneyFrameSafe(page, root, "CONNECTED HABITAT");

  await next.click();
  await expect(page.locator(".nature-premium__title")).toContainText(/landscape changes/i);
  await expectJourneyFrameSafe(page, root, "PRESSURE");

  await next.click();
  await expect(page.locator(".nature-premium__title")).toContainText(/Pressure is not the destination/i);
  await expectJourneyFrameSafe(page, root, "RESPOND");
  await expect(page.getByRole("link", { name: /Explore solutions/i })).toBeVisible();
});
