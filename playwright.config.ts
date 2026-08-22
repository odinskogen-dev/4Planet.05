import { defineConfig, devices } from "@playwright/test";

/**
 * Gate 1 acceptance config. retries=0 so a flake is a failure, never masked.
 * trace + video + screenshot are always ON for the vertical-slice run so the
 * delivery package carries machine-readable evidence. Four viewport projects
 * cover the required matrix: 1440x900, 1280x800, 390x844, 430x932.
 *
 * Browser resolution is fail-safe: CI installs the Playwright version pinned by
 * package-lock, so Playwright owns its browser path unless PW_CHROMIUM is
 * explicitly supplied by a controlled local runner. Never pin a historical
 * /opt/pw-browsers revision in repository configuration.
 */
const chromiumExecutable = process.env.PW_CHROMIUM?.trim() || undefined;

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
    launchOptions: {
      executablePath: chromiumExecutable,
      args: [
        "--use-gl=angle",
        "--use-angle=swiftshader",
        "--enable-unsafe-swiftshader",
        "--ignore-gpu-blocklist",
        "--disable-gpu-driver-bug-workarounds",
      ],
    },
  },
  projects: [
    { name: "desktop-1440", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "desktop-1280", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    { name: "mobile-390", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } },
    { name: "mobile-430", use: { ...devices["Desktop Chrome"], viewport: { width: 430, height: 932 }, hasTouch: true, isMobile: true } },
    // WebKit matrix (required by the convergence order): desktop + 390 + 430.
    // These clear any optional local Chromium executable override so Playwright
    // resolves the installed WebKit build for the exact package version.
    { name: "webkit-desktop", use: { ...devices["Desktop Safari"], viewport: { width: 1440, height: 900 }, launchOptions: { executablePath: undefined, args: [] } } },
    { name: "webkit-390", use: { ...devices["iPhone 13"], viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, launchOptions: { executablePath: undefined, args: [] } } },
    { name: "webkit-430", use: { ...devices["iPhone 14 Pro Max"], viewport: { width: 430, height: 932 }, hasTouch: true, isMobile: true, launchOptions: { executablePath: undefined, args: [] } } },
  ],
});
