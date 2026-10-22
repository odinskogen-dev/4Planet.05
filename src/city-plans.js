(function () {
  'use strict';
  const COLS = 13;
  const ROWS = 11;
  const LABELS = Object.freeze({
    farm: 'FARMLAND',
    granary: 'GRAIN STORE',
    fort: 'REPUBLICAN WALL',
    woodlot: 'TIMBER CAMP',
    quarry: 'STONE QUARRY',
    market: 'MARKET',
    watchtower: 'WATCHTOWER'
  });
  const INITIAL_SPOTS = Object.freeze([
    [3, 3], [9, 7], [2, 7], [10, 3], [4, 8], [8, 2],
    [2, 4], [10, 6], [4, 2], [8, 8], [1, 7], [11, 3],
    [3, 8], [9, 2], [3, 5], [9, 5], [5, 2], [7, 8]
  ]);
  const WALL_SPOTS = Object.freeze([
    [1, 5], [11, 5], [6, 1], [6, 9],
    [2, 1], [10, 9], [1, 3], [11, 7],
    [1, 7], [11, 3], [4, 1], [8, 9]
  ]);
  function isEdge(x, y) {
    return x === 1 || y === 1 || x === COLS - 2 || y === ROWS - 2;
  }
  function validCoordinate(x, y) {
    return Number.isInteger(x) && Number.isInteger(y) &&
      x >= 1 && x <= COLS - 2 && y >= 1 && y <= ROWS - 2;
  }
  function isRoad(x, y) {
    return x === 6 || y === 5;
  }
  function placeable(layout, type, x, y) {
    if (!LABELS[type] || !validCoordinate(x, y)) return false;
    if (isRoad(x, y)) return false;
    if ((type === 'fort' || type === 'watchtower') && !isEdge(x, y)) return false;
    return !layout.structures.some(s => s.x === x && s.y === y);
  }
  function freeSpot(plan, type) {
    const pool = type === 'fort' || type === 'watchtower' ? WALL_SPOTS : INITIAL_SPOTS;
    for (const spot of pool) {
      if (placeable(plan, type, spot[0], spot[1])) return spot;
    }
    for (let y = 1; y < ROWS - 1; y++) {
      for (let x = 1; x < COLS - 1; x++) {
        if (placeable(plan, type, x, y)) return [x, y];
      }
    }
    return null;
  }
  function ensure(state, siteId) {
    if (!state.cityPlans) state.cityPlans = {};
    if (state.cityPlans[siteId]) return state.cityPlans[siteId];
    const city = state.settlements[siteId];
    if (!city) return null;
    const plan = { version: 1, siteId, structures: [], visualOnly: false };
    const seeded = [
      ['farm', city.farms || 0],
      ['granary', city.granaries || 0],
      ['market', city.markets || 0],
      ['woodlot', city.woodlots || 0],
      ['quarry', city.quarries || 0],
      ['fort', city.fort || 0],
      ['watchtower', city.watchtowers || 0]
    ];
    for (const [type, count] of seeded) {
      for (let i = 0; i < Math.min(20, count); i++) {
        const at = freeSpot(plan, type);
        if (!at) break;
        plan.structures.push({ id: type + '-seed-' + i, type, x: at[0], y: at[1], completed: true });
      }
    }
    state.cityPlans[siteId] = plan;
    return plan;
  }
  function construct(state, siteId, type, x, y) {
    const plan = ensure(state, siteId);
    if (!plan) return { ok: false, reason: 'Unknown town' };
    let chosen = [x, y];
    if (x === null || y === null || x === undefined || y === undefined) chosen = freeSpot(plan, type);
    if (!chosen || !placeable(plan, type, chosen[0], chosen[1])) {
      return { ok: false, reason: 'Choose an empty valid location; walls and towers belong along the perimeter' };
    }
    const placement = {
      id: type + '-' + (plan.structures.length + 1) + '-' + state.tick,
      type, x: chosen[0], y: chosen[1], completed: true
    };
    plan.structures.push(placement);
    return { ok: true, placement };
  }
  function defence(state, siteId) {
    const s = state.settlements[siteId];
    if (!s) return { wallSegments: 0, towers: 0, bonus: 0, protected: false };
    const walls = s.fort || 0;
    const towers = s.watchtowers || 0;
    return {
      wallSegments: walls,
      towers,
      bonus: Math.min(0.32, walls * 0.065 + towers * 0.04),
      protected: walls > 0
    };
  }
  window.ROMA_CITY_PLANS = Object.freeze({
    COLS, ROWS, LABELS, ensure, freeSpot, placeable, construct, defence, validCoordinate
  });
})();