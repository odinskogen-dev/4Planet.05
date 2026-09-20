import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";

const base = "http://127.0.0.1:4187";
const server = spawn("./node_modules/.bin/vite", ["preview", "--host", "127.0.0.1", "--port", "4187", "--strictPort"], {
  stdio: "inherit", env: { ...process.env, PARTNERS_BUILD: "1" },
});
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function ready() {
  for (let i = 0; i < 50; i++) {
    if (server.exitCode !== null) throw Error("Preview exited before ready");
    try { if ((await fetch(base)).ok) return; } catch {}
    await sleep(250);
  }
  throw Error("Preview not ready");
}
const routes = [
  "/", "/portfolio", "/4brand", "/opportunities", "/enquire",
  "/for", "/for/company", "/for/foundation", "/for/investor", "/for/science",
  "/for/field", "/for/public", "/for/culture", "/for/active",
  "/opportunities/founding-build", "/opportunities/sapien-proof",
  "/opportunities/brands-proof", "/opportunities/science-data",
  "/opportunities/plastic-proof", "/dataroom", "/workspace", "/privacy",
  "/system", "/proof", "/partnerships", "/capital", "/trust", "/founder",
];
let browser;
try {
  await ready();
  browser = await chromium.launch();
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on("pageerror", (error) => errors.push(String(error)));
    for (const route of routes) {
      const response = await page.goto(base + route, { waitUntil: "domcontentloaded" });
      if (!response?.ok()) throw Error(route + " HTTP " + response?.status());
      await page.locator("h1").first().waitFor({ state: "visible" });
      const h1 = await page.locator("h1").first().innerText();
      if (!h1.trim()) throw Error(route + " blank H1");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (overflow > 2) throw Error(route + " horizontal overflow " + overflow + "px at " + viewport.width);
    }
    await page.goto(base + "/", { waitUntil: "domcontentloaded" });
    const homeSections = await page.locator("main.ph-home-short > section").count();
    if (homeSections !== 4) throw Error("Homepage must have exactly four concise sections, got " + homeSections);
    await page.getByRole("heading", { name: /A living planet/i }).waitFor();
    const heroText = await page.locator(".ph-hero-copy").innerText();
    if (heroText.length > 580) throw Error("Homepage hero too verbose: " + heroText.length);
    if (viewport.width >= 1201) {
      const navigation = page.getByRole("navigation", { name: "Partners navigation" });
      if (!(await navigation.isVisible())) throw Error("Desktop navigation is hidden");
      if (await page.getByRole("button", { name: "Open navigation" }).isVisible()) throw Error("Desktop hamburger must be hidden");
    } else {
      await page.getByRole("button", { name: "Open navigation" }).click();
      const navigation = page.getByRole("navigation", { name: "Partners navigation" });
      if (!(await navigation.isVisible())) throw Error("Mobile navigation did not open");
      await page.getByRole("button", { name: "Close navigation" }).click();
      if (await navigation.isVisible()) throw Error("Mobile navigation did not close");
    }
    const internalLinks = await page.locator('main.ph-home-short a[href^="/"]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")));
    if (!internalLinks.includes("/for") || !internalLinks.includes("/portfolio") || !internalLinks.includes("/proof")) throw Error("Core decision navigation missing");
    console.log("PARTNERS_HOME_UX=PASS viewport=" + viewport.width + " sections=4");
    if (errors.length) throw Error("React browser errors: " + errors.join(" | "));
    await page.close();
    console.log("PARTNERS_ROUTES=PASS viewport=" + viewport.width + " count=" + routes.length);
  }
  const unavailablePage = await browser.newPage();
  await unavailablePage.route("**/api/leads", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, acceptingEnquiries: false }) });
  });
  await unavailablePage.goto(base + "/enquire");
  await unavailablePage.getByText("The enquiry channel is not yet collecting submissions.", { exact: false }).waitFor();
  if (await unavailablePage.getByRole("button", { name: "Enquiries not available" }).isEnabled()) throw Error("unconfigured channel must disable submission");
  await unavailablePage.close();
  const page = await browser.newPage();
  await page.route("**/api/leads", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, acceptingEnquiries: true }) });
      return;
    }
    const data = route.request().postDataJSON();
    if (data.type !== "4partners" || data.role !== "company" || data.workArea !== "brands-proof" || data.consent !== true)
      throw Error("intake mapping failed");
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, delivered: false, reason: "not_configured" }) });
  });
  await page.goto(base + "/enquire?role=company&opportunity=brands-proof");
  if (await page.locator("select").first().inputValue() !== "company") throw Error("role query hydration failed");
  if (await page.locator("select").nth(1).inputValue() !== "brands-proof") throw Error("opportunity query hydration failed");
  async function fill() {
    await page.locator('input[autocomplete="name"]').fill("QA User");
    await page.locator('input[autocomplete="email"]').fill("qa@example.org");
    await page.locator("textarea").fill("QA non-sensitive enquiry");
    await page.locator('input[type="checkbox"]').check();
  }
  await fill();
  await page.getByRole("button", { name: "Submit enquiry" }).click();
  await page.getByText("Your information has not been stored or forwarded.").waitFor();
  await page.unroute("**/api/leads");
  await page.route("**/api/leads", async (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, delivered: true }) }));
  await page.getByRole("button", { name: "Submit enquiry" }).click();
  await page.getByText("Your enquiry was received by the configured 4PLANET intake.", { exact: false }).waitFor();
  console.log("PARTNERS_INTAKE_AVAILABILITY_MAPPING_AND_FAIL_CLOSED=PASS");
  await page.close();
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
