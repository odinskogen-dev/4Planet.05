export interface PickWalletObservation {
  id: number | string | null;
  price: number;
  currency: string;
  date: string | null;
  pricePer: string;
  unitPrice: number | null;
  unitPriceUnit: string | null;
  discounted: boolean;
  priceWithoutDiscount: number | null;
  proofId: number | string | null;
  location: { id: number | string | null; name: string | null; brand: string | null; city: string | null; countryCode: string | null };
  created: string | null;
  ageDays?: number | null;
}

export interface PickWalletResult {
  version: string;
  state: string;
  confidence: string;
  directness: string;
  summary: string;
  limitation: string;
  observation: PickWalletObservation | null;
  source: Record<string, unknown> | null;
}

export const PICK_WALLET_VERSION: string;
export function unknownWallet(reason?: string): PickWalletResult;
export function normaliseWalletEnvelope(envelope: Record<string, any> | null | undefined): PickWalletResult;
export function compareWallet(a: PickWalletResult | null | undefined, b: PickWalletResult | null | undefined): { known: boolean; favourable: boolean; delta: number | null; unit: string | null; explanation: string };
