type ProductKey =
  | "impact_tree_test"
  | "impact_plastic_test"
  | "impact_coral_test"
  | "impact_rewild_test"
  | "membership_supporter_test"
  | "sponsor_package_test";

type ProductKind = "IMPACT_UNIT" | "SPONSOR_PACKAGE" | "MEMBERSHIP";
type ProductFamily = "IMPACT" | "SPONSOR" | "MEMBERSHIP";
type CheckoutMode = "payment" | "subscription";

interface Env {
  STRIPE_TEST_SECRET_KEY?: string;
  STRIPE_CHECKOUT_TEST_ENABLED?: string;
  STRIPE_PRICE_IMPACT_TREE_TEST?: string;
  STRIPE_PRICE_IMPACT_PLASTIC_TEST?: string;
  STRIPE_PRICE_IMPACT_CORAL_TEST?: string;
  STRIPE_PRICE_IMPACT_REWILD_TEST?: string;
  STRIPE_PRICE_MEMBERSHIP_SUPPORTER_TEST?: string;
  STRIPE_PRICE_SPONSOR_PACKAGE_TEST?: string;
}

interface CatalogEntry {
  key: ProductKey;
  kind: ProductKind;
  family: ProductFamily;
  action?: "plant-trees" | "clean-ocean" | "restore-coral" | "rewild-nature";
  mission?: "CLIM4TE" | "PL4STIC/CLE4N" | "COR4L" | "RE:WILD";
  mode: CheckoutMode;
  priceEnv: keyof Env;
  minQuantity: number;
  maxQuantityPerCheckout: number;
  returnPath: string;
}

