import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const CATALOGUE = path.join(ROOT, "atlas-data-sandbox", "sources.json");
const OUT_DIR = path.join(ROOT, "artifacts", "atlas-data-sandbox");
const TIMEOUT_MS = Number(process.env.ATLAS_PROBE_TIMEOUT_MS || 12000);
const CONCURRENCY = Math.max(1, Math.min(6, Number(process.env.ATLAS_PROBE_CONCURRENCY || 4)));
const USER_AGENT = "4PLANET-ATLAS-DATA-SANDBOX/1.0 (+https://4planet.org; non-production source probe)";

const catalogue = JSON.parse(await fs.readFile(CATALOGUE, "utf8"));
const candidates = catalogue.sources.filter((source) => source.probeUrl);

const redactUrl = (url) => {
  const u = new URL(url);
  for (const key of [...u.searchParams.keys()]) {
    if (/key|token|secret|password|auth/i.test(key)) u.searchParams.set(key, "REDACTED");
  }
  return u.toString();
};

async function probe(source) {
  const startedAt = new Date().toISOString();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const started = performance.now();

  try {
    const response = await fetch(source.probeUrl, {
      method: "GET",
      headers: {
        "user-agent": USER_AGENT,
        accept: "application/json, application/geo+json, application/xml, text/xml, text/html;q=0.8, */*;q=0.5",
      },
      signal: controller.signal,
      redirect: "follow",
    });

    const body = (await response.text()).slice(0, 250000);
    const expected = source.probeExpect || "";
    const expectedFound = expected ? body.toLowerCase().includes(String(expected).toLowerCase()) : true;
    const providerRequestBlock = source.id === "noaa-coral-reef-watch"
      && response.status === 403
      && /request blacklist|ip address|blacklist/i.test(body);
    const status = response.ok && expectedFound
      ? "PROBE_GREEN"
      : providerRequestBlock
        ? "CI_PROVIDER_REQUEST_BLOCKED"
        : response.status === 401 || response.status === 403
          ? "AUTH_OR_RIGHTS_BLOCK"
          : response.status === 429
            ? "RATE_LIMITED"
            : "PROBE_DEGRADED";

    return {
      id: source.id,
      name: source.name,
      status,
      httpStatus: response.status,
      expected,
      expectedFound,
      durationMs: Math.round(performance.now() - started),
      contentType: response.headers.get("content-type"),
      finalUrl: redactUrl(response.url || source.probeUrl),
      startedAt,
      checkedAt: new Date().toISOString(),
      note: providerRequestBlock
        ? "Provider rejected this shared CI egress IP after repeated requests. This is an environment/request-control state, not source absence or an auth/rights conclusion; deployed same-origin proof remains required."
        : response.ok
          ? (expectedFound ? "Endpoint responded and expected contract marker was present." : "Endpoint responded but expected contract marker was not found in bounded response sample.")
          : `HTTP ${response.status}`,
    };
  } catch (error) {
    const aborted = error?.name === "AbortError";
    return {
      id: source.id,
      name: source.name,
      status: aborted ? "TIMEOUT" : "NETWORK_OR_TLS_ERROR",
      httpStatus: null,
      expected: source.probeExpect || "",
      expectedFound: false,
      durationMs: Math.round(performance.now() - started),
      contentType: null,
      finalUrl: redactUrl(source.probeUrl),
      startedAt,
      checkedAt: new Date().toISOString(),
      note: aborted ? `Timed out after ${TIMEOUT_MS} ms.` : String(error?.message || error),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function runPool(items, concurrency) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await probe(items[index]);
      const r = results[index];
      console.log(`${r.status.padEnd(28)} ${r.id.padEnd(30)} ${String(r.httpStatus ?? "-").padStart(3)} ${String(r.durationMs).padStart(6)}ms`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

console.log(`ATLAS DATA SANDBOX source probe · ${candidates.length} endpoints · concurrency=${CONCURRENCY} · timeout=${TIMEOUT_MS}ms`);
const results = await runPool(candidates, CONCURRENCY);

const counts = results.reduce((acc, r) => {
  acc[r.status] = (acc[r.status] || 0) + 1;
  return acc;
}, {});

const report = {
  schemaVersion: 2,
  baselineSha: catalogue.baselineSha,
  branch: process.env.GITHUB_REF_NAME || "local",
  commitSha: process.env.GITHUB_SHA || null,
  generatedAt: new Date().toISOString(),
  timeoutMs: TIMEOUT_MS,
  concurrency: CONCURRENCY,
  counts,
  results,
};

const md = [
  "# ATLAS DATA SANDBOX — SOURCE PROBE REPORT",
  "",
  `Generated: ${report.generatedAt}`,
  `Branch: ${report.branch}`,
  `Commit: ${report.commitSha || "local"}`,
  `Baseline: ${report.baselineSha}`,
  "",
  "This is endpoint/contract health evidence only. PROBE_GREEN does not mean rights-approved, production-ready or map-integrated. Provider request blocking is kept separate from auth/rights and from source absence.",
  "",
  "| Source | Probe | HTTP | ms | Contract marker |",
  "|---|---:|---:|---:|---|",
  ...results.map((r) => `| ${r.name} | ${r.status} | ${r.httpStatus ?? "—"} | ${r.durationMs} | ${r.expected ? (r.expectedFound ? `✓ ${r.expected}` : `✗ ${r.expected}`) : "—"} |`),
  "",
  "## Status counts",
  "",
  ...Object.entries(counts).sort().map(([key, value]) => `- ${key}: ${value}`),
  "",
  "## Promotion boundary",
  "",
  "A source must still pass terms/licence, record semantics, normalisation, performance, map UX, failure-state and truth review before production promotion.",
  "",
].join("\n");

await fs.mkdir(OUT_DIR, { recursive: true });
await fs.writeFile(path.join(OUT_DIR, "source-probe-report.json"), JSON.stringify(report, null, 2) + "\n");
await fs.writeFile(path.join(OUT_DIR, "source-probe-report.md"), md);

console.log("\n" + md);
