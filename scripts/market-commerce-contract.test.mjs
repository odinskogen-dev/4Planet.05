import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const catalog = read("src/market/firstCreatorCatalogue.ts");
const checkout = read("functions/api/market-checkout.ts");
const webhook = read("functions/api/market-stripe-webhook.ts");
const status = read("functions/api/market-order-status.ts");
const callback = read("functions/api/market-prodigi-callback.ts");
const runtime = read("functions/_lib/marketCommerce.ts");
const ui = read("src/components/market/FirstMarketProducts.tsx");

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const count = (source, pattern) => (source.match(pattern) ?? []).length;

assert(count(catalog, /id: "market:/g) === 11, "Expected exactly 11 real Market products");
assert(count(catalog, /creator: "Odin Oddekalv"/g) === 5, "Expected five Odin products");
assert(count(catalog, /creator: "Amalie Marie Myrtvedt"/g) === 6, "Expected six Amalie products");
assert(catalog.includes('candidatePriceNok: 1290'), "Photo candidate price missing");
assert(catalog.includes('candidatePriceNok: 890'), "Art candidate price missing");
assert(catalog.includes('GLOBAL-FAP-8X12'), "Photo POD SKU candidate missing");
assert(catalog.includes('GLOBAL-FAP-6X8'), "Art POD SKU candidate missing");
assert(catalog.includes('sampleState: "REQUIRED"'), "Physical sample gate missing");
assert(!catalog.includes('state: "FOR SALE"'), "Catalogue must not claim public sale before release");

assert(checkout.includes('shipping_address_collection[allowed_countries][0]'), "Checkout must collect shipping address");
assert(checkout.includes('"NO"'), "Initial shipping boundary must be Norway");
assert(checkout.includes('consent_collection[terms_of_service]'), "Checkout must require terms consent");
assert(checkout.includes('productCanCheckout'), "Checkout must use release gate");
assert(checkout.includes('4market_stripe_prodigi_v1'), "Checkout integration metadata missing");

assert(webhook.includes('verifyStripeSignature'), "Stripe webhook signature verification missing");
assert(webhook.includes('loadAuthoritativeSession'), "Webhook must read Stripe back before fulfilment");
assert(webhook.includes('idempotencyKey: `4market-${sessionId}`'), "Prodigi idempotency missing");
assert(webhook.includes('/v4.0/orders'), "Prodigi order creation missing");
assert(webhook.includes('payment_status !== "paid"'), "Prodigi must not run before payment settles");
assert(webhook.includes('norwegian_shipping_address_missing'), "Shipping address fail-close missing");

assert(callback.includes('Do not trust the callback body as fulfilment truth'), "Prodigi callback must be provider-readback verified");
assert(callback.includes('updateStripeSessionMetadata'), "Tracking must be linked back to Stripe session");
assert(status.includes('/v4.0/orders/'), "Order status must read Prodigi live state");
assert(status.includes('tracking:'), "Order status must expose tracking");

assert(runtime.includes('MARKET_LIVE_RELEASE_APPROVED'), "Founder live release gate missing");
assert(runtime.includes('MARKET_PHOTO_SAMPLE_APPROVED'), "Photo sample approval gate missing");
assert(runtime.includes('MARKET_ART_SAMPLE_APPROVED'), "Art sample approval gate missing");
assert(runtime.includes('MARKET_FULFILMENT_LIVE_ENABLED'), "Live fulfilment switch missing");
assert(runtime.includes('releaseApproved') && runtime.includes('fulfilmentInfrastructureReady'), "Fail-closed runtime incomplete");
assert(!runtime.includes('= "true";'), "Runtime must not hard-code a live switch true");

assert(ui.includes('BUY PRINT'), "Product UI must support checkout when released");
assert(ui.includes('LAUNCH PRICE CANDIDATE'), "Unreleased pricing must remain clearly provisional");
assert(ui.includes('/api/market-order-status'), "Customer order status UI missing");

console.log("PASS — 4MARKET commerce contract is release-gated, payment-first, idempotent and POD/tracking wired.");
