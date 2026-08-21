import { expect, test } from "@playwright/test";

test.describe("ENGINE FOUNDRY · Partner Engine transfer proof", () => {
  test("runs a second specialised engine on the shared Foundry runtime", async ({ page }) => {
    await page.goto("/labs/engines/partner");

    await expect(page.getByRole("heading", { name: /Find the right partner/i })).toBeVisible();
    await expect(page.getByText("INPUT-DRIVEN / NO OUTREACH")).toBeVisible();
    await expect(page.locator(".pe-candidate")).toHaveCount(3);

    await page.getByRole("button", { name: "RUN PARTNER ENGINE" }).click();

    await expect(page.getByText("SUCCEEDED", { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/#1 ·/).first()).toBeVisible();
    await expect(page.locator(".pe-result").getByText("Candidate A · field operator", { exact: true })).toBeVisible();
    await expect(page.locator(".pe-result").getByText("Candidate B · research consortium", { exact: true })).toBeVisible();
    await expect(page.locator(".pe-result.is-blocked").getByText("Candidate C · unverified implementer", { exact: true })).toBeVisible();
    await expect(page.getByText("FOUNDER_NORWAY_OUTBOUND_APPROVAL")).toBeVisible();
    await expect(page.locator(".pe-result.is-blocked").getByText("INELIGIBLE", { exact: true })).toBeVisible();
    await expect(page.getByText("HOLD / REJECT")).toBeVisible();

    for (const stage of ["validate", "fit", "diligence", "block", "rank"]) {
      await expect(page.getByText(stage, { exact: true })).toBeVisible();
    }
  });

  test("keeps external action advisory and exposes diligence gaps", async ({ page }) => {
    await page.goto("/labs/engines/partner");
    await page.getByRole("button", { name: "RUN PARTNER ENGINE" }).click();

    await expect(page.getByText("EXTERNAL_ACTION_AUTHORITY").first()).toBeVisible();
    await expect(page.getByText("VERIFY_ELIGIBILITY")).toBeVisible();
    await expect(page.getByText(/This engine cannot contact anyone/i)).toBeVisible();
  });
});
