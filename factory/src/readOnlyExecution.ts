import type { Outcome, WorkPackage } from "./contracts";

// Source pages are frequently substantially larger than the small machine-readable
// endpoints used by the first canary. Keep the read bounded, but large enough to
// fingerprint real authoritative pages such as NOAA species records without
// misclassifying normal page size as a source failure.
const MAX_SOURCE_BYTES = 1_048_576;
const MAX_BROWSER_BYTES = 8_000_000;
const MAX_SOURCE_REDIRECTS = 5;
const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^0\./,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^\[?::1\]?$/,
];

export interface ExecutionTarget {
  url: URL;
  host: string;
}

export function validateExecutionTarget(targetUrl: string, allowedHosts: string[]): ExecutionTarget {
  let url: URL;
  try {
    url = new URL(targetUrl);
  } catch {
    throw new Error("Execution target must be a valid URL");
  }
  if (url.protocol !== "https:") throw new Error("Execution target must use HTTPS");
  const host = url.hostname.toLowerCase();
  if (PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(host))) throw new Error("Private/local execution targets are forbidden");
  if (allowedHosts.length === 0) throw new Error("Execution target requires an explicit allowlist");
  const allowed = allowedHosts.some((entry) => {
    const candidate = entry.trim().toLowerCase();
    return candidate.length > 0 && (host === candidate || host.endsWith(`.${candidate}`));
  });
  if (!allowed) throw new Error(`Execution target host is not allowlisted: ${host}`);
  return { url, host };
}

/**
 * Redirects are new execution targets, not a transport detail. Every hop must
 * pass the same HTTPS/private-network/host allowlist gate as the original URL.
 */
export function validateRedirectTarget(currentUrl: string, location: string, allowedHosts: string[]): ExecutionTarget {
  let resolved: URL;
  try {
    resolved = new URL(location, currentUrl);
  } catch {
    throw new Error("Source redirect target must be a valid URL");
  }
  return validateExecutionTarget(resolved.toString(), allowedHosts);
}

async function readBounded(response: Response, maxBytes: number): Promise<Uint8Array> {
  const declared = Number(response.headers.get("content-length") ?? "0");
  if (declared > maxBytes) throw new Error(`Execution response exceeds ${maxBytes} byte limit`);
  if (!response.body) return new Uint8Array();

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel("bounded execution response limit exceeded");
        throw new Error(`Execution response exceeds ${maxBytes} byte limit`);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const joined = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    joined.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return joined;
}

