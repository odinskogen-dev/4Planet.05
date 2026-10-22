/** Pure serialisable simulation, no timers, Date.now or implicit Math.random. */
export function createTurnEngine({ initialState, systems, maxLog = 256 }) {
  if (!Array.isArray(systems)) throw Error('Systems array required');
  const names = new Set();
  for (const item of systems) {
    if (!item?.id || typeof item.apply !== 'function' || names.has(item.id)) throw Error('Invalid/duplicate system id');
    names.add(item.id);
  }
  let state = structuredClone(initialState);
  if (!Number.isSafeInteger(state.tick) || state.tick < 0) throw Error('State requires tick >= 0');
  const ordered = [...systems].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id.localeCompare(b.id));
  return {
    getState: () => structuredClone(state),
    advance(days = 1) {
      if (!Number.isSafeInteger(days) || days < 1 || days > 366) throw Error('Invalid number of days');
      for (let n = 0; n < days; n++) {
        const next = structuredClone(state);
        const events = [];
        next.tick += 1;
        for (const system of ordered) {
          const generated = system.apply(next, { tick: next.tick, emit: e => events.push({ tick: next.tick, system: system.id, ...e }) });
          if (generated && generated !== next) throw Error(`System ${system.id} returned unexpected state`);
        }
        next.events = [...(next.events ?? []), ...events].slice(-maxLog);
        state = next;
      }
      return this.getState();
    },
    replaceState(newState) {
      if (!Number.isSafeInteger(newState?.tick) || newState.tick < 0) throw Error('Invalid replacement state');
      state = structuredClone(newState);
    }
  };
}