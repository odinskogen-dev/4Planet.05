import { hash32 } from './rng.js';
/** All CUB game scenarios can use this small shared envelope, with game-specific payloads. */
export function validateScenario(s) {
  const errors = [];
  if (!s || typeof s !== 'object') return ['scenario must be object'];
  if (s.schema !== 'cub.scenario.v1') errors.push('invalid schema');
  if (!s.id || !s.gameId || typeof s.id !== 'string') errors.push('missing stable id/gameId');
  if (!s.title || !s.start) errors.push('missing title/start');
  if (!['historical','reconstruction','fiction','simulation'].includes(s.truthStatus)) errors.push('truthStatus required');
  if (s.truthStatus === 'historical' && (!s.sources || !s.sources.length)) errors.push('historical scenario requires sources');
  if (s.factions && (!Array.isArray(s.factions) || !s.factions.every(f => typeof f.id === 'string' && f.id))) errors.push('invalid factions');
  if (s.objectives && (!Array.isArray(s.objectives) || !s.objectives.every(o => o.id && ['control','survive','resource','route'].includes(o.kind)))) errors.push('invalid objectives');
  return errors;
}
export function seedScenario(s) {
  const errors = validateScenario(s);
  if (errors.length) throw Error(errors.join(', '));
  // Reserve canonical envelope keys so scenario content cannot override identity or tick.
  const start = structuredClone(s.start);
  for (const reserved of ['scenarioId','gameId','tick','worldSeed','appliedBattleIds']) {
    if (Object.hasOwn(start,reserved)) throw Error(`Scenario start cannot override reserved key: ${reserved}`);
  }
  return { ...start, scenarioId: s.id, gameId: s.gameId, tick: 0, worldSeed: hash32([s.gameId,s.id].join(':')),
    completedObjectives: [], events: [], appliedBattleIds: [] };
}
/** Tiny goals evaluator, no engine state or external fetches. */
export function checkObjectives(objectives, snapshot) {
  return objectives.map(o => {
    let achieved = false;
    if (o.kind === 'resource') achieved = (snapshot.wallet?.[o.resource] ?? 0) >= o.minimum;
    if (o.kind === 'control') achieved = snapshot.settlements?.[o.settlementId]?.owner === o.factionId;
    if (o.kind === 'survive') achieved = snapshot.tick >= o.untilTick && (snapshot.armies ?? []).some(a => a.id === o.armyId && a.soldiers > 0);
    if (o.kind === 'route') achieved = Array.isArray(snapshot.activeRoutes) && snapshot.activeRoutes.includes(o.routeId);
    return { id: o.id, achieved };
  });
}