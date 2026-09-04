#!/usr/bin/env node

import fs from "node:fs";

const registryPath = process.argv[2] || "docs/control/PRODUCT_SURFACE_REGISTRY.json";
const runtimePath = process.argv[3] || "artifacts/four-state-runtime.json";
const outputPath = process.argv[4] || "artifacts/four-state-worker.mjs";

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const runtime = JSON.parse(fs.readFileSync(runtimePath, "utf8"));

if (!runtime.heir?.origin || !runtime.heir?.sha || !runtime.heir?.render_origin) throw new Error("runtime HEIR origin/SHA/render origin missing");
for (const [product, record] of Object.entries(registry.products || {})) {
  if (record.sandbox && (!runtime.sandboxes?.[product]?.origin || !runtime.sandboxes?.[product]?.render_origin)) {
    throw new Error(`runtime sandbox origin/render origin missing for ${product}`);
  }
}

const config = {
  generatedAt: new Date().toISOString(),
  reviewHost: "test.4planet.org",
  archiveHost: "archive.4planet.org",
  heir: runtime.heir,
  sandboxes: runtime.sandboxes || {},
  products: Object.fromEntries(Object.entries(registry.products || {}).map(([product, item]) => [product, {
    live: item.live,
    heir: item.heir,
    sandbox: item.sandbox ? {
      branch: item.sandbox.branch,
      review_path: item.sandbox.review_path,
      origin_path: item.sandbox.origin_path,
      pr: item.sandbox.pr,
      lineage_state: item.sandbox.lineage_state
    } : null
  }])),
  deployments: runtime.deployments || []
};

