#!/usr/bin/env node
/**
 * IMPACT search/AI-discovery snapshot — NATUREBRAIN → src/data/impactDiscovery.json
 *
 * The SEO prerender and sitemap read a build-time projection of the SAME public
 * NATUREBRAIN read the runtime uses (impact_lan_v02 → fallback impact_lan_gold_v01).
 * This is a crawlable representation, never a second truth store: every field is
 * copied from the projection; nothing is authored here.
 *
 * Modes
 *   (default)                    keep the committed snapshot (deterministic local/CI builds)
 *   CF_PAGES=1 or IMPACT_SNAPSHOT_LIVE=1
 *                                fetch live NATUREBRAIN at build time; on any failure keep the
 *                                committed snapshot and say so (fail-soft, never fail the build)
 *   --from <payload.json>        normalise a saved projection payload (fixtures / AXE dry-run)
 *   --check                      validate the committed snapshot and exit
 *
 * Scale batches are publication-gated in NATUREBRAIN; counts are never hard-coded here.\n * Result: once AXE publishes a project in NATUREBRAIN, the next Pages build prerenders
 * /impact/project/<slug>, its actor and issue pages, and lists them in sitemap.xml —
 * with no code change.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const target = path.join(root, "src/data/impactDiscovery.json");
const SUPABASE_URL = "https://ghvdzetmplqkdtfqiror.supabase.co";
const PUBLISHABLE_KEY = "sb_publishable_H6TT_u7YO4DVlvQdCJ06mA_VEvgxsOE"; // public, read-only (same as src/identity/identityClient.ts)

const args = process.argv.slice(2);
const fromIndex = args.indexOf("--from");
const fromFile = fromIndex >= 0 ? args[fromIndex + 1] : null;
const outIndex = args.indexOf("--out");
const outFile = outIndex >= 0 ? args[outIndex + 1] : target;

const text = (v) => (typeof v === "string" ? v.trim() : "");
const list = (v) => (Array.isArray(v) ? v : []);
const isRow = (v) => Boolean(v) && typeof v === "object" && !Array.isArray(v);
const tail = (id) => id.split(":").pop() || id;
const slugOf = (id, profile = {}) => (/^[a-z0-9][a-z0-9-]{0,118}$/.test(text(profile.slug)) ? text(profile.slug) : tail(id));
const https = (v) => (/^https:\/\//.test(text(v)) ? text(v) : null);
const claimsOf = (rows) => list(rows).filter((c) => isRow(c) && text(c.statement)).map((c) => ({
  statement: text(c.statement),
  review: text(c.review_status),
  strength: text(c.evidence_strength),
  interpretation: text(c.interpretation_status),
  source: text(c.citation) || text(c.source_name) || null,
  url: https(c.source_url),
  checkedAt: text(c.checked_at) || null,
  limitations: list(c.limitations).map(text).filter(Boolean),
}));
const citationsOf = (claims) => Array.from(new Set(claims.map((c) => c.url).filter(Boolean)));

export function normalise(payload) {
  if (!isRow(payload)) throw new Error("no payload");
  const isV02 = Array.isArray(payload.issues) || text(payload.version).includes("v02");
  const projects = [];
  const actors = new Map();
  const issues = new Map();
  const solutions = new Map();
  const places = new Map();

  if (isV02) {
    const nodes = (key, kind) => {
      for (const row of list(payload[key])) {
        if (!isRow(row) || !text(row.id) || !text(row.name)) continue;
        const profile = isRow(row.profile) ? row.profile : {};
        const base = {
          id: text(row.id),
          slug: slugOf(text(row.id), profile),
          name: text(row.name),
          description: text(row.description) || null,
          publication: text(profile.publication) === "public" ? "public" : "related",
          claims: claimsOf(row.evidence),
          whyItMatters: text(profile.why_it_matters) || null,
          unknowns: list(profile.unknowns).map(text).filter(Boolean),
          lastReviewed: text(profile.last_reviewed) || null,
          updatedAt: text(row.updated_at) || null,
        };
        if (kind === "actor") actors.set(base.id, { ...base, type: text(row.actor_type) || null, website: https(profile.website) });
        if (kind === "issue") issues.set(base.id, { ...base, domain: text(profile.domain) || null });
        if (kind === "solution") solutions.set(base.id, {
          ...base,
          type: text(row.solution_type) || null,
          maturity: text(profile.maturity) || null,
          mechanism: text(profile.mechanism) || null,
          applicability: list(profile.applicability).map(text).filter(Boolean),
          risks: list(profile.risks).map(text).filter(Boolean),
          issueIds: list(row.issues).map((edge) => isRow(edge) ? text(edge.id) : "").filter(Boolean),
        });
        if (kind === "place") places.set(base.id, base);
      }
    };
    nodes("actors", "actor"); nodes("issues", "issue"); nodes("solutions", "solution"); nodes("places", "place");
    for (const row of list(payload.projects)) {
      if (!isRow(row) || !text(row.id) || !text(row.name)) continue;
      const profile = isRow(row.profile) ? row.profile : {};
      const edges = list(row.edges).filter(isRow);
      const ids = (pred) => Array.from(new Set(edges.filter(pred).map((e) => text(e.target)).filter(Boolean)));
      const actorEdges = edges.filter((e) => text(e.target_type) === "actor" || actors.has(text(e.target)));
      const leadEdge = actorEdges.find((e) => /lead/.test(text(e.role) || text(e.predicate))) || actorEdges[0];
      projects.push({
        id: text(row.id), slug: slugOf(text(row.id), profile), name: text(row.name),
        description: text(profile.summary) || text(row.description) || "",
        image: text(profile.image_path) || null,
        imageRole: text(profile.image_role) || null,
        reviewState: text(profile.review_state) || null,
        lastReviewed: text(profile.last_reviewed) || null,
        officialUrl: https(profile.official_url),
        coverageNote: text(profile.coverage_note) || null,
        leadActorId: leadEdge ? text(leadEdge.target) : null,
        actorIds: Array.from(new Set(actorEdges.map((e) => text(e.target)))),
        issueIds: ids((e) => ["problem", "issue"].includes(text(e.target_type)) || issues.has(text(e.target))),
        placeIds: ids((e) => text(e.target_type) === "place" || places.has(text(e.target))),
        solutionIds: ids((e) => text(e.target_type) === "solution" || solutions.has(text(e.target))),
        claims: claimsOf(row.evidence),
      });
    }
  } else {
    for (const row of list(payload.projects)) {
      if (!isRow(row) || !text(row.id) || !text(row.name)) continue;
      const ref = (v) => (isRow(v) && text(v.id) && text(v.name) ? v : null);
      const a = ref(row.actor); const i = ref(row.issue); const p = ref(row.place); const s = ref(row.solution);
      if (a) actors.set(text(a.id), { id: text(a.id), slug: tail(text(a.id)), name: text(a.name), description: text(a.description) || null, type: text(a.actor_type) || null, website: null, publication: "related", claims: [] });
      if (i) issues.set(text(i.id), { id: text(i.id), slug: tail(text(i.id)), name: text(i.name), description: text(i.description) || null, domain: null, publication: "public", claims: [] });
      if (p) places.set(text(p.id), { id: text(p.id), slug: tail(text(p.id)), name: text(p.name), description: text(p.description) || null, publication: "related", claims: [] });
      if (s) solutions.set(text(s.id), { id: text(s.id), slug: tail(text(s.id)), name: text(s.name), description: text(s.description) || null, type: text(s.solution_type) || null, maturity: null, publication: "related", claims: [] });
      projects.push({
        id: text(row.id), slug: tail(text(row.id)), name: text(row.name), description: text(row.description),
        image: text(row.image_path) || null, imageRole: text(row.image_role) || null,
        reviewState: text(row.review_state) || null, lastReviewed: null,
        officialUrl: https(row.official_url), coverageNote: text(row.coverage_note) || null,
        leadActorId: a ? text(a.id) : null, actorIds: a ? [text(a.id)] : [],
        issueIds: i ? [text(i.id)] : [], placeIds: p ? [text(p.id)] : [], solutionIds: s ? [text(s.id)] : [],
        claims: claimsOf(row.evidence),
      });
    }
  }
  if (!projects.length) throw new Error("projection contained no publishable projects");

  const byName = (a, b) => a.name.localeCompare(b.name);
  const ref = (map, id) => { const n = map.get(id); return n ? { id: n.id, slug: n.slug, name: n.name } : null; };
  const outProjects = projects.sort(byName).map((p) => {
    const lead = p.leadActorId ? ref(actors, p.leadActorId) : null;
    const placeNames = p.placeIds.map((id) => places.get(id)?.name).filter(Boolean);
    return {
      id: p.id, slug: p.slug, name: p.name, description: p.description,
      image: p.image, imageRole: p.imageRole,
      actor: lead, // kept for existing consumers (sitemap, prerender, contracts)
      actors: p.actorIds.map((id) => ref(actors, id)).filter(Boolean),
      issues: p.issueIds.map((id) => ref(issues, id)).filter(Boolean),
      solutions: p.solutionIds.map((id) => ref(solutions, id)).filter(Boolean),
      place: p.coverageNote || placeNames.join(", ") || null,
      places: placeNames,
      reviewState: p.reviewState, lastReviewed: p.lastReviewed, officialUrl: p.officialUrl,
      claims: p.claims,
      citations: citationsOf(p.claims),
    };
  });
  const projectsFor = (key, id) => outProjects.filter((p) => p[key].some((n) => n.id === id)).map((p) => p.slug);
  const outActors = Array.from(actors.values()).filter((a) => projectsFor("actors", a.id).length || a.publication === "public").sort(byName).map((a) => ({
    id: a.id, slug: a.slug, name: a.name, description: a.description, type: a.type, website: a.website,
    lastReviewed: a.lastReviewed || null, updatedAt: a.updatedAt || null,
    projects: projectsFor("actors", a.id),
    citations: citationsOf([...a.claims, ...outProjects.filter((p) => p.actors.some((n) => n.id === a.id)).flatMap((p) => p.claims)]),
  }));
  const outIssues = Array.from(issues.values()).filter((i) => projectsFor("issues", i.id).length || i.publication === "public").sort(byName).map((i) => ({
    id: i.id, slug: i.slug, name: i.name, description: i.description, domain: i.domain,
    whyItMatters: i.whyItMatters || null,
    unknowns: i.unknowns || [],
    lastReviewed: i.lastReviewed || null,
    updatedAt: i.updatedAt || null,
    claims: i.claims || [],
    projects: projectsFor("issues", i.id),
    citations: citationsOf(i.claims),
  }));
  const outSolutions = Array.from(solutions.values()).sort(byName).map((s) => ({
    id: s.id, slug: s.slug, name: s.name, description: s.description, type: s.type, maturity: s.maturity,
    publication: s.publication, indexable: s.publication === "public",
    reviewState: s.publication === "public" ? "SOURCE-CHECKED" : null,
    lastReviewed: s.lastReviewed || null,
    updatedAt: s.updatedAt || null,
    mechanism: s.mechanism || null,
    applicability: s.applicability || [],
    risks: s.risks || [],
    claims: s.claims || [],
    citations: citationsOf(s.claims || []),
    issues: (s.issueIds || []).map((id) => ref(issues, id)).filter(Boolean),
    projects: projectsFor("solutions", s.id),
    projectRefs: outProjects.filter((p) => p.solutions.some((n) => n.id === s.id)).map((p) => ({ id: p.id, slug: p.slug, name: p.name })),
  }));
  return {
    version: text(payload.version) || (isV02 ? "impact-lan-v02" : "impact-lan-gold-v01"),
    sourceOfTruth: "NATUREBRAIN public.impact_lan_v02() with fallback public.impact_lan_gold_v01()",
    projection: isV02 ? "impact_lan_v02" : "impact_lan_gold_v01",
    generatedAt: text(payload.generated_at) || null,
    snapshotNote: "Build-time crawlable projection of the public NATUREBRAIN read. Not a truth store; regenerated from NATUREBRAIN on Pages builds.",
    projects: outProjects,
    actors: outActors,
    issues: outIssues,
    solutions: outSolutions,
  };
}

export function validate(manifest) {
  const problems = [];
  const slugs = new Set();
  for (const kind of ["projects", "actors", "issues", "solutions"]) {
    for (const item of manifest[kind] ?? []) {
      const key = kind + "/" + item.slug;
      if (!/^[a-z0-9][a-z0-9-]*$/.test(item.slug)) problems.push(`bad slug ${key}`);
      if (slugs.has(key)) problems.push(`duplicate slug ${key}`);
      slugs.add(key);
    }
  }
  if (!(manifest.projects ?? []).length) problems.push("no projects");
  return problems;
}

async function live() {
  const call = async (name) => {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
      method: "POST",
      headers: { apikey: PUBLISHABLE_KEY, "Content-Type": "application/json", Accept: "application/json" },
      body: "{}",
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw new Error(`${name} HTTP ${response.status}`);
    return response.json();
  };
  try {
    return { payload: await call("impact_lan_v02"), via: "impact_lan_v02" };
  } catch (error) {
    console.log(`IMPACT SNAPSHOT: v02 unavailable (${error.message}); trying v01`);
    return { payload: await call("impact_lan_gold_v01"), via: "impact_lan_gold_v01" };
  }
}

const isMain = import.meta.url === new URL(process.argv[1], "file://").href || process.argv[1]?.endsWith("impact-graph-snapshot.mjs");
if (isMain) {
  if (args.includes("--check")) {
    const problems = validate(JSON.parse(fs.readFileSync(target, "utf8")));
    if (problems.length) { console.error("IMPACT SNAPSHOT CHECK: FAIL\n" + problems.join("\n")); process.exit(1); }
    console.log("IMPACT SNAPSHOT CHECK: PASS");
    process.exit(0);
  }
  const wantLive = process.env.CF_PAGES === "1" || process.env.IMPACT_SNAPSHOT_LIVE === "1";
  try {
    let payload; let via;
    if (fromFile) { payload = JSON.parse(fs.readFileSync(fromFile, "utf8")); via = "file:" + fromFile; }
    else if (wantLive) ({ payload, via } = await live());
    else { console.log("IMPACT SNAPSHOT: keeping committed snapshot (set IMPACT_SNAPSHOT_LIVE=1 to refresh from NATUREBRAIN)"); process.exit(0); }
    const manifest = normalise(payload);
    const problems = validate(manifest);
    if (problems.length) throw new Error("invalid projection: " + problems.join("; "));
    fs.writeFileSync(outFile, JSON.stringify(manifest, null, 2) + "\n");
    console.log(`IMPACT SNAPSHOT: wrote ${path.relative(root, outFile)} from ${via} — ${manifest.projects.length} projects, ${manifest.actors.length} actors, ${manifest.issues.length} issues`);
  } catch (error) {
    if (fromFile) { console.error("IMPACT SNAPSHOT: FAIL — " + error.message); process.exit(1); }
    console.log(`IMPACT SNAPSHOT: live refresh failed (${error.message}); keeping committed snapshot — SEO pages reflect the last committed projection`);
  }
}
