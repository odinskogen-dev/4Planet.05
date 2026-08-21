export type MarketSaleProduct = {
  id: string;
  slug: string;
  title: string;
  creator: string;
  location: string;
  year: number;
  currency: "NOK";
  customerPriceNok: number;
  imageUrl: string;
  checkoutUrl: string;
  checkoutMode: "sandbox" | "live";
  productKind: "physical_poster";
  providerState: "pricing_pending" | "sample_pending" | "approved";
  firstVariant: {
    label: string;
    aspectRatio: string;
    paper: string;
    provider: string;
    providerSku: string | null;
  };
};

/**
 * SALE 01 is intentionally provider-neutral until the exact physical poster SKU,
 * landed Norway cost and physical sample are approved.
 *
 * The Stripe URL below is the existing sandbox payment-route fixture. It must be
 * replaced by a physical-product Checkout/Payment Link before LIVE sale.
 */
export const FIRST_SALE: MarketSaleProduct = {
  id: "4pm-odin-mulafossur-01",
  slug: "mulafossur",
  title: "Mulafossur",
  creator: "Odin Oddekalv",
  location: "Faroe Islands",
  year: 2022,
  currency: "NOK",
  customerPriceNok: 490,
  imageUrl:
    "https://drive.google.com/thumbnail?id=1G3H8_isp5mq-HE61vICNQ4r5LEIBiLJz&sz=w2000",
  checkoutUrl:
    import.meta.env.VITE_MARKET_MULAFOSSUR_CHECKOUT_URL ||
    "https://buy.stripe.com/test_fZu6oGbr8gVZ7Fle2N5J600",
  checkoutMode: "sandbox",
  productKind: "physical_poster",
  providerState: "pricing_pending",
  firstVariant: {
    label: "FIRST POSTER / PHOTO RATIO",
    aspectRatio: "3:2",
    paper: "Affordable matte poster paper — final stock pending sample",
    provider: "POD provider qualification in progress",
    providerSku: null,
  },
};

export const SALE_01_BOUNDARIES = [
  "The current Stripe link is sandbox-only and is not a live physical order.",
  "Production starts only after a physical POD variant and provider SKU are approved.",
  "Payment, production, dispatch, creator payable and Impact remain separate states.",
  "No ecological outcome is claimed from a product purchase.",
] as const;
