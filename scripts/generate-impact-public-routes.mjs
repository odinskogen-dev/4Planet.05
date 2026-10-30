#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const source=path.join(root,"src/data/impactDiscovery.json");
const target=path.join(root,"functions/impact-public-routes.generated.js");
const data=JSON.parse(fs.readFileSync(source,"utf8"));
const slugs=(rows)=>Array.from(new Set((rows||[]).map((x)=>x?.slug).filter(Boolean))).sort();
const projects=slugs(data.projects);
const actors=slugs(data.actors);
const issues=slugs(data.issues);
const solutions=slugs((data.solutions||[]).filter((x)=>x?.indexable===true));
const out=`// Generated from src/data/impactDiscovery.json. Do not hand-author profile truth here.
export const IMPACT_PUBLIC_PROJECT_SLUGS = ${JSON.stringify(projects)};
export const IMPACT_PUBLIC_ACTOR_SLUGS = ${JSON.stringify(actors)};
export const IMPACT_PUBLIC_ISSUE_SLUGS = ${JSON.stringify(issues)};
export const IMPACT_PUBLIC_SOLUTION_SLUGS = ${JSON.stringify(solutions)};

const sets = {
  project: new Set(IMPACT_PUBLIC_PROJECT_SLUGS),
  actors: new Set(IMPACT_PUBLIC_ACTOR_SLUGS),
  issue: new Set(IMPACT_PUBLIC_ISSUE_SLUGS),
  solution: new Set(IMPACT_PUBLIC_SOLUTION_SLUGS),
};

export function isKnownImpactProfileRoute(pathname) {
  const p = pathname.replace(/\\/+$/, "") || "/";
  const match = p.match(/^\\/impact\\/(project|actors|issue|solution)\\/([^/]+)$/);
  if (!match) return null;
  return sets[match[1]].has(match[2]);
}
`;
fs.writeFileSync(target,out,"utf8");
console.log(`IMPACT PUBLIC ROUTES: ${projects.length} projects / ${actors.length} actors / ${issues.length} issues / ${solutions.length} solutions`);