const CATALOG: Record<ProductKey, CatalogEntry> = {
  impact_tree_test: {
    key: "impact_tree_test",
    kind: "IMPACT_UNIT",
    family: "IMPACT",
    action: "plant-trees",
    mission: "CLIM4TE",
    mode: "payment",
    priceEnv: "STRIPE_PRICE_IMPACT_TREE_TEST",
    minQuantity: 1,
    maxQuantityPerCheckout: 20,
    returnPath: "/impact/lab",
  },
  impact_plastic_test: {
    key: "impact_plastic_test",
    kind: "IMPACT_UNIT",
    family: "IMPACT",
    action: "clean-ocean",
    mission: "PL4STIC/CLE4N",
    mode: "payment",
    priceEnv: "STRIPE_PRICE_IMPACT_PLASTIC_TEST",
    minQuantity: 1,
    maxQuantityPerCheckout: 20,
    returnPath: "/impact/lab",
  },
  impact_coral_test: {
    key: "impact_coral_test",
    kind: "IMPACT_UNIT",
    family: "IMPACT",
    action: "restore-coral",
    mission: "COR4L",
    mode: "payment",
    priceEnv: "STRIPE_PRICE_IMPACT_CORAL_TEST",
    minQuantity: 1,
    maxQuantityPerCheckout: 20,
    returnPath: "/impact/lab",
  },
  impact_rewild_test: {
    key: "impact_rewild_test",
    kind: "IMPACT_UNIT",
    family: "IMPACT",
    action: "rewild-nature",
    mission: "RE:WILD",
    mode: "payment",
    priceEnv: "STRIPE_PRICE_IMPACT_REWILD_TEST",
    minQuantity: 1,
    maxQuantityPerCheckout: 20,
    returnPath: "/impact/lab",
  },
  membership_supporter_test: {
    key: "membership_supporter_test",
    kind: "MEMBERSHIP",
    family: "MEMBERSHIP",
    mode: "subscription",
    priceEnv: "STRIPE_PRICE_MEMBERSHIP_SUPPORTER_TEST",
    minQuantity: 1,
    maxQuantityPerCheckout: 1,
    returnPath: "/join",
  },
  sponsor_package_test: {
    key: "sponsor_package_test",
    kind: "SPONSOR_PACKAGE",
    family: "SPONSOR",
    mode: "payment",
    priceEnv: "STRIPE_PRICE_SPONSOR_PACKAGE_TEST",
    minQuantity: 1,
    maxQuantityPerCheckout: 1,
    returnPath: "/brands",
  },
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

function allowedOrigin(origin: string) {
  try {
    const url = new URL(origin);
    if (url.protocol !== "https:" && url.hostname !== "localhost") return false;
    return (
      url.hostname === "4planet.org" ||
      url.hostname === "www.4planet.org" ||
      url.hostname.endsWith(".4planet-05.pages.dev") ||
      url.hostname === "localhost"
    );
  } catch {
    return false;
  }
}

function validEmail(email?: string) {
  return !email || (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254);
}

function readCatalogKey(value: unknown): ProductKey | null {
  if (typeof value !== "string") return null;
  return Object.prototype.hasOwnProperty.call(CATALOG, value) ? (value as ProductKey) : null;
}

function safeQuantity(value: unknown, entry: CatalogEntry) {
  const quantity = typeof value === "number" && Number.isInteger(value) ? value : 1;
  if (quantity < entry.minQuantity || quantity > entry.maxQuantityPerCheckout) return null;
  return quantity;
}

function setMetadata(form: URLSearchParams, prefix: string, entry: CatalogEntry) {
  form.set(`${prefix}[4planet_product_key]`, entry.key);
  form.set(`${prefix}[product_kind]`, entry.kind);
  form.set(`${prefix}[product_family]`, entry.family);
  form.set(`${prefix}[truth_state]`, "TEST");
  form.set(`${prefix}[ecological_delivery_authority]`, "none");
  form.set(`${prefix}[catalog_version]`, "commerce-core-01");
  if (entry.action) form.set(`${prefix}[impact_action]`, entry.action);
  if (entry.mission) form.set(`${prefix}[mission]`, entry.mission);
}

export const onRequestPost = async (ctx: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = ctx;
  const origin = request.headers.get("origin") ?? new URL(request.url).origin;

  if (!allowedOrigin(origin)) return json({ ok: false, error: "origin_not_allowed" }, 403);
  if (env.STRIPE_CHECKOUT_TEST_ENABLED !== "true") {
    return json({ ok: false, error: "stripe_test_checkout_disabled" }, 503);
  }

  const secret = env.STRIPE_TEST_SECRET_KEY?.trim();
  if (!secret || !secret.startsWith("sk_test_")) {
    return json({ ok: false, error: "stripe_test_secret_missing" }, 503);
  }

  let body: { productKey?: unknown; quantity?: unknown; customerEmail?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const productKey = readCatalogKey(body.productKey);
  if (!productKey) return json({ ok: false, error: "unsupported_product" }, 400);

  const entry = CATALOG[productKey];
  const quantity = safeQuantity(body.quantity, entry);
  if (quantity === null) return json({ ok: false, error: "invalid_quantity" }, 400);

  const customerEmail = typeof body.customerEmail === "string" ? body.customerEmail.trim() : undefined;
  if (!validEmail(customerEmail)) return json({ ok: false, error: "invalid_email" }, 400);

  const priceId = env[entry.priceEnv]?.trim();
  if (!priceId || !priceId.startsWith("price_")) {
    return json({ ok: false, error: "price_not_configured" }, 503);
  }

  const form = new URLSearchParams();
  form.set("mode", entry.mode);
  form.set("line_items[0][price]", priceId);
  form.set("line_items[0][quantity]", String(quantity));
  form.set("billing_address_collection", "auto");
  form.set(
    "success_url",
    `${origin}${entry.returnPath}?checkout=success&session_id={CHECKOUT_SESSION_ID}&product=${encodeURIComponent(productKey)}`,
  );
  form.set(
    "cancel_url",
    `${origin}${entry.returnPath}?checkout=cancel&product=${encodeURIComponent(productKey)}`,
  );
  form.set("client_reference_id", `4p_${productKey}`);
  setMetadata(form, "metadata", entry);

  if (entry.mode === "payment") {
    form.set("customer_creation", "always");
    setMetadata(form, "payment_intent_data[metadata]", entry);
  } else {
    setMetadata(form, "subscription_data[metadata]", entry);
  }

  form.set(
    "custom_text[submit][message]",
    entry.family === "IMPACT"
      ? "TEST MODE — payment-path validation only. No partner request, physical delivery or ecological outcome is created by this checkout."
      : "TEST MODE — payment-path validation only. This is not a public commercial offer.",
  );
  if (customerEmail) form.set("customer_email", customerEmail);

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${secret}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: form,
  });

  const stripePayload = (await stripeResponse.json().catch(() => null)) as
    | { id?: string; url?: string; livemode?: boolean; mode?: string; error?: { type?: string } }
    | null;

  if (
    !stripeResponse.ok ||
    !stripePayload?.url ||
    !stripePayload.id?.startsWith("cs_test_") ||
    stripePayload.livemode === true ||
    (stripePayload.mode && stripePayload.mode !== entry.mode)
  ) {
    return json(
      {
        ok: false,
        error: "stripe_checkout_create_failed",
        stripeType: stripePayload?.error?.type ?? null,
      },
      502,
    );
  }

  return json({
    ok: true,
    environment: "TEST",
    checkoutMode: entry.mode,
    sessionId: stripePayload.id,
    url: stripePayload.url,
    productKey,
    productKind: entry.kind,
    productFamily: entry.family,
    quantity,
    truthState: "TEST",
    deliveryAuthority: "none",
  });
};

export const onRequest = async (ctx: { request: Request; env: Env }): Promise<Response> => {
  if (ctx.request.method === "POST") return onRequestPost(ctx);
  return json({ ok: false, error: "method_not_allowed" }, 405);
};
