import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("Business Gold keeps commerce separate from BRAIN and creator-private finance", () => {
  const sql = read("supabase/migrations/20260821120000_market_business_gold.sql");
  assert.match(sql, /create schema if not exists market/i);
  assert.match(sql, /Separate from 4PLANET BRAIN and creator-private finance/i);
  assert.doesNotMatch(sql, /create table[^;]*(brain|runway|personal_bank|creator_cash_balance)/i);
});

test("commerce migration materialises the minimum complete real-sale objects", () => {
  const sql = read("supabase/migrations/20260821120000_market_business_gold.sql");
  for (const table of [
    "creators",
    "creator_agreements",
    "works",
    "rights_grants",
    "products",
    "product_variants",
    "customers",
    "orders",
    "order_items",
    "payments",
    "refunds",
    "fulfilments",
    "creator_payables",
    "impact_liabilities",
    "impact_events",
    "evidence",
    "order_state_events",
    "webhook_events",
    "consents",
    "email_events",
    "audit_log",
  ]) {
    assert.match(sql, new RegExp(`create table if not exists market\\.${table}`, "i"));
  }
});

test("customer and financial tables are RLS protected and no anonymous policy is created", () => {
  const sql = read("supabase/migrations/20260821120000_market_business_gold.sql");
  for (const table of ["customers", "orders", "payments", "refunds", "fulfilments", "creator_payables", "impact_liabilities", "webhook_events", "audit_log"]) {
    assert.match(sql, new RegExp(`alter table market\\.${table} enable row level security`, "i"));
  }
  assert.doesNotMatch(sql, /to\s+anon\b/i);
  assert.match(sql, /Store hashes and minimal refs, not raw provider payloads/i);
});

test("live commerce preserves payment, POD, creator and Impact as separate states", () => {
  const code = read("src/market/liveCommerce.ts");
  for (const state of [
    "PAYMENT_PENDING",
    "PAYMENT_CAPTURED",
    "FULFILMENT_REVIEW",
    "POD_ORDER_SUBMITTED",
    "PRODUCTION_ACCEPTED",
    "SHIPPED",
    "DELIVERED",
    "CREATOR_PAYABLE_CREATED",
    "CREATOR_PAID",
    "IMPACT_LIABILITY_CREATED",
    "IMPACT_FUNDED",
    "IMPACT_EVIDENCE_LINKED",
    "REFUND_PENDING",
    "REFUNDED",
    "TRANSACTION_RECONCILED",
  ]) {
    assert.match(code, new RegExp(`"${state}"`));
  }
});

test("first live orders are Norway/NOK and human-release while Impact defaults off", () => {
  const code = read("src/market/liveCommerce.ts");
  assert.match(code, /market: "NO" as const/);
  assert.match(code, /currency: "NOK" as const/);
  assert.match(code, /podReleaseMode: "HUMAN_REVIEW" as const/);
  assert.match(code, /automaticPodReleaseAfterSuccessfulOrders: 3/);
  assert.match(code, /impactEnabled: false/);
});

test("provider contracts require idempotency and keep Impact provider replaceable", () => {
  const code = read("src/market/liveCommerce.ts");
  for (const interfaceName of ["PaymentProvider", "PodProvider", "ImpactProvider"]) {
    assert.match(code, new RegExp(`export interface ${interfaceName}`));
  }
  assert.match(code, /makeProviderIdempotencyKey/);
  assert.match(code, /idempotencyKey/);
  assert.doesNotMatch(code, /GoodAPI|Prodigi|Gelato|WhiteWall/);
});

test("waterfall contract is fail-closed and must reconcile exactly", () => {
  const code = read("src/market/liveCommerce.ts");
  assert.match(code, /validateWaterfall/);
  assert.match(code, /Business Gold launch supports NOK only/);
  assert.match(code, /Waterfall values cannot be negative/);
  assert.match(code, /allocated !== waterfall\.gross\.amountMinor/);
});
