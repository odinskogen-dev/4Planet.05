import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const migrationPath = new URL("../supabase/migrations/20260920200000_four_sapien_core_finance_connections_portfolio.sql", import.meta.url);
const sql = fs.readFileSync(migrationPath, "utf8");

const publicTables = [
  "four_sapien_finance_connections",
  "four_sapien_finance_sync_runs",
  "four_sapien_finance_holdings",
  "four_sapien_finance_quotes",
];

test("all browser-readable finance tables enable RLS", () => {
  for (const table of publicTables) {
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`, "i"));
  }
});

test("anonymous access is revoked and never granted", () => {
  for (const table of publicTables) {
    assert.match(sql, new RegExp(`revoke all on table public\\.${table} from public, anon, authenticated`, "i"));
  }
  assert.doesNotMatch(sql, /grant\s+[^;]+\s+to\s+anon\b/i);
});

test("owner policies use initplan-safe auth uid checks", () => {
  assert.match(sql, /using \(\(select auth\.uid\(\)\) = user_id\)/i);
  assert.match(sql, /with check \(\(select auth\.uid\(\)\) = user_id and source = 'manual'\)/i);
  assert.doesNotMatch(sql, /using \(auth\.uid\(\) = user_id\)/i);
});

test("provider references are kept in a server-only schema", () => {
  assert.match(sql, /create table if not exists four_sapien_private\.finance_connection_refs/i);
  assert.match(sql, /revoke all on schema four_sapien_private from public, anon, authenticated/i);
  assert.match(sql, /grant all on table four_sapien_private\.finance_connection_refs to service_role/i);
  const publicConnectionSection = sql.split("create table if not exists public.four_sapien_finance_connections")[1]
    .split("create table if not exists public.four_sapien_finance_sync_runs")[0];
  assert.doesNotMatch(publicConnectionSection, /requisition|account_refs|client_secret|access_token/i);
});

test("portfolio view invokes underlying owner RLS and never adds FX", () => {
  assert.match(sql, /with \(security_invoker = true\)/i);
  assert.match(sql, /candidate\.currency = holding\.currency/i);
  assert.doesNotMatch(sql, /fx_rate|currency_conversion/i);
});

test("bank target is capped at four per day", () => {
  assert.match(sql, /target_syncs_per_day between 1 and 4/i);
});
