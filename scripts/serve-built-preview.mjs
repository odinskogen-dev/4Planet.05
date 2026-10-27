import { createServer } from "node:http";
import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { extname, isAbsolute, join, normalize, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

const MIME_TYPES = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
  [".xml", "application/xml; charset=utf-8"],
]);

function safeRelativePath(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  if (decoded.includes("\0") || decoded.includes("\\")) return null;

  const relative = normalize(decoded.replace(/^\/+/, ""));
  if (isAbsolute(relative) || relative === ".." || relative.startsWith(`..${sep}`)) {
    return null;
  }

  return relative === "." ? "" : relative;
}

function isInside(root, candidate) {
  return candidate === root || candidate.startsWith(`${root}${sep}`);
}

async function readableFile(path) {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

export async function resolveBuiltPreviewFile(rootDirectory, pathname) {
  const root = resolve(rootDirectory);
  const relative = safeRelativePath(pathname);
  if (relative === null) return null;

  const hasExtension = extname(relative) !== "";
  const candidates = hasExtension
    ? [join(root, relative)]
    : [join(root, relative, "index.html"), join(root, `${relative}.html`), join(root, "index.html")];

  for (const candidate of candidates) {
    if (isInside(root, candidate) && (await readableFile(candidate))) return candidate;
  }

  return null;
}

export function createBuiltPreviewServer({ rootDirectory }) {
  const root = resolve(rootDirectory);

  return createServer(async (request, response) => {
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD" });
      response.end();
      return;
    }

    const pathname = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
    const file = await resolveBuiltPreviewFile(root, pathname);
    if (!file) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found\n");
      return;
    }

    const body = await readFile(file);
    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Length": body.byteLength,
      "Content-Type": MIME_TYPES.get(extname(file).toLowerCase()) ?? "application/octet-stream",
    });
    response.end(request.method === "HEAD" ? undefined : body);
  });
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  const host = process.env.PREVIEW_HOST ?? "127.0.0.1";
  const port = Number.parseInt(process.env.PREVIEW_PORT ?? "4173", 10);
  const rootDirectory = process.env.PREVIEW_ROOT ?? resolve(process.cwd(), "dist");

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PREVIEW_PORT: ${process.env.PREVIEW_PORT}`);
  }

  createBuiltPreviewServer({ rootDirectory }).listen(port, host, () => {
    console.log(`BUILT_PREVIEW_READY http://${host}:${port} root=${rootDirectory}`);
  });
}
