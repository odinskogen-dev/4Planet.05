#!/usr/bin/env node
/**
 * 4NATION visual QA — screenshots across viewports and themes.
 *
 * Usage: node scripts/nation-visual-qa.mjs <baseUrl> <outDir> [--fixture] [--browser=chromium|webkit]
 *   --fixture  intercepts /api/unesco-* with a LAYOUT FIXTURE (synthetic values,
 *              visibly watermarked). Only for sandboxes without upstream egress.
 *              Never use fixture screenshots as evidence of real values.
 * Without --fixture it exercises the real shared read path (/api/unesco-*).
 */
import { chromium, webkit } from "@playwright/test";
import { mkdirSync } from "node:fs";

const [base = "http://127.0.0.1:5173", out = "qa-nation"] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const useFixture = process.argv.includes("--fixture");
const engine = (process.argv.find((a) => a.startsWith("--browser=")) || "--browser=chromium").split("=")[1];
const exe = process.env.PW_EXECUTABLE || undefined;
mkdirSync(out, { recursive: true });

const ID = { NO: ["NOR", "Norway", "Oslo"], BR: ["BRA", "Brazil", "Brasília"], JP: ["JPN", "Japan", "Tokyo"], KE: ["KEN", "Kenya", "Nairobi"] };
const BASE = { NO: [5.0e6, 62000, 81], BR: [1.9e8, 7000, 72], JP: [1.28e8, 39000, 82], KE: [4.0e7, 1000, 59] };
function wdi(iso2) {
  const [p0, g0, l0] = BASE[iso2];
  const rows = [];
  for (let y = 2000; y <= 2023; y++) {
    const t = y - 2000;
    rows.push({ country: iso2, year: String(y), population_total: Math.round(p0 * (1 + t * 0.008)), gdp_per_capita: Math.round(g0 * (1 + t * 0.025 + Math.sin(t / 2) * 0.05)),
      gdp_total: Math.round(p0 * g0 * (1 + t * 0.03)), gdp_growth_rate: +(1.5 + Math.sin(t) * 1.2).toFixed(2), life_expectancy: +(l0 + t * 0.12).toFixed(2),
      unemployment_rate: +(4 + Math.cos(t / 3) * 1.5).toFixed(2), labor_force_female: 61.2, labor_force_male: 70.4,
      population_0_14: Math.round(p0 * 0.17), population_15_64: Math.round(p0 * 0.64), population_65_up: Math.round(p0 * 0.19), female_population: 49.6,
      primary_school_enrollment: 100.3, secondary_school_enrollment: 114.9, tertiary_school_enrollment: +(60 + t * 0.9).toFixed(1) });
  }
  return rows;
}
const site = (title, iso2, extra = {}) => ({ title_en: title, name_en: title, site: title, iso2, iso_codes: iso2, countries: iso2, country_iso2: iso2, coordinates: { lat: 60, lon: 10 }, date_inscribed: "1979", category: "Cultural", ...extra });

