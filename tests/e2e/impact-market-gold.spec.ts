import { expect, test } from "@playwright/test";

test.describe("4PLANET MARKET — Creator × Impact Gold", () => {
  test("complete synthetic creator-to-impact transaction stays coherent", async ({ page }) => {
    await page.goto("/market");

    await expect(page.getByRole("heading", { name: /ART THAT.*DOES.*SOMETHING/i })).toBeVisible();
    await expect(page.getByText("DEMO · NOT LIVE COMMERCE")).toBeVisible();
    await expect(page.getByText(/No payment · POD · creator payout or ecological outcome/i)).toBeVisible();

    await page.getByRole("button", { name: /Habitat recovery action/i }).click();
    await expect(page.getByText("RE:WILD_").first()).toBeVisible();
    await expect(page.getByText("NOK 160").first()).toBeVisible();

    const price = page.getByLabel("Demo print price");
    await price.fill("1500");
    await expect(page.getByText("NOK 1 500").first()).toBeVisible();

    await expect(page.getByText(/ALLOCATED/)).toBeVisible();
    await expect(page.getByText(/NOK 1 500 \/ NOK 1 500/)).toBeVisible();
    await expect(page.getByText("Creator retained")).toBeVisible();
    await expect(page.getByText("Not granted")).toBeVisible();

    await page.getByRole("button", { name: /SUBMIT PRODUCT/i }).click();
    await expect(page.getByRole("heading", { name: "CURATION PENDING" })).toBeVisible();
    await page.getByRole("button", { name: /SIMULATE CURATOR APPROVAL/i }).click();
    await expect(page.getByRole("heading", { name: /APPROVED FOR DEMO MARKET/i })).toBeVisible();
    await expect(page.getByText("✓ PUBLISHED FIXTURE")).toBeVisible();

    await page.getByRole("button", { name: /RUN DEMO ORDER/i }).click();
    await expect(page.getByRole("heading", { name: "ORDER CREATED" })).toBeVisible();

    for (let step = 1; step < 10; step += 1) {
      await page.getByRole("button", { name: /NEXT EVENT/i }).click();
    }

    await expect(page.getByRole("heading", { name: "TRANSACTION RECONCILED" })).toBeVisible();
    await expect(page.getByText("YES", { exact: true })).toBeVisible();
    await expect(page.getByText("NOK 495").first()).toBeVisible();
    await expect(page.getByText("NOK 160").first()).toBeVisible();
    await expect(page.getByText("1", { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/DEMO IMPACT FUNDING STATE/i)).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
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
