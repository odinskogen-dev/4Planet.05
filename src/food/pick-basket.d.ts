import type { CanonicalFoodProduct } from "./core.js";
import type { PickDecisionAxis } from "./pick-core.js";
import type { PickWalletResult } from "./pick-wallet.js";

export interface PickBasketItem {
  gtin: string;
  name: string;
  brand: string;
  quantity: string;
  category: string;
  addedAt: string;
  health: string;
  healthConfidence: string;
  wallet: string;
  walletConfidence: string;
  planet: string;
  planetConfidence: string;
  observedPrice: number | null;
  observedPriceDate: string | null;
  observedPricePlace: string | null;
  observedUnitPrice: number | null;
  observedUnitPriceUnit: string | null;
}

export interface PickBasketSummary {
  total: number;
  healthCoverage: number;
  walletCoverage: number;
  planetCoverage: number;
  priceObservationCoverage: number;
  observedBasketPrice: number;
  pricedItems: number;
  unknownWallet: number;
  unknownPlanet: number;
  categories: number;
  rule: string;
}

export const PICK_BASKET_VERSION: string;
export const PICK_BASKET_KEY: string;
export function makeBasketItem(product: CanonicalFoodProduct, axes: PickDecisionAxis[], context?: { wallet?: PickWalletResult | null }): PickBasketItem;
export function addBasketItem(items: PickBasketItem[], item: PickBasketItem): PickBasketItem[];
export function removeBasketItem(items: PickBasketItem[], gtin: string): PickBasketItem[];
export function basketSummary(items: PickBasketItem[]): PickBasketSummary;
export function safeReadBasket(storage: Storage): PickBasketItem[];
export function persistBasket(storage: Storage, items: PickBasketItem[]): void;