async function fixture(page) {
  await page.route("**/api/unesco-data?**", (route) => {
    const ds = new URL(route.request().url()).searchParams.get("dataset");
    let records = [];
    if (ds === "cou001") records = Object.entries(ID).map(([iso2, [iso3, name, cap]]) => ({ iso2, iso3, country_title_en: name, capital_en: cap }));
    if (ds === "whc001") records = Object.keys(ID).flatMap((i) => [site("Fixture heritage site A", i), site("Fixture heritage site B", i, { category: "Natural", date_inscribed: "2005" })]);
    if (ds === "mab001") records = Object.keys(ID).map((i) => ({ title_en: "Fixture biosphere reserve", iso2: i, coordinates: { lat: 60, lon: 10 }, date: "2019" }));
    if (ds === "eg0001") records = [];
    if (ds === "ioc001") records = Object.keys(ID).map((i) => ({ area_name: "Fixture EEZ", name: "Fixture EEZ", country_iso2: i, area_type: "EEZ", coordinates: { lat: 62, lon: 4 }, n_species: 4211, n_observations: 812345, year_first: "1880", year_last: "2023" }));
    route.fulfill({ json: { ok: true, dataset: ds, retrievedAt: new Date().toISOString(), totalCount: records.length, truncated: false, records } });
  });
  await page.route("**/api/unesco-country?**", (route) => {
    const c = new URL(route.request().url()).searchParams.get("country");
    route.fulfill({ json: { ok: true, dataset: "wdi001", country: c, retrievedAt: new Date().toISOString(), totalCount: 24, records: wdi(c) } });
  });
  await page.route("**/api/climate-trace?**", (route) => {
    const assets = Array.from({ length: 12 }, (_, i) => ({ id: "fx" + i, name: "Fixture source " + (i + 1), subsector: "fixture-subsector", co2e: Math.round(9e6 / (i + 1.3)), year: 2024, lat: 60, lon: 10 }));
    route.fulfill({ json: { ok: true, source: "climatetrace", assets } });
  });
  await page.addInitScript(() => {
    addEventListener("DOMContentLoaded", () => {
      const b = document.createElement("div");
      b.textContent = "QA LAYOUT FIXTURE — SYNTHETIC VALUES, NOT SOURCE DATA";
      b.style.cssText = "position:fixed;z-index:99999;left:0;right:0;bottom:0;padding:4px;text-align:center;font:600 10px monospace;letter-spacing:.1em;background:#FF4D22;color:#fff;pointer-events:none";
      document.body.appendChild(b);
    });
  });
}
// Sandbox only: QA_FONT_DIR serves the brand fonts locally when Google Fonts is unreachable.
async function quiet(page) {
  const dir = process.env.QA_FONT_DIR;
  if (!dir) return;
  const { readFileSync } = await import("node:fs");
  const css = [["DM Sans", "DMSans.ttf", "100 1000"], ["Instrument Sans", "InstrumentSans.ttf", "400 700"], ["Fragment Mono", "FragmentMono.ttf", "400"]]
    .map(([f, file, w]) => `@font-face{font-family:"${f}";src:url(/__qa_fonts/${file}) format("truetype");font-weight:${w};font-display:block}`).join("");
  await page.route("**/fonts.googleapis.com/**", (r) => r.fulfill({ contentType: "text/css", body: css }));
  await page.route("**/__qa_fonts/**", (r) => r.fulfill({ contentType: "font/ttf", body: readFileSync(dir + "/" + r.request().url().split("/").pop()) }));
}

const VIEWPORTS = [["desktop", 1440, 900], ["tablet", 834, 1112], ["m430", 430, 932], ["m390", 390, 844]];
const S4 = process.argv.includes("--s4piens");
const ROUTES = S4
  ? [["s4-home", "/human-systems"], ["s4-food", "/human-systems/system/food?c=NO"], ["s4-energy", "/human-systems/system/energy-and-industry?step=processing&c=NO"], ["s4-food-end", "/human-systems/system/food?step=end"]]
  : [["home", "/4nation"], ["norway", "/4nation/country/norway"], ["kenya", "/4nation/country/kenya"], ["japan-atlas", "/4nation/country/japan?mode=atlas&l=unesco-world-heritage"]];
const THEMES = ["light", "dark", "paper"];

const browser = await (engine === "webkit" ? webkit : chromium).launch({ executablePath: exe });
const report = [];
for (const [vp, w, h] of VIEWPORTS) {
  for (const theme of THEMES) {
    if (theme !== "light" && vp !== "desktop" && vp !== "m390") continue;
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: vp.startsWith("m") ? 2 : 1 });
    await ctx.addInitScript((t) => { try { localStorage.setItem("4nation.theme", t); localStorage.setItem("s4piens.theme", t); } catch {} }, theme);
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await quiet(page);
    if (useFixture) await fixture(page);
    for (const [name, path] of ROUTES) {
      if (theme !== "light" && (name === "kenya" || name === "s4-food-end")) continue;
      await page.goto(base + path, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(2600);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      const file = `${out}/${engine}-${vp}-${theme}-${name}.png`;
      await page.screenshot({ path: file, fullPage: name !== "japan-atlas" && vp !== "desktop" ? false : name !== "japan-atlas" });
      report.push({ engine, vp, theme, name, overflow, errors: errors.splice(0).join(" | ") });
    }
    await ctx.close();
  }
}
await browser.close();
console.table(report);
