import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const atlas = JSON.parse(fs.readFileSync(path.join(root, "src/data/atlasDiscovery.json"), "utf8"));
const slugs = ["earth", "fires", "whales"];
const objects = slugs.map((slug) => {
  const object = atlas.objects.find((item) => item.slug === slug);
  assert.ok(object, `missing atlas object ${slug}`);
  return object;
});

let distDir = "";
let publicServer;
let atlasServer;
let publicPort = 0;
let atlasPort = 0;

function parseRedirects(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const [source, destination, code = "302"] = line.split(/\s+/);
      const names = [];
      const pattern = source
        .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
        .replace(/\\\*/g, () => {
          names.push("splat");
          return "(.*)";
        });
      return { source, destination, code: Number(code), names, re: new RegExp(`^${pattern}$`) };
    });
}

function matchRedirect(rules, pathname) {
  for (const rule of rules) {
    const match = pathname.match(rule.re);
    if (!match) continue;
    let destination = rule.destination;
    rule.names.forEach((name, index) => {
      destination = destination.replaceAll(name === "splat" ? ":splat" : `:${name}`, match[index + 1] ?? "");
    });
    return { ...rule, destination };
  }
  return null;
}

function resolveAsset(dist, pathname) {
  const clean = pathname.replace(/\/+$/, "");
  const relative = clean.replace(/^\/+/, "");
  const base = path.resolve(dist);
  const direct = path.resolve(base, relative);
  if (direct !== base && !direct.startsWith(base + path.sep)) return null;
  if (relative && fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  const index = path.resolve(base, relative, "index.html");
  if ((index === base || index.startsWith(base + path.sep)) && fs.existsSync(index)) return index;
  return null;
}

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server.address().port));
  });
}

async function follow(startUrl) {
  const hops = [];
  let current = startUrl;
  for (let i = 0; i < 8; i += 1) {
    const response = await fetch(current, { redirect: "manual" });
    const location = response.headers.get("location");
    hops.push({ url: current, status: response.status, location });
    if (response.status >= 300 && response.status < 400 && location) {
      current = new URL(location, current).toString();
      continue;
    }
    return { hops, finalUrl: current, status: response.status, body: await response.text() };
  }
  throw new Error(`redirect limit exceeded from ${startUrl}`);
}

before(async () => {
  distDir = fs.mkdtempSync(path.join(os.tmpdir(), "atlas-discovery-redirect-"));
  fs.copyFileSync(path.join(root, "index.html"), path.join(distDir, "index.html"));
  const prerender = spawnSync(process.execPath, ["scripts/prerender-discovery-seo.mjs"], {
    cwd: root,
    env: { ...process.env, DISCOVERY_PRERENDER_DIST: distDir },
    encoding: "utf8",
  });
  assert.equal(prerender.status, 0, prerender.stderr || prerender.stdout);

  const rules = parseRedirects(fs.readFileSync(path.join(root, "public/_redirects"), "utf8"));
  atlasServer = http.createServer((req, res) => {
    const url = new URL(req.url || "/", "http://127.0.0.1");
    const rule = matchRedirect(rules, url.pathname);
    if (rule && rule.code >= 300 && rule.code < 400) {
      const location = new URL(rule.destination, url);
      if (!rule.destination.includes("?")) location.search = url.search;
      res.writeHead(rule.code, { Location: location.pathname + location.search });
      res.end();
      return;
    }
    const asset = resolveAsset(distDir, url.pathname);
    if (asset) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(fs.readFileSync(asset));
      return;
    }
    if (rule && rule.code === 200) {
      const assetPath = resolveAsset(distDir, rule.destination) || path.join(distDir, "index.html");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(fs.readFileSync(assetPath));
      return;
    }
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("missing");
  });
  atlasPort = await listen(atlasServer);

  // Models the observed public edge only. This repository does not mutate that edge.
  publicServer = http.createServer((req, res) => {
    const url = new URL(req.url || "/", "http://127.0.0.1");
    const match = url.pathname.match(/^\/atlas\/([^/]+)\/?$/);
    if (!match || !slugs.includes(match[1])) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("not a discovery entry");
      return;
    }
    const suffix = url.pathname.endsWith("/") ? "/" : "";
    res.writeHead(308, { Location: `http://127.0.0.1:${atlasPort}/${match[1]}${suffix}${url.search}` });
    res.end();
  });
  publicPort = await listen(publicServer);
});

after(async () => {
  await Promise.all([publicServer, atlasServer].filter(Boolean).map((server) => new Promise((resolve) => server.close(resolve))));
  if (distDir) fs.rmSync(distDir, { recursive: true, force: true });
});

for (const object of objects) {
  test(`${object.slug} public redirect chain delivers object raw HTML`, async () => {
    const result = await follow(`http://127.0.0.1:${publicPort}/atlas/${object.slug}`);
    assert.deepEqual(result.hops.map((hop) => hop.status), [308, 308, 200], `${object.slug} hop chain ${JSON.stringify(result.hops)}`);
    assert.equal(new URL(result.hops[0].location).pathname, `/${object.slug}`);
    assert.equal(new URL(result.hops[1].location, result.hops[1].url).pathname, `/atlas/${object.slug}/`);
    assert.equal(result.status, 200);
    assert.equal(new URL(result.finalUrl).pathname, `/atlas/${object.slug}/`);

    assert.match(result.body, new RegExp(`<title>${object.title}</title>`));
    assert.match(result.body, new RegExp(`<h1>${object.name}</h1>`));
    assert.match(result.body, new RegExp(`<link rel="canonical" href="https://4planet.org/atlas/${object.slug}" />`));
    const jsonLd = result.body.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.equal((result.body.match(/application\/ld\+json/g) || []).length, 1);
    const schema = JSON.parse(jsonLd?.[1] || "");
    assert.equal(schema["@type"], "WebPage");
    assert.equal(schema.name, object.title);
    assert.equal(schema.url, `https://4planet.org/atlas/${object.slug}`);
    assert.deepEqual(schema.citation, object.sources.map((source) => source.url));
    for (const source of object.sources) assert.match(result.body, new RegExp(source.url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    for (const limit of object.limitations) assert.match(result.body, new RegExp(limit.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(result.body, /Open live ATLAS/);
    assert.match(result.body, new RegExp(object.atlasHref.replaceAll("&", "&amp;").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.doesNotMatch(result.body, /<div id="root"><\/div>/);
    assert.doesNotMatch(result.body, /<title>4PLANET_ — For a Living Planet<\/title>/);

    for (const other of objects) {
      if (other.slug === object.slug) continue;
      assert.doesNotMatch(result.body, new RegExp(`<h1>${other.name}</h1>`));
      assert.doesNotMatch(result.body, new RegExp(`<title>${other.title}</title>`));
    }
  });
}

test("shared discovery prerender still preserves full Open Graph metadata keys", async () => {
  const source = fs.readFileSync(path.join(root, "scripts/prerender-discovery-seo.mjs"), "utf8");
  assert.match(source, /selector\.indexOf\(":"\)/);
  assert.doesNotMatch(source, /selector\.split\(":"\)/);
  const orca = fs.readFileSync(path.join(distDir, "species", "orca", "index.html"), "utf8");
  for (const token of [
    'property="og:title"',
    'property="og:description"',
    'property="og:url"',
    'name="twitter:title"',
    'name="twitter:description"',
  ]) assert.match(orca, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(orca, /property="og"(?!:)/);
  assert.doesNotMatch(orca, /name="twitter"(?!:)/);
});
