import { expect, test } from "@playwright/test";

test.describe("4SAPIEN Embla 02 first real choice loop", () => {
  test("shopping list gives immediate controlled FOOD coverage without fake recommendations", async ({ page }) => {
    await page.goto("/4sapien");

    await expect(page.getByRole("heading", { name: "Embla." })).toBeVisible();
    await expect(page.getByRole("button", { name: "Shopping list" })).toBeVisible();

    const list = page.getByLabel("What do you need?");
    await list.fill("Kaffe\nMelk\nSmør\nPasta");
    await page.getByLabel("Store").selectOption({ label: "KIWI" });
    await page.getByLabel("Budget · NOK").fill("150");
    await page.getByRole("button", { name: "Analyse my list" }).click();

    await expect(page.getByText("evidence-ready", { exact: true })).toBeVisible();
    await expect(page.getByText("not covered yet", { exact: true })).toBeVisible();
    await expect(page.getByText("EVIDENCE PATH READY", { exact: true })).toHaveCount(3);
    await expect(page.getByText("NOT COVERED YET", { exact: true })).toHaveCount(1);
    await expect(page.getByText(/does not claim live shelf availability/i)).toBeVisible();
    await expect(page.getByText(/category-wide ranking is withheld/i).first()).toBeVisible();

    await page.getByRole("button", { name: "Use this list" }).click();
    await expect(page.getByText(/Saved on this device/i)).toBeVisible();
  });

  test("Ask Embla still routes unsupported expensive choices fail-closed", async ({ page }) => {
    await page.goto("/4sapien");
    await page.getByRole("button", { name: "Ask Embla" }).click();
    await page.getByLabel("Ask Embla").fill("What car makes the most sense over five years?");
    await page.locator("form").filter({ has: page.getByLabel("Ask Embla") }).getByRole("button", { name: "Ask Embla" }).click();

    await expect(page.getByText("EMBLA → CAR")).toBeVisible();
    await expect(page.getByText("INTAKE ONLY")).toBeVisible();
    await expect(page.getByText(/withholds a recommendation instead of guessing/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /OPEN LIVE FOOD PROOF/i })).toHaveCount(0);
  });
});
