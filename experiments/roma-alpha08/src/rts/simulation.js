import {
  BUILDINGS,
  TROOPS,
  distance,
  rng,
  water,
  height,
  MAP,
} from './config.js';
import { Navigation } from './navigation.js';
export class Simulation {
  constructor(seed = 713) {
    this.seed = seed;
    this.random = rng(seed);
    this.time = 0;
    this.id = 1;
    this.buildings = [];
    this.workers = [];
    this.armies = [];
    this.resources = [];
    this.effects = [];
    this.events = [];
    this.nav = new Navigation();
    this.winner = null;
    this.paused = false;
    this.losses = [0, 0];
    this.delivered = [0, 0];
    this.orders = 0;
    this.stock = [
      { food: 220, wood: 280, stone: 170, iron: 100, coin: 130 },
      { food: 200, wood: 260, stone: 160, iron: 90, coin: 100 },
    ];
    this.territories = [
      { id: 'west', name: 'Willowmere', x: 33, z: 101, owner: 0, progress: 0 },
      {
        id: 'ridge',
        name: 'Highmeadow',
        x: 119,
        z: 113,
        owner: -1,
        progress: 0,
      },
      { id: 'east', name: 'Redbank', x: 147, z: 43, owner: 1, progress: 0 },
    ];
    for (const side of [0, 1]) {
      const x = side ? 147 : 33,
        z = side ? 43 : 101;
      this.addBuilding('town', x, z, side, true);
      this.addBuilding('house', x - 10, z - 8, side, true);
      this.addBuilding('farm', x + 11, z + 2, side, true);
      for (let i = 0; i < 12; i++)
        this.addWorker(
          x - 8 + (i % 4) * 2,
          z + 8 + Math.floor(i / 4) * 2,
          side,
        );
    }
    for (const p of [
      { x: 22, z: 76, type: 'wood' },
      { x: 53, z: 121, type: 'wood' },
      { x: 60, z: 54, type: 'wood' },
      { x: 135, z: 24, type: 'wood' },
      { x: 159, z: 67, type: 'wood' },
      { x: 130, z: 135, type: 'wood' },
      { x: 25, z: 122, type: 'food' },
      { x: 164, z: 30, type: 'food' },
      { x: 56, z: 92, type: 'stone' },
      { x: 126, z: 63, type: 'stone' },
      { x: 61, z: 132, type: 'iron' },
      { x: 163, z: 53, type: 'iron' },
      { x: 119, z: 124, type: 'iron' },
      { x: 66, z: 39, type: 'stone' },
    ])
      this.resources.push({
        id: this.id++,
        kind: 'resource',
        ...p,
        radius: p.type === 'wood' ? 6 : 3,
        amount: 2500,
        max: 2500,
      });
    this.rebuildNav();
    for (const side of [0, 1]) {
      const ws = this.workers.filter((w) => w.side === side);
      ['wood', 'food', 'stone', 'iron'].forEach((type, j) => {
        const source = this.nearestResource(ws[0], type);
        ws.slice(j * 3, j * 3 + 3).forEach((w) => this.assignWorker(w, source));
      });
    }
    this.aiAt = 25;
    this.raidAt = 180;
    this.explored = new Uint8Array(MAP.width / MAP.cell * MAP.depth / MAP.cell);
    this.visible = new Uint8Array(MAP.width / MAP.cell * MAP.depth / MAP.cell);
    this.visionAt = 0;
    this.updateVision();
    this.log(
      'Your village is alive. Build a barracks and raise your first regiment.',
    );
  }
  log(text) {
    this.events.unshift({ text, time: this.time });
    this.events = this.events.slice(0, 30);
  }
  population(side) {
    return (
      this.workers.filter((w) => w.side === side && w.hp > 0).length +
      this.armies
        .filter((a) => a.side === side && a.hp > 0)
        .reduce((n, a) => n + TROOPS[a.type].pop, 0) +
      this.buildings
        .filter((b) => b.side === side)
        .reduce(
          (n, b) =>
            n +
            b.queue.reduce(
              (v, q) => v + (q.type === 'worker' ? 1 : TROOPS[q.type].pop),
              0,
            ),
          0,
        )
    );
  }
  capacity(side) {
    return this.buildings
      .filter((b) => b.side === side && b.hp > 0 && b.progress >= 1)
      .reduce(
        (n, b) => n + (b.type === 'town' ? 20 : b.type === 'house' ? 8 : 0),
        0,
      );
  }
  canPay(cost, side = 0) {
    return Object.entries(cost).every(([k, v]) => this.stock[side][k] >= v);
  }
  pay(cost, side = 0) {
    if (!this.canPay(cost, side)) return false;
    for (const [k, v] of Object.entries(cost)) this.stock[side][k] -= v;
    return true;
  }
  addBuilding(type, x, z, side, complete = false) {
    const d = BUILDINGS[type],
      b = {
        id: this.id++,
        kind: 'building',
        type,
        x,
        z,
        side,
        radius: d.size,
        hp: d.hp,
        maxHp: d.hp,
        progress: complete ? 1 : 0,
        queue: [],
        shot: 0,
      };
    this.buildings.push(b);
    return b;
  }
  addWorker(x, z, side) {
    const w = {
      id: this.id++,
      kind: 'worker',
      x,
      z,
      side,
      hp: 45,
      maxHp: 45,
      source: null,
      task: null,
      path: [],
      carry: 0,
      resource: 'wood',
      phase: 'idle',
      gather: 0,
      repath: 0,
      angle: 0,
    };
    this.workers.push(w);
    return w;
  }
  addArmy(type, x, z, side) {
    const d = TROOPS[type],
      a = {
        id: this.id++,
        kind: 'army',
        type,
        x,
        z,
        side,
        hp: d.hp,
        maxHp: d.hp,
        morale: d.morale,
        mode: 'line',
        state: 'steady',
        path: [],
        angle: side ? -Math.PI / 2 : Math.PI / 2,
        target: null,
        shot: 0,
        repath: 0,
        hold: false,
        number: this.armies.filter((a) => a.side === side).length + 1,
      };
    this.armies.push(a);
    return a;
  }
  rebuildNav() {
    this.nav.update(this.buildings, this.resources);
  }
  nearestResource(w, type) {
    return [
      ...this.resources.filter((r) => r.type === type && r.amount > 0),
      ...this.buildings.filter(
        (b) =>
          b.type === 'farm' &&
          b.side === w.side &&
          b.progress >= 1 &&
          type === 'food',
      ),
    ].sort((a, b) => distance(w, a) - distance(w, b))[0];
  }
  assignWorker(w, r) {
    if (!r) return;
    w.source = r.id;
    w.resource = r.type === 'farm' ? 'food' : r.type;
    w.task = null;
    w.phase = 'gather';
    w.path = [];
    w.repath = 0;
  }
  assign(type, count = 3, side = 0) {
    const available = this.workers
      .filter((w) => w.side === side && w.hp > 0 && !w.task)
      .sort((a, b) => (a.resource === type) - (b.resource === type));
    const chosen = available.slice(0, count);
    for (const w of chosen) this.assignWorker(w, this.nearestResource(w, type));
    if (side === 0) this.log(`${chosen.length} workers assigned to ${type}.`);
    return chosen.length;
  }
  assignSource(source, count = 3) {
    const ws = this.workers
      .filter((w) => w.side === 0 && w.hp > 0 && !w.task)
      .sort(
        (a, b) =>
          (a.source === source.id) - (b.source === source.id) ||
          distance(a, source) - distance(b, source),
      )
      .slice(0, count);
    ws.forEach((w) => this.assignWorker(w, source));
    this.log(
      `${ws.length} workers assigned. They gather and deliver automatically.`,
    );
  }
  placement(type, x, z, side = 0) {
    const d = BUILDINGS[type];
    if (x < 8 || z < 8 || x > MAP.width - 8 || z > MAP.depth - 8) return 'Outside buildable land';
    for (let dx = -d.size; dx <= d.size; dx += 2)
      for (let dz = -d.size; dz <= d.size; dz += 2)
        if (water(x + dx, z + dz)) return 'Cannot build in the river';
    if (
      this.buildings.some(
        (b) => b.hp > 0 && distance(b, { x, z }) < b.radius + d.size + 1,
      )
    )
      return 'Too close to another building';
    if (
      this.resources.some(
        (r) => r.amount > 0 && distance(r, { x, z }) < r.radius + d.size + 1,
      )
    )
      return 'Keep resource access clear';
    if (
      !this.buildings.some(
        (b) => b.side === side && b.hp > 0 && distance(b, { x, z }) < 42,
      ) &&
      !this.territories.some(
        (t) => t.owner === side && distance(t, { x, z }) < 24,
      )
    )
      return 'Build near your settlement or captured territory';
    if (!this.workers.some((w) => w.side === side && w.hp > 0))
      return 'No builders available';
    if (!this.canPay(d.cost, side)) return 'Not enough resources';
    return '';
  }
  build(type, x, z, side = 0) {
    const error = this.placement(type, x, z, side);
    if (error) return { error };
    this.pay(BUILDINGS[type].cost, side);
    const b = this.addBuilding(type, x, z, side);
    this.rebuildNav();
    const workers = this.workers
      .filter((w) => w.side === side && w.hp > 0 && !w.task)
      .sort((a, c) => distance(a, b) - distance(c, b))
      .slice(0, 3);
    if (!workers.length) {
      this.buildings.pop();
      for (const [k, v] of Object.entries(BUILDINGS[type].cost))
        this.stock[side][k] += v;
      this.rebuildNav();
      return { error: 'Builders are busy; wait for construction to finish' };
    }
    workers.forEach((w) => {
      w.task = b.id;
      w.phase = 'build';
      w.path = [];
      w.repath = 0;
    });
    if (side === 0)
      this.log(
        `${BUILDINGS[type].name} foundation placed. ${workers.length} builders on the way.`,
      );
    return { building: b };
  }
  repair(b) {
    const ws = this.workers
      .filter((w) => w.side === b.side && w.hp > 0 && !w.task)
      .sort((a, c) => distance(a, b) - distance(c, b))
      .slice(0, 3);
    ws.forEach((w) => {
      w.task = b.id;
      w.phase = 'repair';
      w.path = [];
      w.repath = 0;
    });
    this.log(`${ws.length} workers repairing ${BUILDINGS[b.type].name}.`);
  }
  recruit(b, type) {
    if (b.progress < 1) return 'Finish construction first';
    if (b.queue.length >= 5) return 'Queue is full';
    if (
      (type === 'worker' && b.type !== 'town') ||
      (type === 'artillery' && b.type !== 'workshop') ||
      (type !== 'worker' && type !== 'artillery' && b.type !== 'barracks')
    )
      return 'Wrong production building';
    const d =
      type === 'worker'
        ? { cost: { food: 40 }, pop: 1, time: 12 }
        : TROOPS[type];
    if (this.population(b.side) + d.pop > this.capacity(b.side))
      return 'Build a house for more population';
    if (!this.pay(d.cost, b.side)) return 'Not enough resources';
    b.queue.push({ type, left: d.time, total: d.time });
    if (b.side === 0)
      this.log(`${type === 'worker' ? 'Worker' : d.name} queued.`);
    return '';
  }
  cancelQueue(b) {
    const q = b.queue.pop();
    if (!q) return;
    const cost = q.type === 'worker' ? { food: 40 } : TROOPS[q.type].cost;
    for (const [k, v] of Object.entries(cost)) this.stock[b.side][k] += v;
    this.log('Last queued unit cancelled. Resources refunded.');
  }
  trade(resource) {
    if (
      !this.buildings.some(
        (b) =>
          b.type === 'market' && b.side === 0 && b.progress >= 1 && b.hp > 0,
      )
    )
      return 'Build a market first';
    if (this.stock[0][resource] < 50) return 'You need 50 ' + resource;
    this.stock[0][resource] -= 50;
    this.stock[0].coin += 30;
    return '';
  }
  move(a, p, target = null) {
    a.hold = false;
    a.target = target?.id ?? null;
    a.path = this.nav.find(a, p, a.side);
    a.repath = 2;
    this.orders++;
    if (!a.path.length) return false;
    this.effects.push({ kind: 'order', x: p.x, z: p.z, life: 1.5 });
    return true;
  }
  retreat(a) {
    const home = this.buildings.find(
      (b) => b.side === a.side && b.type === 'town' && b.hp > 0,
    );
    if (home) {
      this.move(a, { x: home.x - 8, z: home.z + 10 });
      a.state = 'retreating';
      a.target = null;
    }
  }
  object(id) {
    return (
      this.buildings.find((b) => b.id === id) ||
      this.resources.find((r) => r.id === id) ||
      this.armies.find((a) => a.id === id) ||
      this.workers.find((w) => w.id === id)
    );
  }
  walk(o, dt, speed) {
    if (!o.path.length) return false;
    const p = o.path[0];
    if (this.nav.blocked(p.x, p.z, o.side)) {
      o.path = [];
      o.repath = 0;
      return false;
    }
    const d = distance(o, p);
    if (d < speed * dt + 0.1) {
      o.x = p.x;
      o.z = p.z;
      o.path.shift();
    } else {
      o.x += ((p.x - o.x) / d) * speed * dt;
      o.z += ((p.z - o.z) / d) * speed * dt;
    }
    o.angle = Math.atan2(p.x - o.x, p.z - o.z) || o.angle;
    return true;
  }
  approach(w, p, dt, speed, radius) {
    if (distance(w, p) < radius) {
      w.path = [];
      return true;
    }
    if (!w.path.length && w.repath <= 0) {
      w.path = this.nav.find(w, p, w.side);
      w.repath = 3;
    }
    this.walk(w, dt, speed);
    return false;
  }
  updateWorker(w, dt) {
    if (w.hp <= 0) return;
    w.repath -= dt;
    if (w.task) {
      const b = this.object(w.task);
      if (
        !b ||
        b.hp <= 0 ||
        (b.progress >= 1 && w.phase === 'build') ||
        (b.hp >= b.maxHp && w.phase === 'repair')
      ) {
        w.task = null;
        w.phase = 'gather';
        w.path = [];
        return;
      }
      if (this.approach(w, b, dt, 3.5, b.radius + 3)) {
        if (w.phase === 'build') {
          b.progress = Math.min(
            1,
            b.progress + dt / BUILDINGS[b.type].time / 2,
          );
          if (b.progress >= 1) {
            this.effects.push({ kind: 'built', x: b.x, z: b.z, life: 2 });
            if (b.side === 0) this.log(`${BUILDINGS[b.type].name} completed.`);
          }
        } else if (this.stock[w.side].wood > dt * 0.5) {
          b.hp = Math.min(b.maxHp, b.hp + dt * 9);
          this.stock[w.side].wood -= dt * 0.5;
        }
      }
      return;
    }
    let r = this.object(w.source);
    if (!r || r.hp <= 0 || r.amount === 0) {
      r = this.nearestResource(w, w.resource);
      if (r) this.assignWorker(w, r);
      else {
        w.phase = 'idle';
        return;
      }
    }
    if (w.phase === 'deliver') {
      const drop = this.buildings
        .filter(
          (b) =>
            b.side === w.side &&
            b.hp > 0 &&
            b.progress >= 1 &&
            (b.type === 'town' ||
              (b.type === 'lumber' && w.resource === 'wood') ||
              (b.type === 'mine' && ['iron', 'stone'].includes(w.resource))),
        )
        .sort((a, b) => distance(w, a) - distance(w, b))[0];
      if (!drop) return;
      if (this.approach(w, drop, dt, 3.8, drop.radius + 3)) {
        this.stock[w.side][w.resource] += w.carry;
        this.delivered[w.side] += w.carry;
        w.carry = 0;
        w.phase = 'gather';
        w.path = [];
        w.repath = 0;
      }
      return;
    }
    if (this.approach(w, r, dt, 3.8, (r.radius || 3) + 3)) {
      let rate = 1.6;
      const boost = this.buildings.some(
        (b) =>
          b.side === w.side &&
          b.progress >= 1 &&
          distance(b, r) < 22 &&
          ((b.type === 'lumber' && w.resource === 'wood') ||
            (b.type === 'mine' && ['stone', 'iron'].includes(w.resource))),
      );
      if (boost) rate *= 1.3;
      const amount = Math.min(rate * dt, 12 - w.carry, r.amount ?? Infinity);
      w.carry += amount;
      if (r.amount !== undefined) r.amount = Math.max(0, r.amount - amount);
      if (w.carry >= 11.99 || r.amount === 0) {
        w.phase = 'deliver';
        w.path = [];
        w.repath = 0;
      }
    }
  }
  lineOfSight(a, b) {
    const d = distance(a, b);
    for (let t = 2; t < d - 2; t += 2) {
      const x = a.x + ((b.x - a.x) * t) / d,
        z = a.z + ((b.z - a.z) * t) / d;
      if (
        this.buildings.some(
          (o) =>
            o.hp > 0 &&
            ['wall', 'gate', 'tower'].includes(o.type) &&
            o.id !== b.id &&
            distance(o, { x, z }) < o.radius,
        )
      )
        return false;
    }
    return true;
  }
  damage(target, amount, morale = 0) {
    target.hp -= amount;
    if (target.morale !== undefined) target.morale -= morale;
    if (target.hp <= 0) {
      target.hp = 0;
      if (target.kind === 'army') {
        this.losses[target.side]++;
        this.log(
          `${target.side === 0 ? 'Your' : 'Enemy'} ${TROOPS[target.type].name} was defeated.`,
        );
      }
      if (target.kind === 'building') {
        this.rebuildNav();
        this.log(
          `${target.side === 0 ? 'Your' : 'Enemy'} ${BUILDINGS[target.type].name} was destroyed.`,
        );
        if (
          target.type === 'town' &&
          !this.buildings.some(
            (b) =>
              b !== target &&
              b.side === target.side &&
              b.type === 'town' &&
              b.hp > 0,
          )
        ) {
          this.winner = 1 - target.side;
          this.log(
            this.winner === 0
              ? 'Redbank has fallen. The valley is yours.'
              : 'Willowmere has fallen. Your settlement was overrun.',
          );
        }
      }
    }
  }
  updateArmy(a, dt) {
    if (a.hp <= 0) return;
    const d = TROOPS[a.type];
    a.shot -= dt;
    a.repath -= dt;
    if (a.morale < 17 && a.state !== 'routing') {
      a.state = 'routing';
      a.target = null;
      this.retreat(a);
      a.state = 'routing';
      if (a.side === 0)
        this.log('A regiment broke. Rally it near your town centre.');
    }
    if (a.state === 'routing' || a.state === 'retreating') {
      this.walk(a, dt, d.speed * 1.3);
      a.morale = Math.min(d.morale, a.morale + dt * 1.7);
      if (!a.path.length && a.morale > 45) a.state = 'steady';
      return;
    }
    a.state = a.morale < 40 ? 'wavering' : 'steady';
    a.morale = Math.min(d.morale, a.morale + dt * 0.8);
    let target = this.object(a.target);
    if (!target || target.hp <= 0 || target.side === a.side) target = null;
    if (!target) {
      target = this.armies
        .filter(
          (o) =>
            o.side !== a.side &&
            o.hp > 0 &&
            o.state !== 'routing' &&
            distance(a, o) < d.range + 6,
        )
        .sort((p, q) => distance(a, p) - distance(a, q))[0];
    }
    if (!target)
      target = this.buildings.find(
        (o) =>
          o.side !== a.side && o.hp > 0 && distance(a, o) < d.range + o.radius,
      );
    if (target) {
      let range = d.range + (target.radius || 0),
        dist = distance(a, target);
      if (dist <= range && this.lineOfSight(a, target)) {
        a.path = [];
        const desired = Math.atan2(target.x - a.x, target.z - a.z),
          turn = Math.atan2(
            Math.sin(desired - a.angle),
            Math.cos(desired - a.angle),
          );
        a.angle += Math.max(-dt * 1.8, Math.min(dt * 1.8, turn));
        if (a.shot <= 0 && Math.abs(turn) < 0.4) {
          a.shot =
            a.type === 'artillery' ? 7 : a.type === 'cavalry' ? 2.8 : 3.7;
          const incoming = Math.atan2(a.x - target.x, a.z - target.z);
          const flank =
            target.kind === 'army' && Math.cos(incoming - target.angle) < -0.2
              ? 1.45
              : 1;
          const elevation =
            height(a.x, a.z) - height(target.x, target.z) > 2 ? 1.18 : 1;
          const cover =
            target.mode === 'skirmish' && a.type !== 'cavalry' ? 0.7 : 1;
          let damage =
            d.damage *
            (0.4 + (0.6 * a.hp) / a.maxHp) *
            flank *
            elevation *
            cover *
            (a.mode === 'column' ? 0.65 : 1);
          if (target.kind === 'building')
            damage *= a.type === 'artillery' ? 3 : 0.55;
          this.damage(target, damage, damage * 0.6 * flank);
          this.effects.push({
            kind: a.type === 'artillery' ? 'cannon' : 'shot',
            x: a.x,
            z: a.z,
            tx: target.x,
            tz: target.z,
            life: 0.45,
          });
        }
        return;
      } else if (a.target && !a.hold && a.repath <= 0) {
        a.path = this.nav.find(a, target, a.side);
        a.repath = 3;
      }
    }
    this.walk(
      a,
      dt,
      d.speed * (a.mode === 'column' ? 1.25 : a.mode === 'skirmish' ? 1.07 : 1),
    );
    const home = this.buildings.some(
      (b) =>
        b.type === 'town' &&
        b.side === a.side &&
        b.hp > 0 &&
        distance(a, b) < 18,
    );
    if (home && a.hp < a.maxHp && this.stock[a.side].food > dt * 0.8) {
      a.hp = Math.min(a.maxHp, a.hp + dt * 1.6);
      this.stock[a.side].food -= dt * 0.8;
    }
  }
  updateVision() {
    this.visible.fill(0);
    const sources = [
      ...this.buildings.filter((b) => b.side === 0 && b.hp > 0),
      ...this.workers.filter((w) => w.side === 0 && w.hp > 0),
      ...this.armies.filter((a) => a.side === 0 && a.hp > 0),
    ];
    for (const o of sources) {
      const r = o.type === 'tower' ? 30 : o.kind === 'worker' ? 17 : 25;
      for (
        let z = Math.max(0, Math.floor((o.z - r) / 2));
        z < Math.min(MAP.depth / MAP.cell, (o.z + r) / 2);
        z++
      )
        for (
          let x = Math.max(0, Math.floor((o.x - r) / 2));
          x < Math.min(MAP.width / MAP.cell, (o.x + r) / 2);
          x++
        )
          if (Math.hypot(x * 2 - o.x, z * 2 - o.z) < r) {
            this.visible[z * (MAP.width / MAP.cell) + x] = 1;
            this.explored[z * (MAP.width / MAP.cell) + x] = 1;
          }
    }
  }
  seen(o) {
    return !!this.visible[
      Math.min(MAP.depth / MAP.cell - 1, Math.max(0, Math.floor(o.z / MAP.cell))) * (MAP.width / MAP.cell) +
        Math.min(MAP.width / MAP.cell - 1, Math.max(0, Math.floor(o.x / MAP.cell)))
    ];
  }
  ai() {
    const side = 1,
      home = this.buildings.find(
        (b) => b.side === 1 && b.type === 'town' && b.hp > 0,
      );
    if (!home) return;
    const owned = this.buildings.filter((b) => b.side === 1 && b.hp > 0);
    const want = !owned.some((b) => b.type === 'barracks')
      ? 'barracks'
      : this.population(1) > this.capacity(1) - 7
        ? 'house'
        : !owned.some((b) => b.type === 'tower')
          ? 'tower'
          : !owned.some((b) => b.type === 'market')
            ? 'market'
            : !owned.some((b) => b.type === 'workshop')
              ? 'workshop'
              : null;
    if (want)
      for (let i = 0; i < 12; i++) {
        const a = this.random() * Math.PI * 2,
          r = 13 + this.random() * 13;
        const result = this.build(
          want,
          home.x + Math.cos(a) * r,
          home.z + Math.sin(a) * r,
          1,
        );
        if (result.building) break;
      }
    for (const b of owned.filter(
      (b) => b.progress >= 1 && b.queue.length < 1,
    )) {
      if (
        b.type === 'barracks' &&
        this.armies.filter((a) => a.side === 1 && a.hp > 0).length < 8
      )
        this.recruit(b, this.random() < 0.3 ? 'light' : 'line');
      if (
        b.type === 'workshop' &&
        this.armies.filter(
          (a) => a.side === 1 && a.hp > 0 && a.type === 'artillery',
        ).length < 2
      )
        this.recruit(b, 'artillery');
      if (
        b.type === 'town' &&
        this.workers.filter((w) => w.side === 1).length < 16
      )
        this.recruit(b, 'worker');
    }
    // Rival pays the same costs and must finish a market before trading.
    if (
      owned.some((b) => b.type === 'market' && b.progress >= 1) &&
      this.stock[1].wood > 90 &&
      this.stock[1].coin < 80
    ) {
      this.stock[1].wood -= 50;
      this.stock[1].coin += 30;
    }
    if (
      this.territories[1].owner === 1 &&
      !owned.some(
        (b) => b.type === 'barracks' && distance(b, this.territories[1]) < 30,
      )
    )
      this.build('barracks', 111, 104, 1);
    if (this.time > this.raidAt) {
      const army = this.armies.filter(
        (a) => a.side === 1 && a.hp > 0 && a.state !== 'routing',
      );
      const target = this.buildings.find(
        (b) => b.side === 0 && b.type === 'town' && b.hp > 0,
      );
      army.forEach((a, i) => {
        if (i === 0 && this.territories[1].owner !== 1)
          this.move(a, this.territories[1]);
        else if (target) this.move(a, target, target);
      });
      this.raidAt = this.time + 95;
      if (army.length)
        this.log(
          'Scouts report Redbank regiments moving towards the crossings.',
        );
    }
  }
  step(dt) {
    if (this.paused || this.winner !== null) return;
    this.time += dt;
    this.effects.forEach((e) => (e.life -= dt));
    this.effects = this.effects.filter((e) => e.life > 0);
    this.workers.forEach((w) => this.updateWorker(w, dt));
    this.armies.forEach((a) => this.updateArmy(a, dt));
    for (const b of this.buildings) {
      if (b.hp <= 0 || b.progress < 1) continue;
      if (b.queue.length) {
        const q = b.queue[0];
        q.left -= dt;
        if (q.left <= 0) {
          const spawn = this.nav.nearest(b.x, b.z + b.radius + 5, b.side);
          if (spawn) {
            if (q.type === 'worker') {
              const w = this.addWorker(spawn.x, spawn.z, b.side);
              this.assignWorker(w, this.nearestResource(w, 'wood'));
            } else this.addArmy(q.type, spawn.x, spawn.z, b.side);
            b.queue.shift();
            if (b.side === 0)
              this.log(
                `${q.type === 'worker' ? 'Worker' : TROOPS[q.type].name} ready.`,
              );
          }
        }
      }
      if (b.type === 'tower' || b.type === 'town') {
        b.shot -= dt;
        const target = this.armies.find(
          (a) =>
            a.side !== b.side &&
            a.hp > 0 &&
            distance(a, b) < (b.type === 'tower' ? 25 : 18),
        );
        if (target && b.shot <= 0 && this.lineOfSight(b, target)) {
          b.shot = 3;
          this.damage(target, b.type === 'tower' ? 12 : 8, 4);
          this.effects.push({
            kind: 'shot',
            x: b.x,
            z: b.z,
            tx: target.x,
            tz: target.z,
            life: 0.35,
          });
        }
      }
    }
    for (const t of this.territories) {
      const sides = [0, 1].filter((s) =>
        this.armies.some(
          (a) =>
            a.side === s &&
            a.hp > 0 &&
            a.state !== 'routing' &&
            distance(a, t) < 12,
        ),
      );
      if (sides.length === 1 && sides[0] !== t.owner) {
        const side = sides[0];
        if (t.capturing !== side) {
          t.progress = 0;
          t.capturing = side;
        }
        t.progress += dt;
        if (t.progress >= 18) {
          t.owner = side;
          t.progress = 0;
          this.log(
            `${t.name} captured by ${side === 0 ? 'Willowmere' : 'Redbank'}. Forward building unlocked.`,
          );
        }
      } else t.progress = Math.max(0, t.progress - dt);
      if (t.owner >= 0)
        this.stock[t.owner].coin += dt * (t.id === 'ridge' ? 0.8 : 0.22);
    }
    if (this.time >= this.aiAt) {
      this.ai();
      this.aiAt = this.time + 12;
    }
    if (this.time >= this.visionAt) {
      this.updateVision();
      this.visionAt = this.time + 0.6;
    }
  }
  serialize() {
    const data = {};
    for (const k of [
      'seed',
      'time',
      'id',
      'buildings',
      'workers',
      'armies',
      'resources',
      'stock',
      'territories',
      'events',
      'winner',
      'losses',
      'delivered',
      'orders',
      'aiAt',
      'raidAt',
    ])
      data[k] = this[k];
    data.explored = Array.from(this.explored);
    return data;
  }
  static restore(data) {
    if (!data || !Array.isArray(data.buildings) || !Array.isArray(data.stock))
      throw new Error('Invalid save');
    const s = new Simulation(data.seed);
    Object.assign(s, data);
    s.effects = [];
    s.explored = Uint8Array.from(data.explored);
    s.visible = new Uint8Array(MAP.width / MAP.cell * MAP.depth / MAP.cell);
    s.rebuildNav();
    s.updateVision();
    return s;
  }
}
