import { MAP, water } from './config.js';
// Shared 2 m navigation grid. A* is run per worker/formation, never per visual soldier.
export class Navigation {
  constructor() {
    this.w = MAP.width / MAP.cell;
    this.h = MAP.depth / MAP.cell;
    this.base = new Uint8Array(this.w * this.h);
    this.revision = 0;
    for (let z = 0; z < this.h; z++)
      for (let x = 0; x < this.w; x++)
        if (water(x * 2 + 1, z * 2 + 1)) this.base[z * this.w + x] = 1;
    this.dynamic = [this.base.slice(), this.base.slice()];
  }
  update(buildings, resources) {
    this.dynamic = [this.base.slice(), this.base.slice()];
    const stamp = (o, r, side) => {
      for (
        let z = Math.max(0, Math.floor((o.z - r) / 2));
        z <= Math.min(this.h - 1, Math.floor((o.z + r) / 2));
        z++
      )
        for (
          let x = Math.max(0, Math.floor((o.x - r) / 2));
          x <= Math.min(this.w - 1, Math.floor((o.x + r) / 2));
          x++
        )
          if (
            Math.abs(x * 2 + 1 - o.x) < r + 0.6 &&
            Math.abs(z * 2 + 1 - o.z) < r + 0.6
          )
            this.dynamic[side][z * this.w + x] = 1;
    };
    for (const b of buildings.filter((b) => b.hp > 0))
      for (let s = 0; s < 2; s++)
        if (b.type !== 'farm' && !(b.type === 'gate' && b.side === s))
          stamp(b, b.radius, s);
    for (const r of resources)
      if (r.amount > 0)
        for (let s = 0; s < 2; s++) stamp(r, r.radius * 0.55, s);
    this.revision++;
  }
  blocked(x, z, side = 0) {
    if (x < 1 || z < 1 || x >= MAP.width - 1 || z >= MAP.depth - 1) return true;
    return !!this.dynamic[side][Math.floor(z / 2) * this.w + Math.floor(x / 2)];
  }
  nearest(x, z, side) {
    x = Math.max(1, Math.min(MAP.width - 2, x));
    z = Math.max(1, Math.min(MAP.depth - 2, z));
    if (!this.blocked(x, z, side)) return { x, z };
    for (let r = 2; r < 18; r += 2)
      for (let a = 0; a < Math.PI * 2; a += 0.4) {
        const p = { x: x + Math.cos(a) * r, z: z + Math.sin(a) * r };
        if (!this.blocked(p.x, p.z, side)) return p;
      }
    return null;
  }
  find(start, end, side = 0) {
    const goal = this.nearest(end.x, end.z, side),
      begin = this.nearest(start.x, start.z, side);
    if (!goal || !begin) return [];
    const id = (p) => Math.floor(p.z / 2) * this.w + Math.floor(p.x / 2),
      s = id(begin),
      g = id(goal);
    if (s === g) return [goal];
    const size = this.w * this.h,
      score = new Float32Array(size).fill(Infinity),
      came = new Int32Array(size).fill(-1),
      closed = new Uint8Array(size),
      heap = [];
    const heur = (i) =>
      Math.hypot(
        (i % this.w) - (g % this.w),
        Math.floor(i / this.w) - Math.floor(g / this.w),
      );
    const push = (i, f) => {
      heap.push({ i, f });
      let k = heap.length - 1;
      while (k > 0) {
        let p = (k - 1) >> 1;
        if (heap[p].f <= f) break;
        [heap[p], heap[k]] = [heap[k], heap[p]];
        k = p;
      }
    };
    const pop = () => {
      const first = heap[0],
        last = heap.pop();
      if (heap.length) {
        heap[0] = last;
        let k = 0;
        while (true) {
          let j = k * 2 + 1;
          if (j >= heap.length) break;
          if (j + 1 < heap.length && heap[j + 1].f < heap[j].f) j++;
          if (heap[k].f <= heap[j].f) break;
          [heap[k], heap[j]] = [heap[j], heap[k]];
          k = j;
        }
      }
      return first.i;
    };
    score[s] = 0;
    push(s, heur(s));
    let found = false;
    while (heap.length) {
      const i = pop();
      if (closed[i]) continue;
      if (i === g) {
        found = true;
        break;
      }
      closed[i] = 1;
      let x = i % this.w,
        z = Math.floor(i / this.w);
      for (let dz = -1; dz <= 1; dz++)
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dz) continue;
          const nx = x + dx,
            nz = z + dz;
          if (nx < 0 || nz < 0 || nx >= this.w || nz >= this.h) continue;
          const n = nz * this.w + nx;
          if (this.dynamic[side][n] || closed[n]) continue;
          if (
            dx &&
            dz &&
            (this.dynamic[side][z * this.w + nx] ||
              this.dynamic[side][nz * this.w + x])
          )
            continue;
          const cost = score[i] + (dx && dz ? 1.414 : 1);
          if (cost < score[n]) {
            score[n] = cost;
            came[n] = i;
            push(n, cost + heur(n));
          }
        }
    }
    if (!found) return [];
    const path = [goal];
    for (let i = g; i !== s && i !== -1; i = came[i])
      path.push({ x: (i % this.w) * 2 + 1, z: Math.floor(i / this.w) * 2 + 1 });
    path.reverse();
    return path;
  }
}
