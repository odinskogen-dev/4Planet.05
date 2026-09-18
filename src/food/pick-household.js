export const PICK_SHOP_VERSION = "p18-pick-shop-0.1.0";
export const PICK_SHOP_KEY = "p18:pick:shop:v1";

export const HOUSEHOLD_NEEDS = [
  { id: "produce", label: "FRUIT + VEGETABLES", group: "fresh" },
  { id: "wholegrain", label: "BREAD + WHOLEGRAINS", group: "base" },
  { id: "breakfast", label: "BREAKFAST GRAINS", group: "base" },
  { id: "eggs", label: "EGGS", group: "protein" },
  { id: "dairy", label: "MILK / YOGHURT / CHEESE", group: "protein" },
  { id: "fish", label: "FISH + SEAFOOD", group: "protein" },
  { id: "poultry", label: "CHICKEN / MEAT", group: "protein" },
  { id: "legumes", label: "BEANS + LENTILS", group: "protein" },
  { id: "starch", label: "PASTA / RICE / POTATOES", group: "base" },
  { id: "pantry", label: "TOMATOES + PANTRY", group: "pantry" },
  { id: "oils", label: "OILS + FATS", group: "pantry" },
  { id: "nuts", label: "NUTS + SEEDS", group: "pantry" },
  { id: "freezer", label: "FREEZER BACKUP", group: "backup" },
];

export function safeReadShop(storage) {
  try {
    const parsed = JSON.parse(storage.getItem(PICK_SHOP_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function persistShop(storage, state) {
  storage.setItem(PICK_SHOP_KEY, JSON.stringify(state));
}

export function toggleNeed(state, id) {
  return { ...(state ?? {}), [id]: !(state ?? {})[id] };
}

export function shopSummary(state) {
  const checked = HOUSEHOLD_NEEDS.filter((need) => Boolean(state?.[need.id]));
  const total = HOUSEHOLD_NEEDS.length;
  const hasProduce = Boolean(state?.produce);
  const hasBase = ["wholegrain", "starch"].some((id) => Boolean(state?.[id]));
  const hasProtein = ["eggs", "dairy", "fish", "poultry", "legumes"].some((id) => Boolean(state?.[id]));
  const mealBaseReady = hasProduce && hasBase && hasProtein;
  return {
    checked: checked.length,
    total,
    coverage: Math.round((checked.length / total) * 100),
    mealBaseReady,
    missing: HOUSEHOLD_NEEDS.filter((need) => !state?.[need.id]),
  };
}

export function nextHouseholdAction(state, basketSummary) {
  const shop = shopSummary(state);
  if (shop.checked === 0) return "Mark what the household already has before adding more products.";
  if (!shop.mealBaseReady) return "Complete one simple meal base: vegetables + a grain/potato base + a protein source.";
  if ((basketSummary?.unknownWallet ?? 0) > 0) return "Wallet evidence is incomplete. Compare shelf/unit prices before calling the basket cheaper.";
  if ((basketSummary?.unknownPlanet ?? 0) > 0) return "Planet evidence is incomplete. Do not infer a lower footprint from missing data.";
  return "Core household coverage is present. Review substitutions only where evidence supports a real improvement.";
}

export const MEAL_PATTERNS = [
  { id: "tray", label: "OVEN TRAY", needs: ["produce", "starch"], note: "Add fish, chicken, eggs or legumes depending on what is available." },
  { id: "pasta", label: "PASTA + TOMATO", needs: ["starch", "pantry"], note: "Add vegetables and a protein source from the household basket." },
  { id: "bowl", label: "GRAIN / POTATO BOWL", needs: ["produce", "starch"], note: "Use beans, fish, eggs or chicken as the protein component." },
  { id: "omelette", label: "EGGS + VEGETABLES", needs: ["eggs", "produce"], note: "Use bread or potatoes if a larger meal is needed." },
];

export function availableMealPatterns(state) {
  return MEAL_PATTERNS.filter((pattern) => pattern.needs.every((id) => Boolean(state?.[id])));
}
