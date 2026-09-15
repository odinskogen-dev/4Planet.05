import type { FirstMarketProduct } from "../../src/market/firstCreatorCatalogue";
import { stripePostForm, type resolveMarketCommerceRuntime } from "./marketCommerce";

type Runtime = ReturnType<typeof resolveMarketCommerceRuntime>;

export async function createMarketCheckoutSession(args: {
  runtime: Runtime;
  product: FirstMarketProduct;
  origin: string;
  attemptId: string;
  canary?: boolean;
}) {
  const { runtime, product, origin, attemptId, canary = false } = args;
  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("line_items[0][price_data][currency]", "nok");
  form.set("line_items[0][price_data][unit_amount]", String(product.commerce.candidatePriceNok * 100));
  form.set("line_items[0][price_data][product_data][name]", `${product.title} — ${product.creator}`);
  form.set("line_items[0][price_data][product_data][description]", `${product.productType} · ${product.commerce.printSize} · Enhanced Matte Art Paper · standard shipping in Norway included.`);
  form.set("line_items[0][quantity]", "1");
  form.set("customer_creation", "always");
  form.set("billing_address_collection", "auto");
  form.set("shipping_address_collection[allowed_countries][0]", "NO");
  form.set("phone_number_collection[enabled]", "true");
  form.set("consent_collection[terms_of_service]", "required");
  form.set("success_url", `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`);
  form.set("cancel_url", `${origin}/?checkout=cancel&product=${encodeURIComponent(product.slug)}`);
  form.set("client_reference_id", product.id);
  form.set("custom_text[submit][message]", canary
    ? "PRIVATE 4MARKET CANARY — this is a real payment and a real print-on-demand fulfilment test."
    : runtime.isLive
      ? "Your print will be produced on demand and shipped directly to the Norwegian delivery address entered here."
      : "TEST MODE — validates payment and fulfilment integration. No public sale is released by this checkout.");

  const metadata: Record<string, string> = {
    market_product_id: product.id,
    market_product_slug: product.slug,
    market_creator: product.creator,
    market_integration: "4market_stripe_prodigi_v1",
    market_environment: runtime.mode,
    market_canary: canary ? "true" : "false",
    market_price_nok: String(product.commerce.candidatePriceNok),
    prodigi_sku: product.commerce.podSku,
    prodigi_sizing: product.commerce.podSizing,
    print_size: product.commerce.printSize,
    asset_path: product.imageUrl,
    shipping_method: product.commerce.shippingMethod,
    fulfilment_state: "AWAITING_PAYMENT",
  };
  for (const [key, value] of Object.entries(metadata)) {
    form.set(`metadata[${key}]`, value);
    form.set(`payment_intent_data[metadata][${key}]`, value);
  }

  return stripePostForm(
    runtime,
    "/v1/checkout/sessions",
    form,
    `4market_${runtime.mode.toLowerCase()}_${canary ? "canary_" : ""}${product.slug}_${attemptId}`,
  );
}
