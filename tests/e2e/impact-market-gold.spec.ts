import { expect, test } from "@playwright/test";

test.describe("4PLANET MARKET — Creator × Impact Gold", () => {
  test("real first creator catalogue leads the Market and stays dense on mobile", async ({ page }) => {
    await page.goto("/market");

    await expect(page.getByRole("heading", { name: /ART THAT.*DOES.*SOMETHING/i }).first()).toBeVisible();
    await expect(page.getByText("CATALOGUE LIVE · COMMERCE NOT LIVE")).toBeVisible();
    await expect(page.getByText(/No payment · POD · creator payout or ecological outcome/i).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /ODIN ODDEKALV.*PHOTOGRAPHS/i })).toBeVisible();

    const products = page.locator(".mkt-maze-card");
    await expect(products).toHaveCount(6);
    for (const title of [
      "Above the fjord",
      "Still water, two skies",
      "Turf roofs, inner waterway",
      "Cliff edge, weather coming in",
      "White sand at dusk",
      "Kelp line, low tide",
    ]) await expect(page.getByRole("heading", { name: title })).toBeVisible();

    const imagesLoaded = await products.locator("img").evaluateAll((images) => images.every((image) => {
      const img = image as HTMLImageElement;
      return img.complete && img.naturalWidth > 0;
    }));
    expect(imagesLoaded).toBe(true);

    if (test.info().project.name.includes("390")) {
      const first = await products.nth(0).boundingBox();
      const second = await products.nth(1).boundingBox();
      expect(first).not.toBeNull();
      expect(second).not.toBeNull();
      expect(Math.abs((first?.x ?? 0) - (second?.x ?? 0))).toBeGreaterThan(120);
      expect(Math.abs((first?.y ?? 0) - (second?.y ?? 0))).toBeLessThan(360);
    }

    const gridBox = await page.locator(".mkt-maze").boundingBox();
    const oldFixtureBox = await page.locator(".mkt-legacy-model .mkt-product-stage").boundingBox();
    expect(gridBox).not.toBeNull();
    expect(oldFixtureBox).toBeNull();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
  });

  test("complete synthetic creator-to-impact transaction remains available below the real catalogue", async ({ page }) => {
    await page.goto("/market");

    await page.getByRole("button", { name: /Habitat recovery action/i }).click();
    await expect(page.getByText("RE:WILD_").first()).toBeVisible();
    await expect(page.getByText("NOK 160").first()).toBeVisible();

    const price = page.getByLabel("Demo print price");
    await price.fill("1500");
    await expect(page.getByText(/NOK\s*1\s*500/).first()).toBeVisible();

    await expect(page.getByText(/ALLOCATED/)).toBeVisible();
    const allocation = page.locator(".mkt-waterfall-check strong");
    await expect(allocation).toBeVisible();
    const allocationText = (await allocation.textContent()) ?? "";
    expect(allocationText.replace(/\s/g, "")).toBe("NOK1500/NOK1500");
    await expect(page.getByText("Creator retained")).toBeVisible();
    await expect(page.getByText("Not granted")).toBeVisible();

    await page.getByRole("button", { name: /SUBMIT PRODUCT/i }).click();
    await expect(page.getByRole("heading", { name: "CURATION PENDING" })).toBeVisible();
    await page.getByRole("button", { name: /SIMULATE CURATOR APPROVAL/i }).click();
    await expect(page.getByRole("heading", { name: /APPROVED FOR DEMO MARKET/i })).toBeVisible();
    await expect(page.getByText("✓ PUBLISHED FIXTURE")).toBeVisible();

    await page.getByRole("button", { name: /RUN DEMO ORDER/i }).click();
    await expect(page.getByRole("heading", { name: "ORDER CREATED" })).toBeVisible();

    for (let step = 1; step < 10; step += 1) await page.getByRole("button", { name: /NEXT EVENT/i }).click();

    await expect(page.getByRole("heading", { name: "TRANSACTION RECONCILED" })).toBeVisible();
    await expect(page.getByText("YES", { exact: true })).toBeVisible();
    await expect(page.getByText("NOK 495").first()).toBeVisible();
    await expect(page.getByText("NOK 160").first()).toBeVisible();
    await expect(page.getByText("1", { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/DEMO IMPACT FUNDING STATE/i)).toBeVisible();
  });

  test("distribution and truth boundaries remain explicit", async ({ page }) => {
    await page.goto("/market");

    await expect(page.getByRole("heading", { name: /THE PEOPLE MAKING.*THE WORK CAN ALSO.*MOVE THE STORY/i })).toBeVisible();
    const distribution = page.getByLabel("Creator originated distribution share");
    await distribution.fill("55");
    await expect(page.getByText("55%", { exact: true })).toBeVisible();
    await expect(page.getByText(/Hypothesis control only/i)).toBeVisible();

    await expect(page.getByRole("heading", { name: /BUILD THE WHOLE LOOP.*FAKE NONE OF IT/i })).toBeVisible();
    await expect(page.getByText(/No real sale · no real creator payout/i)).toBeVisible();
    await expect(page.getByText(/Quality-validated POD print partner/i)).toBeVisible();
  });
});
