import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("./generate-sitemap.mjs",import.meta.url),"utf8");
const published=readFileSync(new URL("../public/robots.txt",import.meta.url),"utf8");
test("public Oslofjord path must remain crawlable for Google, Bing and ChatGPT",()=>{
  for(const robot of ["Googlebot","Bingbot","OAI-SearchBot"]){
    assert.ok(published.includes("User-agent: "+robot));
  }
  assert.doesNotMatch(published,/^Disallow: \/os$/m);
  assert.doesNotMatch(source,/"\/os",/);
  assert.match(published,/Disallow: \/os\$/);
  assert.match(published,/Disallow: \/os\//);
  assert.match(published,/Disallow: \/os\?/);
  // Google robots pattern interpretation: exact /os and subroutes remain blocked,
  // while public names beginning with 'os' are not excluded by the private gate.
  const rules=published.split("\n").filter(x=>x.startsWith("Disallow: ")).map(x=>x.slice(10));
  const matches=(rule,p)=>rule.endsWith("$")?p===rule.slice(0,-1):p.startsWith(rule);
  assert.ok(!rules.some(r=>matches(r,"/oslofjord")));
  assert.ok(rules.some(r=>matches(r,"/os")));
  assert.ok(rules.some(r=>matches(r,"/os/private")));
});
