import { test, expect } from "@playwright/test";

const surfaces = [
  { path: "/labs/gold/object/blue-whale", heading: "Blue whale", marker: "SPECIES GOLD" },
  { path: "/labs/gold/object/oslofjord", heading: "Oslofjord", marker: "PLACE GOLD" },
  { path: "/labs/gold/object/eelgrass-restoration", heading: "Eelgrass restoration", marker: "SOLUTION GOLD" },
  { path: "/labs/gold/story/news-august-2026", heading: "August just became the hottest August ever recorded", marker: "NEWS" },
  { path: "/labs/gold/story/explainer-1-5c", heading: "The planet crossed 1.5°C again", marker: "EXPLAINER" },
  { path: "/labs/gold/story/feature-blue-whale", heading: "The largest animal ever known is built on a world of krill", marker: "FEATURE" },
  { path: "/labs/gold/story/visual-blue-whale", heading: "A blue whale, in six numbers", marker: "VISUAL STORY" },
] as const;

for (const surface of surfaces) {
  test(`${surface.marker} proof renders as controlled Gold surface`, async ({ page }, testInfo) => {
    const fatal: string[] = [];
    page.on("pageerror", (error) => fatal.push(`pageerror:${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error" && !message.text().includes("Failed to load resource")) fatal.push(`console:${message.text()}`);
    });

    const response = await page.goto(surface.path, { waitUntil: "networkidle" });
    expect(response?.status(), `${surface.path} must return HTTP 200`).toBe(200);

    await expect(page.getByText("CONTROLLED TEST", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("NO LIVE RELEASE", { exact: true }).first()).toBeVisible();
    await expect(page.locator("h1").first()).toContainText(surface.heading);
    await expect(page.locator("meta[name='robots']")).toHaveAttribute("content", /noindex/);
    await expect(page.locator("body")).not.toHaveText(/undefined|null null|NaN/i);

    const safeName = surface.path.split("/").filter(Boolean).slice(-1)[0];
    await page.screenshot({ path: `artifacts/product-proof/gold-${safeName}-${testInfo.project.name}.png`, fullPage: true });
    expect(fatal, fatal.join("\n")).toEqual([]);
  });
}

test("Gold index exposes exactly the seven representative review paths", async ({ page }) => {
  await page.goto("/labs/gold", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: /Two reusable forms/i })).toBeVisible();
  for (const surface of surfaces) await expect(page.locator(`a[href='${surface.path}']`)).toHaveCount(1);
});
