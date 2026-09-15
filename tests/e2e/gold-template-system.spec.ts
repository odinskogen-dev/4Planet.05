import { test, expect } from "@playwright/test";

const surfaces = [
  { path: "/sandbox/gold/species/blue-whale", heading: "Blue whale", marker: "SPECIES GOLD" },
  { path: "/sandbox/gold/place/oslofjord", heading: "Oslofjord", marker: "PLACE GOLD" },
  { path: "/sandbox/gold/living-system/oslofjord-living-system", heading: "Oslofjord coastal living system", marker: "LIVING SYSTEM GOLD" },
  { path: "/sandbox/gold/actor/orca", heading: "ORCA", marker: "ACTOR GOLD" },
  { path: "/sandbox/gold/solution/eelgrass-restoration", heading: "Eelgrass restoration", marker: "SOLUTION GOLD" },
  { path: "/sandbox/gold/signal/oslofjord-plan-2026", heading: "Oslofjord plan 2026–2030 enters consultation", marker: "SIGNAL GOLD" },
  { path: "/sandbox/gold/proof/eelgrass-proof-record", heading: "Eelgrass restoration — proof record", marker: "PROOF GOLD" },
  { path: "/sandbox/gold/magazine/news-august-2026", heading: "August just became the hottest August ever recorded", marker: "NEWS" },
  { path: "/sandbox/gold/magazine/explainer-1-5c", heading: "The planet crossed 1.5°C again", marker: "EXPLAINER" },
  { path: "/sandbox/gold/magazine/feature-blue-whale", heading: "The largest animal ever known is built on a world of krill", marker: "FEATURE" },
  { path: "/sandbox/gold/magazine/visual-blue-whale", heading: "A blue whale, in six numbers", marker: "VISUAL STORY" },
] as const;

for (const surface of surfaces) {
  test(`${surface.marker} renders as controlled sandbox Gold surface`, async ({ page }, testInfo) => {
    const fatal: string[] = [];
    page.on("pageerror", (error) => fatal.push(`pageerror:${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error" && !message.text().includes("Failed to load resource")) fatal.push(`console:${message.text()}`);
    });

    const response = await page.goto(surface.path, { waitUntil: "domcontentloaded" });
    expect(response?.status(), `${surface.path} must return HTTP 200`).toBe(200);

    await expect(page.getByText("CONTROLLED TEST", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("NO LIVE RELEASE", { exact: true }).first()).toBeVisible();
    await expect(page.locator("h1").first()).toContainText(surface.heading);
    await expect(page.locator("meta[name='robots']")).toHaveAttribute("content", /noindex/);

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("undefined");
    expect(bodyText).not.toContain("null null");
    expect(bodyText).not.toMatch(/\bNaN\b/);

    const safeName = surface.path.split("/").filter(Boolean).slice(-1)[0];
    await page.screenshot({ path: `artifacts/product-proof/gold-${safeName}-${testInfo.project.name}.png`, fullPage: true });
    expect(fatal, fatal.join("\n")).toEqual([]);
  });
}

test("Founder Review index exposes every object and Magazine review path", async ({ page }) => {
  const response = await page.goto("/sandbox/gold", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: /Founder Review/i }).first()).toBeVisible();
  await expect(page.locator("meta[name='robots']")).toHaveAttribute("content", /noindex/);
  for (const surface of surfaces) await expect(page.locator(`a[href='${surface.path}']`)).toHaveCount(1);
});
