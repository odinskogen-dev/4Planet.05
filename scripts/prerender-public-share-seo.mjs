import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const indexPath = path.join(dist, "index.html");
const manifestPath = path.join(root, "src", "content", "shareMeta.json");

if (!fs.existsSync(indexPath)) {
  throw new Error("dist/index.html is missing; run Vite build before public share prerender");
}
if (!fs.existsSync(manifestPath)) {
  throw new Error("src/content/shareMeta.json is missing");
}

const baseHtml = fs.readFileSync(indexPath, "utf8");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const origin = (process.env.PUBLIC_SITE_ORIGIN || process.env.VITE_PUBLIC_SITE_ORIGIN || manifest.origin || "https://4planet.org").replace(/\/$/, "");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function absoluteUrl(value) {
  if (/^https?:\/\//i.test(value)) return value;
  return `${origin}${value.startsWith("/") ? value : `/${value}`}`;
}

function stripManagedHead(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/<meta\s+name=["']description["'][^>]*>/gi, "")
    .replace(/<meta\s+name=["']robots["'][^>]*>/gi, "")
    .replace(/<meta\s+property=["']og:[^"']+["'][^>]*>/gi, "")
    .replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi, "")
    .replace(/<link\s+rel=["']canonical["'][^>]*>/gi, "")
    .replace(/<script\s+type=["']application\/ld\+json["'][^>]*data-4planet-share[^>]*>[\s\S]*?<\/script>/gi, "");
}

function headMarkup(route, meta) {
  const canonicalPath = meta.canonicalPath || route;
  const canonical = absoluteUrl(canonicalPath === "/" ? "/" : canonicalPath);
  const image = absoluteUrl(meta.image);
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: meta.title,
    description: meta.description,
    url: canonical,
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: image,
      caption: meta.imageAlt,
    },
    isPartOf: {
      "@type": "WebSite",
      name: manifest.siteName,
      url: absoluteUrl("/"),
    },
  }).replaceAll("<", "\\u003c");

  return [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}">`,
    `<meta name="robots" content="${escapeHtml(meta.robots || "index,follow,max-image-preview:large")}">`,
    `<link rel="canonical" href="${escapeHtml(canonical)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${escapeHtml(manifest.siteName)}">`,
    `<meta property="og:locale" content="${escapeHtml(manifest.locale || "en_GB")}">`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}">`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}">`,
    `<meta property="og:url" content="${escapeHtml(canonical)}">`,
    `<meta property="og:image" content="${escapeHtml(image)}">`,
    `<meta property="og:image:secure_url" content="${escapeHtml(image)}">`,
    `<meta property="og:image:alt" content="${escapeHtml(meta.imageAlt)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}">`,
    `<meta name="twitter:image" content="${escapeHtml(image)}">`,
    `<meta name="twitter:image:alt" content="${escapeHtml(meta.imageAlt)}">`,
    `<script type="application/ld+json" data-4planet-share="true">${jsonLd}</script>`,
  ].join("\n    ");
}

function writeRoute(route, meta) {
  const clean = stripManagedHead(baseHtml);
  const html = clean.replace("</head>", `    ${headMarkup(route, meta)}\n  </head>`);
  const target = route === "/"
    ? indexPath
    : path.join(dist, route.replace(/^\//, ""), "index.html");

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html, "utf8");
}

for (const [route, meta] of Object.entries(manifest.routes)) {
  writeRoute(route, meta);
}

console.log(`Prerendered premium 4PLANET share metadata for ${Object.keys(manifest.routes).length} public routes at ${origin}`);
