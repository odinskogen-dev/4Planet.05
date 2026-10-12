const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const sourcePath = path.join(__dirname, "..", "source", "4sapien-local-week.js");
const hardeningPath = path.join(__dirname, "..", "source", "4sapien-live-hardening.js");
const guardPath = path.join(__dirname, "..", "build", "apply_live_hardening_guard.py");
const context = { module: { exports: {} }, Intl, Date };
context.globalThis = context;
vm.runInNewContext(fs.readFileSync(sourcePath, "utf8"), context, { filename: sourcePath });
const { resolvedTimeZone, startISO, watch } = context.module.exports;

const oslo = "Europe/Oslo";

assert.equal(startISO("2026-10-11T22:30:00.000Z", oslo), "2026-10-12", "Oslo summer-time Monday must select the new local week");
assert.equal(startISO("2026-11-01T23:30:00.000Z", oslo), "2026-11-02", "Oslo winter-time Monday must select the new local week");
assert.equal(startISO("2026-10-11T21:59:00.000Z", oslo), "2026-10-05", "Oslo Sunday 23:59 must remain in the ending local week");
assert.equal(startISO("2026-10-12T10:00:00.000Z", oslo), "2026-10-12", "Monday daytime must keep the same local week key");
assert.equal(resolvedTimeZone("Not/A_TimeZone"), "UTC", "invalid time zones must fail closed to UTC");
assert.equal(startISO("2026-10-11T22:30:00.000Z", "Not/A_TimeZone"), "2026-10-05", "UTC fallback must be deterministic");
assert.throws(() => startISO("not-a-date", oslo), /INVALID_WEEK_INSTANT/);

let now = new Date("2026-10-11T21:59:00.000Z");
let scheduledCheck;
let cancelled = false;
const rollovers = [];
const watcher = watch((next, previous) => rollovers.push({ next, previous }), {
  now: () => now,
  timeZone: oslo,
  intervalMs: 10,
  setIntervalFn: (fn, delay) => {
    assert.equal(delay, 10);
    scheduledCheck = fn;
    return 17;
  },
  clearIntervalFn: (id) => {
    assert.equal(id, 17);
    cancelled = true;
  },
});
assert.equal(watcher.current(), "2026-10-05");
now = new Date("2026-10-11T22:00:00.000Z");
scheduledCheck();
scheduledCheck();
assert.deepEqual(rollovers, [{ next: "2026-10-12", previous: "2026-10-05" }], "an open tab must emit exactly one new-week transition");
assert.equal(watcher.current(), "2026-10-12");
watcher.stop();
assert.equal(cancelled, true);

const hardening = fs.readFileSync(hardeningPath, "utf8");
const guard = fs.readFileSync(guardPath, "utf8");
assert.match(hardening, /function currentWeekStartISO\(now=new Date\(\)\)/);
assert.match(hardening, /FourSapienLocalWeek\?\.startISO/);
assert.match(hardening, /const wk=currentWeekStartISO\(\)/);
assert.doesNotMatch(hardening, /getUTCFullYear\(\).*getUTCMonth\(\).*getUTCDate\(\)/);
assert.match(guard, /if '\/4sapien-local-week\.js' not in s:/);
assert.match(guard, /label\+' local week asset'/);

const site = process.argv[2];
if (site) {
  const root = fs.readFileSync(path.join(site, "index.html"), "utf8");
  const food = fs.readFileSync(path.join(site, "app", "food", "index.html"), "utf8");
  const asset = fs.readFileSync(path.join(site, "4sapien-local-week.js"), "utf8");
  assert.match(root, /<script src="\/4sapien-local-week\.js"><\/script>/);
  assert.ok(root.indexOf('/4sapien-local-week.js') < root.indexOf('/4sapien-live-hardening.js'));
  assert.match(food, /<script src="\/4sapien-local-week\.js"><\/script>/);
  assert.match(food, /function weekStartISO\(\)\{return window\.FourSapienLocalWeek\.startISO\(new Date\(\)\);\}/);
  assert.match(food, /\.eq\("week_start",currentWeek\)/);
  assert.match(food, /week_start:currentWeek/);
  assert.match(food, /\},\[user\?\.id,currentWeek\]\);/);
  assert.match(food, /FourSapienLocalWeek\.watch/);
  assert.match(food, /setCurrentWeek\(prev=>prev===next\?prev:next\)/);
  assert.match(food, /visibilitychange/);
  assert.match(asset, /LOCAL_DATE_UNAVAILABLE/);
  assert.match(asset, /function watch\(/);
}

console.log("PASS 4SAPIEN local weekly meal plan: Oslo DST boundaries + deterministic open-tab rollover + materialized read/write binding");
