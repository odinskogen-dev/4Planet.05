const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const sourcePath = path.join(__dirname, '..', 'source', '4sapien-live-hardening.js');
const source = fs.readFileSync(sourcePath, 'utf8').replace(
  /\n\}\)\(\);\s*$/,
  '\nwindow.__noteAuthTest={handleAuthChange,updateNote,addNote,removeNote};\n})();\n',
);

const input = { value: '' };
const state = { textContent: '' };
const eventUsers = [];
const memoryUsers = [];
const updateMutationUrls = [];
const deleteMutationUrls = [];
let heldMutation = null;
let releaseMutation = null;
let deleteReceiptOverride;
let updateReceiptOverride;

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
      if (body.state === 'deleted') {
        deleteMutationUrls.push(url);
        const expectedUser = decodeURIComponent((url.match(/[?&]user_id=eq\.([^&]+)/) || [])[1] || '');
        const receipt = deleteReceiptOverride === undefined
          ? [{ id, user_id: expectedUser, state: 'deleted', deleted_at: body.deleted_at }]
          : deleteReceiptOverride;
        deleteReceiptOverride = undefined;
        return { ok: true, status: 200, json: async () => receipt };
      }
      if (options.method === 'PATCH') {
        updateMutationUrls.push(url);
        const expectedUser = decodeURIComponent((url.match(/[?&]user_id=eq\.([^&]+)/) || [])[1] || '');
        const receipt = updateReceiptOverride === undefined
          ? [{ id, user_id: expectedUser, content, state: 'active', deleted_at: null }]
          : updateReceiptOverride;
        updateReceiptOverride = undefined;
        return { ok: true, status: 200, json: async () => receipt };
      }
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

const { handleAuthChange, updateNote, addNote, removeNote } = context.__noteAuthTest;
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

  heldMutation = false;
  releaseMutation = null;
  eventUsers.length = 0;
  state.textContent = '';
  await updateNote('note-existing', 'C edited note');
  assert.deepEqual(eventUsers, ['user-c'], 'same-epoch update must emit for the initiating user');
  assert.match(updateMutationUrls.at(-1), /[?&]user_id=eq\.user-c(?:&|$)/, 'update PATCH must require the initiating owner');
  assert.match(updateMutationUrls.at(-1), /[?&]state=eq\.active(?:&|$)/, 'update PATCH must require an active row');
  assert.match(updateMutationUrls.at(-1), /[?&]deleted_at=is\.null(?:&|$)/, 'update PATCH must require a not-deleted row');

  for (const [label, receipt] of [
    ['zero-row/deleted-or-nonexistent', []],
    ['other-owner', [{ id: 'note-existing', user_id: 'user-other', content: 'C edited note', state: 'active', deleted_at: null }]],
    ['inactive', [{ id: 'note-existing', user_id: 'user-c', content: 'C edited note', state: 'deleted', deleted_at: new Date().toISOString() }]],
    ['wrong-id', [{ id: 'note-other', user_id: 'user-c', content: 'C edited note', state: 'active', deleted_at: null }]],
  ]) {
    eventUsers.length = 0;
    state.textContent = '';
    updateReceiptOverride = receipt;
    await updateNote('note-existing', 'C edited note');
    assert.deepEqual(eventUsers, [], `${label} update receipt must not emit note_updated`);
    assert.equal(state.textContent, 'Kunne ikke oppdatere huskelappen.', `${label} update must fail closed`);
  }

  for (const [from, to] of [['user-c', 'user-d'], ['user-d', 'user-c']]) {
    await handleAuthChange({ user: { id: from } });
    eventUsers.length = 0;
    state.textContent = '';
    heldMutation = true;
    releaseMutation = null;
    const staleDelete = removeNote('note-existing');
    await waitForMutation();
    await handleAuthChange({ user: { id: to } });
    releaseMutation();
    await staleDelete;
    assert.deepEqual(eventUsers, [], `${from}→${to} stale delete must not emit under the later identity`);
    assert.equal(state.textContent, '', `${from}→${to} stale delete must not paint the later identity UI`);
  }

  heldMutation = false;
  releaseMutation = null;
  eventUsers.length = 0;
  state.textContent = '';
  await removeNote('note-existing');
  assert.deepEqual(eventUsers, ['user-c'], 'same-epoch delete must emit for the initiating user');
  assert.equal(state.textContent, 'Huskelappen ble fjernet.', 'same-epoch confirmed delete may announce success');
  assert.match(deleteMutationUrls.at(-1), /[?&]state=eq\.active(?:&|$)/, 'delete PATCH must require an active row');
  assert.match(deleteMutationUrls.at(-1), /[?&]deleted_at=is\.null(?:&|$)/, 'delete PATCH must require a not-yet-deleted row');

  eventUsers.length = 0;
  state.textContent = '';
  deleteReceiptOverride = [];
  await removeNote('note-existing');
  assert.deepEqual(eventUsers, [], 'repeated delete of an already-deleted note must not emit note_deleted');
  assert.equal(
    state.textContent,
    'Kunne ikke fjerne huskelappen. Den kan fortsatt være lagret. Prøv igjen.',
    'repeated delete must retain the fail-closed retry state rather than repaint success',
  );

  for (const [label, receipt] of [
    ['zero-row/nonexistent', []],
    ['other-owner', [{ id: 'note-existing', user_id: 'user-other', state: 'deleted', deleted_at: new Date().toISOString() }]],
    ['wrong-id', [{ id: 'note-other', user_id: 'user-c', state: 'deleted', deleted_at: new Date().toISOString() }]],
  ]) {
    eventUsers.length = 0;
    state.textContent = '';
    deleteReceiptOverride = receipt;
    await removeNote('note-existing');
    assert.deepEqual(eventUsers, [], `${label} delete receipt must not emit note_deleted`);
    assert.equal(
      state.textContent,
      'Kunne ikke fjerne huskelappen. Den kan fortsatt være lagret. Prøv igjen.',
      `${label} delete receipt must retain the fail-closed retry state`,
    );
  }

  console.log('PASS 4SAPIEN note auth epoch: update and delete require owner-bound affected-row receipts and continuations remain auth-bound');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
