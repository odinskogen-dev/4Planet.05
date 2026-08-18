import { defineConfig, devices } from "@playwright/test";

/**
 * Gate 1 acceptance config. retries=0 so a flake is a failure, never masked.
 * trace + video + screenshot are always ON for the vertical-slice run so the
 * delivery package carries machine-readable evidence. Four viewport projects
 * cover the required matrix: 1440x900, 1280x800, 390x844, 430x932.
 *
 * Browser binaries are resolved by Playwright from the version installed by CI.
 * Do not pin an absolute executable path: that makes the gate depend on a stale
 * runner image rather than the repository's locked Playwright version.
 */
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
    // WebKit matrix: desktop + 390 + 430. Clear Chromium-specific launch args so
    // Playwright uses its own installed WebKit binary and defaults.
    { name: "webkit-desktop", use: { ...devices["Desktop Safari"], viewport: { width: 1440, height: 900 }, launchOptions: { args: [] } } },
    { name: "webkit-390", use: { ...devices["iPhone 13"], viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, launchOptions: { args: [] } } },
    { name: "webkit-430", use: { ...devices["iPhone 14 Pro Max"], viewport: { width: 430, height: 932 }, hasTouch: true, isMobile: true, launchOptions: { args: [] } } },
  ],
});
