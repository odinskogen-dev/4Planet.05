import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');

const routes = read('src/routes/router.tsx');
const app = read('src/App.tsx');
const join = read('src/pages/v5/Join.tsx');
const privacy = read('src/pages/v5/Privacy.tsx');
const trust = read('src/pages/v5/TrustPolicy.tsx');
const gateway = read('functions/api/leads.ts');
const migration = read('supabase/migrations/20260810030000_company_digital_trust_join.sql');
const rpc = read('supabase/migrations/20260810030500_register_interest_rpc.sql');
const edge = read('supabase/functions/register-interest/index.ts');

const requiredTrustRoutes = [
  '/trust', '/company', '/contact', '/privacy', '/source-policy', '/corrections',
  '/impact-claims', '/editorial-independence', '/media-rights', '/ai-disclosure', '/terms', '/cookies',
];

test('public trust routes are explicit', () => {
  for (const route of requiredTrustRoutes) assert.ok(routes.includes(`path="${route}"`), `missing trust route ${route}`);
});

test('legal operator is visible without implying separate 4Planet entity', () => {
  for (const source of [app, trust, privacy]) {
    assert.match(source, /SKOG COMMUNICATIONS AS/);
    assert.match(source, /923 003 789/);
  }
  assert.match(trust, /not a separate incorporated legal entity/i);
});

test('Join separates required privacy acknowledgement from optional marketing consent', () => {
  assert.match(join, /privacyAcknowledged/);
  assert.match(join, /marketingConsent/);
  assert.match(join, /Optional and separate/i);
  assert.doesNotMatch(join, /name="consent"/);
});

test('gateway has no webhook source of truth and no user-agent capture', () => {
  assert.match(gateway, /JOIN_PERSISTENCE_URL/);
  assert.doesNotMatch(gateway, /LEAD_WEBHOOK_URL/);
  assert.doesNotMatch(gateway, /headers\.get\(["']user-agent["']\)/i);
  assert.doesNotMatch(gateway, /userAgent\s*:/i);
  assert.match(gateway, /stored: false/);
});

test('first-party tables are RLS protected and unavailable to public roles', () => {
  for (const table of ['actors', 'interest_enquiries', 'consent_events']) {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`, 'i'));
  }
  assert.match(migration, /revoke all on public\.actors, public\.interest_enquiries, public\.consent_events from anon, authenticated/i);
  assert.match(rpc, /revoke all on function public\.register_interest_server[\s\S]*from public, anon, authenticated/i);
  assert.match(rpc, /grant execute on function public\.register_interest_server[\s\S]*to service_role/i);
});

test('server path deduplicates actor and rate limits repeated enquiry writes', () => {
  assert.match(rpc, /where a\.email_norm = p_email_norm/);
  assert.match(rpc, /v_recent_count >= 5/);
  assert.match(edge, /rate_limited/);
  assert.doesNotMatch(edge, /headers\.get\(["']user-agent["']\)/i);
  assert.doesNotMatch(edge, /userAgent\s*:/i);
});

test('privacy notice documents minimisation and release gating', () => {
  assert.match(privacy, /2026-08-10-v1/);
  assert.match(privacy, /does not intentionally persist a raw IP address, user-agent string/i);
  assert.match(privacy, /professional legal review before production release/i);
  assert.match(privacy, /exact production project, region, processor configuration/i);
});
