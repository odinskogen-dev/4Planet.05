import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const client = fs.readFileSync("src/identity/identityClient.ts", "utf8");
const ui = fs.readFileSync("src/pages/identity/IdentityApp.tsx", "utf8");
const app = fs.readFileSync("src/App.tsx", "utf8");
const shell = fs.readFileSync("src/components/layout/PublicShell.tsx", "utf8");
const join = fs.readFileSync("src/pages/v5/Join.tsx", "utf8");

test("4PLANET ID is one canonical cross-product identity surface", () => {
  assert.match(app, /id\.4planet\.org/);
  assert.match(app, /auth\/4planet\/callback/);
  assert.match(ui, /4PLANET ID/);
  assert.match(shell, /SIGN IN/);
  assert.match(shell, /CREATE 4PLANET ID/);
  assert.match(shell, /ACCOUNT/);
  assert.match(client, /return "ACCOUNT"/);
});

test("join uses canonical ID links and does not invent membership", () => {
  assert.match(join, /IdentityAffordances presentation="join"/);
  assert.match(join, /A free 4PLANET ID is not paid membership/);
  assert.match(join, /does not activate paid membership/);
  assert.match(join, /returnHrefFromSearch/);
  assert.match(shell, /identityLoginUrl\(here, "signup"\)/);
  assert.match(shell, /identityLoginUrl\(here\)/);
  assert.match(shell, /identityAccountUrl\(here\)/);
  assert.match(shell, /identityDisplayLabel\(profile, session\.user\)/);
  assert.doesNotMatch(join, /No registration, payment or data capture is active/);
  assert.doesNotMatch(join, /FourPlanetIdentity/);
  assert.doesNotMatch(shell, /FourPlanetIdentity/);
  assert.doesNotMatch(app, /FourPlanetIdentity/);
  assert.doesNotMatch(join, /addEventListener\(\s*["']click["']/);
  assert.doesNotMatch(shell, /addEventListener\(\s*["']click["']/);
  assert.doesNotMatch(app, /addEventListener\(\s*["']click["']/);
  assert.doesNotMatch(client, /pages\.dev/);
});

test("signup mode, display name and untrusted return stay on the existing client", async () => {
  globalThis.window = { location: { origin: "https://4planet.org", href: "https://4planet.org/join" } };
  const mod = await import("../src/identity/identityClient.ts");
  const joinReturn = "https://4planet.org/join";
  const signup = new URL(mod.identityLoginUrl(joinReturn, "signup"));
  assert.equal(signup.origin + signup.pathname, "https://id.4planet.org/login");
  assert.equal(signup.searchParams.get("mode"), "signup");
  assert.equal(signup.searchParams.get("return_to"), joinReturn);
  const login = new URL(mod.identityLoginUrl(joinReturn));
  assert.equal(login.searchParams.get("mode"), null);
  assert.equal(login.searchParams.get("return_to"), joinReturn);
  const account = new URL(mod.identityAccountUrl(joinReturn));
  assert.equal(account.origin + account.pathname, "https://id.4planet.org/account");
  assert.equal(account.searchParams.get("return_to"), joinReturn);
  assert.equal(mod.identityDisplayLabel({ display_name: " Ada " }, { email: "ada@4planet.org" }), "Ada");
  assert.equal(mod.identityDisplayLabel({ display_name: " " }, { email: "ada@4planet.org" }), "ada@4planet.org");
  assert.equal(mod.identityDisplayLabel(null, { email: " " }), "ACCOUNT");
  assert.equal(mod.safeReturnTo("https://evil.example/steal", "https://4planet.org/"), "https://4planet.org/");
  assert.equal(mod.safeReturnTo("https://preview.4planet-05.pages.dev/join", "https://4planet.org/"), "https://4planet.org/");
  assert.equal(mod.safeReturnTo("https://labs.oddekalv.org/join", "https://4planet.org/"), "https://4planet.org/");
  assert.equal(mod.safeReturnTo("https://4planet.org/species", "https://4planet.org/"), "https://4planet.org/species");
  assert.equal(mod.safeReturnTo("https://4planetatlas.com/atlas", "https://4planet.org/"), "https://4planetatlas.com/atlas");
});

test("global auth includes premium recovery and password-manager semantics", () => {
  assert.match(ui, /Glemt passord\?/);
  assert.match(ui, /resetPasswordForEmail/);
  assert.match(ui, /autoComplete=.*current-password/);
  assert.match(ui, /autoComplete=.*new-password/);
  assert.match(ui, /Logg ut overalt/);
});

test("cross-domain handoff is one-time and excludes oddekalv.org", () => {
  assert.match(client, /four-planet-id-bridge/);
  assert.match(client, /verifyOtp/);
  assert.match(client, /token_hash/);
  assert.match(client, /oddekalv\.org/);
  assert.match(client, /target\.hostname\.endsWith\("oddekalv\.org"\)/);
});


test("canonical ID client can hand off to every priority product host accepted by the bridge", () => {
  for (const host of [
    "4planet.org",
    "4sapien.com",
    "s4piens.com",
    "4brands.org",
    "4planetatlas.com",
    "4species.com",
    "labs.4planet.org",
    "4brain.app",
  ]) {
    assert.ok(client.includes(`"${host}"`), `trusted host missing: ${host}`);
  }
});


test("identity funnel is measurable without emitting credential values or email", () => {
  assert.match(ui, /trackEvent\("signup_started"/);
  assert.match(ui, /trackEvent\("signup_completed"/);
  assert.match(ui, /trackEvent\("login"/);
  const telemetryCalls = [...ui.matchAll(/trackEvent\([\s\S]*?\);/g)].map((match) => match[0]);
  for (const call of telemetryCalls) {
    assert.doesNotMatch(call, /\bemail\s*:/);
    assert.doesNotMatch(call, /\bpassword\s*:/);
    assert.doesNotMatch(call, /\bemail\.trim\(/);
    assert.doesNotMatch(call, /[{,]\s*(?:email|password)\s*[,}]/);
  }
});

const SYNTHETIC_NOTICE = "SYNTHETIC AUTH — not a real account or customer";
const SYNTHETIC_SDK = `(() => {
  const NOTICE = ${JSON.stringify(SYNTHETIC_NOTICE)};
  const STORAGE = "fourplanet.synthetic-auth.v1";
  const listeners = new Set();
  const read = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE) || "null"); }
    catch { return null; }
  };
  const write = (session) => {
    if (session) localStorage.setItem(STORAGE, JSON.stringify(session));
    else localStorage.removeItem(STORAGE);
  };
  const sessionFor = (id) => ({
    access_token: "synthetic-access-" + id,
    refresh_token: "synthetic-refresh-" + id,
    user: {
      id,
      email: id + "@example.invalid",
      user_metadata: { synthetic: true, notice: NOTICE, realAccount: false, realCustomer: false }
    }
  });
  const emit = (event, session) => { for (const cb of listeners) cb(event, session); };
  const client = () => ({
    auth: {
      async getSession() { return { data: { session: read() }, error: null }; },
      async signInWithPassword({ email, password }) {
        const id = String(email || "").replace(/@example\\.invalid$/, "");
        if (password !== "synthetic-password" || !/^synthetic-user-[abc]$/.test(id)) {
          return { data: { session: null }, error: { message: "synthetic credentials rejected" } };
        }
        const session = sessionFor(id);
        write(session);
        emit("SIGNED_IN", session);
        return { data: { session }, error: null };
      },
      async signUp() { return { data: { session: null }, error: { message: "synthetic harness does not create accounts" } }; },
      async signInWithOAuth() { return { data: { url: null }, error: { message: "synthetic harness does not start OAuth" } }; },
      async resetPasswordForEmail() { return { data: {}, error: { message: "synthetic harness does not send email" } }; },
      async updateUser() { return { data: { user: null }, error: { message: "synthetic harness does not update accounts" } }; },
      async signOut() { write(null); emit("SIGNED_OUT", null); return { error: null }; },
      async verifyOtp({ token_hash, type }) {
        const id = String(token_hash || "").replace(/^synthetic-bridge-/, "");
        if (type !== "email" || !token_hash || token_hash === id || !/^synthetic-user-[abc]$/.test(id)) {
          return { data: { session: null }, error: { message: "synthetic token rejected" } };
        }
        const session = sessionFor(id);
        write(session);
        emit("SIGNED_IN", session);
        return { data: { session }, error: null };
      },
      async getUserIdentities() { return { data: { identities: [{ provider: "synthetic" }] }, error: null }; },
      onAuthStateChange(cb) {
        listeners.add(cb);
        return { data: { subscription: { unsubscribe() { listeners.delete(cb); } } } };
      },
      oauth: {
        async getAuthorizationDetails() { return { data: null, error: { message: "synthetic harness does not approve OAuth" } }; },
        async approveAuthorization() { return { data: null, error: { message: "synthetic harness does not approve OAuth" } }; },
        async denyAuthorization() { return { data: null, error: { message: "synthetic harness does not approve OAuth" } }; }
      }
    }
  });
  window.supabase = { createClient() { return client(); } };
  window.__FOURPLANET_SYNTHETIC_AUTH__ = {
    kind: "synthetic",
    notice: NOTICE,
    realAccount: false,
    realCustomer: false,
    emitCurrent() {
      const session = read();
      if (!session || session.user.user_metadata.synthetic !== true) throw new Error("no synthetic session");
      emit("TOKEN_REFRESHED", session);
    },
    switchTo(id) {
      const session = sessionFor(id);
      write(session);
      emit("SIGNED_IN", session);
    },
    logout() {
      write(null);
      emit("SIGNED_OUT", null);
    }
  };
})();`;

if (process.env.IDENTITY_TRUSTED_ORIGIN_BROWSER === "1") {
  test("trusted-origin browser matrix restores synthetic ID return at desktop and 390px", { timeout: 240000 }, async () => {
    assert.doesNotMatch(client, /pages\.dev/);
    assert.match(client, /"4planet.org"/);
    assert.match(client, /"id.4planet.org"/);
    const dist = path.resolve("dist");
    const indexPath = path.join(dist, "index.html");
    assert.equal(fs.existsSync(indexPath), true, "npm run build must produce dist before the isolated browser harness");
    const localIndex = fs.readFileSync(indexPath, "utf8");
    const localAsset = localIndex.match(/\/assets\/index-[^"]+\.js/);
    assert.ok(localAsset, "local candidate bundle missing from dist/index.html");
    const sha = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
    const { chromium } = await import("@playwright/test");
    const evidenceDir = path.resolve("artifacts/identity-trusted-origin");
    fs.mkdirSync(evidenceDir, { recursive: true });
    const browser = await chromium.launch({
      headless: true,
      args: [
        "--host-resolver-rules=MAP 4planet.org 127.0.0.1, MAP id.4planet.org 127.0.0.1, MAP www.4planet.org 127.0.0.1, MAP ghvdzetmplqkdtfqiror.supabase.co 127.0.0.1, MAP cdn.jsdelivr.net 127.0.0.1, MAP fonts.googleapis.com 127.0.0.1, MAP fonts.gstatic.com 127.0.0.1, MAP www.googletagmanager.com 127.0.0.1, MAP us.i.posthog.com 127.0.0.1",
        "--ignore-certificate-errors",
      ],
    });
    const matrix = [
      { name: "desktop", width: 1440, height: 900, entry: "header-sign-in", lane: "header" },
      { name: "mobile-390", width: 390, height: 844, entry: "join-sign-in", lane: "join" },
    ];
    const evidence = [];
    try {
      for (const spec of matrix) {
        evidence.push(await runTrustedOriginJourney({ browser, spec, dist, localAsset: localAsset[0], sha, evidenceDir }));
      }
    } finally {
      await browser.close();
    }
    fs.writeFileSync(path.join(evidenceDir, "evidence.json"), JSON.stringify({
      proof: "SYNTHETIC_TRUSTED_ORIGIN_BROWSER",
      synthetic: true,
      realAccount: false,
      realCustomer: false,
      publicDnsChanged: false,
      pagesPreviewAllowlisted: false,
      sha,
      matrix: evidence,
    }, null, 2));
    console.log("SYNTHETIC AUTH ONLY — not a real account or customer");
    console.log(JSON.stringify({ proof: "SYNTHETIC_TRUSTED_ORIGIN_BROWSER", sha, matrix: evidence }));
  });
}

function syntheticProfile(userId) {
  const names = {
    "synthetic-user-a": "SYNTHETIC USER A",
    "synthetic-user-b": "SYNTHETIC USER B",
    "synthetic-user-c": "SYNTHETIC USER C",
  };
  return names[userId] || "SYNTHETIC USER";
}

async function runTrustedOriginJourney({ browser, spec, dist, localAsset, sha, evidenceDir }) {
  const original = `https://4planet.org/join?intent=return-proof&lane=${spec.lane}`;
  const pagesReturn = "https://preview.4planet-05.pages.dev/join?x=1";
  const held = [];
  let holdProfiles = false;
  const cors = {
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "cache-control": "no-store",
    "x-4planet-harness": "synthetic-trusted-origin",
  };
  const context = await browser.newContext({
    viewport: { width: spec.width, height: spec.height },
    ignoreHTTPSErrors: true,
    serviceWorkers: "block",
  });
  await context.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: cors, body: "" });
      return;
    }
    if (url.hostname === "cdn.jsdelivr.net") {
      await route.fulfill({ status: 200, headers: { ...cors, "content-type": "application/javascript; charset=utf-8" }, body: SYNTHETIC_SDK });
      return;
    }
    if (url.hostname === "ghvdzetmplqkdtfqiror.supabase.co") {
      if (url.pathname.endsWith("/four-planet-id-bridge")) {
        const token = (request.headers().authorization || "").replace(/^Bearer\s+/i, "");
        const id = token.replace(/^synthetic-access-/, "");
        if (!token.startsWith("synthetic-access-") || !/^synthetic-user-[abc]$/.test(id)) {
          await route.fulfill({ status: 401, headers: { ...cors, "content-type": "application/json" }, body: JSON.stringify({ error: "synthetic token required" }) });
          return;
        }
        await route.fulfill({ status: 200, headers: { ...cors, "content-type": "application/json" }, body: JSON.stringify({ token_hash: `synthetic-bridge-${id}` }) });
        return;
      }
      if (url.pathname.includes("/four_planet_profiles")) {
        const userId = decodeURIComponent((url.searchParams.get("user_id") || "").replace(/^eq\./, ""));
        const body = JSON.stringify([{ user_id: userId, display_name: syntheticProfile(userId), avatar_url: null, locale: "en" }]);
        if (!holdProfiles) {
          await route.fulfill({ status: 200, headers: { ...cors, "content-type": "application/json" }, body });
          return;
        }
        await new Promise((resolve) => held.push({ route, body, userId, resolve }));
        return;
      }
      await route.fulfill({ status: 404, headers: { ...cors, "content-type": "application/json" }, body: JSON.stringify({ error: "synthetic harness blocked this auth request" }) });
      return;
    }
    if (url.hostname === "4planet.org" || url.hostname === "id.4planet.org" || url.hostname === "www.4planet.org") {
      await serveCandidate(route, url, dist, request.resourceType());
      return;
    }
    if (url.hostname === "www.googletagmanager.com" || url.hostname === "us.i.posthog.com") {
      await route.fulfill({ status: 200, headers: { ...cors, "content-type": "application/javascript" }, body: "void 0" });
      return;
    }
    if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
      await route.fulfill({ status: 200, headers: { ...cors, "content-type": "text/css" }, body: "" });
      return;
    }
    if (request.resourceType() === "document") await route.abort();
    else await route.fulfill({ status: 204, headers: cors, body: "" });
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  try {
    const rejected = await page.goto(`https://id.4planet.org/login?return_to=${encodeURIComponent(pagesReturn)}`);
    assert.equal(rejected?.headers()["x-4planet-harness"], "synthetic-trusted-origin");
    await page.locator(".identity-card").waitFor();
    assert.equal(await page.locator(".identity-card").getAttribute("data-return-to"), "https://4planet.org/");
    assert.equal((await page.locator(".identity-card").getAttribute("data-return-to") || "").includes("pages.dev"), false);
    await shot(page, evidenceDir, `${spec.name}-pages-rejected`);

    const opened = await page.goto(original);
    assert.equal(opened?.headers()["x-4planet-harness"], "synthetic-trusted-origin");
    assert.equal(page.url(), original);
    await page.getByTestId("header-sign-in").waitFor();
    await page.getByTestId("join-sign-in").waitFor();
    const html = await page.content();
    assert.equal(html.includes(localAsset), true, "browser loaded a different bundle than this candidate dist");
    for (const id of ["header-sign-in", "join-sign-in"]) {
      const href = await page.getByTestId(id).getAttribute("href");
      const target = new URL(href);
      assert.equal(`${target.origin}${target.pathname}`, "https://id.4planet.org/login");
      assert.equal(target.searchParams.get("return_to"), original);
      const box = await page.getByTestId(id).boundingBox();
      assert.ok(box && box.width > 0 && box.height > 0, `${id} is not visible at ${spec.width}px`);
      assert.ok(box.x >= -1 && box.x + box.width <= spec.width + 1, `${id} overflows ${spec.width}px`);
    }
    await shot(page, evidenceDir, `${spec.name}-signed-out`);
    await page.getByTestId(spec.entry).click();
    await page.waitForURL((url) => url.hostname === "id.4planet.org" && url.pathname === "/login");
    const canonical = new URL(page.url());
    assert.equal(canonical.searchParams.get("return_to"), original);
    await page.locator(".identity-card").waitFor();
    assert.equal(await page.locator(".identity-card").getAttribute("data-return-to"), original);
    await shot(page, evidenceDir, `${spec.name}-canonical-id`);
    await page.locator("#identity-email").fill("synthetic-user-a@example.invalid");
    await page.locator("#identity-password").fill("synthetic-password");
    await page.getByRole("button", { name: "Logg inn" }).click();
    await page.waitForURL((url) => url.href === original);
    assert.equal(page.url(), original);
    await page.getByTestId("header-account").waitFor();
    await page.getByTestId("join-account").waitFor();
    assert.equal(await page.getByTestId("header-account").innerText(), "SYNTHETIC USER A");
    assert.equal(await page.getByTestId("join-account").innerText(), "SYNTHETIC USER A");
    for (const id of ["header-account", "join-account"]) {
      const account = new URL(await page.getByTestId(id).getAttribute("href"));
      assert.equal(`${account.origin}${account.pathname}`, "https://id.4planet.org/account");
      assert.equal(account.searchParams.get("return_to"), original);
    }
    const marker = await page.evaluate(() => window.__FOURPLANET_SYNTHETIC_AUTH__);
    assert.equal(marker.kind, "synthetic");
    assert.equal(marker.realAccount, false);
    assert.equal(marker.realCustomer, false);
    assert.equal(marker.notice, SYNTHETIC_NOTICE);
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("fourplanet.synthetic-auth.v1")));
    assert.equal(stored.user.user_metadata.synthetic, true);
    assert.equal(stored.user.email, "synthetic-user-a@example.invalid");
    assert.equal(stored.user.user_metadata.realAccount, false);
    await shot(page, evidenceDir, `${spec.name}-signed-in`);

    holdProfiles = true;
    await page.evaluate(() => window.__FOURPLANET_SYNTHETIC_AUTH__.emitCurrent());
    const staleA = await takeHeld(held, "synthetic-user-a");
    await page.evaluate(() => window.__FOURPLANET_SYNTHETIC_AUTH__.switchTo("synthetic-user-b"));
    await page.getByTestId("header-account").waitFor();
    assert.equal(await page.getByTestId("header-account").innerText(), "ACCOUNT");
    assert.equal(await page.getByTestId("join-account").innerText(), "ACCOUNT");
    const pendingB = await takeHeld(held, "synthetic-user-b");
    for (const job of staleA) await releaseHeld(job, cors);
    await page.waitForTimeout(300);
    assert.equal(await page.getByTestId("header-account").innerText(), "ACCOUNT");
    assert.equal(await page.getByTestId("join-account").innerText(), "ACCOUNT");
    for (const job of pendingB) await releaseHeld(job, cors);
    await page.getByTestId("header-account").filter({ hasText: "SYNTHETIC USER B" }).waitFor();
    assert.equal(await page.getByTestId("join-account").innerText(), "SYNTHETIC USER B");
    await shot(page, evidenceDir, `${spec.name}-account-switch`);

    await page.evaluate(() => window.__FOURPLANET_SYNTHETIC_AUTH__.emitCurrent());
    const staleB = await takeHeld(held, "synthetic-user-b");
    await page.evaluate(() => window.__FOURPLANET_SYNTHETIC_AUTH__.logout());
    await page.getByTestId("header-sign-in").waitFor();
    await page.getByTestId("join-sign-in").waitFor();
    assert.equal(await page.getByTestId("header-account").count(), 0);
    assert.equal(await page.getByTestId("join-account").count(), 0);
    await page.evaluate(() => window.__FOURPLANET_SYNTHETIC_AUTH__.switchTo("synthetic-user-c"));
    await page.getByTestId("header-account").waitFor();
    assert.equal(await page.getByTestId("header-account").innerText(), "ACCOUNT");
    const pendingC = await takeHeld(held, "synthetic-user-c");
    for (const job of staleB) await releaseHeld(job, cors);
    await page.waitForTimeout(300);
    assert.equal(await page.getByTestId("header-account").innerText(), "ACCOUNT");
    assert.equal(await page.getByTestId("join-account").innerText(), "ACCOUNT");
    for (const job of held.splice(0)) await releaseHeld(job, cors);
    await page.waitForTimeout(300);
    assert.equal(await page.getByTestId("header-account").innerText(), "ACCOUNT");
    assert.equal(await page.getByTestId("join-account").innerText(), "ACCOUNT");
    for (const job of pendingC) await releaseHeld(job, cors);
    await page.getByTestId("header-account").filter({ hasText: "SYNTHETIC USER C" }).waitFor();
    await shot(page, evidenceDir, `${spec.name}-logout-stale`);
    const serious = pageErrors.filter((error) => !/gtag|posthog|analytics/i.test(error));
    assert.deepEqual(serious, []);
    return {
      viewport: `${spec.width}x${spec.height}`,
      entry: spec.entry,
      original,
      canonicalRequest: `https://id.4planet.org/login?return_to=${encodeURIComponent(original)}`,
      restored: original,
      signedInLabel: "SYNTHETIC USER A",
      pagesDevReturnRejectedTo: "https://4planet.org/",
      accountSwitchStaleLabelDropped: true,
      logoutStaleLabelDropped: true,
      synthetic: true,
      realAccount: false,
      realCustomer: false,
      localAsset,
      sha,
    };
  } catch (error) {
    await shot(page, evidenceDir, `${spec.name}-failure`).catch(() => undefined);
    const text = await page.locator("body").innerText().catch(() => "");
    throw new Error(`${spec.name} ${page.url()} synthetic harness failed: ${error.message}\n${text.slice(0, 500)}\n${pageErrors.join("\n")}`);
  } finally {
    holdProfiles = false;
    for (const job of held.splice(0)) await releaseHeld(job, cors).catch(() => undefined);
    await context.close();
  }
}

async function takeHeld(held, userId) {
  const start = Date.now();
  while (!held.some((job) => job.userId === userId)) {
    if (Date.now() - start > 8000) throw new Error(`no held synthetic profile for ${userId}`);
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  await new Promise((resolve) => setTimeout(resolve, 350));
  const matched = [];
  for (let i = held.length - 1; i >= 0; i -= 1) {
    if (held[i].userId === userId) matched.unshift(held.splice(i, 1)[0]);
  }
  assert.ok(matched.length >= 1);
  return matched;
}

async function releaseHeld(job, cors) {
  await job.route.fulfill({ status: 200, headers: { ...cors, "content-type": "application/json" }, body: job.body });
  job.resolve();
}

async function serveCandidate(route, url, dist, resourceType) {
  const decoded = decodeURIComponent(url.pathname);
  const relative = decoded.replace(/^\/+/, "");
  if (relative.includes("..")) {
    await route.fulfill({ status: 404, headers: { "x-4planet-harness": "synthetic-trusted-origin" }, body: "rejected path" });
    return;
  }
  const candidates = relative ? [path.join(dist, relative), path.join(dist, relative, "index.html")] : [path.join(dist, "index.html")];
  const file = candidates.find((candidate) => path.resolve(candidate).startsWith(`${path.resolve(dist)}${path.sep}`) && fs.existsSync(candidate) && fs.statSync(candidate).isFile());
  const headers = { "cache-control": "no-store", "x-4planet-harness": "synthetic-trusted-origin" };
  if (!file) {
    if (resourceType === "document") {
      await route.fulfill({ status: 200, headers: { ...headers, "content-type": "text/html; charset=utf-8" }, body: fs.readFileSync(path.join(dist, "index.html")) });
      return;
    }
    await route.fulfill({ status: 404, headers, body: "missing candidate asset" });
    return;
  }
  await route.fulfill({ status: 200, headers: { ...headers, "content-type": contentType(file) }, body: fs.readFileSync(file) });
}

function contentType(file) {
  const ext = path.extname(file);
  return {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".woff2": "font/woff2",
    ".ico": "image/x-icon",
  }[ext] || "application/octet-stream";
}

async function shot(page, evidenceDir, name) {
  await page.screenshot({ path: path.join(evidenceDir, `${name}.png`) });
}
