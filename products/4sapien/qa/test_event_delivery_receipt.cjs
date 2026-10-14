const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const sourcePath = process.argv[2] || path.join(__dirname, "..", "source", "4sapien-live-hardening.js");
const source = fs.readFileSync(sourcePath, "utf8").replace(
  /\n\}\)\(\);\s*$/,
  "\nwindow.__receiptTest={oncePerSession,handleAuthChange};\n})();\n",
);

const stored = new Map();
let posts = 0;
let failNextPost = false;
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
      if (failNextPost) {
        failNextPost = false;
        return { ok: false, status: 503, json: async () => ({ state: "SOURCE_DOWN" }) };
      }
    }
    return { ok: true, status: 204, json: async () => null };
  },
};
context.window = context;
vm.createContext(context);
vm.runInContext(source, context, { filename: sourcePath });

const { oncePerSession, handleAuthChange } = context.__receiptTest;
const deliver = () => context.FourSapienProductEvent("surface_viewed", "core", { path: "/" });

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

  assert.equal(stored.get("4sapien_evt_user-a_surface_core"), "delivered");
  assert.equal(stored.get("4sapien_evt_user-b_surface_core"), "delivered");
  assert.equal(stored.get("4sapien_evt_user-c_surface_core"), "delivered");
  assert.equal(stored.get("4sapien_evt_user-d_surface_core"), "delivered");
  console.log("PASS 4SAPIEN event receipts: identity-isolated, acknowledged-only, retryable after failure");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
