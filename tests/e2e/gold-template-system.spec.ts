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

test("@identity-preflight exact controlled sandbox is the expected HEIR before the full matrix", async ({ page }) => {
  const exactSha = process.env.EXACT_SHA;
  expect(exactSha, "workflow must pin the exact candidate SHA").toMatch(/^[0-9a-f]{40}$/);

  const response = await page.goto("/sandbox/gold", { waitUntil: "domcontentloaded" });
  expect(response?.status(), "sandbox identity preflight requires HTTP 200").toBe(200);

  const headers = response?.headers() ?? {};
  expect(headers["x-4planet-control-plane"]).toBe("four-state-v1");
  expect(headers["x-4planet-review-source"]).toBe(`heir-${exactSha!.slice(0, 12)}`);

  const controlled = page.getByText("CONTROLLED TEST", { exact: true }).first();
  await expect(controlled).toBeVisible();
  await expect(page.getByRole("heading", { name: /Founder Review/i }).first()).toBeVisible();

  const controlledNode = await controlled.elementHandle();
  expect(controlledNode, "controlled sentinel must resolve to a stable node").not.toBeNull();
  const originalText = await controlledNode!.textContent();
  try {
    await controlledNode!.evaluate((node) => {
      node.textContent = "WRONG SURFACE";
    });
    await expect(page.getByText("CONTROLLED TEST", { exact: true })).toHaveCount(0);
    await expect(page.getByText("WRONG SURFACE", { exact: true })).toBeVisible();
  } finally {
    await controlledNode!.evaluate((node, text) => {
      node.textContent = text;
    }, originalText);
  }
  await expect(page.getByText("CONTROLLED TEST", { exact: true }).first()).toBeVisible();
});

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
