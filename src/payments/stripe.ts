export type StripeProductKey =
  | "impact_tree_test"
  | "impact_plastic_test"
  | "impact_coral_test"
  | "impact_rewild_test";

export interface StripeCheckoutInput {
  productKey: StripeProductKey;
  quantity?: number;
  customerEmail?: string;
}

export interface StripeCheckoutResponse {
  ok: true;
  mode: "test";
  sessionId: string;
  url: string;
  productKey: StripeProductKey;
  quantity: number;
  truthState: "TEST";
  deliveryAuthority: "none";
}

export async function createStripeCheckoutSession(input: StripeCheckoutInput): Promise<StripeCheckoutResponse> {
  const response = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });

  const payload = (await response.json().catch(() => null)) as
    | StripeCheckoutResponse
    | { ok?: false; error?: string }
    | null;

  if (!response.ok || !payload || payload.ok !== true || !("url" in payload)) {
    const reason = payload && "error" in payload && payload.error ? payload.error : "checkout_unavailable";
    throw new Error(reason);
  }

  return payload;
}

export async function startStripeCheckout(input: StripeCheckoutInput) {
  const session = await createStripeCheckoutSession(input);
  window.location.assign(session.url);
}
