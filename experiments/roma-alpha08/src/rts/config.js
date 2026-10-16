export const VERSION = 'RTS CORE 01 · 0.1.0';
export const MAP = { width: 180, depth: 160, cell: 2 };
export const RESOURCE = {
  food: { name: 'Food', color: '#dba54f' },
  wood: { name: 'Wood', color: '#79a67a' },
  stone: { name: 'Stone', color: '#adb7bd' },
  iron: { name: 'Iron', color: '#849bad' },
  coin: { name: 'Coin', color: '#efd77b' },
};
export const BUILDINGS = {
  town: {
    name: 'Town centre',
    cost: { wood: 180, stone: 100 },
    size: 5,
    hp: 1600,
    time: 35,
    desc: 'A new settlement. Trains workers; accepts deliveries.',
  },
  house: {
    name: 'House',
    cost: { wood: 45 },
    size: 2.5,
    hp: 300,
    time: 12,
    desc: '+8 population. Room for a growing village.',
  },
  farm: {
    name: 'Farm',
    cost: { wood: 55 },
    size: 3.5,
    hp: 280,
    time: 15,
    desc: 'Renewable food. Assign workers to harvest.',
  },
  lumber: {
    name: 'Lumber camp',
    cost: { wood: 45 },
    size: 2.8,
    hp: 350,
    time: 13,
    desc: 'Nearby wood deliveries; gather wood 30% faster.',
  },
  mine: {
    name: 'Mine',
    cost: { wood: 65, stone: 20 },
    size: 2.8,
    hp: 400,
    time: 16,
    desc: 'Nearby mineral deliveries; mining 30% faster.',
  },
  market: {
    name: 'Market',
    cost: { wood: 100, stone: 35 },
    size: 3.4,
    hp: 500,
    time: 22,
    desc: 'Sell 50 wood or food for 30 coin.',
  },
  barracks: {
    name: 'Barracks',
    cost: { wood: 100, stone: 35 },
    size: 3.5,
    hp: 650,
    time: 22,
    desc: 'Recruit line infantry, skirmishers and cavalry.',
  },
  workshop: {
    name: 'Workshop',
    cost: { wood: 130, stone: 70, iron: 35 },
    size: 3.5,
    hp: 550,
    time: 26,
    desc: 'Recruit artillery to break fortified positions.',
  },
  wall: {
    name: 'Wall',
    cost: { stone: 20 },
    size: 2,
    hp: 700,
    time: 8,
    desc: 'Blocks movement and incoming small-arms fire.',
  },
  gate: {
    name: 'Gate',
    cost: { wood: 30, stone: 20 },
    size: 2,
    hp: 600,
    time: 10,
    desc: 'Friendly troops pass. Enemy troops must breach.',
  },
  tower: {
    name: 'Watchtower',
    cost: { wood: 70, stone: 65 },
    size: 2,
    hp: 650,
    time: 22,
    desc: 'Long vision; fires at enemies in range.',
  },
};
export const TROOPS = {
  line: {
    name: 'Line infantry',
    short: 'LINE',
    men: 240,
    models: 24,
    cost: { food: 90, wood: 30, coin: 25 },
    time: 25,
    speed: 3,
    range: 14,
    damage: 12,
    morale: 100,
    hp: 240,
    pop: 4,
  },
  light: {
    name: 'Light infantry',
    short: 'LIGHT',
    men: 120,
    models: 16,
    cost: { food: 70, wood: 20, coin: 20 },
    time: 20,
    speed: 3.8,
    range: 17,
    damage: 8,
    morale: 85,
    hp: 160,
    pop: 3,
  },
  cavalry: {
    name: 'Cavalry',
    short: 'HORSE',
    men: 100,
    models: 12,
    cost: { food: 130, iron: 25, coin: 50 },
    time: 35,
    speed: 5.7,
    range: 3.7,
    damage: 23,
    morale: 100,
    hp: 300,
    pop: 5,
  },
  artillery: {
    name: 'Artillery',
    short: 'GUNS',
    men: 40,
    models: 4,
    cost: { wood: 100, iron: 70, coin: 60 },
    time: 40,
    speed: 2,
    range: 25,
    damage: 30,
    morale: 80,
    hp: 150,
    pop: 4,
  },
};
export function riverX(z) {
  return 91 + Math.sin(z * 0.043) * 8;
}
export function water(x, z) {
  return (
    Math.abs(x - riverX(z)) < 5.2 &&
    Math.abs(z - 48) > 5 &&
    Math.abs(z - 116) > 5 && (MAP.depth <= 160 || (Math.abs(z - 232) > 5 && Math.abs(z - 310) > 5))
  );
}
export function height(x, z) {
  const ridge = Math.exp(-((x - 124) ** 2 / 500 + (z - 107) ** 2 / 900)) * 6;
  const frontier = MAP.width <= 180 ? 0 : 8 * Math.exp(-((x-252)**2/2600+(z-136)**2/1650)) + 10 * Math.exp(-((x-320)**2/3900+(z-258)**2/2000));
  return 0.5 + ridge + frontier + Math.sin(x * 0.047) * 0.65 + Math.cos(z * 0.064) * 0.45;
}
export const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
export function rng(seed = 713) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  };
}
