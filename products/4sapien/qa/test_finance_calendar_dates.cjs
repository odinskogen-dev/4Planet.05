const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const sourcePath = process.argv[2] || path.join(__dirname, "..", "source", "4sapien-live-hardening.js");
const source = fs.readFileSync(sourcePath, "utf8").replace(
  /\n\}\)\(\);\s*$/,
  "\nwindow.__financeCalendarTest={nextOcc,occurrencesInWindow,addLocalCalendarDays};\n})();\n",
);
const context = {
  console,
  Date,
  location: { pathname: "/app/money/" },
  localStorage: { length: 0, key: () => null, getItem: () => null },
  sessionStorage: { getItem: () => null, setItem: () => {} },
  document: {
    readyState: "loading",
    body: { classList: { contains: () => false }, appendChild: () => {} },
    addEventListener: () => {},
    getElementById: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ classList: { add: () => {} }, appendChild: () => {} }),
  },
};
context.window = context;
vm.createContext(context);
vm.runInContext(source, context, { filename: sourcePath });

const { nextOcc, occurrencesInWindow, addLocalCalendarDays } = context.__financeCalendarTest;
const event = (recurring, occurred_on) => ({ recurring, occurred_on });
const key = (date) => date && [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");

for (const hour of [10, 13]) {
  const now = new Date(2026, 9, 16, hour);
  assert.equal(key(nextOcc(event("once", "2026-10-16"), now)), "2026-10-16", `one-off due today survives ${hour}:00`);
  assert.equal(key(nextOcc(event("monthly", "2024-01-16"), now)), "2026-10-16", `monthly due today survives ${hour}:00`);
  assert.equal(key(nextOcc(event("yearly", "2024-10-16"), now)), "2026-10-16", `yearly due today survives ${hour}:00`);
}

assert.equal(nextOcc(event("once", "2026-10-15"), new Date(2026, 9, 16, 10)), null, "past one-off is excluded");
assert.equal(key(nextOcc(event("once", "2026-10-17"), new Date(2026, 9, 16, 13))), "2026-10-17", "future one-off remains scheduled");
assert.equal(key(nextOcc(event("monthly", "2024-01-31"), new Date(2026, 3, 30, 13))), "2026-04-30", "month-end recurrence clamps to the current month");
assert.equal(key(nextOcc(event("monthly", "2024-01-31"), new Date(2026, 3, 30, 23, 59))), "2026-04-30", "month-end recurrence survives the full due day");
assert.equal(key(nextOcc(event("yearly", "2024-02-29"), new Date(2026, 1, 28, 13))), "2026-02-28", "leap-day recurrence clamps in a non-leap year");
assert.equal(key(nextOcc(event("yearly", "2024-02-29"), new Date(2028, 1, 28, 13))), "2028-02-29", "leap-day recurrence preserves Feb 29 in a leap year");
assert.equal(key(nextOcc(event("monthly", "2026-12-20"), new Date(2026, 9, 16, 13))), "2026-12-20", "recurrence never predates its anchor");
assert.equal(key(addLocalCalendarDays(new Date(2026, 2, 8, 13), 30)), "2026-04-07", "30-day window advances by local calendar dates across DST-prone months");

const start = new Date(2026, 9, 16, 13);
const end = addLocalCalendarDays(start, 30);
assert.ok(nextOcc(event("once", "2026-11-15"), start) <= end, "calendar day 30 is included");
assert.ok(nextOcc(event("once", "2026-11-16"), start) > end, "calendar day 31 is excluded");
assert.equal(nextOcc(event("once", "not-a-date"), start), null, "invalid calendar dates fail closed");

const febWindowStart = new Date(2027, 1, 28, 13);
const febWindowEnd = addLocalCalendarDays(febWindowStart, 30);
const monthlyBill = { ...event("monthly", "2024-01-28"), id: "owner-row-1", user_id: "owner-a", type: "bill", amount: 100 };
const monthlyBillOccurrences = [...occurrencesInWindow(monthlyBill, febWindowStart, febWindowEnd)];
assert.deepEqual(
  monthlyBillOccurrences.map(key),
  ["2027-02-28", "2027-03-28"],
  "monthly recurrence counts every due occurrence in an inclusive 30-day window",
);
assert.equal(monthlyBillOccurrences.reduce((sum) => sum + Math.abs(monthlyBill.amount), 0), 200, "NOK 100 recurring twice contributes NOK 200");
assert.deepEqual(monthlyBill, { recurring: "monthly", occurred_on: "2024-01-28", id: "owner-row-1", user_id: "owner-a", type: "bill", amount: 100 }, "enumeration never rewrites owner or source truth");
assert.deepEqual(
  [...occurrencesInWindow(event("monthly", "2024-01-31"), new Date(2026, 1, 28, 13), new Date(2026, 2, 31, 13))].map(key),
  ["2026-02-28", "2026-03-31"],
  "month-end recurrence preserves its anchor while enumerating",
);
assert.deepEqual(
  [...occurrencesInWindow(event("yearly", "2024-02-29"), new Date(2027, 1, 28, 13), new Date(2028, 1, 29, 13))].map(key),
  ["2027-02-28", "2028-02-29"],
  "yearly recurrence enumerates clamped and leap-day occurrences",
);
assert.deepEqual(
  [...occurrencesInWindow(event("once", "2026-11-15"), start, end)].map(key),
  ["2026-11-15"],
  "one-off appears exactly once inside the window",
);
assert.deepEqual([...occurrencesInWindow(event("once", "2026-11-16"), start, end)], [], "one-off outside the window is excluded");
assert.deepEqual([...occurrencesInWindow(event("monthly", "not-a-date"), start, end)], [], "invalid recurrence fails closed");
assert.deepEqual([...occurrencesInWindow(event("monthly", "2024-01-28"), end, start)], [], "invalid reversed window fails closed");

console.log("PASS 4SAPIEN finance calendar: due-today, complete recurrence, leap/month-end, 30-day window");
