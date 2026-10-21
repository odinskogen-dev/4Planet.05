const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const sourcePath = path.join(__dirname, '..', 'source', '4sapien-live-hardening.js');
const source = fs.readFileSync(sourcePath, 'utf8').replace(
  /\n\}\)\(\);\s*$/,
  '\nwindow.__noteAuthTest={handleAuthChange,updateNote,addNote};\n})();\n',
);

const input = { value: '' };
const state = { textContent: '' };
const eventUsers = [];
const memoryUsers = [];
let heldMutation = null;
let releaseMutation = null;

const context = {
  console,
  Promise,
  URLSearchParams,
  setTimeout,
  clearTimeout,
  location: { pathname: '/app/food/' },
  localStorage: {
    length: 1,
    key: () => 'sb-test-auth-token',
    getItem: () => JSON.stringify({ access_token: 'test-token' }),
  },
  sessionStorage: { getItem: () => null, setItem: () => {} },
  document: {
    readyState: 'loading',
    body: { classList: { contains: () => false }, appendChild: () => {} },
    addEventListener: () => {},
    getElementById: (id) => id === 'fs-note-input' ? input : id === 'fs-notes-state' ? state : null,
    querySelectorAll: () => [],
    createElement: () => ({ classList: { add: () => {} }, appendChild: () => {} }),
  },
  fetch: async (url, options = {}) => {
    if (url.includes('four_sapien_embla_memories') && ['POST', 'PATCH'].includes(options.method)) {
      const body = JSON.parse(options.body);
      if (body.user_id) memoryUsers.push(body.user_id);
      if (heldMutation) await new Promise((resolve) => { releaseMutation = resolve; });
      const content = body.content;
      const id = options.method === 'POST' ? 'note-created' : 'note-existing';
      return { ok: true, status: 200, json: async () => [{ id, content, state: 'active' }] };
    }
    if (url.includes('four_sapien_embla_events')) {
      eventUsers.push(JSON.parse(options.body).user_id);
      return { ok: true, status: 204, json: async () => null };
    }
    return { ok: true, status: 200, json: async () => [] };
  },
};
context.window = context;
vm.createContext(context);
vm.runInContext(source, context, { filename: sourcePath });

const { handleAuthChange, updateNote, addNote } = context.__noteAuthTest;
const waitForMutation = async () => {
  for (let i = 0; i < 30 && !releaseMutation; i += 1) await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(typeof releaseMutation, 'function', 'held note write must reach the transport');
};

(async () => {
  await handleAuthChange({ user: { id: 'user-a' } });
  input.value = 'A private note';
  heldMutation = true;
  const staleCreate = addNote();
  await waitForMutation();
  await handleAuthChange({ user: { id: 'user-b' } });
  releaseMutation();
  await staleCreate;
  assert.deepEqual(memoryUsers, ['user-a'], 'the persisted row must remain bound to initiating user A');
  assert.deepEqual(eventUsers, [], 'user B must not inherit an event for user A write');
  assert.equal(input.value, 'A private note', 'a stale completion must not mutate user B UI');
  assert.equal(state.textContent, '', 'a stale completion must not paint success or failure for user B');

  heldMutation = false;
  releaseMutation = null;
  input.value = 'B private note';
  await addNote();
  assert.deepEqual(memoryUsers, ['user-a', 'user-b'], 'same-epoch create must bind to current user B');
  assert.deepEqual(eventUsers, ['user-b'], 'same-epoch create must emit only for user B');
  assert.equal(input.value, '', 'same-epoch confirmed create may clear the input');

  eventUsers.length = 0;
  heldMutation = true;
  const staleUpdate = updateNote('note-existing', 'A edited note');
  await waitForMutation();
  await handleAuthChange({ user: { id: 'user-c' } });
  releaseMutation();
  await staleUpdate;
  assert.deepEqual(eventUsers, [], 'a stale update completion must not emit under user C');
  assert.equal(state.textContent, '', 'a stale update completion must not paint user C UI');

  console.log('PASS 4SAPIEN note auth epoch: A→B/C post-await continuations cannot emit or paint across accounts');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
