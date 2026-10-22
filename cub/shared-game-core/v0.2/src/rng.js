/** Stable FNV-1a UTF-8 hash, suitable for deterministic IDs/checks, NOT cryptography. */
export function hash32(input) {
  const bytes = new TextEncoder().encode(String(input));
  let hash = 2166136261 >>> 0;
  for (const b of bytes) { hash ^= b; hash = Math.imul(hash, 16777619) >>> 0; }
  return hash >>> 0;
}
/** Portable deterministic generator: same seed => same sequence across browser and Node. */
export function seededRandom(seed) {
  let s = typeof seed === 'number' ? (seed >>> 0) : hash32(seed);
  if (s === 0) s = 0x6d2b79f5;
  return {
    next() {
      s ^= s << 13; s >>>= 0;
      s ^= s >>> 17; s >>>= 0;
      s ^= s << 5; s >>>= 0;
      return (s >>> 0) / 4294967296;
    },
    integer(min, max) {
      if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || min > max)
        throw new Error('Invalid random integer bounds');
      return min + Math.floor(this.next() * (max - min + 1));
    },
    pick(items) {
      if (!Array.isArray(items) || !items.length) throw new Error('Empty candidate list');
      return items[this.integer(0, items.length - 1)];
    },
    snapshot() { return s >>> 0; }
  };
}
export function deriveSeed(worldSeed, turn, system, entity = '') {
  return hash32([worldSeed, turn, system, entity].join('|'));
}