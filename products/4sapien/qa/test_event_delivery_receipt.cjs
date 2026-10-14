const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const sourcePath = process.argv[2] || path.join(__dirname, "..", "source", "4sapien-live-hardening.js");
const source = fs.readFileSync(sourcePath, "utf8").replace(
  /\n\}\)\(\);\s*$/,
  "\nwindow.__receiptTest={oncePerSession,handleAuthChange,emitEvent};\n})();\n",
);

const stored = new Map();
let posts = 0;
let failNextPost = false;
let holdNextPost = false;
let releasePendingPost = null;
const postedUsers = [];
const context = {
  console,
  URLSearchParams,
  Promise,
  setTimeout,
  clearTimeout,
  location: { pathname: "/app/food/" },
  localStorage: {
    length: 1,
    key: () => "sb-test-auth-token",
    getItem: () => JSON.stringify({ access_token: "test-token" }),
  },
  sessionStorage: {
    getItem: (key) => stored.get(key) ?? null,
    setItem: (key, value) => stored.set(key, value),
  },
  document: {
    readyState: "loading",
    body: { classList: { contains: () => false }, appendChild: () => {} },
    addEventListener: () => {},
    getElementById: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ classList: { add: () => {} }, appendChild: () => {} }),
  },
  fetch: async (_url, options = {}) => {
    if (options.method === "POST") {
      posts += 1;
      postedUsers.push(JSON.parse(options.body).user_id);
      if (failNextPost) {
        failNextPost = false;
        return { ok: false, status: 503, json: async () => ({ state: "SOURCE_DOWN" }) };
      }
      if (holdNextPost) {
        holdNextPost = false;
        await new Promise((resolve) => { releasePendingPost = resolve; });
        releasePendingPost = null;
      }
    }
    return { ok: true, status: 204, json: async () => null };
  },
};
context.window = context;
vm.createContext(context);
vm.runInContext(source, context, { filename: sourcePath });

const { oncePerSession, handleAuthChange, emitEvent } = context.__receiptTest;
const deliver = (attempt) => emitEvent("surface_viewed", "core", { path: "/" }, attempt);
const waitForPendingPost = async () => {
  for (let i = 0; i < 20 && !releasePendingPost; i += 1) await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(typeof releasePendingPost, "function", "held POST must reach the transport");
};

(async () => {
  await handleAuthChange({ user: { id: "user-a" } });
  assert.equal(await oncePerSession("surface_core", deliver), true, "first acknowledged delivery must succeed");
  assert.equal(await oncePerSession("surface_core", deliver), true, "same identity/session must reuse the receipt");
  assert.equal(posts, 1, "same identity/session must emit once");

  await handleAuthChange({ user: { id: "user-b" } });
  assert.equal(await oncePerSession("surface_core", deliver), true, "a second signed-in identity must have an independent receipt");
  assert.equal(posts, 2, "identity B must not be suppressed by identity A's receipt");

  await handleAuthChange({ user: { id: "user-a" } });
  assert.equal(await oncePerSession("surface_core", deliver), true, "identity A's receipt must survive an A→B→A switch");
  assert.equal(posts, 2, "returning to identity A must not duplicate its acknowledged event");

  await handleAuthChange({ user: { id: "user-c" } });
  failNextPost = true;
  assert.equal(await oncePerSession("surface_core", deliver), false, "failed delivery must not create a receipt");
  assert.equal(await oncePerSession("surface_core", deliver), true, "failed delivery must remain retryable");
  assert.equal(posts, 4, "failed delivery plus retry must perform two attempts");

  await handleAuthChange({ user: { id: "user-d" } });
  assert.deepEqual(
    await Promise.all([oncePerSession("surface_core", deliver), oncePerSession("surface_core", deliver)]),
    [true, true],
    "concurrent duplicates must share one delivery attempt",
  );
  assert.equal(posts, 5, "concurrent duplicates must be coalesced");

  await handleAuthChange({ user: { id: "user-e" } });
  const beforeRacePosts = posts;
  assert.equal(await oncePerSession("switch_before_send", async (attempt) => {
    await handleAuthChange({ user: { id: "user-f" } });
    return emitEvent("surface_viewed", "core", { path: "/" }, attempt);
  }), false, "an attempt invalidated before send must be rejected");
  assert.equal(posts, beforeRacePosts, "a stale attempt must not reach the transport");
  assert.equal(stored.get("4sapien_evt_user-e_switch_before_send"), undefined, "stale identity E must not receive a receipt");
  assert.equal(stored.get("4sapien_evt_user-f_switch_before_send"), undefined, "current identity F must not inherit E's receipt");

  await handleAuthChange({ user: { id: "user-g" } });
  holdNextPost = true;
  const pending = oncePerSession("switch_during_post", deliver);
  await waitForPendingPost();
  assert.equal(postedUsers.at(-1), "user-g", "the POST payload must use the captured identity");
  await handleAuthChange({ user: { id: "user-h" } });
  releasePendingPost();
  assert.equal(await pending, false, "an acknowledgement from a stale auth epoch must be rejected");
  assert.equal(stored.get("4sapien_evt_user-g_switch_during_post"), undefined, "stale identity G must not receive the receipt");
  assert.equal(stored.get("4sapien_evt_user-h_switch_during_post"), undefined, "current identity H must not receive G's receipt");
  await handleAuthChange({ user: { id: "user-g" } });
  assert.equal(await oncePerSession("switch_during_post", deliver), true, "a rejected stale acknowledgement must remain retryable");
  assert.deepEqual(postedUsers.slice(-2), ["user-g", "user-g"], "initial and retry payloads must remain bound to identity G");

  assert.equal(stored.get("4sapien_evt_user-a_surface_core"), "delivered");
  assert.equal(stored.get("4sapien_evt_user-b_surface_core"), "delivered");
  assert.equal(stored.get("4sapien_evt_user-c_surface_core"), "delivered");
  assert.equal(stored.get("4sapien_evt_user-d_surface_core"), "delivered");
  assert.equal(stored.get("4sapien_evt_user-g_switch_during_post"), "delivered");
  console.log("PASS 4SAPIEN event receipts: identity/epoch-bound, stale acknowledgements rejected, retryable");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
