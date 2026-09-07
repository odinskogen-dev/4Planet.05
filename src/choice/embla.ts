export type EmblaDomain = "FOOD" | "HOME" | "CAR" | "FINANCE" | "GENERAL";

export type EmblaIntakeResult = {
  domain: EmblaDomain;
  status: "EVIDENCE_PATH_READY" | "INTAKE_ONLY";
  eyebrow: string;
  title: string;
  detail: string;
  truthBoundary: string;
  nextHref?: string;
  nextLabel?: string;
};

export type EmblaFoodCategory =
  | "GREEK_PLAIN_YOGHURT"
  | "SKYR_PROTEIN_YOGHURT"
  | "PLAIN_YOGHURT"
  | "ROLLED_OATS"
  | "GRANOLA"
  | "MUESLI"
  | "CORN_FLAKES"
  | "FROZEN_PIZZA"
  | "TORTILLA_CHIPS"
  | "POTATO_CHIPS"
  | "ENERGY_DRINK"
  | "CARBONATED_SOFT_DRINK";

export type EmblaShoppingItem = {
  raw: string;
  label: string;
  category?: EmblaFoodCategory;
  supported: boolean;
  status: "EVIDENCE_PATH_READY" | "NOT_COVERED_YET";
};

const hasAny = (value: string, words: string[]) => words.some((word) => value.includes(word));

/**
 * These terms intentionally mirror FOOD's human-controlled direct-substitute
 * profiles. A broad food family is never promoted to evidence-ready merely
 * because Embla recognises the noun.
 */
const FOOD_CATEGORY_TERMS: Array<{ category: EmblaFoodCategory; label: string; terms: string[] }> = [
  { category: "GREEK_PLAIN_YOGHURT", label: "Greek-style plain yoghurt", terms: ["gresk yoghurt", "gresk yogurt", "greek yoghurt", "greek yogurt"] },
  { category: "SKYR_PROTEIN_YOGHURT", label: "Skyr / protein yoghurt", terms: ["skyr", "proteinyoghurt", "protein yoghurt", "protein yogurt"] },
  { category: "PLAIN_YOGHURT", label: "Plain yoghurt", terms: ["naturell yoghurt", "naturell yogurt", "plain yoghurt", "plain yogurt"] },
  { category: "ROLLED_OATS", label: "Rolled oats", terms: ["havregryn", "rolled oats", "oat flakes"] },
  { category: "GRANOLA", label: "Granola", terms: ["granola"] },
  { category: "MUESLI", label: "Muesli", terms: ["müsli", "musli", "muesli"] },
  { category: "CORN_FLAKES", label: "Corn flakes", terms: ["corn flakes", "cornflakes"] },
  { category: "FROZEN_PIZZA", label: "Frozen pizza", terms: ["frossenpizza", "frossen pizza", "frozen pizza"] },
  { category: "TORTILLA_CHIPS", label: "Tortilla chips", terms: ["tortillachips", "tortilla chips", "nachos", "nacho chips"] },
  { category: "POTATO_CHIPS", label: "Potato chips", terms: ["potetgull", "potetchips", "potato chips", "potato crisps"] },
  { category: "ENERGY_DRINK", label: "Energy drink", terms: ["energidrikk", "energy drink"] },
  { category: "CARBONATED_SOFT_DRINK", label: "Carbonated soft drink", terms: ["brus", "soft drink", "soda"] },
];

export function parseEmblaShoppingList(input: string): EmblaShoppingItem[] {
  return input
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((raw) => {
      const value = raw.toLowerCase();
      const controlled = FOOD_CATEGORY_TERMS.find((item) => hasAny(value, item.terms));
      if (!controlled) {
        return {
          raw,
          label: raw,
          supported: false,
          status: "NOT_COVERED_YET" as const,
        };
      }
      return {
        raw,
        label: controlled.label,
        category: controlled.category,
        supported: true,
        status: "EVIDENCE_PATH_READY" as const,
      };
    });
}

export function summariseEmblaShoppingList(items: EmblaShoppingItem[]) {
  const supported = items.filter((item) => item.supported).length;
  return {
    total: items.length,
    supported,
    unsupported: items.length - supported,
  };
}

