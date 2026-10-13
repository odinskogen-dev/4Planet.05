export const EMBLA_SHOPPING_LIST_STORAGE_KEY = "4planet.embla.shopping-list.v1";

export interface EmblaShoppingListReceipt {
  shoppingList: string;
  store: string;
  budget: string;
  savedAt?: string;
}

export interface EmblaStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface EmblaRestoreResult {
  value: EmblaShoppingListReceipt | null;
  unavailable: boolean;
}

export function restoreEmblaShoppingList(storage: EmblaStorage): EmblaRestoreResult {
  let raw: string | null;

  try {
    raw = storage.getItem(EMBLA_SHOPPING_LIST_STORAGE_KEY);
  } catch {
    return { value: null, unavailable: true };
  }

  if (!raw) return { value: null, unavailable: false };

  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    if (typeof value.shoppingList !== "string" || !value.shoppingList.trim()) {
      throw new Error("Invalid Embla shopping-list receipt");
    }

    return {
      value: {
        shoppingList: value.shoppingList,
        store: typeof value.store === "string" && value.store.trim() ? value.store : "",
        budget: typeof value.budget === "string" ? value.budget : "",
        savedAt: typeof value.savedAt === "string" ? value.savedAt : undefined,
      },
      unavailable: false,
    };
  } catch {
    try {
      storage.removeItem(EMBLA_SHOPPING_LIST_STORAGE_KEY);
      return { value: null, unavailable: false };
    } catch {
      return { value: null, unavailable: true };
    }
  }
}

export function saveEmblaShoppingList(
  storage: EmblaStorage,
  value: EmblaShoppingListReceipt,
): boolean {
  try {
    storage.setItem(EMBLA_SHOPPING_LIST_STORAGE_KEY, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
