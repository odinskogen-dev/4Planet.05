export interface FoodFixture {
  id: string;
  label: string;
  envelope: Record<string, unknown>;
}
export const FOOD_FIXTURES: Record<string, FoodFixture>;
