import { expect, test } from "@playwright/test";

/**
 * The Embla Choice Intelligence loop, end to end, with no network dependency.
 *
 * The journey runs on the bounded FOOD test record so the whole decision —
 * intent, product, priorities, verdict, trade-offs, saved choice and feedback —
 * is machine-checkable. The live source path is covered by its honest failure
 * state, never by inventing data.
 */

const BASELINE = "TEST RECORD — Norsk yoghurt naturell";
const BETTER = "TEST RECORD — Yoghurt C";

async function startYoghurtDecision(page: import("@playwright/test").Page) {
  await page.goto("/4sapien");
  await page.getByLabel("What are you choosing?").fill("Yoghurt for breakfast");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Which one are you holding?" })).toBeVisible();
  await page.getByRole("button", { name: "Try it with a test record" }).click();
  await expect(page.getByRole("heading", { name: BASELINE })).toBeVisible();
}

test.describe("EMBLA — one complete FOOD choice", () => {
  test("intent → product → priorities → explained verdict → saved decision", async ({ page }) => {
    await startYoghurtDecision(page);

    // Test data is never presented as a real shelf product.
    await expect(page.getByText(/TEST DATA · This is a 4PLANET fixture record/i)).toBeVisible();

    // No priorities yet: Embla refuses to call any product better.
    await expect(page.getByRole("heading", { name: "Tell Embla what matters." })).toBeVisible();
    await expect(page.getByRole("button", { name: "Choose this one" })).toHaveCount(0);

    await page.getByRole("button", { name: "Lower sugar" }).click();

    // A recommendation is now earned, and it is explained in human units.
    await expect(page.getByRole("heading", { name: `Switch to ${BETTER}.` })).toBeVisible();
    await expect(page.getByText("Sugar: 1.9 g lower per 100 g/ml").first()).toBeVisible();
    await expect(page.getByText("Protein: 1.5 g higher per 100 g/ml").first()).toBeVisible();
    await expect(page.getByText(/not stated in either record/i).first()).toBeVisible();

    // The choice action persists locally and claims nothing beyond the decision.
    await page.getByRole("button", { name: "Choose this one" }).click();
    await expect(page.getByText("SAVED ON THIS DEVICE")).toBeVisible();
    await expect(page.getByText(`You chose ${BETTER} instead of ${BASELINE}.`)).toBeVisible();
    await expect(page.getByText(/not proof of a purchase/i).first()).toBeVisible();

    await expect(page.getByRole("heading", { name: "Kept on this device." })).toBeVisible();

    await page.reload();
    await expect(page.getByRole("heading", { name: "Kept on this device." })).toBeVisible();
    await expect(page.getByText(BETTER).first()).toBeVisible();

    await page.getByRole("button", { name: "Useful", exact: true }).click();
    await expect(page.getByText("MARKED USEFUL")).toBeVisible();

    const overflow = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
    }));
    expect(overflow.document).toBeLessThanOrEqual(overflow.viewport + 2);
  });

  test("evidence and limits stay inspectable under the answer", async ({ page }) => {
    await startYoghurtDecision(page);
    await page.getByRole("button", { name: "Lower sugar" }).click();

    await page.getByRole("group", { name: "Avoid declared allergens" }).getByRole("button", { name: "Milk" }).click();
    await expect(page.getByText(/None of the allergens you avoid are listed in this record/i).first()).toBeVisible();

    await page.locator("summary").filter({ hasText: "Substitutes Embla looked at" }).click();
    await expect(page.getByText("NOT COMPARED · Unsuitable comparison").first()).toBeVisible();

    await page.locator("summary").filter({ hasText: "Evidence, source and limits" }).click();
    await expect(page.getByText("4PLANET test fixture")).toBeVisible();
    await expect(page.getByText(/Price — no shelf price is read/i)).toBeVisible();
    await expect(page.getByRole("link", { name: "Open the full FOOD evidence workspace" })).toHaveAttribute("href", "/4sapien/food");
  });

  test("a decision without an evidence path fails closed instead of guessing", async ({ page }) => {
    await page.goto("/4sapien");
    await page.getByLabel("What are you choosing?").fill("What car makes the most sense over five years?");
    await page.getByRole("button", { name: "Start", exact: true }).click();

    await expect(page.getByText("EMBLA → CAR")).toBeVisible();
    await expect(page.getByText(/withholds a recommendation instead of guessing/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "Read product" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Choose this one" })).toHaveCount(0);
  });

  test("an unreadable barcode is refused without inventing a product", async ({ page }) => {
    await page.goto("/4sapien");
    await page.getByLabel("What are you choosing?").fill("Yoghurt");
    await page.getByRole("button", { name: "Start", exact: true }).click();

    await page.getByLabel("Barcode").fill("1234");
    await page.getByRole("button", { name: "Read product" }).click();

    await expect(page.getByText(/A barcode has 8, 12, 13 or 14 digits/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /^Switch to/ })).toHaveCount(0);
  });
});
