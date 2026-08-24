import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const urls = {
  catalog: new URL("../functions/api/stripe/catalog.ts", import.meta.url),
  checkout: new URL("../functions/api/stripe/checkout.ts", import.meta.url),
  offer: new URL("../functions/api/stripe/offer.ts", import.meta.url),
  status: new URL("../functions/api/stripe/checkout-status.ts", import.meta.url),
  webhook: new URL("../functions/api/stripe/webhook.ts", import.meta.url),
  invoice: new URL("../functions/api/stripe/invoice.ts", import.meta.url),
  client: new URL("../src/payments/stripe.ts", import.meta.url),
  receipt: new URL("../src/pages/integrated/CheckoutReturn.tsx", import.meta.url),
  review: new URL("../src/pages/integrated/CheckoutReview.tsx", import.meta.url),
  support: new URL("../src/pages/v5/Support.tsx", import.meta.url),
  sponsor: new URL("../src/pages/v5/Sponsor.tsx", import.meta.url),
  legalData: new URL("../src/legal/legal.ts", import.meta.url),
  legal: new URL("../src/pages/v5/Legal.tsx", import.meta.url),
  privacy: new URL("../src/pages/v5/Privacy.tsx", import.meta.url),
  lab: new URL("../src/pages/integrated/CommerceStripeLab.tsx", import.meta.url),
  router: new URL("../src/routes/router.tsx", import.meta.url),
  migration: new URL("../supabase/migrations/20260824160000_stripe_commerce_core.sql", import.meta.url),
};
const source = Object.fromEntries(Object.entries(urls).map(([name, url]) => [name, readFileSync(url, "utf8")]));
const missionKeys = ["mission_supporter_cle4n","mission_supporter_wh4les","mission_supporter_cor4l","mission_supporter_rewild_marine","mission_supporter_clim4te","mission_supporter_am4zonia","mission_supporter_species","mission_supporter_rewild_land","mission_supporter_food","mission_supporter_en4rgy","mission_supporter_circular_city","mission_supporter_f4shion","mission_supporter_m4gazine","mission_supporter_4rt","mission_supporter_4film","mission_supporter_4play"];

for (const [name, url] of Object.entries(urls)) {
  if (name === "migration") continue;
  test(`${name} TypeScript is syntactically valid`, () => {
    const isTsx = url.pathname.endsWith(".tsx");
    const result = ts.transpileModule(readFileSync(url, "utf8"), { reportDiagnostics: true, compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext, strict: true, ...(isTsx ? { jsx: ts.JsxEmit.ReactJSX } : {}) }, fileName: isTsx ? `${name}.tsx` : `${name}.ts` });
    const errors = (result.diagnostics ?? []).filter((d) => d.category === ts.DiagnosticCategory.Error);
    assert.equal(errors.length, 0, errors.map((d) => ts.flattenDiagnosticMessageText(d.messageText, " ")).join(" | "));
  });
}