const source = `const CONFIG = ${JSON.stringify(config)};

const esc = (value) => String(value ?? "").replace(/[&<>\"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","\\\"":"&quot;","'":"&#39;"}[ch]));
const page = (body, title = "4PLANET CONTROL") => new Response(\`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>\${esc(title)}</title><style>html,body{margin:0;background:#fff;color:#050505;font-family:Arial,Helvetica,sans-serif}*{box-sizing:border-box}a{color:inherit}header{padding:24px;border-bottom:1px solid #111;display:flex;justify-content:space-between;gap:20px;align-items:baseline}main{padding:24px}.mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1px;background:#111;border:1px solid #111}.card{background:#fff;padding:18px;min-height:190px}.state{font-size:11px;letter-spacing:.12em}.links{display:grid;gap:8px;margin-top:18px}.links a{display:block;border-top:1px solid #bbb;padding-top:8px;text-decoration:none}.muted{color:#666}.bad{color:#9a0000}.ok{color:#006d33}input{width:100%;padding:12px;border:1px solid #111;margin:0 0 16px;font:inherit}table{border-collapse:collapse;width:100%;font-size:13px}th,td{text-align:left;border-bottom:1px solid #ddd;padding:9px;vertical-align:top}iframe{position:fixed;inset:0;width:100vw;height:100vh;border:0;background:white}.badge{position:fixed;right:8px;bottom:8px;z-index:2147483647;background:#000;color:#fff;padding:6px 8px;font:10px ui-monospace,SFMono-Regular,monospace;text-decoration:none;opacity:.28}.badge:hover,.badge:focus{opacity:1}</style></head><body>\${body}</body></html>\`,{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store","x-robots-tag":"noindex, nofollow","x-4planet-control-plane":"four-state-v1"}});

function frame(target, product, state, sha) {
  const src = esc(target);
  return page(\`<iframe src="\${src}" title="\${esc(product)} \${esc(state)}"></iframe><a class="badge" href="/_control" target="_top">\${esc(state)} · \${esc(product)} · \${esc(String(sha).slice(0,8))}</a>\`, \`\${product} \${state}\`);
}

function dashboard() {
  const cards = Object.entries(CONFIG.products).map(([name,p]) => {
    const heirUrl = p.heir.review_path;
    const sandbox = p.sandbox ? \`<a href="\${esc(p.sandbox.review_path)}">SANDBOX <span class="mono">\${esc(CONFIG.sandboxes[name]?.sha?.slice(0,8) || "UNRESOLVED")}</span></a>\` : '<span class="muted">SANDBOX — none registered</span>';
    return \`<section class="card"><div class="state">\${esc(name)}</div><h2>\${esc(name)}</h2><div class="mono">HEIR \${esc(CONFIG.heir.sha.slice(0,12))}</div><div class="links"><a href="\${esc(p.live.url)}" target="_blank" rel="noreferrer">LIVE ↗</a><a href="\${esc(heirUrl)}">HEIR</a>\${sandbox}</div></section>\`;
  }).join('');
  return page(\`<header><div><strong>4PLANET_ PRODUCT CONTROL</strong><div class="mono">LIVE / HEIR / SANDBOX / ARCHIVED</div></div><div class="mono">HEIR \${esc(CONFIG.heir.sha)}</div></header><main><p>Human-visible authority surface. Branch recency is not product authority.</p><div class="grid">\${cards}</div><p class="mono">Generated \${esc(CONFIG.generatedAt)} · <a href="https://archive.4planet.org/">OPEN ARCHIVE ↗</a></p></main>\`, "4PLANET PRODUCT CONTROL");
}

function archive() {
  const rows = CONFIG.deployments.map(d => \`<tr data-row><td>\${esc(d.branch || "unknown")}</td><td class="mono">\${esc((d.sha || "").slice(0,12))}</td><td>\${esc(d.environment || "preview")}</td><td>\${esc(d.created_on || "")}</td><td><a href="\${esc(d.url)}" target="_blank" rel="noreferrer">VIEW ↗</a></td></tr>\`).join('');
  return page(\`<header><div><strong>4PLANET_ VISUAL ARCHIVE</strong><div class="mono">immutable Cloudflare Pages deliveries · no product authority</div></div><div><a href="https://test.4planet.org/_control">CONTROL ↗</a></div></header><main><input id="q" placeholder="Filter product / branch / SHA" aria-label="Filter archive"><table><thead><tr><th>BRANCH / LINEAGE</th><th>SHA</th><th>ENV</th><th>CREATED</th><th>VISUAL</th></tr></thead><tbody>\${rows}</tbody></table><script>const q=document.getElementById('q');q.addEventListener('input',()=>{const s=q.value.toLowerCase();document.querySelectorAll('[data-row]').forEach(r=>r.hidden=!r.textContent.toLowerCase().includes(s))})</script></main>\`, "4PLANET VISUAL ARCHIVE");
}

function normalise(pathname) { if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0,-1); return pathname || '/'; }

export default { async fetch(request) {
  const url = new URL(request.url);
  if (url.hostname === CONFIG.archiveHost) return archive();
  if (url.hostname !== CONFIG.reviewHost) return new Response("Unknown control host", {status:404});
  const path = normalise(url.pathname);
  if (path === '/_control') return dashboard();

  for (const [product,p] of Object.entries(CONFIG.products)) {
    if (p.sandbox && path === normalise(p.sandbox.review_path)) {
      const runtime = CONFIG.sandboxes[product];
      if (!runtime?.render_origin) return page('<main><h1>SANDBOX UNRESOLVED</h1></main>', product);
      return frame(runtime.render_origin + p.sandbox.origin_path, product, 'SANDBOX', runtime.sha);
    }
  }
  for (const [product,p] of Object.entries(CONFIG.products)) {
    if (path === normalise(p.heir.review_path)) return frame(CONFIG.heir.render_origin + p.heir.origin_path, product, 'HEIR', CONFIG.heir.sha);
  }
  return dashboard();
}};
`;

fs.mkdirSync(new URL(".", `file://${process.cwd()}/${outputPath}`).pathname, { recursive: true });
fs.writeFileSync(outputPath, source);
console.log(`wrote ${outputPath}`);
