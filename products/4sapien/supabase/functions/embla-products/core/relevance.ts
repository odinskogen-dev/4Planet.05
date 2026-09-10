import { arrText, norm, norwayRank, tokenSet } from "./normalize.ts";

const CARRIER_WORDS = new Set([
  "pizza","burger","sandwich","baguette","wrap","taco","suppe","saus","dressing","gryte","salat","pai","toast","snack","chips","lasagne","lasagna"
]);
const DIRECT_FORM_WORDS = new Set([
  "pålegg","palegg","skiver","skive","filet","fileter","biter","stykker","naturell","original","lett","økologisk","okologisk","kokt","røkt","rokt","speke"
]);

export type RelevanceBand = "DIRECT" | "RELATED" | "WEAK";
export type Relevance = { score:number; band:RelevanceBand; why:string; query:string };

function hasCarrierOutsideQuery(name: string, queryTokens: string[]) {
  const nt = [...tokenSet(name)];
  return nt.some(t => CARRIER_WORDS.has(t) && !queryTokens.includes(t));
}

function compoundLooksDirect(name: string, query: string) {
  if (!name.includes(query)) return false;
  const remainder = name.replace(query, " ").trim();
  if (!remainder) return true;
  return remainder.split(" ").some(t => DIRECT_FORM_WORDS.has(t));
}

export function relevanceFor(p: any, rawQuery: string): Relevance {
  const query = norm(rawQuery);
  const qt = query.split(" ").filter(Boolean);
  const name = norm(p?.product_name_nb || p?.product_name || "");
  const nameTokens = tokenSet(name);
  const brand = norm(p?.brands || "");
  const categories = norm(arrText(p?.categories_tags_en));
  const ingredients = norm(p?.ingredients_text || "");
  const carrier = hasCarrierOutsideQuery(name, qt);
  let score = 0;
  let why = "weak";

  if (name === query) { score = 130; why = "exact_name"; }
  else if (qt.length && qt.every(t => nameTokens.has(t))) { score = carrier ? 64 : 118; why = carrier ? "carrier_name_words" : "name_words"; }
  else if (name.startsWith(query + " ") || name.endsWith(" " + query)) { score = carrier ? 62 : 112; why = carrier ? "carrier_name_edge" : "name_edge"; }
  else if (` ${name} `.includes(` ${query} `)) { score = carrier ? 60 : 108; why = carrier ? "carrier_name_phrase" : "name_phrase"; }
  else if (compoundLooksDirect(name, query) && !carrier) { score = 96; why = "direct_form_compound"; }
  else if (name.includes(query)) { score = carrier ? 58 : 72; why = carrier ? "carrier_compound" : "name_compound"; }
  else if (qt.length && qt.every(t => tokenSet(brand).has(t))) { score = 52; why = "brand"; }
  else if (categories.includes(query)) { score = 42; why = "category"; }
  else if (ingredients.includes(query)) { score = 22; why = "ingredient"; }

  score += norwayRank(p) ? 6 : 0;
  const band: RelevanceBand = score >= 90 ? "DIRECT" : score >= 55 ? "RELATED" : "WEAK";
  return { score, band, why, query };
}

export function rankByIntent(products: any[], q: string) {
  const decorated = products.map((p, providerIndex) => {
    const r = relevanceFor(p,q);
    return {...p,embla_provider_order:providerIndex,embla_relevance:r.score,embla_relevance_band:r.band,embla_match:r.why};
  });
  decorated.sort((a,b) => (b.embla_relevance-a.embla_relevance) || (a.embla_provider_order-b.embla_provider_order));
  const direct = decorated.filter(p => p.embla_relevance_band === "DIRECT");
  if (direct.length >= 3) return decorated.filter(p => p.embla_relevance_band !== "WEAK");
  return decorated;
}
