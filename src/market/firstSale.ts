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
 * SALE 01 now has a supplier-verified Prodigi Budget Poster SKU and current
 * Norway pricing evidence. Physical sample approval, VAT/handling treatment and
 * live commercial credentials remain open, so fulfilment stays fail-closed.
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
  providerState: "sample_pending",
  firstVariant: {
    label: "40 × 60 CM TARGET / 410 × 610 MM ACTUAL",
    aspectRatio: "3:2 target — slight crop or thin border required",
    paper: "Prodigi Budget Poster",
    provider: "Prodigi — EU facility serving Norway",
    providerSku: "GLOBAL-BLP-16x24",
  },
};

export const SALE_01_BOUNDARIES = [
  "The current Stripe link is sandbox-only and is not a live physical order.",
  "Supplier pricing is verified, but production starts only after physical sample approval and live fulfilment credentials.",
  "Current supplier evidence: EUR 7.00 production + EUR 10.25 tracked Norway shipping before Norwegian VAT or carrier handling.",
  "Payment, production, dispatch, creator payable and Impact remain separate states.",
  "No ecological outcome is claimed from a product purchase.",
] as const;
