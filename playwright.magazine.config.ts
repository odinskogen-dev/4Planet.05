import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /magazine-(world-class|article-sprint)\.spec\.ts/,
  timeout: 120_000,
  expect: { timeout: 12_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [
    ["list"],
    ["json", { outputFile: "artifacts/magazine-results.json" }],
    ["html", { outputFolder: "magazine-playwright-report", open: "never" }],
  ],
  outputDir: "magazine-test-results",
  use: {
    baseURL: process.env.BASE_URL || "http://127.0.0.1:4173",
    trace: "on",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "mag-desktop-1440", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mag-tablet-1024", use: { ...devices["Desktop Chrome"], viewport: { width: 1024, height: 768 } } },
    { name: "mag-mobile-430", use: { ...devices["Desktop Chrome"], viewport: { width: 430, height: 932 }, hasTouch: true, isMobile: true } },
    { name: "mag-mobile-390", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } },
    { name: "mag-webkit-430", use: { ...devices["iPhone 14 Pro Max"], viewport: { width: 430, height: 932 }, hasTouch: true, isMobile: true } },
    { name: "mag-webkit-390", use: { ...devices["iPhone 13"], viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } },
  ],
});
