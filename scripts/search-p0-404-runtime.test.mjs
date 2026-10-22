import test from "node:test";
import assert from "node:assert/strict";
import { onRequest } from "../functions/_middleware.js";
import { PUBLIC_EXACT_ROUTES, PUBLIC_PATTERN_ROUTES, RELEASED_MISSION_ROUTES, isKnown4PlanetPublicRoute } from "../functions/public-4planet-routes.generated.js";
import fs from "node:fs";
// Cloudflare HTMLRewriter is a runtime primitive; for status-gate unit tests
// preserve its transform interface without substituting for browser QA.
globalThis.HTMLRewriter ??= class { on(){return this;} transform(response){return response;} };

function page(url, {method="GET",contentType="text/html; charset=utf-8",status=200}={}){
  return onRequest({
    request:new Request(url,{method}),
    next:async()=>new Response("<!doctype html><html><head><title>Live app</title></head><body><div id='root'></div></body></html>",{status,headers:{"content-type":contentType}}),
  });
}
test("public route manifest covers every current declared React Router path",()=>{
  const source=fs.readFileSync("src/routes/router.tsx","utf8");
  const routes=[...source.matchAll(/<Route\b[^>]*?\bpath="([^"]+)"/g)].map(x=>x[1]).filter(x=>x!=="*");
  for(const r of routes){
    assert.ok(PUBLIC_EXACT_ROUTES.includes(r)||PUBLIC_PATTERN_ROUTES.includes(r),"Uncovered route "+r);
  }
  assert.equal(RELEASED_MISSION_ROUTES.length,16);
  assert.ok(PUBLIC_EXACT_ROUTES.includes("/now"));
  assert.ok(PUBLIC_PATTERN_ROUTES.includes("/4nation/*"));
});
test("unknown routes become real 404 with noindex; preserve HEAD semantics",async()=>{
  for(const path of ["/this-public-route-does-not-exist-404-check","/unknown/path/nested","/nope-fake-route","/place/unreleased-place-404-check","/missions/not-a-real-mission","/domains/unreleased-domain"]){
    const r=await page("https://4planet.org"+path);
    assert.equal(r.status,404,path);
    assert.match(r.headers.get("x-robots-tag"),/noindex/);
    assert.match(await r.text(),/<h1>Page not found\.<\/h1>/);
  }
  const head=await page("https://4planet.org/__unknown__",{method:"HEAD"});
  assert.equal(head.status,404);assert.equal((await head.text()),"");
});
test("known public routes, query-driven maps, Next Living Systems and asset URLs keep original status",async()=>{
  for(const path of ["/","/now","/now/","/about/what-we-believe","/domains/e4rth","/missions/cle4n","/livingsystems/","/livingsystems/species/western-honey-bee/","/games/wild-orca/","/xr/generated/orca-canonical.json","/impact/lab/test-unit","/4nation/decisions/123","/atlas?embed=news&z=5&c=5%2C18","/embed/atlas?place=oslo","/journey/orca/"]){
    const r=await page("https://4planet.org"+path);
    assert.ok([200,308].includes(r.status),path+" status="+r.status);
  }
  assert.ok(isKnown4PlanetPublicRoute("/missions/cle4n"));
  assert.ok(!isKnown4PlanetPublicRoute("/missions/random-nonsense"));
  const css=await page("https://4planet.org/assets/example.css",{contentType:"text/css"});
  assert.equal(css.status,200,"asset paths never diverted by HTML-only gate");
});
