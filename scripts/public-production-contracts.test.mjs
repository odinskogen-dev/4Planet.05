import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const migration = read("supabase/migrations/20260810003400_public_production_core.sql");
const leads = read("functions/api/leads.ts");
const events = read("functions/api/events.ts");
const shared = read("functions/_shared/production.ts");
const join = read("src/pages/v5/Join.tsx");
const privacy = read("src/pages/v5/Privacy.tsx");
const headers = read("public/_headers");

test("public registration tables fail closed under RLS", () => {
  for (const table of ["public_registrations", "public_privacy_requests", "product_events"]) {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`, "i"));
    assert.match(migration, new RegExp(`revoke all on public\\.${table} from anon, authenticated`, "i"));
  }
  assert.doesNotMatch(migration, /create policy[\s\S]+public_registrations/i);
  assert.doesNotMatch(migration, /create policy[\s\S]+public_privacy_requests/i);
  assert.doesNotMatch(migration, /create policy[\s\S]+product_events/i);
  assert.match(migration, /marketing_permission boolean not null default false/i);
  assert.match(migration, /retention_until timestamptz not null default \(now\(\) \+ interval '180 days'\)/i);
});

test("lead intake is durable, idempotent and not a generic webhook", () => {
  assert.match(leads, /PUBLIC_INTAKE_ENABLED/);
  assert.match(leads, /SUPABASE_SECRET_KEY/);
  assert.match(leads, /dedupeKey/);
  assert.match(leads, /idempotencyKey/);
  assert.match(leads, /duplicateSuppressed/);
  assert.match(leads, /marketing_permission: false/);
  assert.match(leads, /consent_scope: "registration_contact_v1"/);
  assert.doesNotMatch(leads, /LEAD_WEBHOOK_URL|LEAD_WEBHOOK_SECRET/);
  assert.doesNotMatch(leads, /userAgent|user-agent/i);
  assert.match(leads, /storage_unavailable|storage_failed|storage_error/);
});

test("client registration sends explicit consent, attribution and idempotency", () => {
  assert.match(join, /Idempotency-Key/);
  assert.match(join, /currentAttribution/);
  assert.match(join, /consent: fd\.get\("consent"\) === "on"/);
  assert.match(join, /does not give separate permission for unrelated marketing/i);
  assert.match(join, /No success state has been recorded/);
});

test("measurement uses one allowlist and rejects PII-shaped payloads", () => {
  for (const name of [
    "landing", "gold_vertical_entry", "atlas_interaction", "species_interaction", "source_open",
    "relationship_reveal", "impact_member_cta", "signup_start", "signup_completion", "contact_enquiry",
    "return_visit", "content_referral", "payment_intent", "checkout", "payment_success", "payment_failure", "payment_refund",
  ]) assert.match(shared, new RegExp(`"${name}"`));
  assert.match(events, /EVENT_NAMES\.includes\(eventName\)/);
  assert.match(events, /PAYMENT_EVENTS\.has\(eventName\)[\s\S]+PAYMENTS_ENABLED/);
  assert.match(shared, /SENSITIVE_KEYS/);
  for (const forbidden of ["useragent", "ipaddress", "fingerprint", "fullreferrer"]) assert.match(shared.toLowerCase(), new RegExp(forbidden));
  assert.doesNotMatch(events, /CF-Connecting-IP|user-agent/i);
});

test("Supabase secret is server-only and sent as apikey, not browser bearer auth", () => {
  assert.match(shared, /apikey: env\.SUPABASE_SECRET_KEY/);
  assert.doesNotMatch(shared, /Authorization.*SUPABASE_SECRET_KEY|Bearer.*SUPABASE_SECRET_KEY/i);
  assert.doesNotMatch(join, /SUPABASE_SECRET|service_role|sb_secret_/i);
});

test("Pages Function responses carry explicit security headers", () => {
  for (const token of ["x-content-type-options", "referrer-policy", "permissions-policy", "x-frame-options", "cross-origin-resource-policy"]) {
    assert.match(shared.toLowerCase(), new RegExp(token));
  }
  assert.match(headers, /Content-Security-Policy:/);
  assert.match(headers, /Permissions-Policy: camera=\(\), microphone=\(\), payment=\(\), usb=\(\)/);
});

test("privacy notice matches hardened application behavior", () => {
  assert.match(privacy, /180 days/);
  assert.match(privacy, /does not create separate permission for unrelated marketing/i);
  assert.match(privacy, /not to store IP addresses, full referrer URLs, browser fingerprints or User-Agent strings/i);
  assert.match(privacy, /identity verification before information is disclosed or deleted/i);
});

test("production rollback is bounded to this migration", () => {
  const rollback = read("supabase/rollback/20260810003400_public_production_core_rollback.sql");
  for (const table of ["product_events", "public_privacy_requests", "public_registrations"]) {
    assert.match(rollback, new RegExp(`drop table if exists public\\.${table}`, "i"));
  }
  assert.doesNotMatch(rollback, /drop schema|drop database|source_records|contributions|brand_/i);
});
