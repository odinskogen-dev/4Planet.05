import { applyTransaction } from './ledger.js';
/** Portable, deterministic province/settlement production; no historically fixed stats. */
export function productionForSettlement(settlement, definitions, turn = 0) {
  const wallet = {};
  const buildings = settlement.buildings ?? {};
  for (const [buildingId, count] of Object.entries(buildings)) {
    if (!Number.isSafeInteger(count) || count < 0) throw Error('Invalid building count');
    const definition = definitions[buildingId];
    if (!definition) throw Error(`Unknown building: ${buildingId}`);
    for (const [resource, amount] of Object.entries(definition.produces ?? {})) {
      if (!Number.isFinite(amount)) throw Error('Non-finite production');
      wallet[resource] = (wallet[resource] ?? 0) + amount * count;
    }
    for (const [resource, amount] of Object.entries(definition.consumes ?? {})) {
      if (!Number.isFinite(amount) || amount < 0) throw Error('Invalid consumption');
      wallet[resource] = (wallet[resource] ?? 0) - amount * count;
    }
  }
  const seasonal = settlement.seasonModifiers?.[turn % 4] ?? {};
  for (const [resource, factor] of Object.entries(seasonal)) {
    if (!Number.isFinite(factor) || factor < 0) throw Error('Invalid seasonal factor');
    wallet[resource] = (wallet[resource] ?? 0) * factor;
  }
  return wallet;
}
/** Execute a settlement daily turn atomically: debt is reported, not silently converted into gains. */
export function simulateSettlementDay(settlement, definitions, tick = 0) {
  const deltas = productionForSettlement(settlement, definitions, tick);
  const updated = applyTransaction(settlement.wallet ?? {}, deltas);
  if (!updated.ok) return { ok: false, reason: updated.reason, settlement };
  return { ok: true, settlement: { ...settlement, wallet: updated.wallet }, deltas };
}