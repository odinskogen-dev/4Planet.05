import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const urls = {
  me: new URL("../src/pages/me/Me4Planet.tsx", import.meta.url),
  review: new URL("../src/pages/integrated/CheckoutReview.tsx", import.meta.url),
  legal: new URL("../src/pages/v5/Legal.tsx", import.meta.url),
  privacy: new URL("../src/pages/v5/Privacy.tsx", import.meta.url),
  analytics: new URL("../src/analytics/Analytics.tsx", import.meta.url),
  authShared: new URL("../functions/api/_shared/supabase.ts", import.meta.url),
  otp: new URL("../functions/api/auth/request-otp.ts", import.meta.url),
  verify: new URL("../functions/api/auth/verify-otp.ts", import.meta.url),
  session: new URL("../functions/api/auth/session.ts", import.meta.url),
  overview: new URL("../functions/api/me/overview.ts", import.meta.url),
  export: new URL("../functions/api/me/export.ts", import.meta.url),
  privacyRequest: new URL("../functions/api/me/privacy-request.ts", import.meta.url),
  portal: new URL("../functions/api/stripe/portal.ts", import.meta.url),
  checkout: new URL("../functions/api/stripe/checkout.ts", import.meta.url),
  webhook: new URL("../functions/api/stripe/webhook.ts", import.meta.url),
  invoice: new URL("../functions/api/stripe/invoice.ts", import.meta.url),
  meMigration: new URL("../supabase/migrations/20260824183000_me4planet_core.sql", import.meta.url),
  orderingMigration: new URL("../supabase/migrations/20260824184000_commerce_ordering_guard.sql", import.meta.url),
  headers: new URL("../public/_headers", import.meta.url),
  router: new URL("../src/routes/router.tsx", import.meta.url),
};
const source = Object.fromEntries(Object.entries(urls).map(([name, url]) => [name, readFileSync(url, "utf8")]));

for (const [name, url] of Object.entries(urls)) {
  if (url.pathname.endsWith(".sql") || url.pathname.endsWith("_headers")) continue;
  test(`${name} parses as TypeScript/TSX`, () => {
    const text = source[name];
    const isTsx = url.pathname.endsWith(".tsx");
    const result = ts.transpileModule(text, {
      reportDiagnostics: true,
      compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext, strict: true, jsx: isTsx ? ts.JsxEmit.ReactJSX : undefined },
      fileName: isTsx ? `${name}.tsx` : `${name}.ts`,
    });
    const errors = (result.diagnostics ?? []).filter((d) => d.category === ts.DiagnosticCategory.Error);
    assert.equal(errors.length, 0, errors.map((d) => ts.flattenDiagnosticMessageText(d.messageText, " ")).join(" | "));
  });
}

test("ME4PLANET uses passwordless OTP and HttpOnly server session cookies", () => {
  assert.match(source.me, /SEND ENGANGSKODE/);
  assert.match(source.otp, /auth\/v1\/otp/);
  assert.match(source.verify, /auth\/v1\/verify/);
  assert.match(source.authShared, /HttpOnly; Secure; SameSite=Lax/);
  assert.doesNotMatch(source.me, /access_token/);
  assert.doesNotMatch(source.me, /refresh_token/);
});

test("membership role is explicit data while marketing consent defaults false and stays separate", () => {
  for (const role of ["4PEOPLE_MEMBER", "FOUNDING_MEMBER", "MISSION_BACKER", "4AMBASSADOR"]) {
    assert.match(source.meMigration, new RegExp(role));
    assert.match(source.me, new RegExp(role));
  }
  assert.match(source.meMigration, /marketing_consent boolean not null default false/);
  assert.match(source.overview, /consent_type: "MARKETING"/);
  assert.match(source.me, /frivillig og kan trekkes tilbake/);
});

test("RLS defaults user-linked data to own rows and provider-owned state remains read-only", () => {
  assert.match(source.meMigration, /enable row level security/g);
  assert.match(source.meMigration, /user_id = auth\.uid\(\)/);
  assert.match(source.meMigration, /revoke all on public\.stripe_customer_links/);
  assert.match(source.meMigration, /revoke all on public\.commerce_financial_records/);
  assert.match(source.meMigration, /grant select on public\.commerce_financial_records to authenticated/);
  assert.doesNotMatch(source.overview, /stripe_customer_id\s*:/);
});

