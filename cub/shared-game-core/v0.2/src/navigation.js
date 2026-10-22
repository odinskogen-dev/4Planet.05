/** Deterministic cheapest legal route. Node IDs are stable strings; travel weights >0. */
export function findRoute(roads, origin, destination, options = {}) {
  if (typeof origin !== 'string' || typeof destination !== 'string') throw Error('Bad route endpoints');
  if (origin === destination) return { path: [origin], cost: 0 };
  const blocked = new Set(options.blocked ?? []);
  const graph = new Map();
  for (const road of roads) {
    const { from, to, cost, bidirectional = true, id = `${road.from}|${road.to}` } = road;
    if (!from || !to || !Number.isFinite(cost) || cost <= 0) throw Error(`Invalid road ${id}`);
    if (blocked.has(id)) continue;
    if (!graph.has(from)) graph.set(from, []);
    graph.get(from).push({ to, cost });
    if (bidirectional) {
      if (!graph.has(to)) graph.set(to, []);
      graph.get(to).push({ to: from, cost });
    }
  }
  for (const links of graph.values()) links.sort((a, b) => a.to.localeCompare(b.to));
  const costs = new Map([[origin, 0]]), prev = new Map(), queue = [{ id: origin, cost: 0 }];
  while (queue.length) {
    queue.sort((a,b) => a.cost - b.cost || a.id.localeCompare(b.id));
    const best = queue.shift();
    if (best.cost !== costs.get(best.id)) continue;
    if (best.id === destination) {
      const path = [destination];
      let cur = destination;
      while (prev.has(cur)) { cur = prev.get(cur); path.unshift(cur); }
      return { path, cost: best.cost };
    }
    for (const edge of graph.get(best.id) ?? []) {
      const value = best.cost + edge.cost;
      if (value < (costs.get(edge.to) ?? Infinity)) {
        costs.set(edge.to, value);prev.set(edge.to, best.id);
        queue.push({ id: edge.to, cost: value });
      }
    }
  }
  return null;
}
export function marchProgress(march, tick) {
  if (!march || !Number.isFinite(march.departAt) || !Number.isFinite(march.arriveAt) ||
      march.arriveAt <= march.departAt) throw Error('Invalid marching interval');
  return Math.max(0, Math.min(1, (tick - march.departAt) / (march.arriveAt - march.departAt)));
}
export function interpolateCoordinates(start, end, fraction) {
  const t = Math.max(0, Math.min(1, fraction));
  return { x: start.x + (end.x - start.x) * t, y: start.y + (end.y - start.y) * t };
}