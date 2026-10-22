import { hash32 } from './rng.js';
/** JSON-only saves. FNV checksum detects accidents; it is NOT tamper-resistant. */
export function encodeSave({ gameId, version, state, writtenAt = null }) {
  if (!gameId || !Number.isSafeInteger(version) || version < 1) throw Error('Invalid save metadata');
  const payload = { gameId, version, writtenAt, state };
  const stable = JSON.stringify(payload);
  if (stable === undefined) throw Error('Unserialisable save');
  return JSON.stringify({ payload, checksum: hash32(stable) });
}
export function decodeSave(text, { gameId, currentVersion, migrate = {} }) {
  const envelope = JSON.parse(text);
  if (!envelope || !envelope.payload || !Number.isInteger(envelope.checksum)) throw Error('Malformed save');
  const { payload } = envelope;
  if (hash32(JSON.stringify(payload)) !== envelope.checksum) throw Error('Save checksum mismatch');
  if (payload.gameId !== gameId) throw Error('Save belongs to another game');
  if (payload.version > currentVersion) throw Error('Future save version; do not downgrade');
  let state = payload.state;
  if (!state || typeof state !== 'object' || Array.isArray(state)) throw Error('Invalid saved state');
  for (let version = payload.version; version < currentVersion; version++) {
    if (typeof migrate[version] !== 'function') throw Error(`Missing save migration ${version} -> ${version + 1}`);
    state = migrate[version](structuredClone(state));
  }
  return { state, migratedFrom: payload.version, currentVersion };
}
/** Browser integration only when explicitly called; no storage dependency in core. */
export function browserSaveAdapter(storage, namespace) {
  if (!storage || !namespace) throw Error('Storage and namespace required');
  return { load: key => storage.getItem(`${namespace}:${key}`),
    store: (key, value) => storage.setItem(`${namespace}:${key}`, value),
    remove: key => storage.removeItem(`${namespace}:${key}`) };
}