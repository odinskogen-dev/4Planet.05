import {
  json,
  releasedMarketProductIds,
  resolveMarketCommerceRuntime,
  type MarketCommerceEnv,
} from "../_lib/marketCommerce";

export const onRequestGet = async (ctx: { env: MarketCommerceEnv }): Promise<Response> => {
  const runtime = resolveMarketCommerceRuntime(ctx.env);
  const releasedProductIds = releasedMarketProductIds(ctx.env);
  return json({
    ok: true,
    environment: runtime.mode,
    publicCheckoutEnabled: runtime.isLive && releasedProductIds.length > 0,
    testCheckoutEnabled: !runtime.isLive && runtime.checkoutInfrastructureReady,
    checkoutInfrastructureReady: runtime.checkoutInfrastructureReady,
    fulfilmentInfrastructureReady: runtime.fulfilmentInfrastructureReady,
    webhookConfigured: runtime.webhookConfigured,
    releaseApproved: runtime.releaseApproved,
    photoSampleApproved: ctx.env.MARKET_PHOTO_SAMPLE_APPROVED === "true",
    artSampleApproved: ctx.env.MARKET_ART_SAMPLE_APPROVED === "true",
    releasedProductIds,
    productCount: 11,
    shippingCountry: "NO",
    paymentProvider: "Stripe",
    fulfilmentProvider: "Prodigi",
  });
};

export const onRequest = async (ctx: { request: Request; env: MarketCommerceEnv }): Promise<Response> =>
  ctx.request.method === "GET" ? onRequestGet(ctx) : json({ ok: false, error: "method_not_allowed" }, 405);
