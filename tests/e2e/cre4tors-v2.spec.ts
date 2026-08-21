import { expect, test } from "@playwright/test";

test.describe("CRE4TORS_ v02", () => {
  test("creator operating story and interactions hold together", async ({ page }) => {
    await page.goto("/cre4tors");

    await expect(page.getByRole("heading", { name: /Create more/i })).toBeVisible();
    await expect(page.getByText("INFRASTRUCTURE FOR CREATIVE INDEPENDENCE · V2 LAB")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Human potential is abundant/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Creative work is surrounded by operating work/i })).toBeVisible();

    const metric = page.locator(".c4-tax-panel strong").first();
    const before = await metric.textContent();
    await page.getByLabel("Demo system effectiveness").evaluate((element) => {
      const input = element as HTMLInputElement;
      input.value = "80";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await expect(metric).not.toHaveText(before ?? "");

    await page.getByRole("tab", { name: "MUSICIAN" }).click();
    await expect(page.locator(".c4-archetype-main").getByRole("heading", { name: "Musician" })).toBeVisible();
    await expect(page.getByText("Master · composition · sync · performance")).toBeVisible();
    await expect(page.getByText("Listening world 01")).toBeVisible();

    await expect(page.getByRole("heading", { name: /3 things need you/i })).toBeVisible();
    const firstAction = page.locator(".c4-os-action").first();
    await firstAction.click();
    await expect(page.getByRole("heading", { name: /2 things need you/i })).toBeVisible();

    await expect(page.getByRole("heading", { name: /Not more jobs/i })).toBeVisible();
    await expect(page.getByText("SONIC × WH4LES_")).toBeVisible();
    await page.getByRole("button", { name: /Listening-world collaboration/i }).click();
    await expect(page.getByText("Master + composition handled separately")).toBeVisible();

    await expect(page.getByRole("heading", { name: /Rights should not be a mystery/i })).toBeVisible();
    await expect(page.getByText("PAID ≠ LICENSED ≠ CONTRIBUTED. CONTRIBUTED ≠ FREE-FOR-ALL.")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Your abilities can meet/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /More of your life belongs to you/i })).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
  });

  test("prototype truth labels remain explicit", async ({ page }) => {
    await page.goto("/cre4tors");
    await expect(page.getByText("EARLY STAGE · 4PLANET LABS")).toBeVisible();
    await expect(page.getByText(/Every object below is DEMO \/ CONCEPT/)).toBeVisible();
    await expect(page.getByText("DEMO NEED · NOT A LIVE OPPORTUNITY").first()).toBeVisible();
    await expect(page.getByText(/V2 remains a LABS instrument/)).toBeVisible();
  });
});
