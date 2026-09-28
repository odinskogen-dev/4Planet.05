/** A deterministic helper on the existing 4PLANET FOOD/4SAPIEN HEIR, not a new store. */
export interface PantryItem { name: string; amount: number | null; unit: string }
export interface MealIngredient { name: string; amount: number | null; unit: string }
export interface FoodRecipe { id: string; name: string; sourceRef?: string | null; ingredients: MealIngredient[]; allergens?: string[] }
export interface FoodPriceObservation { name: string; priceNok: number; quantity: number; unit: string; observedAt: string; sourceId: string }
export interface MissingFoodItem { name: string; amount: number; unit: string }
export interface PantryMealResult {
  id: string; name: string; sourceRef: string | null;
  status: 'CONSTRAINT_CONFLICT' | 'UNKNOWN' | 'NEEDS_ITEMS' | 'CAN_MAKE_WITH_REPORTED_STOCK';
  available: MissingFoodItem[]; missing: MissingFoodItem[];
  unknown: Array<{ name: string; reason: string }>;
  allergyState: 'NOT_REQUESTED' | 'UNKNOWN' | 'CONFLICT' | 'DECLARED_NO_CONFLICT';
  additionalPurchase: { state: 'DATED_ESTIMATE' | 'NO_ADDITIONAL_ITEMS' | 'UNKNOWN'; nok: number | null; purchases: Array<MissingFoodItem & { costState: string; estimatedAdditionalNok?: number; reason?: string; sourceId?: string; observedAt?: string }>; limitation: string };
  budget: { state: 'UNKNOWN_BUDGET' | 'UNKNOWN_COST' | 'ESTIMATE_WITHIN_BUDGET' | 'ESTIMATE_ABOVE_BUDGET'; nok: number | null };
  limitation: string;
}
export function comparePantryMeals(input?: {pantry?: PantryItem[]; recipes?: FoodRecipe[]; budgetNok?: number | null; prices?: FoodPriceObservation[]; avoid?: string[]}): PantryMealResult[];