/**
 * First bounded Embla seam.
 *
 * This is deliberately deterministic. It does not pretend a conversation model,
 * external evidence retrieval or a recommendation exists where it does not. Its
 * job is to convert a human decision prompt into the strongest currently proven
 * 4SAPIEN choice path and fail closed when that path is not yet evidence-ready.
 *
 * Specific choice domains are resolved before generic financial language so a
 * question such as "Can I afford this home?" stays a HOME decision instead of
 * being collapsed into FINANCE merely because it contains the word "afford".
 */
export function resolveEmblaIntake(prompt: string): EmblaIntakeResult {
  const value = prompt.trim().toLowerCase();

  if (hasAny(value, ["food", "grocery", "groceries", "product", "barcode", "eat", "meal", "shopping list", "handleliste", "kaffe", "coffee", "smør", "smor", "butter", "melk", "milk", "yoghurt", "yogurt", "havregryn", "granola", "muesli", "müsli", "pizza", "potetgull", "chips", "brus", "soda", "energidrikk", "energy drink"])) {
    return {
      domain: "FOOD",
      status: "EVIDENCE_PATH_READY",
      eyebrow: "EMBLA → FOOD → CHOICE",
      title: "Tell me what matters most in this choice.",
      detail:
        "The current FOOD proof can read a real barcode, compare only human-controlled direct substitutes for selected health and allergen priorities, and inspect HEALTH, WALLET and PLANET separately without inventing one universal score.",
      truthBoundary:
        "Embla has identified a usable decision path, not a universal answer. A recognised shopping-list noun is not automatically a controlled comparison category. Wallet and planetary evidence do not yet support category-wide ranking, so those paths remain product evidence rather than a false best-in-category recommendation.",
      nextHref: "/4sapien/food/choose",
      nextLabel: "MAKE THIS CHOICE",
    };
  }

  if (hasAny(value, ["car", "vehicle", "ev", "electric car", "petrol", "diesel"])) {
    return {
      domain: "CAR",
      status: "INTAKE_ONLY",
      eyebrow: "EMBLA → CAR",
      title: "This choice needs a bounded five-year comparison.",
      detail:
        "The intended comparison covers total ownership cost, usefulness, energy, reliability and impact against personal constraints.",
      truthBoundary:
        "The CAR evidence adapter is not yet active. Embla therefore withholds a recommendation instead of guessing from incomplete evidence.",
    };
  }

  if (hasAny(value, ["home", "house", "apartment", "flat", "mortgage", "rent", "property"])) {
    return {
      domain: "HOME",
      status: "INTAKE_ONLY",
      eyebrow: "EMBLA → HOME",
      title: "This choice needs life-fit and total-cost evidence.",
      detail:
        "The intended comparison covers purchase or rent cost, energy, running cost, materials, place, risk and long-term constraints.",
      truthBoundary:
        "The HOME evidence adapter is not yet active. Embla keeps the decision open rather than treating missing evidence as a negative score.",
    };
  }

  if (hasAny(value, ["investment", "invest", "stock", "share", "money", "finance", "afford", "budget"])) {
    return {
      domain: "FINANCE",
      status: "INTAKE_ONLY",
      eyebrow: "EMBLA → 4FINANCE",
      title: "Frame the financial decision before scoring it.",
      detail:
        "4FINANCE can currently show the intended money, cost and scenario structure. Connected personal accounts and evidence-complete investment comparison are not active in this proof.",
      truthBoundary:
        "No personalised trading instruction is produced. Missing financial context remains UNKNOWN and no BUY / SELL recommendation is generated.",
      nextHref: "/4sapien/finance",
      nextLabel: "OPEN 4FINANCE PROOF",
    };
  }

  return {
    domain: "GENERAL",
    status: "INTAKE_ONLY",
    eyebrow: "EMBLA / DECISION INTAKE",
    title: value ? "I need the options and the decision criteria." : "Tell me what you are trying to decide.",
    detail: value
      ? "Embla can preserve the question now, but a defensible comparison needs at least two explicit options, what matters to you and source-backed evidence for the relevant criteria."
      : "Start with the decision in plain language. Embla will route it only to a proof path that currently exists.",
    truthBoundary:
      "No evidence quorum means no confident recommendation. UNKNOWN remains UNKNOWN.",
  };
}
