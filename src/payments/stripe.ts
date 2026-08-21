export type StripeCheckoutInput = {
  priceId: string;
  quantity?: number;
  customerEmail?: string;
  orderRef?: string;
};

type CheckoutResponse = {
  sessionId?: string;
  url?: string;
  error?: string;
};

export async function createStripeCheckoutSession(input: StripeCheckoutInput) {
  const response = await fetch("/api/stripe/create-checkout-session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });

  const body = (await response.json()) as CheckoutResponse;

  if (!response.ok || !body.url) {
    throw new Error(body.error ?? "checkout_session_failed");
  }

  return body;
}

export async function startStripeCheckout(input: StripeCheckoutInput) {
  const session = await createStripeCheckoutSession(input);
  window.location.assign(session.url as string);
}
