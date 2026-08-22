import { expect, test } from "@playwright/test";

test.describe("4PLANET MARKET — SALE 01 physical-commerce boundary", () => {
  test("Mulafossur first-sale surface stays truthful and purchase-ready in sandbox", async ({ page }) => {
    await page.goto("/market");

    await expect(page.getByRole("heading", { name: "Mulafossur" })).toBeVisible();
    await expect(page.getByText("SALE 01 / SANDBOX")).toBeVisible();
    await expect(page.getByText(/REAL PRODUCT ROUTE · NO LIVE MONEY · PHYSICAL FULFILMENT NOT YET RELEASED/i)).toBeVisible();
    await expect(page.getByText(/NOK\s*490/).first()).toBeVisible();
    await expect(page.getByText(/target retail \/ sandbox/i)).toBeVisible();
    await expect(page.getByText(/AFFORDABLE MATTE POSTER/i)).toBeVisible();

    const workImage = page.getByRole("img", { name: /Mulafossur waterfall and coastal landscape/i });
    await expect(workImage).toBeVisible();
    await expect(workImage).toHaveAttribute("src", /drive\.google\.com\/thumbnail/);

    const checkout = page.getByRole("link", { name: /TEST CHECKOUT/i });
    await expect(checkout).toBeVisible();
    await expect(checkout).toHaveAttribute("href", /buy\.stripe\.com\/test_/);
    await expect(page.getByText(/Stripe sandbox\. This button validates the payment route only/i)).toBeVisible();
    await expect(page.getByText(/It cannot create a physical order yet/i)).toBeVisible();

    await page.getByRole("button", { name: /PRODUCT DETAILS/i }).click();
    await expect(page.getByText("Odin Oddekalv", { exact: true })).toBeVisible();
    await expect(page.getByText("Unframed poster", { exact: true })).toBeVisible();
    await expect(page.getByText(/POD \/ provider qualification/i)).toBeVisible();
    await expect(page.getByText(/None · made to order/i)).toBeVisible();

    for (const step of ["BUY", "MAKE", "SHIP", "UPDATE", "RECEIPT", "RECONCILE"]) {
      await expect(page.getByText(step, { exact: true })).toBeVisible();
    }

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
  });

  test("physical sale truth boundaries remain explicit", async ({ page }) => {
    await page.goto("/market");

    await expect(page.getByRole("heading", { name: /THE SHOP.*THE WORK.*THE PAYMENT ROUTE/i })).toBeVisible();
    await expect(page.getByText(/current Stripe link is sandbox-only and is not a live physical order/i)).toBeVisible();
    await expect(page.getByText(/Production starts only after a physical POD variant and provider SKU are approved/i)).toBeVisible();
    await expect(page.getByText(/Payment, production, dispatch, creator payable and Impact remain separate states/i)).toBeVisible();
    await expect(page.getByText(/No ecological outcome is claimed from a product purchase/i)).toBeVisible();

    await expect(page.getByText(/Exact first production size locks after provider quote \+ physical sample/i)).toBeVisible();
    await expect(page.getByText(/Good photographic reproduction without fine-art paper pricing/i)).toBeVisible();
  });
});
