export type ProdigiEnv = {
  PRODIGI_API_KEY: string;
  PRODIGI_ENV?: "sandbox" | "live";
};

export type PostalAddress = {
  line1: string;
  line2?: string;
  postalOrZipCode: string;
  countryCode: string;
  townOrCity: string;
  stateOrCounty?: string | null;
};

export type CreatePosterOrderInput = {
  merchantReference: string;
  idempotencyKey: string;
  callbackUrl: string;
  recipientName: string;
  recipientEmail?: string;
  address: PostalAddress;
  sku: string;
  assetUrl: string;
  copies?: number;
  shippingMethod?: "Budget" | "Standard" | "StandardPlus" | "Express" | "Overnight";
  recipientCost?: { amount: string; currency: string };
};

const baseUrl = (env: ProdigiEnv) =>
  env.PRODIGI_ENV === "live"
    ? "https://api.prodigi.com/v4.0"
    : "https://api.sandbox.prodigi.com/v4.0";

const assertValue = (name: string, value: string) => {
  if (!value.trim()) throw new Error(`Missing ${name}`);
};

export async function createProdigiPosterOrder(env: ProdigiEnv, input: CreatePosterOrderInput) {
  assertValue("PRODIGI_API_KEY", env.PRODIGI_API_KEY);
  assertValue("merchantReference", input.merchantReference);
  assertValue("idempotencyKey", input.idempotencyKey);
  assertValue("callbackUrl", input.callbackUrl);
  assertValue("sku", input.sku);
  assertValue("assetUrl", input.assetUrl);

  const payload = {
    merchantReference: input.merchantReference,
    idempotencyKey: input.idempotencyKey,
    callbackUrl: input.callbackUrl,
    shippingMethod: input.shippingMethod ?? "Standard",
    recipient: {
      name: input.recipientName,
      email: input.recipientEmail,
      address: {
        line1: input.address.line1,
        line2: input.address.line2,
        postalOrZipCode: input.address.postalOrZipCode,
        countryCode: input.address.countryCode.toUpperCase(),
        townOrCity: input.address.townOrCity,
        stateOrCounty: input.address.stateOrCounty ?? null,
      },
    },
    items: [
      {
        merchantReference: input.merchantReference,
        sku: input.sku,
        copies: input.copies ?? 1,
        sizing: "fitPrintArea",
        recipientCost: input.recipientCost,
        assets: [{ printArea: "default", url: input.assetUrl }],
      },
    ],
    metadata: {
      source: "4planet_market",
      sale: "SALE_01",
    },
  };

  const response = await fetch(`${baseUrl(env)}/orders`, {
    method: "POST",
    headers: {
      "X-API-Key": env.PRODIGI_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as {
    outcome?: string;
    order?: { id?: string; status?: { stage?: string } };
    traceParent?: string;
  };

  if (!response.ok || !body.order?.id) {
    throw new Error(`Prodigi order failed (${response.status}; ${body.outcome ?? "unknown"})`);
  }

  return body;
}

export async function quoteProdigiPoster(
  env: ProdigiEnv,
  input: { sku: string; countryCode: string; copies?: number; currencyCode?: string },
) {
  assertValue("PRODIGI_API_KEY", env.PRODIGI_API_KEY);
  assertValue("sku", input.sku);

  const response = await fetch(`${baseUrl(env)}/quotes`, {
    method: "POST",
    headers: {
      "X-API-Key": env.PRODIGI_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      destinationCountryCode: input.countryCode.toUpperCase(),
      currencyCode: input.currencyCode ?? "EUR",
      items: [
        {
          sku: input.sku,
          copies: input.copies ?? 1,
          assets: [{ printArea: "default" }],
        },
      ],
    }),
  });

  const body = await response.json();
  if (!response.ok) throw new Error(`Prodigi quote failed (${response.status})`);
  return body;
}
