import { mkdirSync } from "node:fs";
import { expect, test } from "@playwright/test";

const sharedShellRoutes = [
  "/",
  "/domains",
  "/missions",
  "/species",
  "/living-systems",
  "/impact",
  "/magazine",
  "/about",
  "/about/founder",
  "/join",
  "/people",
  "/brands",
  "/partners",
  "/funders",
  "/privacy",
];

const fullLiveMatrixRoutes = [
  "/domains/oce4n",
  "/domains/e4rth",
  "/domains/s4piens",
  "/domains/4culture",
  "/missions/cle4n",
  "/missions/wh4les",
  "/missions/cor4l",
  "/missions/rewild-marine",
  "/missions/clim4te",
  "/missions/am4zonia",
  "/missions/species",
  "/missions/rewild-land",
  "/missions/food",
  "/missions/en4rgy",
  "/missions/circular-city",
  "/missions/f4shion",
  "/missions/4film",
  "/missions/4rt",
  "/missions/4play",
  "/reports",
  "/about/story",
  "/about/system",
];

const reviewRoutes = [
  ["home", "/"],
  ["species", "/species"],
  ["living-systems", "/living-systems"],
  ["impact", "/impact"],
  ["magazine", "/magazine"],
  ["about", "/about"],
  ["oce4n", "/domains/oce4n"],
  ["amazonia", "/missions/am4zonia"],
] as const;

async function expectUsableSharedSurface(page: import("@playwright/test").Page, route: string) {
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response?.status(), `${route} returned an HTTP error`).toBeLessThan(400);
  await expect(page.locator("#main-content"), `${route} missing the shared main landmark`).toBeVisible();
  await expect(page.locator(".public-brand"), `${route} missing the shared 4PLANET identity`).toBeVisible();
  await expect(page.locator("footer"), `${route} missing the shared return/orientation layer`).toHaveCount(1);
  await expect(page).toHaveTitle(/4PLANET/i);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `${route} has page-level horizontal overflow`).toBeLessThanOrEqual(1);

  const visibleText = (await page.locator("#main-content").innerText()).replace(/\s+/g, " ").trim();
  expect(visibleText.length, `${route} rendered an effectively empty public surface`).toBeGreaterThan(24);
}

async function activateScrollReveals(page: import("@playwright/test").Page) {
  await page.evaluate(async () => {
    const step = Math.max(320, Math.floor(window.innerHeight * 0.78));
    const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    for (let y = 0; y <= max; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => window.setTimeout(resolve, 45));
    }
    window.scrollTo(0, max);
    await new Promise((resolve) => window.setTimeout(resolve, 120));
  });
}

test("PUBLIC CORE shared-shell routes render as one usable product family with no obvious dead end or horizontal overflow", async ({ page }) => {
  for (const route of sharedShellRoutes) await expectUsableSharedSurface(page, route);
});

test("ATLAS remains reachable while its active product sprint owns its internal shell", async ({ page }) => {
  const response = await page.goto("/atlas", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBeLessThan(400);
  await expect(page).toHaveTitle(/4PLANET/i);
  const text = (await page.locator("body").innerText()).replace(/\s+/g, " ").trim();
  expect(text.length, "ATLAS rendered an effectively empty surface").toBeGreaterThan(24);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, "ATLAS has page-level horizontal overflow").toBeLessThanOrEqual(1);
});

test("PUBLIC CORE full LIVE matrix renders on representative desktop/mobile", async ({ page }, testInfo) => {
  test.skip(!["desktop-1440", "mobile-390"].includes(testInfo.project.name), "Full matrix is exhaustive on one desktop + one phone; critical routes remain cross-browser.");
  for (const route of fullLiveMatrixRoutes) await expectUsableSharedSurface(page, route);
});

test("PUBLIC CORE held SPA routes fail closed into safe public destinations", async ({ page }) => {
  const cases = [
    ["/species/lab", "/species"],
    ["/species/orca/lume", "/species/orca"],
    ["/lens", "/atlas"],
    ["/4sapien/food", "/domains/s4piens"],
    ["/food/pick", "/missions/food"],
    ["/actors/orca", "/partners"],
    ["/get-involved", "/join"],
    ["/impact/lab/tree-unit", "/impact"],
    ["/checkout/lab", "/impact"],
  ] as const;

  for (const [held, safe] of cases) {
    await page.goto(held, { waitUntil: "domcontentloaded" });
    await expect.poll(() => new URL(page.url()).pathname, `${held} did not fail closed`).toBe(safe);
  }
});

test("PUBLIC CORE first read explains the proposition and exposes the four human lenses", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Everything you love is connected");
  await expect(page.getByText(/Explore one living planet/i)).toBeVisible();
  for (const label of ["ATLAS", "SPECIES", "LIVING SYSTEMS", "IMPACT"]) {
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
  }
});

test("PUBLIC CORE shared shell retains keyboard, landmark, image and responsive navigation accessibility", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const skip = page.locator("a.skip-link");
  await skip.focus();
  await expect(skip).toBeFocused();
  await skip.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
  await expect(page.getByRole("link", { name: "4PLANET home" })).toHaveCount(1);

  const width = page.viewportSize()?.width ?? 1440;
  if (width <= 900) {
    const menu = page.getByRole("button", { name: "Open menu" });
    await expect(menu).toBeVisible();
    await menu.click();
    const dialog = page.getByRole("dialog", { name: "4PLANET navigation" });
    await expect(dialog).toBeVisible();
    for (const label of ["ATLAS", "SPECIES", "LIVING SYSTEMS", "IMPACT"]) {
      await expect(dialog.getByText(label, { exact: true }).first()).toBeVisible();
    }
    await page.keyboard.press("Escape");
    await expect(menu).toBeFocused();
  } else {
    await expect(page.getByRole("navigation", { name: "Primary navigation" })).toHaveCount(1);
  }

  const unlabeledImages = await page.locator("img:not([alt])").count();
  expect(unlabeledImages, "homepage contains image elements without an alt attribute").toBe(0);

  const unnamedButtons = await page.locator("button").evaluateAll((buttons) => buttons.filter((button) => {
    const aria = button.getAttribute("aria-label")?.trim();
    const text = button.textContent?.trim();
    return !aria && !text;
  }).length);
  expect(unnamedButtons, "homepage contains buttons without an accessible name").toBe(0);
});

test("PUBLIC CORE homepage reveals essential below-fold content during a normal human scroll", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await activateScrollReveals(page);
  await expect(page.getByRole("heading", { name: /Environmental problems are complex/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Build this with us/i })).toBeVisible();
});

test("PUBLIC CORE homepage stays within a bounded local navigation-time budget", async ({ page }) => {
  await page.goto("/", { waitUntil: "load" });
  const timing = await page.evaluate(() => {
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    return navigation ? navigation.loadEventEnd - navigation.startTime : Number.POSITIVE_INFINITY;
  });
  expect(timing, `homepage local load timing exceeded release sanity budget: ${timing}ms`).toBeLessThan(5_000);
});

test("PUBLIC CORE records rendered Founder-JUDGE evidence on desktop and phones", async ({ page }, testInfo) => {
  test.skip(!["desktop-1440", "mobile-390", "mobile-430"].includes(testInfo.project.name), "Founder visual pack uses Chromium desktop + target phone widths.");
  const out = `artifacts/public-core/${testInfo.project.name}`;
  mkdirSync(out, { recursive: true });

  for (const [name, route] of reviewRoutes) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page.locator("#main-content")).toBeVisible();
    await activateScrollReveals(page);
    await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
  }
});
