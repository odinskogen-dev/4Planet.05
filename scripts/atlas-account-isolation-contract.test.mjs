import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { accountStorageKey, isActiveAccount } from "../src/planet/accountStorageScope.ts";

const read = (path) => fs.readFileSync(path, "utf8");
const ui = read("src/earth/AtlasSavedViews.tsx");
const follows = read("src/planet/follow.ts");
const views = read("src/planet/atlasViews.ts");

test("guest and account caches have disjoint deterministic keys", () => {
  const base = "4planet.test.v1";
  assert.equal(accountStorageKey(base, null), base);
  assert.equal(accountStorageKey(base, "account-a"), `${base}:account:account-a`);
  assert.equal(accountStorageKey(base, "account-b"), `${base}:account:account-b`);
  assert.notEqual(accountStorageKey(base, null), accountStorageKey(base, "account-a"));
  assert.notEqual(accountStorageKey(base, "account-a"), accountStorageKey(base, "account-b"));
});

test("a late operation is accepted only for the still-active account", () => {
  assert.equal(isActiveAccount("account-a", "account-a"), true);
  assert.equal(isActiveAccount("account-a", "account-b"), false);
  assert.equal(isActiveAccount("account-a", null), false);
});

test("My Atlas switches both stores before hydration and guards stale completion", () => {
  assert.match(follows, /accountStorageKey\(KEY, activeAccountId\)/);
  assert.match(views, /accountStorageKey\(KEY, activeAccountId\)/);
  assert.match(ui, /setFollowStorageAccount\(accountId\)[\s\S]*setAtlasViewsStorageAccount\(accountId\)[\s\S]*setState\(readAtlasSavedViews\(\)\)/);
  assert.match(ui, /hydrating\.current = Boolean\(accountId\)[\s\S]*setFollowStorageAccount\(accountId\)/);
  assert.doesNotMatch(ui, /mergeFollows\(getFollows\(\), remote\?\.follows \|\| \[\]\)[\s\S]*setFollowStorageAccount/);
  assert.match(ui, /isActiveAccount\(accountId, sessionRef\.current\?\.user\.id\)/);
  assert.match(ui, /isActiveAccount\(active\.user\.id, sessionRef\.current\?\.user\.id\)/);
});
