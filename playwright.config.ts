import { defineConfig, devices } from "@playwright/test";

// V40 behavioural harness. Runs against a served build or a deployed preview via
// BASE_URL. Needs a real browser (WebGL) — not runnable in the WebGL-less CI box.
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:4173",
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
