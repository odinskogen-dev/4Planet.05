function number(n, name) {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0)
    throw new Error(`Invalid ${name}: resources must be finite non-negative numbers`);
  return n;
}
export function validateWallet(wallet) {
  if (!wallet || typeof wallet !== 'object' || Array.isArray(wallet)) throw Error('Invalid wallet');
  for (const [key, value] of Object.entries(wallet)) number(value, key);
  return true;
}
/** Atomic transaction; rejects unknown resources, insufficient funds and overflows. */
export function applyTransaction(wallet, change, { allowCreation = false } = {}) {
  validateWallet(wallet);
  if (!change || typeof change !== 'object' || Array.isArray(change)) throw Error('Invalid transaction');
  const next = { ...wallet };
  for (const [key, value] of Object.entries(change)) {
    if (!allowCreation && !Object.hasOwn(wallet, key)) return { ok: false, reason: `unknown:${key}`, wallet };
    if (!Number.isFinite(value)) throw Error(`Non-finite transaction: ${key}`);
    const balance = (next[key] ?? 0) + value;
    if (!Number.isFinite(balance)) throw Error(`Resource overflow: ${key}`);
    if (balance < 0) return { ok: false, reason: `insufficient:${key}`, wallet };
    next[key] = balance;
  }
  return { ok: true, wallet: next };
}
export function priceToTransaction(cost) {
  for (const [k, v] of Object.entries(cost)) number(v, k);
  return Object.fromEntries(Object.entries(cost).map(([k, v]) => [k, -v]));
}
/** Pure helper: mutate no settlement until a complete, affordable purchase is validated. */
export function purchase(wallet, cost) { return applyTransaction(wallet, priceToTransaction(cost)); }
export function forecast(wallet, dailyDeltas, days) {
  if (!Number.isSafeInteger(days) || days < 0 || days > 100000) throw Error('Invalid days');
  const delta = Object.fromEntries(Object.entries(dailyDeltas).map(([key, n]) => [key, n * days]));
  return applyTransaction(wallet, delta);
}