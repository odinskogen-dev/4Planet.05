import type { PickBasketSummary } from "./pick-basket.js";

export interface HouseholdNeed { id: string; label: string; group: string; }
export interface HouseholdShopSummary { checked: number; total: number; coverage: number; mealBaseReady: boolean; missing: HouseholdNeed[]; }
export interface MealPattern { id: string; label: string; needs: string[]; note: string; }

export const PICK_SHOP_VERSION: string;
export const PICK_SHOP_KEY: string;
export const HOUSEHOLD_NEEDS: HouseholdNeed[];
export const MEAL_PATTERNS: MealPattern[];
export function safeReadShop(storage: Storage): Record<string, boolean>;
export function persistShop(storage: Storage, state: Record<string, boolean>): void;
export function toggleNeed(state: Record<string, boolean>, id: string): Record<string, boolean>;
export function shopSummary(state: Record<string, boolean>): HouseholdShopSummary;
export function nextHouseholdAction(state: Record<string, boolean>, basketSummary: PickBasketSummary): string;
export function availableMealPatterns(state: Record<string, boolean>): MealPattern[];
