import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const urls = {
  catalog: new URL("../functions/api/stripe/catalog.ts", import.meta.url),
  checkout: new URL("../functions/api/stripe/checkout.ts", import.meta.url),
  status: new URL("../functions/api/stripe/checkout-status.ts", import.meta.url),
  webhook: new URL("../functions/api/stripe/webhook.ts", import.meta.url),
  invoice: new URL("../functions/api/stripe/invoice.ts", import.meta.url),
  client: new URL("../src/payments/stripe.ts", import.meta.url),
  receipt: new URL("../src/pages/integrated/CheckoutReturn.tsx", import.meta.url),
  lab: new URL("../src/pages/integrated/CommerceStripeLab.tsx", import.meta.url),
  router: new URL("../src/routes/router.tsx", import.meta.url),
  migration: new URL("../supabase/migrations/20260824160000_stripe_commerce_core.sql", import.meta.url),
};

const source = Object.fromEntries(Object.entries(urls).map(([name, url]) => [name, readFileSync(url, "utf8")]));

const missionSlugs = [
  "cle4n", "wh4les", "cor4l", "rewild_marine", "clim4te", "am4zonia", "species", "rewild_land",
  "food", "en4rgy", "circular_city", "f4shion", "m4gazine", "4rt", "4film", "4play",
];

const coreProducts = [
  "impact_tree", "impact_plastic", "impact_coral", "impact_rewild",
  "support_4planet", "founding_patron", "membership_supporter",
  "sponsor_package", "project_sponsor", "mission_sponsor", "b2b_pilot_funder",
];

test("Stripe TypeScript and TSX sources are syntactically valid", () => {
  for (const [name, url] of Object.entries(urls)) {
    if (name === "migration") continue;
    const text = readFileSync(url, "utf8");
    const isTsx = url.pathname.endsWith(".tsx");
    const compilerOptions = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      strict: true,
      ...(isTsx ? { jsx: ts.JsxEmit.ReactJSX } : {}),
    };
    const result = ts.transpileModule(text, {
      reportDiagnostics: true,
      compilerOptions,
      fileName: isTsx ? `${name}.tsx` : `${name}.ts`,
    });
    const errors = (result.diagnostics ?? []).filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
    assert.equal(errors.length, 0, `${name}: ${errors.map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")).join(" | ")}`);
  }
});

test("catalog contains all required 4PLANET money streams", () => {
  for (const key of coreProducts) assert.match(source.catalog, new RegExp(`\\b${key}\\b`));
  for (const slug of missionSlugs) assert.match(source.catalog, new RegExp(`mission_supporter_${slug}`));
  assert.match(source.catalog, /IMPACT_UNIT/);
  assert.match(source.catalog, /SUPPORT/);
  assert.match(source.catalog, /FOUNDING_PATRON/);
  assert.match(source.catalog, /MEMBERSHIP/);
  assert.match(source.catalog, /MISSION_SUPPORTER/);
  assert.match(source.catalog, /PROJECT_SPONSOR/);
  assert.match(source.catalog, /MISSION_SPONSOR/);
  assert.match(source.catalog, /B2B_FUNDING_OBJECT/);
});

test("TEST prices are explicit engineering objects and LIVE prices remain environment-owned", () => {
  assert.match(source.catalog, /price_1U7w9lBIIif9wShMBdiJkElA/);
  assert.match(source.catalog, /price_1U7yPWBIIif9wShMgT57NW4Y/);
  assert.match(source.catalog, /price_1U7yPqBIIif9wShMVxTsEJH1/);
  assert.match(source.catalog, /STRIPE_LIVE_PRICE_IMPACT_TREE/);
  assert.match(source.catalog, /STRIPE_LIVE_PRICE_SUPPORT_4PLANET/);
  assert.match(source.catalog, /STRIPE_LIVE_PRICE_MISSION_SUPPORTER_4PLAY/);
  assert.match(source.catalog, /resolvePriceId/);
});

