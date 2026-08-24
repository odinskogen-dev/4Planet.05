import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const checkout = readFileSync(new URL("../functions/api/stripe/checkout.ts", import.meta.url), "utf8");
const status = readFileSync(new URL("../functions/api/stripe/checkout-status.ts", import.meta.url), "utf8");
const webhook = readFileSync(new URL("../functions/api/stripe/webhook.ts", import.meta.url), "utf8");
const client = readFileSync(new URL("../src/payments/stripe.ts", import.meta.url), "utf8");

const products = [
  "impact_tree_test",
  "impact_plastic_test",
  "impact_coral_test",
  "impact_rewild_test",
  "membership_supporter_test",
  "sponsor_package_test",
];

test("shared Stripe catalogue exposes exactly the intended TEST families", () => {
  for (const key of products) {
    assert.match(checkout, new RegExp(key));
    assert.match(client, new RegExp(key));
    assert.match(status, new RegExp(key));
  }
  assert.match(checkout, /IMPACT_UNIT/);
  assert.match(checkout, /MEMBERSHIP/);
  assert.match(checkout, /SPONSOR_PACKAGE/);
});

test("checkout is fail-closed to Stripe TEST mode with server-owned pricing", () => {
  assert.match(checkout, /STRIPE_TEST_SECRET_KEY/);
  assert.match(checkout, /startsWith\("sk_test_"\)/);
  assert.doesNotMatch(checkout, /sk_live_/);
  assert.match(checkout, /STRIPE_PRICE_IMPACT_TREE_TEST/);
  assert.match(checkout, /STRIPE_PRICE_MEMBERSHIP_SUPPORTER_TEST/);
  assert.match(checkout, /STRIPE_PRICE_SPONSOR_PACKAGE_TEST/);
  assert.match(checkout, /price_not_configured/);
  assert.match(checkout, /cs_test_/);
  assert.match(checkout, /stripePayload\.livemode === true/);
});

test("one-time and recurring flows share Checkout without collapsing semantics", () => {
  assert.match(checkout, /mode: "subscription"/);
  assert.match(checkout, /mode: "payment"/);
  assert.match(checkout, /subscription_data\[metadata\]/);
  assert.match(checkout, /payment_intent_data\[metadata\]/);
  assert.match(checkout, /maxQuantityPerCheckout: 20/);
  assert.match(checkout, /maxQuantityPerCheckout: 1/);
});

test("IMPACT payment remains separate from ecological delivery and outcome", () => {
  assert.match(checkout, /ecological_delivery_authority/);
  assert.match(checkout, /No partner request, physical delivery or ecological outcome/);
  assert.match(status, /DELIVERY_NOT_ESTABLISHED/);
  assert.match(status, /not partner delivery, ecological outcome or verified impact/);
  assert.match(webhook, /cannot be inferred from Stripe events/);
});

test("checkout confirmation is server-verified and webhook is signed/test-only", () => {
  assert.match(status, /startsWith\("cs_test_"\)/);
  assert.match(status, /session\.livemode === false/);
  assert.match(status, /session\.status === "complete"/);
  assert.match(webhook, /Stripe-Signature/);
  assert.match(webhook, /HMAC/);
  assert.match(webhook, /event\.livemode === true/);
  assert.match(webhook, /customer\.subscription\.created/);
  assert.match(webhook, /invoice\.payment_failed/);
});
