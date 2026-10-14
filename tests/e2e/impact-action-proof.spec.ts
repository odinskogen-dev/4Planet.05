import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://127.0.0.1:4173";
const PATH = "/impact/actions/bay-of-biscay-survey";

test.describe("IMPACT Bay action Proof Ladder", () => {
  test("desktop keeps the three-column comparison", async ({ page }, testInfo) => {
    test.skip(!["desktop-1440", "webkit-desktop"].includes(testInfo.project.name), "desktop geometry only");
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${BASE}${PATH}`);

    await expect(page.getByRole("heading", { name: /Every stronger claim needs a stronger state/i })).toBeVisible();
    const rows = page.getByTestId("impact-proof-ladder-row");
    await expect(rows.first()).toBeVisible();
    const columns = await rows.first().evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(" ").filter(Boolean).length);
    expect(columns).toBe(3);
    await expect(rows.first().getByText("DOES NOT PROVE", { exact: true })).toBeVisible();
  });

  for (const width of [390, 430]) {
    test(`mobile ${width}px stacks every state and limitation without horizontal overflow`, async ({ page }, testInfo) => {
      test.skip(![`mobile-${width}`, `webkit-${width}`].includes(testInfo.project.name), `${width}px geometry only`);
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${BASE}${PATH}`);

      const ladder = page.getByTestId("impact-proof-ladder");
      const rows = page.getByTestId("impact-proof-ladder-row");
      await expect(ladder).toBeVisible();
      await expect(rows.first()).toBeVisible();

      const columnCounts = await rows.evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).gridTemplateColumns.split(" ").filter(Boolean).length));
      expect(columnCounts.every((count) => count === 1)).toBe(true);
      await expect(rows.first().getByText("DOES NOT PROVE", { exact: true })).toBeVisible();

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }
});