test("Checkout supports TEST now and LIVE only behind explicit release gates", () => {
  assert.match(source.catalog, /STRIPE_PAYMENT_ENV/);
  assert.match(source.catalog, /STRIPE_CHECKOUT_LIVE_ENABLED/);
  assert.match(source.catalog, /STRIPE_LIVE_RELEASE_APPROVED/);
  assert.match(source.catalog, /sk_test_/);
  assert.match(source.catalog, /sk_live_/);
  assert.match(source.catalog, /cs_test_/);
  assert.match(source.catalog, /cs_live_/);
  assert.match(source.checkout, /Idempotency-Key/);
  assert.match(source.checkout, /resolvePriceId/);
  assert.doesNotMatch(source.checkout, /unit_amount/);
});

test("one-time, recurring and invoice flows stay semantically separate", () => {
  assert.match(source.catalog, /"payment"/);
  assert.match(source.catalog, /"subscription"/);
  assert.match(source.catalog, /channel: "invoice"/);
  assert.match(source.checkout, /subscription_data\[metadata\]/);
  assert.match(source.checkout, /payment_intent_data\[metadata\]/);
  assert.match(source.invoice, /collection_method/);
  assert.match(source.invoice, /send_invoice/);
  assert.match(source.invoice, /auto_advance/);
  assert.match(source.invoice, /"false"/);
  assert.match(source.invoice, /STRIPE_INTERNAL_BILLING_TOKEN/);
});

test("support and patron are not represented as tax-deductible donations", () => {
  assert.match(source.catalog, /taxDeductibleClaim: false/);
  assert.match(source.checkout, /tax_deductible_claim/);
  assert.match(source.checkout, /not presented as a tax-deductible donation/);
  assert.doesNotMatch(source.lab, /tax-deductible donation[^\n]*yes/i);
});

test("IMPACT payment remains separate from ecological delivery, evidence and outcome", () => {
  assert.match(source.checkout, /ecological_delivery_authority/);
  assert.match(source.checkout, /Partner delivery, evidence and ecological outcomes are tracked separately/);
  assert.match(source.status, /DELIVERY_NOT_ESTABLISHED/);
  assert.match(source.webhook, /no Stripe event may mutate ecological Delivery, Evidence/);
  assert.match(source.migration, /ecological_delivery_authority/);
  assert.match(source.migration, /check \(ecological_delivery_authority = 'none'\)/);
});

test("webhook is signed, environment-bound, idempotently persisted and LIVE fail-closed", () => {
  assert.match(source.webhook, /Stripe-Signature/);
  assert.match(source.webhook, /HMAC/);
  assert.match(source.webhook, /stripe_event_id/);
  assert.match(source.webhook, /on_conflict/);
  assert.match(source.webhook, /commerce_events/);
  assert.match(source.webhook, /commerce_financial_records/);
  assert.match(source.webhook, /ledger_unavailable/);
  assert.match(source.webhook, /invoice\.payment_failed/);
  assert.match(source.webhook, /charge\.refunded/);
  assert.match(source.webhook, /customer\.subscription\.deleted/);
});

test("financial ledger is server-only and cannot become ecological truth", () => {
  assert.match(source.migration, /enable row level security/);
  assert.match(source.migration, /revoke all on table public\.commerce_events from anon, authenticated/);
  assert.match(source.migration, /revoke all on table public\.commerce_financial_records from anon, authenticated/);
  assert.match(source.migration, /Never ecological delivery\/outcome truth/);
});

test("checkout confirmation is server-verified and truthful receipt UI exists", () => {
  assert.match(source.status, /session\.status === "complete"/);
  assert.match(source.status, /payment_status/);
  assert.match(source.status, /financialState/);
  assert.match(source.receipt, /The browser redirect is never treated as proof of payment/);
  assert.match(source.receipt, /Partner delivery, evidence and ecological outcome remain separate states/);
  assert.match(source.router, /path="\/checkout\/return"/);
  assert.match(source.router, /path="\/checkout\/lab"/);
});

test("TEST lab exposes all public checkout families without exposing B2B invoice auth", () => {
  assert.match(source.lab, /SUPPORT 4PLANET/);
  assert.match(source.lab, /BECOME A FOUNDING PATRON/);
  assert.match(source.lab, /16 MISSION SUPPORTERS/);
  assert.match(source.lab, /Large B2B and negotiated pilot funding does not use a public buy button/);
  assert.doesNotMatch(source.lab, /STRIPE_INTERNAL_BILLING_TOKEN/);
});
