import { defineConfig, devices } from "@playwright/test";

/**
 * Gate 1 acceptance config. retries=0 so a flake is a failure, never masked.
 * trace + video + screenshot are always ON for the vertical-slice run so the
 * delivery package carries machine-readable evidence. Four Chromium viewport
 * projects cover 1440x900, 1280x800, 390x844, 430x932. WebKit provides a
 * second-engine matrix.
 *
 * CI installs Playwright browsers into its own cache. A custom Chromium path is
 * used only when PW_CHROMIUM is explicitly supplied by a controlled runtime;
 * otherwise Playwright resolves the browser it just installed.
 */
const chromiumArgs = [
  "--use-gl=angle",
  "--use-angle=swiftshader",
  "--enable-unsafe-swiftshader",
  "--ignore-gpu-blocklist",
  "--disable-gpu-driver-bug-workarounds",
];

const chromiumLaunch = process.env.PW_CHROMIUM
  ? { executablePath: process.env.PW_CHROMIUM, args: chromiumArgs }
  : { args: chromiumArgs };

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 150_000,
  expect: { timeout: 12_000 },
  fullyParallel: false,
  workers: 1,
  forbidOnly: true,
  retries: 0,
  reporter: [
    ["list"],
    ["json", { outputFile: "artifacts/results.json" }],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  outputDir: "test-results",
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:4173",
    trace: "on",
    video: "on",
    screenshot: "on",
    launchOptions: chromiumLaunch,
  },
  projects: [
    { name: "desktop-1440", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "desktop-1280", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    { name: "mobile-390", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } },
    { name: "mobile-430", use: { ...devices["Desktop Chrome"], viewport: { width: 430, height: 932 }, hasTouch: true, isMobile: true } },
    { name: "webkit-desktop", use: { ...devices["Desktop Safari"], viewport: { width: 1440, height: 900 }, launchOptions: { executablePath: undefined, args: [] } } },
    { name: "webkit-390", use: { ...devices["iPhone 13"], viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, launchOptions: { executablePath: undefined, args: [] } } },
    { name: "webkit-430", use: { ...devices["iPhone 14 Pro Max"], viewport: { width: 430, height: 932 }, hasTouch: true, isMobile: true, launchOptions: { executablePath: undefined, args: [] } } },
  ],
});
