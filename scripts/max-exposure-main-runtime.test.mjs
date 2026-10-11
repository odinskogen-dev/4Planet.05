import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { onRequest } from "../functions/_middleware.js";

function bodyFor(url){
  const pathname=new URL(url).pathname;
  const rel=pathname==="/" ? "index.html" : path.join(pathname.replace(/^\//,""),"index.html");
  const target=path.join("dist",rel);
  if(fs.existsSync(target)) return fs.readFileSync(target,"utf8");
  if(pathname==="/sitemap.xml") return fs.readFileSync("dist/sitemap.xml","utf8");
  return "";
}
async function call(url){
  return onRequest({
    request:new Request(url),
    next:async()=>new Response(bodyFor(url),{status:200,headers:{"content-type":url.endsWith(".xml")?"application/xml":"text/html; charset=utf-8"}}),
  });
}

test("Discovery Guides pass through as substantive prerendered HTML",async()=>{
  for(const route of ["now","wildfires","earthquakes","whales"]){
    const r=await call(`https://4planet.org/${route}/`);
    assert.equal(r.status,200,route);
    const html=await r.text();
    assert.match(html,/<h1>/,route);
    assert.match(html,new RegExp(`rel="canonical" href="https://4planet\\.org/${route}/"`),route);
    assert.match(html,/application\/ld\+json/,route);
  }
});

test("4PLANET sitemap exposes guides but not canonical Place or Species duplicates",async()=>{
  const r=await call("https://4planet.org/sitemap.xml");
  assert.equal(r.status,200);
  const xml=await r.text();
  for(const route of ["now","wildfires","earthquakes","whales"]) assert.match(xml,new RegExp(`<loc>https://4planet\\.org/${route}/</loc>`));
  assert.doesNotMatch(xml,/<loc>https:\/\/4planet\.org\/place\//);
  assert.doesNotMatch(xml,/<loc>https:\/\/4planet\.org\/species\//);
});

test("canonical transport converges protocol, www and Living Systems legacy aliases",async()=>{
  const cases=[
    ["http://4planet.org/about","https://4planet.org/about"],
    ["https://www.4planet.org/about","https://4planet.org/about"],
    ["http://www.4planet.org/living-systems/","https://4planet.org/livingsystems/"],
    ["https://4planet.org/living-systems/","https://4planet.org/livingsystems/"],
    ["https://4planet.org/living-systems/oslofjorden","https://4planet.org/living-systems/oslofjord"],
    ["https://4planet.org/livingsystems/oslofjord","https://4planet.org/living-systems/oslofjord"],
    ["https://4planet.org/livingsystems/great-barrier-reef","https://4planet.org/living-systems/great-barrier-reef"],
  ];
  for(const [from,to] of cases){
    const r=await call(from);
    assert.equal(r.status,308,from);
    assert.equal(r.headers.get("location"),to,from);
  }
});
