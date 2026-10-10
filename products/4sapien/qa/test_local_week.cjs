const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const sourcePath = path.join(__dirname, "..", "source", "4sapien-local-week.js");
const context = { module: { exports: {} }, Intl, Date };
context.globalThis = context;
vm.runInNewContext(fs.readFileSync(sourcePath, "utf8"), context, { filename: sourcePath });
const { resolvedTimeZone, startISO } = context.module.exports;

const oslo = "Europe/Oslo";

assert.equal(startISO("2026-10-11T22:30:00.000Z", oslo), "2026-10-12", "Oslo summer-time Monday must select the new local week");
assert.equal(startISO("2026-11-01T23:30:00.000Z", oslo), "2026-11-02", "Oslo winter-time Monday must select the new local week");
assert.equal(startISO("2026-10-11T21:59:00.000Z", oslo), "2026-10-05", "Oslo Sunday 23:59 must remain in the ending local week");
assert.equal(startISO("2026-10-12T10:00:00.000Z", oslo), "2026-10-12", "Monday daytime must keep the same local week key");
assert.equal(resolvedTimeZone("Not/A_TimeZone"), "UTC", "invalid time zones must fail closed to UTC");
assert.equal(startISO("2026-10-11T22:30:00.000Z", "Not/A_TimeZone"), "2026-10-05", "UTC fallback must be deterministic");
assert.throws(() => startISO("not-a-date", oslo), /INVALID_WEEK_INSTANT/);

const site = process.argv[2];
if (site) {
  const food = fs.readFileSync(path.join(site, "app", "food", "index.html"), "utf8");
  const asset = fs.readFileSync(path.join(site, "4sapien-local-week.js"), "utf8");
  assert.match(food, /<script src="\/4sapien-local-week\.js"><\/script>/);
  assert.match(food, /function weekStartISO\(\)\{return window\.FourSapienLocalWeek\.startISO\(new Date\(\)\);\}/);
  assert.match(food, /\.eq\("week_start",currentWeek\)/);
  assert.match(food, /week_start:currentWeek/);
  assert.match(food, /\},\[user\?\.id,currentWeek\]\);/);
  assert.match(asset, /LOCAL_DATE_UNAVAILABLE/);
}

console.log("PASS 4SAPIEN local weekly meal plan: Oslo DST boundaries + deterministic UTC fallback + materialized read/write binding");