test("all self-service public payment families have explicit LIVE Stripe prices", () => {
  assert.match(source.catalog, /support_4planet: checkout\("support_4planet", "SUPPORT", "SUPPORT", "subscription"/);
  assert.match(source.catalog, /membership_supporter: checkout\("membership_supporter", "MEMBERSHIP", "MEMBERSHIP", "subscription"/);
  assert.match(source.catalog, /price_1U84WtPd4O2xtXFRU60ePdoZ/);
  assert.match(source.catalog, /price_1U85CxPd4O2xtXFR8VpbdqHk/);
  for (const key of missionKeys) assert.match(source.catalog, new RegExp(`${key}: checkout`));
  for (const price of ["price_1U84X1Pd4O2xtXFRU92oXY75","price_1U84X9Pd4O2xtXFRJB13EXTC","price_1U84XHPd4O2xtXFRKHhsezW7","price_1U84XOPd4O2xtXFRi5nptElC","price_1U84XXPd4O2xtXFRTNXyT1GR","price_1U84XhPd4O2xtXFRgXgQsHMp","price_1U84XpPd4O2xtXFRRJqxLPQk","price_1U84XxPd4O2xtXFRU4Sp5Ucz","price_1U84Y5Pd4O2xtXFRAgEC3H96","price_1U84YEPd4O2xtXFRPZuyCJLy","price_1U84YMPd4O2xtXFReb5j9CSk","price_1U84YUPd4O2xtXFRta3M36cH","price_1U84YcPd4O2xtXFRcSbPY6E0","price_1U84YjPd4O2xtXFRVADbljiW","price_1U84YtPd4O2xtXFRvKXXfeFy","price_1U84Z1Pd4O2xtXFRehIgZzg8"]) assert.match(source.catalog, new RegExp(price));
  assert.match(source.support, /NOK 50 \/ MONTH/);
  assert.match(source.support, /SUPPORTING MEMBER/);
});

test("free participation remains separate from optional paid Supporting Membership", () => {
  assert.match(source.support, /JOIN FREE/);
  assert.match(source.support, /Basic participation stays free/);
  assert.match(source.legalData, /Basic ME4PLANET \/ 4PEOPLE participation remains free/);
  assert.match(source.router, /path="\/people" element={<People \/>}/);
});

test("all four IMPACT paths are public contribution products without ecological delivery authority", () => {
  assert.match(source.catalog, /IMPACT_CONTRIBUTION/);
  assert.match(source.catalog, /impact_tree:[^\n]+price_1U85DSPd4O2xtXFRP0mtFTRw/);
  assert.match(source.catalog, /impact_plastic:[^\n]+price_1U85DbPd4O2xtXFRgkhyKfXe/);
  assert.match(source.catalog, /impact_coral:[^\n]+price_1U85DlPd4O2xtXFRgsxxhMcy/);
  assert.match(source.catalog, /impact_rewild:[^\n]+price_1U85DvPd4O2xtXFRcqBEq2EH/);
  assert.match(source.checkout, /contribution to the named 4PLANET IMPACT pathway/);
  assert.match(source.checkout, /Partner allocation, delivery, evidence and ecological outcome are separate states/);
  assert.match(source.support, /IMPACT CONTRIBUTIONS/);
  assert.match(source.support, /NOK 100 \/ CONTRIBUTION/);
  assert.match(source.legalData, /Until a partner-backed unit contract is active/);
  assert.match(source.status, /DELIVERY_NOT_ESTABLISHED/);
});

test("all negotiated high-value families are public invoice paths and never anonymous high-value checkout", () => {
  assert.match(source.catalog, /project_sponsor: negotiated[^\n]+50_000, 250_000/);
  assert.match(source.catalog, /mission_sponsor: negotiated[^\n]+250_000, 750_000/);
  assert.match(source.catalog, /founding_patron: negotiated[^\n]+250_000, 1_500_000/);
  assert.match(source.catalog, /sponsor_package: negotiated[^\n]+100_000, 500_000/);
  assert.match(source.catalog, /b2b_pilot_funder: negotiated[^\n]+100_000, 300_000/);
  for (const key of ["project_sponsor","mission_sponsor","founding_patron","sponsor_package","b2b_pilot_funder"]) assert.match(source.invoice, new RegExp(`"${key}"`));
  assert.match(source.sponsor, /SPONSOR PACKAGE/);
  assert.match(source.sponsor, /PILOT \/ FUNDER/);
  assert.match(source.sponsor, /This selector does not charge you/);
  assert.match(source.invoice, /approved_agreement_key_required/);
  assert.match(source.invoice, /amount_outside_approved_corridor/);
  assert.match(source.invoice, /invoiceForm\.set\("auto_advance", "false"\)/);
  assert.match(source.invoice, /itemForm\.set\("invoice", invoiceId\)/);
  assert.match(source.invoice, /stripe_invoice_item_create_failed_draft_rolled_back/);
});

test("LIVE checkout is fail-closed, server-priced and production-origin-only", () => {
  assert.match(source.checkout, /environment === "LIVE"/);
  assert.match(source.checkout, /url\.hostname === "4planet\.org" \|\| url\.hostname === "www\.4planet\.org"/);
  assert.match(source.checkout, /product_not_released_live/);
  assert.match(source.checkout, /resolvePriceId/);
  assert.doesNotMatch(source.checkout, /unit_amount/);
  assert.match(source.checkout, /Idempotency-Key/);
  assert.match(source.checkout, /tax_deductible_claim/);
  assert.match(source.checkout, /payments-public-live-02/);
});

test("consumer sees verified price, cadence, seller and payment obligation before Stripe", () => {
  assert.match(source.offer, /prices\/\$\{encodeURIComponent\(priceId\)\}/);
  assert.match(source.review, /SELLER/);
  assert.match(source.review, /Recurring/);
  assert.match(source.review, /ORDER WITH OBLIGATION TO PAY/);
  assert.match(source.router, /path="\/checkout\/review\/:productKey"/);
});

test("webhook is signed, idempotent, out-of-order safe and LIVE fail-closed", () => {
  assert.match(source.webhook, /Stripe-Signature/);
  assert.match(source.webhook, /resolution=ignore-duplicates/);
  assert.match(source.webhook, /apply_commerce_financial_record_event/);
  assert.match(source.webhook, /checkout\.session\.expired/);
  assert.match(source.webhook, /invoice\.voided/);
  assert.match(source.webhook, /charge\.dispute\.created/);
  assert.match(source.webhook, /ledger_unavailable/);
  assert.match(source.migration, /provider_event_created_at/);
  assert.match(source.migration, /on conflict \(stripe_object_id\) do update/);
  assert.match(source.migration, /excluded\.provider_event_created_at >= commerce_financial_records\.provider_event_created_at/);
  assert.match(source.migration, /ecological_delivery_authority text not null default 'none'/);
});

test("privacy legal and truth boundaries are explicit", () => {
  assert.match(source.privacy, /Stripe/);
  assert.match(source.privacy, /Supabase/);
  assert.match(source.privacy, /Marketing is separate/);
  assert.match(source.legal, /not presented as tax-deductible/);
  assert.match(source.legal, /payment may never be used as proof/);
  assert.match(source.receipt, /The browser redirect is never treated as proof of payment/);
});

test("public routes expose support sponsor and legal journeys", () => {
  assert.match(source.router, /path="\/join" element={<Support \/>}/);
  assert.match(source.router, /path="\/support" element={<Support \/>}/);
  assert.match(source.router, /path="\/sponsor" element={<Sponsor \/>}/);
  assert.match(source.router, /path="\/legal\/terms"/);
  assert.match(source.router, /path="\/legal\/payments"/);
  assert.match(source.router, /path="\/legal\/withdrawal"/);
});
