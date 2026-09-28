import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateHoldingMetrics,
  listFinanceCurrencies,
  parseDecimal,
  parseFinanceDeviceState,
  planNextBankSync,
  summariseCurrency,
} from "../src/finance/core.ts";

const account = (overrides = {}) => ({
  id: "account-1",
  name: "Brukskonto",
  kind: "bank",
  balance: "25000",
  currency: "NOK",
  asOf: "2026-09-20",
  source: "manual",
  ...overrides,
});

const holding = (overrides = {}) => ({
  id: "holding-1",
  symbol: "EQNR.OL",
  name: "Equinor",
  quantity: "10",
  averageCost: "100",
  currentPrice: "120",
  currency: "NOK",
  asOf: "2026-09-20T12:00:00.000Z",
  source: "manual",
  ...overrides,
});

test("parses Norwegian decimal input without inventing missing values", () => {
  assert.equal(parseDecimal(" 12,50 "), 12.5);
  assert.equal(parseDecimal(""), null);
  assert.equal(parseDecimal("ikke et tall"), null);
});

test("calculates holding value and unrealised change from explicit inputs", () => {
  assert.deepEqual(calculateHoldingMetrics(holding()), {
    costBasis: 1000,
    marketValue: 1200,
    unrealisedChange: 200,
    unrealisedChangePercent: 20,
  });
});

test("keeps market value unknown when a quote is missing", () => {
  assert.deepEqual(calculateHoldingMetrics(holding({ currentPrice: null, asOf: null })), {
    costBasis: 1000,
    marketValue: null,
    unrealisedChange: null,
    unrealisedChangePercent: null,
  });
});

test("summarises one currency without silently mixing debt or holdings", () => {
  const summary = summariseCurrency(
    [account(), account({ id: "debt-1", kind: "debt", balance: "10000" }), account({ id: "asset-1", kind: "asset", balance: "5000" })],
    [holding()],
    "NOK",
  );
  assert.deepEqual(summary, {
    currency: "NOK",
    liquidity: 25000,
    debt: 10000,
    otherAssets: 5000,
    portfolioCost: 1000,
    portfolioValue: 1200,
    unrealisedChange: 200,
    recordedNetWorth: 21200,
    holdingCount: 1,
    missingQuoteCount: 0,
  });
});

test("fails recorded net worth closed when one holding quote is unknown", () => {
  const summary = summariseCurrency([account()], [holding({ currentPrice: null, asOf: null })], "NOK");
  assert.equal(summary.portfolioValue, null);
  assert.equal(summary.recordedNetWorth, null);
  assert.equal(summary.missingQuoteCount, 1);
});

test("lists currencies separately and always keeps NOK first", () => {
  assert.deepEqual(
    listFinanceCurrencies([account({ currency: "USD" })], [holding({ currency: "EUR" })]),
    ["NOK", "EUR", "USD"],
  );
});

test("requires bank consent before scheduling", () => {
  assert.equal(planNextBankSync({
    now: "2026-09-20T08:00:00.000Z",
    consentExpiresAt: null,
    lastSuccessfulAt: null,
    successfulSyncsToday: 0,
  }).state, "CONSENT_REQUIRED");
});

test("targets four daily refreshes with a six-hour interval", () => {
  const plan = planNextBankSync({
    now: "2026-09-20T10:00:00.000Z",
    consentExpiresAt: "2026-12-19T00:00:00.000Z",
    lastSuccessfulAt: "2026-09-20T08:00:00.000Z",
    successfulSyncsToday: 1,
  });
  assert.equal(plan.state, "SCHEDULED");
  assert.equal(plan.dueAt, "2026-09-20T14:00:00.000Z");
  assert.equal(plan.effectiveTargetPerDay, 4);
});

test("reduces cadence to the provider limit", () => {
  const plan = planNextBankSync({
    now: "2026-09-20T10:00:00.000Z",
    consentExpiresAt: "2026-12-19T00:00:00.000Z",
    lastSuccessfulAt: "2026-09-20T08:00:00.000Z",
    successfulSyncsToday: 1,
    providerDailyLimit: 2,
  });
  assert.equal(plan.effectiveTargetPerDay, 2);
  assert.equal(plan.dueAt, "2026-09-20T20:00:00.000Z");
});

test("respects rate-limit reset instead of retrying", () => {
  const plan = planNextBankSync({
    now: "2026-09-20T10:00:00.000Z",
    consentExpiresAt: "2026-12-19T00:00:00.000Z",
    lastSuccessfulAt: "2026-09-20T08:00:00.000Z",
    successfulSyncsToday: 1,
    providerRemaining: 0,
    providerResetAt: "2026-09-21T00:00:00.000Z",
  });
  assert.equal(plan.state, "RATE_LIMITED");
  assert.equal(plan.dueAt, "2026-09-21T00:00:00.000Z");
});

test("rejects expired consent", () => {
  assert.equal(planNextBankSync({
    now: "2026-09-20T10:00:00.000Z",
    consentExpiresAt: "2026-09-20T09:59:59.000Z",
    lastSuccessfulAt: null,
    successfulSyncsToday: 0,
  }).state, "CONSENT_EXPIRED");
});

test("parses only valid versioned device rows", () => {
  const parsed = parseFinanceDeviceState(JSON.stringify({
    version: 1,
    accounts: [account(), { id: "broken" }],
    holdings: [holding(), { id: "broken" }],
    updatedAt: "2026-09-20T10:00:00.000Z",
  }));
  assert.equal(parsed.accounts.length, 1);
  assert.equal(parsed.holdings.length, 1);
});
