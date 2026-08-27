import { expect, test } from "@playwright/test";

test.describe("4SAPIEN Embla first decision loop", () => {
  test("FOOD prompt reaches the live evidence path without inventing a recommendation", async ({ page }) => {
    await page.goto("/4sapien");

    await page.getByRole("button", { name: "Which of these groceries is the better choice for me?" }).click();
    await page.getByRole("button", { name: "RUN EMBLA" }).click();

    await expect(page.getByText("EMBLA → FOOD → PICK_")).toBeVisible();
    await expect(page.getByText("EVIDENCE PATH READY")).toBeVisible();
    await expect(page.getByText(/identified the decision path, not the answer/i)).toBeVisible();

    const next = page.getByRole("link", { name: /OPEN LIVE FOOD PROOF/i });
    await expect(next).toHaveAttribute("href", "/4sapien/food");
    await next.click();

    await expect(page).toHaveURL(/\/4sapien\/food$/);
    await expect(page.getByRole("button", { name: /READ PRODUCT/i })).toBeVisible();
    await expect(page.getByText(/No universal score\. No paid ranking\. No fake precision\./i)).toBeVisible();
  });

  test("unsupported CAR prompt fails closed", async ({ page }) => {
    await page.goto("/4sapien");

    await page.getByRole("button", { name: "What car makes the most sense over five years?" }).click();
    await page.getByRole("button", { name: "RUN EMBLA" }).click();

    await expect(page.getByText("EMBLA → CAR")).toBeVisible();
    await expect(page.getByText("INTAKE ONLY")).toBeVisible();
    await expect(page.getByText(/withholds a recommendation instead of guessing/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /OPEN LIVE FOOD PROOF/i })).toHaveCount(0);
  });
});
