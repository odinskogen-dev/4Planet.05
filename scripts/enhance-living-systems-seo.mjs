import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LIVING_SYSTEMS_SEARCH_PAGES, LIVING_SYSTEMS_CANONICAL_PREFIX } from "./living-systems-search-surfaces.mjs";

const escapeHtml = (v) => String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
const safeJson = (v) => JSON.stringify(v).replaceAll("<","\\u003c");
const headerRegex = (name) => new RegExp('<meta\\s+name=["\\x27]'+name+'["\\x27][^>]*>', "gi");
const propertyRegex = (name) => new RegExp('<meta\\s+property=["\\x27]'+name+'["\\x27][^>]*>', "gi");

export function enrichLivingSystemsHtml(original, page) {
  if (!original.includes("</head>") || !/<h1(?:\s|>)/i.test(original)) {
    throw new Error("REFUSE_MISSING_HEAD_OR_VISIBLE_H1: "+page.path);
  }
  if (!original.includes("LIVING SYSTEMS") && !original.includes("Living Systems")) {
    throw new Error("REFUSE_WRONG_PRODUCT: "+page.path);
  }
  if (/<meta[^>]+name=["']robots["'][^>]*noindex/i.test(original)) {
    throw new Error("REFUSE_EXISTING_NOINDEX: "+page.path);
  }
  if (!page.path.startsWith("/") || !page.path.endsWith("/") || /[?#]/.test(page.path)) {
    throw new Error("REFUSE_BAD_ROUTE");
  }

  const url = LIVING_SYSTEMS_CANONICAL_PREFIX + page.path;
  const canonicals = [...original.matchAll(/<link\s+[^>]*rel=["']canonical["'][^>]*>/gi)].map(([tag]) => tag);
  if (canonicals.length > 1 || (canonicals[0] && !canonicals[0].includes(url))) {
    throw new Error("REFUSE_CONFLICTING_CANONICAL: "+page.path);
  }

  let result = original;
  const description = '<meta name="description" content="'+escapeHtml(page.description)+'"/>';
  result = result.replace(headerRegex("description"),"");
  result = result.replace(/<title>[\s\S]*?<\/title>/i,"<title>"+escapeHtml(page.title)+"</title>");
  if (!result.includes("<title>")) throw new Error("REFUSE_MISSING_TITLE");

  // Canonical and metadata must be present in the delivered HTML before JS executes.
  result = result.replace(headerRegex("robots"),"");
  result = result.replace(propertyRegex("og:title"),"");
  result = result.replace(propertyRegex("og:description"),"");
  result = result.replace(propertyRegex("og:url"),"");
  const structured = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": url+"#webpage",
    url, name:page.title, description:page.description,
    isPartOf: { "@type":"WebSite", "@id":"https://4planet.org/#website", name:"4PLANET", url:"https://4planet.org/" }
  };
  const additions = [
    description,
    '<meta name="robots" content="index,follow,max-image-preview:large"/>',
    canonicals.length ? "" : '<link rel="canonical" href="'+escapeHtml(url)+'"/>',
    '<meta property="og:type" content="website"/>',
    '<meta property="og:title" content="'+escapeHtml(page.title)+'"/>',
    '<meta property="og:description" content="'+escapeHtml(page.description)+'"/>',
    '<meta property="og:url" content="'+escapeHtml(url)+'"/>',
    '<script type="application/ld+json" data-4planet-lsi-discovery="true">'+safeJson(structured)+'</script>'
  ].filter(Boolean).join("");
  return result.replace("</head>", additions+"</head>");
}

const isDirectExecution = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectExecution) {
  const root = process.cwd();
  let patched = 0;
  for (const page of LIVING_SYSTEMS_SEARCH_PAGES) {
    const output = path.join(root,"public","livingsystems",page.path.slice(1),"index.html");
    if (!fs.existsSync(output)) throw new Error("REFUSE_UNBUILT_LIVING_SYSTEMS_ROUTE: "+output);
    const before = fs.readFileSync(output,"utf8");
    const after = enrichLivingSystemsHtml(before,page);
    if (after === before) throw new Error("REFUSE_NO_CHANGE: "+page.path);
    fs.writeFileSync(output,after,"utf8");
    patched++;
    console.log("LIVING_SYSTEMS_SOURCE_PRESERVED_DISCOVERY_ENRICHED",page.path);
  }
  if (patched !== LIVING_SYSTEMS_SEARCH_PAGES.length) throw new Error("MISSING_SEARCH_SURFACE");
  console.log("LIVING_SYSTEMS_SEO_SAFETY_PASS",patched,"unchanged source files; public export HTML only");
}