test("Stripe Customer ownership is server-derived, not client asserted", () => {
  assert.match(source.checkout, /requestSession/);
  assert.match(source.checkout, /verifiedUserId/);
  assert.match(source.checkout, /4planet_user_id/);
  assert.match(source.portal, /requestSession/);
  assert.match(source.portal, /stripe_customer_links/);
  assert.doesNotMatch(source.portal, /body\.stripeCustomerId/);
});

test("consumer review shows server-verified price, seller, recurring state and payment obligation before Stripe", () => {
  assert.match(source.review, /api\/stripe\/offer/);
  assert.match(source.review, /TOTAL PRICE/);
  assert.match(source.review, /Gjentakende betaling/);
  assert.match(source.review, /SKOG COMMUNICATIONS AS|OPERATOR\.legalName/);
  assert.match(source.review, /BESTILL MED BETALINGSPLIKT/);
  assert.match(source.review, /betaling er startpunktet|IMPACT TRUTH CHAIN/i);
  assert.match(source.router, /checkout\/review\/:productKey/);
});

test("payment truth cannot jump directly to ecological outcome", () => {
  assert.match(source.webhook, /DELIVERY_PENDING/);
  assert.match(source.webhook, /EVIDENCE_PENDING/);
  assert.match(source.webhook, /OUTCOME_NOT_ESTABLISHED/);
  assert.match(source.meMigration, /OUTCOME_ESTABLISHED/);
  assert.match(source.me, /Betaling er startpunktet, ikke konklusjonen/);
});

test("delayed Stripe events cannot overwrite newer projection in LIVE", () => {
  assert.match(source.orderingMigration, /provider_event_created_at/);
  assert.match(source.orderingMigration, /excluded\.provider_event_created_at >= commerce_financial_records\.provider_event_created_at/);
  assert.match(source.webhook, /rpc\/apply_commerce_financial_record/);
  assert.match(source.webhook, /LIVE never falls back to an unguarded projection/);
});

test("B2B invoice is exact-draft first and rolls back if its line fails", () => {
  const invoiceCreate = source.invoice.indexOf('"invoices"');
  const itemCreate = source.invoice.indexOf('"invoiceitems"');
  assert.ok(invoiceCreate >= 0 && itemCreate > invoiceCreate, "invoice must be created before invoice item");
  assert.match(source.invoice, /itemForm\.set\("invoice", invoiceId\)/);
  assert.match(source.invoice, /deleteDraftInvoice/);
  assert.match(source.invoice, /draftRolledBack: true/);
});

test("privacy rights have product surfaces and self-service data endpoints", () => {
  assert.match(source.privacy, /Behandlingsansvarlig/);
  assert.match(source.privacy, /Formål og behandlingsgrunnlag/);
  assert.match(source.privacy, /Dine rettigheter/);
  assert.match(source.export, /4PLANET_ME_EXPORT_V1/);
  assert.match(source.privacyRequest, /DELETION/);
  assert.match(source.privacyRequest, /PORTABILITY/);
  assert.match(source.router, /legal\/terms/);
  assert.match(source.router, /legal\/payments/);
});

test("analytics requires affirmative consent and reject/accept use the same button style", () => {
  assert.match(source.analytics, /consent !== "granted"/);
  assert.match(source.analytics, /style={choiceStyle}>DECLINE/);
  assert.match(source.analytics, /style={choiceStyle}>ALLOW/);
  assert.match(source.analytics, /allow_ad_personalization_signals: false/);
});

test("sensitive surfaces have transport/security/cache controls", () => {
  assert.match(source.headers, /Strict-Transport-Security/);
  assert.match(source.headers, /Content-Security-Policy/);
  assert.match(source.headers, /object-src 'none'/);
  assert.match(source.headers, /\/api\/\*/);
  assert.match(source.headers, /\/me\*/);
  assert.match(source.headers, /Cache-Control: no-store/);
});
