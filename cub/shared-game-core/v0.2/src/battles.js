/** Generic battle contract. This module never runs or modifies a tactical game engine. */
export function validateBattleContext(ctx) {
  const errors = [];
  if (!ctx || typeof ctx !== 'object') return ['context missing'];
  if (ctx.schema !== 'cub.battle.context.v1') errors.push('unsupported context schema');
  if (!ctx.battleId || typeof ctx.battleId !== 'string') errors.push('battleId missing');
  if (!ctx.location?.id || !Number.isFinite(ctx.location.lon) || !Number.isFinite(ctx.location.lat)) errors.push('invalid location');
  if (!Array.isArray(ctx.participants) || ctx.participants.length < 2) errors.push('two or more participants required');
  for (const p of ctx.participants ?? []) {
    if (!p.armyId || !p.factionId || !Number.isSafeInteger(p.soldiers) || p.soldiers < 0) errors.push('invalid participant');
  }
  if (ctx.settlement && (!Array.isArray(ctx.settlement.structures) || !ctx.settlement.id)) errors.push('invalid city projection');
  return errors;
}
/** Normalise player city construction into future siege geometry input, without inventing damage or a navmesh. */
export function cityToSiegeContext({ settlementId, cityPlan, defence = {}, location = null }) {
  if (!settlementId || !cityPlan || !Array.isArray(cityPlan.structures)) throw Error('No city plan');
  const structures = cityPlan.structures.map(s => {
    if (!s.id || !s.type || !Number.isFinite(s.x) || !Number.isFinite(s.y)) throw Error('Bad city structure');
    return {
      structureId: s.id,
      prefabId: s.type,
      location: { gridX: s.x, gridY: s.y },
      buildComplete: s.completed === true,
      tacticalColliderStatus: 'NOT_GENERATED',
      damageState: 'NOT_IMPLEMENTED',
      historicalConfidence: 'GAMEPLAY_LAYOUT'
    };
  });
  return { id: settlementId, location, planVersion: cityPlan.version ?? 1, structures,
    defensiveScoreBonus: defence.bonus ?? 0,
    wallConnectivity: 'NOT_SOLVED', historicalAccuracy: 'NOT_A_SURVEY',
    tacticalGeometryStatus: 'PREFABS_NOT_RESOLVED', siegeNavigationStatus: 'NOT_BUILT' };
}
/** Validate result strictly before any campaign mutation. */
export function validateBattleResult(ctx, result) {
  const errors = validateBattleContext(ctx);
  if (!result || result.schema !== 'cub.battle.result.v1') return [...errors, 'invalid result schema'];
  if (ctx.battleId !== result.battleId) errors.push('battle id mismatch');
  if (!Array.isArray(result.casualties) || result.casualties.length !== ctx.participants.length) errors.push('incomplete casualties');
  const seen = new Set();
  for (const loss of result.casualties ?? []) {
    if (!loss || seen.has(loss.armyId)) { errors.push('duplicate/missing army casualty'); continue; }
    seen.add(loss.armyId);
    const party = ctx.participants.find(p => p.armyId === loss.armyId);
    if (!party || !Number.isSafeInteger(loss.killed) || loss.killed < 0 || loss.killed > party.soldiers) errors.push(`invalid casualties for ${loss.armyId}`);
  }
  if (!ctx.participants.some(p => p.armyId === result.winnerArmyId) && result.winnerArmyId !== null)
    errors.push('winner must be a participant or null');
  return errors;
}
/** Idempotent application; preserves current strategic ownership and leaves territorial consequences to game-specific rules. */
export function applyBattleResult(campaign, ctx, result) {
  const errors = validateBattleResult(ctx, result);
  if (errors.length) return { ok: false, errors, state: campaign };
  if (campaign.appliedBattleIds?.includes(result.battleId))
    return { ok: true, duplicate: true, state: campaign };
  const next = structuredClone(campaign);
  if (!Array.isArray(next.armies)) return { ok: false, errors: ['campaign armies missing'], state: campaign };
  for (const p of ctx.participants) {
    const army = next.armies.find(a => a.id === p.armyId);
    if (!army) return { ok: false, errors: [`army ${p.armyId} no longer exists`], state: campaign };
    if (!Number.isSafeInteger(army.soldiers) || army.soldiers !== p.soldiers)
      return { ok: false, errors: [`army ${p.armyId} changed since context creation`], state: campaign };
  }
  for (const record of result.casualties) {
    const army = next.armies.find(a => a.id === record.armyId);
    army.soldiers -= record.killed;
    army.experience = Math.min(100, Math.max(0, (army.experience ?? 0) + (record.armyId === result.winnerArmyId ? 5 : 1)));
  }
  next.appliedBattleIds = [...(next.appliedBattleIds ?? []), result.battleId];
  next.lastBattle = { battleId: result.battleId, winnerArmyId: result.winnerArmyId };
  return { ok: true, duplicate: false, state: next };
}