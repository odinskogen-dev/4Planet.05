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

const hasAny = (value: string, words: string[]) => words.some((word) => value.includes(word));

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

  if (hasAny(value, ["food", "grocery", "groceries", "product", "barcode", "eat", "meal"])) {
    return {
      domain: "FOOD",
      status: "EVIDENCE_PATH_READY",
      eyebrow: "EMBLA → FOOD → PICK_",
      title: "Start with the product evidence.",
      detail:
        "The current FOOD proof can read a real product record, keep HEALTH, WALLET and PLANET separate, expose unknowns and compare available alternatives without inventing a universal score.",
      truthBoundary:
        "Embla has identified the decision path, not the answer. A recommendation is not eligible until the underlying product evidence is actually read and sufficient.",
      nextHref: "/4sapien/food",
      nextLabel: "OPEN LIVE FOOD PROOF",
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