async function sha256(bytes: Uint8Array): Promise<string> {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const digest = await crypto.subtle.digest("SHA-256", copy.buffer);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function baseOutcome(pkg: WorkPackage, values: Omit<Outcome, "workPackageId" | "expected" | "completedAt">): Outcome {
  return {
    workPackageId: pkg.id,
    expected: pkg.definitionOfDone.join("; "),
    completedAt: new Date().toISOString(),
    ...values,
  };
}

async function browserQa(env: Cloudflare.Env, pkg: WorkPackage): Promise<Outcome> {
  const execution = pkg.execution;
  if (!execution || execution.kind !== "BROWSER_QA") throw new Error("BROWSER_QA execution spec required");
  const target = validateExecutionTarget(execution.targetUrl, execution.allowedHosts);
  const viewport = execution.viewport ?? { width: 390, height: 844, deviceScaleFactor: 1 };
  if (viewport.width < 240 || viewport.width > 1920 || viewport.height < 320 || viewport.height > 2000) {
    throw new Error("Browser QA viewport is outside bounded limits");
  }

  const response = await env.BROWSER.quickAction("snapshot", {
    url: target.url.toString(),
    formats: ["screenshot", "markdown", "accessibilityTree"],
    viewport,
    gotoOptions: { waitUntil: "networkidle2", timeout: 30_000 },
  });
  const bytes = await readBounded(response, MAX_BROWSER_BYTES);
  const hash = await sha256(bytes);
  const browserMs = response.headers.get("x-browser-ms-used") ?? "UNKNOWN";

  if (!response.ok) {
    return baseOutcome(pkg, {
      status: "BLOCKED",
      evidence: [`browser snapshot FAIL ${target.url.toString()}`, `HTTP ${response.status}`, `payload-sha256 ${hash}`],
      materialDelta: `Browser QA could not verify the rendered target; snapshot returned HTTP ${response.status}.`,
      actual: `Browser Run snapshot failed for ${target.url.toString()}.`,
      limitation: "No product/design acceptance may be inferred from a failed browser snapshot.",
    });
  }

  return baseOutcome(pkg, {
    status: "ACCEPTED",
    evidence: [
      `browser snapshot PASS ${target.url.toString()}`,
      `viewport ${viewport.width}x${viewport.height}`,
      `snapshot-bytes ${bytes.byteLength}`,
      `snapshot-sha256 ${hash}`,
      `browser-ms ${browserMs}`,
    ],
    materialDelta: `Verified the rendered browser target at ${viewport.width}x${viewport.height} and captured screenshot, Markdown and accessibility evidence without changing the target.`,
    actual: `Cloudflare Browser Run returned a successful bounded rendered snapshot for ${target.url.toString()}.`,
    limitation: "This proves render/QA evidence collection only; visual quality judgement and product improvement require evaluator/reference comparison.",
  });
}

async function fetchAllowlistedSource(target: ExecutionTarget, allowedHosts: string[]): Promise<{ response: Response; finalUrl: string; redirectCount: number }> {
  let current = target;
  for (let redirectCount = 0; redirectCount <= MAX_SOURCE_REDIRECTS; redirectCount += 1) {
    const response = await fetch(current.url, {
      method: "GET",
      redirect: "manual",
      headers: {
        accept: "text/html,application/json,text/plain;q=0.9,*/*;q=0.1",
        "user-agent": "4PLANET-Production-Factory/1.0 source-verification",
      },
    });

    if (response.status < 300 || response.status >= 400) {
      return { response, finalUrl: current.url.toString(), redirectCount };
    }

    if (redirectCount === MAX_SOURCE_REDIRECTS) throw new Error(`Source redirect limit exceeded (${MAX_SOURCE_REDIRECTS})`);
    const location = response.headers.get("location");
    if (!location) throw new Error(`Source returned HTTP ${response.status} redirect without Location header`);
    current = validateRedirectTarget(current.url.toString(), location, allowedHosts);
  }
  throw new Error("Unreachable source redirect state");
}

async function sourceCheck(pkg: WorkPackage): Promise<Outcome> {
  const execution = pkg.execution;
  if (!execution || execution.kind !== "HTTP_SOURCE_CHECK") throw new Error("HTTP_SOURCE_CHECK execution spec required");
  const target = validateExecutionTarget(execution.targetUrl, execution.allowedHosts);
  const { response, finalUrl, redirectCount } = await fetchAllowlistedSource(target, execution.allowedHosts);
  const bytes = await readBounded(response, MAX_SOURCE_BYTES);
  const hash = await sha256(bytes);
  const contentType = response.headers.get("content-type") ?? "UNKNOWN";

  const evidence = [
    `source ${response.ok ? "PASS" : "FAIL"} ${target.url.toString()}`,
    `HTTP ${response.status}`,
    `final-url ${finalUrl}`,
    `validated-redirects ${redirectCount}`,
    `content-type ${contentType}`,
    `bounded-bytes ${bytes.byteLength}`,
    `content-sha256 ${hash}`,
  ];

  if (!response.ok) {
    return baseOutcome(pkg, {
      status: "BLOCKED",
      evidence,
      materialDelta: `Source verification did not succeed; authoritative endpoint returned HTTP ${response.status}.`,
      actual: `Source endpoint failed bounded retrieval with HTTP ${response.status}.`,
      limitation: "No scientific/data conclusion may be drawn from an unavailable source.",
    });
  }

  return baseOutcome(pkg, {
    status: "ACCEPTED",
    evidence,
    materialDelta: `Verified the allowlisted source endpoint is reachable and captured a bounded content fingerprint with provenance metadata across ${redirectCount} validated redirect hop(s).`,
    actual: `Fetched ${bytes.byteLength} bounded bytes from ${finalUrl} with content type ${contentType}.`,
    limitation: "Reachability and content fingerprint do not prove semantic correctness, licence suitability or scientific claim validity; those remain separate review gates.",
  });
}

/** Returns undefined when no real bound adapter exists for the package. */
export async function executeReadOnlyPackage(env: Cloudflare.Env, pkg: WorkPackage): Promise<Outcome | undefined> {
  if (!pkg.execution) return undefined;
  if (pkg.execution.kind === "BROWSER_QA") return browserQa(env, pkg);
  if (pkg.execution.kind === "HTTP_SOURCE_CHECK") return sourceCheck(pkg);
  return undefined;
}
