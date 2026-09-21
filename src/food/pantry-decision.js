/**
 * Bounded, deterministic FOOD decision primitive. No network, storage, personal
 * memory, price promises, nutrition claims, or ecological claims.
 * Pantry and recipes are supplied by an authorised product surface; recipes
 * remain source-provenanced in the existing 4PLANET/FOOD knowledge spine.
 */
const key = (value) => String(value ?? '').normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('nb-NO');
const validAmount = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0;

export function comparePantryMeals({ pantry = [], recipes = [], budgetNok = null, prices = [], avoid = [] } = {}) {
  const stock = new Map(), duplicateStock = new Set();
  for (const item of pantry) {
    const id = key(item.name);
    if (!id) continue;
    if (stock.has(id)) { duplicateStock.add(id); continue; }
    stock.set(id, { ...item, id, unit: key(item.unit) });
  }
  const priceByName = new Map(prices.filter(p => key(p.name)).map(p => [key(p.name), p]));
  const avoided = new Set(avoid.map(key).filter(Boolean));
  const budgetKnown = validAmount(budgetNok);
  return recipes.map(recipe => {
    const missing = [], unknown = [], available = [];
    const requirements = new Map();
    for (const part of recipe.ingredients ?? []) {
      const id = key(part.name), unit = key(part.unit);
      if (!id || !validAmount(part.amount) || !unit) {
        unknown.push({ name: part.name ?? 'UNKNOWN', reason: 'recipe_quantity_or_unit_unknown' });
      } else if (requirements.has(id)) {
        const old = requirements.get(id);
        if (old.unit !== unit) { unknown.push({ name: part.name, reason: 'recipe_unit_conflict' }); requirements.delete(id); }
        else old.amount += part.amount;
      } else requirements.set(id, { name: part.name, amount: part.amount, unit });
    }
    for (const ingredient of requirements.values()) {
      const id = key(ingredient.name), unit = key(ingredient.unit);
      const own = stock.get(id);
      if (duplicateStock.has(id)) {
        unknown.push({ name: ingredient.name, reason: 'duplicate_pantry_entry' });
      } else if (!own) {
        missing.push({ name: ingredient.name, amount: ingredient.amount, unit });
      } else if (!validAmount(own.amount) || !own.unit || own.unit !== unit) {
        unknown.push({ name: ingredient.name, reason: 'pantry_quantity_or_unit_unknown' });
      } else if (own.amount >= ingredient.amount) {
        available.push({ name: ingredient.name, amount: ingredient.amount, unit });
      } else {
        available.push({ name: ingredient.name, amount: own.amount, unit });
        missing.push({ name: ingredient.name, amount: ingredient.amount - own.amount, unit });
      }
    }
    const tags = Array.isArray(recipe.allergens) ? recipe.allergens.map(key) : null;
    const allergyState = avoided.size === 0 ? 'NOT_REQUESTED' :
      tags === null ? 'UNKNOWN' : tags.some(tag => avoided.has(tag)) ? 'CONFLICT' : 'DECLARED_NO_CONFLICT';
    if (allergyState === 'UNKNOWN') unknown.push({ name: 'allergens', reason: 'recipe_allergens_unknown' });
    const purchases = [];
    for (const item of missing) {
      const price = priceByName.get(key(item.name));
      if (!price || !validAmount(price.priceNok) || !(price.quantity > 0) || key(price.unit) !== item.unit || !price.observedAt || !price.sourceId) {
        purchases.push({ ...item, costState: 'UNKNOWN', reason: 'dated_matching_price_missing' });
      } else {
        purchases.push({ ...item, costState: 'DATED_OBSERVATION', estimatedAdditionalNok: price.priceNok * item.amount / price.quantity, sourceId: price.sourceId, observedAt: price.observedAt });
      }
    }
    const costKnown = unknown.length === 0 && purchases.every(p => p.costState === 'DATED_OBSERVATION');
    const additionalNok = costKnown ? Math.round(purchases.reduce((sum,p) => sum + p.estimatedAdditionalNok, 0) * 100) / 100 : null;
    return {
      id: recipe.id,
      name: recipe.name,
      sourceRef: recipe.sourceRef ?? null,
      status: allergyState === 'CONFLICT' ? 'CONSTRAINT_CONFLICT' : unknown.length ? 'UNKNOWN' : missing.length ? 'NEEDS_ITEMS' : 'CAN_MAKE_WITH_REPORTED_STOCK',
      available, missing, unknown, allergyState,
      additionalPurchase: { state: costKnown ? (missing.length ? 'DATED_ESTIMATE' : 'NO_ADDITIONAL_ITEMS') : 'UNKNOWN', nok: additionalNok, purchases, limitation: 'Only additional purchases; not total meal cost. Dated observations are not a current checkout-price guarantee.' },
      budget: { state: budgetKnown ? (additionalNok === null ? 'UNKNOWN_COST' : additionalNok <= budgetNok ? 'ESTIMATE_WITHIN_BUDGET' : 'ESTIMATE_ABOVE_BUDGET') : 'UNKNOWN_BUDGET', nok: budgetKnown ? budgetNok : null },
      limitation: 'No nutrition, allergen safety, dietary, environmental, or actual savings claim is inferred from this matching result.'
    };
  });
}
