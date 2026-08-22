type Env = {
  PRODIGI_API_KEY: string;
  PRODIGI_CALLBACK_TOKEN: string;
  PRODIGI_ENV?: "sandbox" | "live";
};

type PagesContext = {
  request: Request;
  env: Env;
};

type ProdigiCloudEvent = {
  id?: string;
  type?: string;
  subject?: string;
  data?: { order?: { id?: string } } | { id?: string };
};

const apiBase = (env: Env) =>
  env.PRODIGI_ENV === "live"
    ? "https://api.prodigi.com/v4.0"
    : "https://api.sandbox.prodigi.com/v4.0";

export async function onRequestPost(context: PagesContext): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);

  if (!env.PRODIGI_CALLBACK_TOKEN || url.searchParams.get("token") !== env.PRODIGI_CALLBACK_TOKEN) {
    return new Response("unauthorised", { status: 401 });
  }
  if (!env.PRODIGI_API_KEY) {
    return new Response("provider not configured", { status: 503 });
  }

  let event: ProdigiCloudEvent;
  try {
    event = (await request.json()) as ProdigiCloudEvent;
  } catch {
    return new Response("invalid json", { status: 400 });
  }

  const embeddedOrderId =
    "order" in (event.data ?? {})
      ? (event.data as { order?: { id?: string } }).order?.id
      : (event.data as { id?: string } | undefined)?.id;
  const orderId = event.subject ?? embeddedOrderId;

  if (!orderId || !/^ord_[A-Za-z0-9_-]+$/.test(orderId)) {
    return new Response("invalid order id", { status: 400 });
  }

  // Treat the callback as a notification only. Re-fetch the order from Prodigi so
  // order state and tracking come from the authenticated provider API, not the POST body.
  const response = await fetch(`${apiBase(env)}/orders/${encodeURIComponent(orderId)}`, {
    headers: { "X-API-Key": env.PRODIGI_API_KEY },
  });
  if (!response.ok) {
    return new Response("provider verification failed", { status: 502 });
  }

  const body = (await response.json()) as {
    outcome?: string;
    order?: {
      id?: string;
      merchantReference?: string;
      status?: { stage?: string };
      shipments?: Array<{ status?: string; tracking?: { url?: string; number?: string } }>;
    };
  };

  const order = body.order;
  console.log("Verified Prodigi order update", {
    eventId: event.id,
    eventType: event.type,
    orderId: order?.id,
    merchantReference: order?.merchantReference,
    stage: order?.status?.stage,
    shipments: order?.shipments?.map((shipment) => ({
      status: shipment.status,
      trackingNumber: shipment.tracking?.number,
      trackingUrl: shipment.tracking?.url,
    })),
  });

  // Next data-plane step: persist the verified transition into market.fulfillments
  // and enqueue the matching customer email. Do not infer delivery from payment alone.
  return new Response("ok", { status: 200 });
}
