import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";

const client = fs.readFileSync("src/identity/identityClient.ts", "utf8");
const ui = fs.readFileSync("src/pages/identity/IdentityApp.tsx", "utf8");
const app = fs.readFileSync("src/App.tsx", "utf8");
const shell = fs.readFileSync("src/components/layout/PublicShell.tsx", "utf8");
const transpiledClient = ts.transpileModule(client, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  fileName: "identityClient.ts",
}).outputText;
const identityClient = await import(
  `data:text/javascript;base64,${Buffer.from(transpiledClient).toString("base64")}`
);

test("4PLANET ID is one canonical cross-product identity surface", () => {
  assert.match(app, /id\.4planet\.org/);
  assert.match(app, /auth\/4planet\/callback/);
  assert.match(ui, /4PLANET ID/);
  assert.match(shell, /SIGN IN/);
  assert.match(shell, /ACCOUNT/);
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

test("return destinations require an exact HTTPS origin", () => {
  const previousWindow = globalThis.window;
  globalThis.window = { location: { origin: "https://id.4planet.org" } };
  try {
    assert.equal(identityClient.safeReturnTo("/account"), "https://id.4planet.org/account");
    assert.equal(identityClient.safeReturnTo("https://4sapien.com/food"), "https://4sapien.com/food");
    assert.equal(
      identityClient.safeReturnTo("https://4sapien.com/food#access_token=secret&refresh_token=secret"),
      "https://4sapien.com/food"
    );
    for (const unsafe of [
      "http://4sapien.com/food",
      "https://4sapien.com:8443/food",
      "https://user:password@4sapien.com/food",
      "https://malicious.4sapien.com/food",
      "https://oddekalv.org/",
    ]) {
      assert.equal(identityClient.safeReturnTo(unsafe), "https://4planet.org/", unsafe);
    }
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});


test("identity entry URLs never copy fragments into return_to", () => {
  const previousWindow = globalThis.window;
  globalThis.window = {
    location: {
      origin: "https://id.4planet.org",
      href: "https://id.4planet.org/login#access_token=secret&refresh_token=secret",
    },
  };
  try {
    for (const destination of [
      identityClient.identityLoginUrl(),
      identityClient.identityAccountUrl("https://4sapien.com/food#private-state"),
    ]) {
      const url = new URL(destination);
      const returnTo = url.searchParams.get("return_to");
      assert.ok(returnTo);
      assert.equal(new URL(returnTo).hash, "");
      assert.doesNotMatch(destination, /access_token|refresh_token|private-state/);
    }
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

test("failed OAuth recovery scrubs credential fragments before SDK work", async () => {
  const previousWindow = globalThis.window;
  const replacements = [];
  globalThis.window = {
    location: {
      origin: "https://id.4planet.org",
      hash: "#access_token=secret-access&refresh_token=secret-refresh",
      pathname: "/auth/callback",
      search: "?source=google",
    },
    history: {
      replaceState(_state, _title, value) {
        replacements.push(value);
      },
    },
    supabase: {
      createClient() {
        return {
          auth: {
            async setSession() {
              assert.deepEqual(replacements, ["/auth/callback?source=google"]);
              return { data: { session: null }, error: { message: "expired" } };
            },
          },
        };
      },
    },
  };
  try {
    await assert.rejects(identityClient.recoverOAuthSessionFromLocation(), /expired/);
    assert.deepEqual(replacements, ["/auth/callback?source=google"]);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});



test("return sanitizer rejects sensitive query keys encoded through depth eight", () => {
  const previousWindow = globalThis.window;
  globalThis.window = { location: { origin: "https://id.4planet.org" } };
  const encodeEveryByte = (value) =>
    [...value].map((character) => `%${character.charCodeAt(0).toString(16).padStart(2, "0")}`).join("");
  try {
    let encodedKey = encodeEveryByte("access_token");
    for (let depth = 1; depth <= 8; depth += 1) {
      const target = `https://4planetatlas.com/explore?habitat=kelp&${encodedKey}=SYNTHETIC_ONLY`;
      assert.equal(
        identityClient.safeReturnTo(target),
        "https://4planetatlas.com/explore?habitat=kelp",
        `encoded sensitive key depth ${depth}`
      );
      encodedKey = encodeURIComponent(encodedKey);
    }
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

test("return sanitizer fails closed on saturated credential-key encoding", () => {
  const previousWindow = globalThis.window;
  globalThis.window = { location: { origin: "https://id.4planet.org" } };
  const wrappedSeparator = (key, wraps) => {
    let encoded = key;
    for (let index = 0; index < wraps; index += 1) encoded = encoded.replace(/%/g, "%25");
    return encoded;
  };
  try {
    for (const wraps of [8, 9, 10, 12]) {
      for (const key of ["access%5Ftoken", "refresh%5Ftoken"]) {
        const target = `https://4planetatlas.com/explore?habitat=kelp&${wrappedSeparator(key, wraps)}=SYNTHETIC_ONLY`;
        assert.equal(
          identityClient.safeReturnTo(target),
          "https://4planetatlas.com/explore?habitat=kelp",
          `${key} at ${wraps} wraps`
        );
      }
      const benign = `https://4planetatlas.com/explore?${wrappedSeparator("habi%74at", wraps)}=kelp`;
      assert.equal(identityClient.safeReturnTo(benign), benign, `benign key at ${wraps} wraps`);
    }
    for (const key of ["access%5Ftoken", "refresh%5Ftoken"]) {
      const saturated = `https://4planetatlas.com/explore?habitat=kelp&${wrappedSeparator(key, 40)}=SYNTHETIC_ONLY`;
      assert.equal(identityClient.safeReturnTo(saturated), "https://4planetatlas.com/explore?habitat=kelp", `${key} saturated`);
    }
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

test("return sanitizer rejects structured, camelCase and aliased sensitive keys", () => {
  const previousWindow = globalThis.window;
  globalThis.window = { location: { origin: "https://id.4planet.org" } };
  try {
    for (const key of [
      "next[access_token]",
      "auth.access_token",
      "session[token_hash]",
      "user[email]",
      "access-token",
      "next[accessToken]",
      "session[refreshToken]",
      "oauth.idToken",
      "user[emailAddress]",
      "contact[phoneNumber]",
      "clientSecret",
      "sessionToken",
      "authorizationCode",
      "IDToken",
      "auth[IDToken]",
      "JWTToken",
      "auth[OAuthIDToken]",
    ]) {
      const target = new URL("https://4planetatlas.com/explore?habitat=kelp");
      target.searchParams.set(key, "SYNTHETIC_ONLY");
      assert.equal(
        identityClient.safeReturnTo(target.href),
        "https://4planetatlas.com/explore?habitat=kelp",
        key
      );
    }
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

test("return sanitizer rejects structured credential values", () => {
  const previousWindow = globalThis.window;
  globalThis.window = { location: { origin: "https://id.4planet.org" } };
  try {
    for (const value of [
      '{"access_token":"SYNTHETIC_ONLY"}',
      '{"refresh_token":"SYNTHETIC_ONLY"}',
      '{"id_token":"SYNTHETIC_ONLY"}',
      '{ "session_token" : "SYNTHETIC_ONLY" }',
      '{"accessToken":"SYNTHETIC_ONLY"}',
      '{"refreshToken":"SYNTHETIC_ONLY"}',
      '{"idToken":"SYNTHETIC_ONLY"}',
      '{"sessionToken":"SYNTHETIC_ONLY"}',
      '{"OAuthIDToken":"SYNTHETIC_ONLY"}',
      JSON.stringify({ meta: JSON.stringify({ accessToken: "SYNTHETIC_ONLY" }) }),
      JSON.stringify([{ meta: JSON.stringify({ refreshToken: "SYNTHETIC_ONLY" }) }]),
      JSON.stringify({ meta: '{"access\\u0054oken":"SYNTHETIC_ONLY"}' }),
      JSON.stringify([{ meta: '{"refresh\\u0054oken":"SYNTHETIC_ONLY"}' }]),
      '{"access\\u0054oken":"SYNTHETIC_ONLY"',
      '{"refresh\\u0054oken":"SYNTHETIC_ONLY"',
      '{"accessToken":"SYNTHETIC_ONLY"',
    ]) {
      const target = new URL("https://4planetatlas.com/explore?habitat=kelp");
      target.searchParams.set("payload", value);
      assert.equal(
        identityClient.safeReturnTo(target.href),
        "https://4planetatlas.com/explore?habitat=kelp",
        value
      );
    }
    const benign = new URL("https://4planetatlas.com/explore?habitat=kelp");
    benign.searchParams.set("payload", '{"habitat":"kelp"}');
    assert.equal(identityClient.safeReturnTo(benign.href), benign.href);
    const benignString = new URL("https://4planetatlas.com/explore?habitat=kelp");
    benignString.searchParams.set("payload", JSON.stringify({ meta: JSON.stringify({ habitat: "kelp" }) }));
    assert.equal(identityClient.safeReturnTo(benignString.href), benignString.href);
    const benignEscapedString = new URL("https://4planetatlas.com/explore?habitat=kelp");
    benignEscapedString.searchParams.set("payload", JSON.stringify({ meta: '{"habi\\u0074at":"kelp"}' }));
    assert.equal(identityClient.safeReturnTo(benignEscapedString.href), benignEscapedString.href);
    const benignMalformedEscaped = new URL("https://4planetatlas.com/explore?habitat=kelp");
    benignMalformedEscaped.searchParams.set("payload", '{"habi\\u0074at":"kelp"');
    assert.equal(identityClient.safeReturnTo(benignMalformedEscaped.href), benignMalformedEscaped.href);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

test("return sanitizer preserves benign structured deep-link keys", () => {
  const previousWindow = globalThis.window;
  globalThis.window = { location: { origin: "https://id.4planet.org" } };
  try {
    const target = new URL("https://4planetatlas.com/explore");
    target.searchParams.set("habitat[focus]", "kelp");
    target.searchParams.set("atlas.layer", "food");
    target.searchParams.set("utm-source", "network");
    target.searchParams.set("view", "coastal");
    assert.equal(identityClient.safeReturnTo(target.href), target.href);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

test("incomplete OAuth credential fragments are scrubbed before early return", async () => {
  const previousWindow = globalThis.window;
  const replacements = [];
  globalThis.window = {
    location: {
      origin: "https://id.4planet.org",
      hash: "",
      pathname: "/auth/callback",
      search: "?source=google",
    },
    history: {
      replaceState(_state, _title, value) {
        replacements.push(value);
      },
    },
  };
  try {
    for (const fragment of [
      "#access_token=SYNTHETIC_ONLY",
      "#refresh_token=SYNTHETIC_ONLY",
    ]) {
      replacements.length = 0;
      globalThis.window.location.hash = fragment;
      assert.equal(await identityClient.recoverOAuthSessionFromLocation(), null);
      assert.deepEqual(replacements, ["/auth/callback?source=google"], fragment);
    }
    replacements.length = 0;
    globalThis.window.location.hash = "#atlas-map";
    assert.equal(await identityClient.recoverOAuthSessionFromLocation(), null);
    assert.deepEqual(replacements, []);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
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
    assert.ok(client.includes(`"https://${host}"`), `trusted HTTPS origin missing: ${host}`);
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
