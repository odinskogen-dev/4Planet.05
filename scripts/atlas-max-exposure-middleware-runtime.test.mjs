import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { onRequest } from "../functions/_middleware.js";

const distIndex=fs.readFileSync("dist/index.html","utf8");
const next=async()=>new Response(distIndex,{status:200,headers:{"content-type":"text/html; charset=utf-8"}});

async function call(path,{protocol="https"}={}){
  return onRequest({
    request:new Request(`${protocol}://4planetatlas.com${path}`),
    next,
  });
}

test("premium ATLAS root and application routes pass through byte-for-byte",async()=>{
  for(const path of ["/","/atlas","/atlas/","/atlas/?place=berlin"]){
    const response=await call(path);
    assert.equal(response.status,200,path);
    assert.equal(await response.text(),distIndex,`${path} must be untouched by discovery middleware`);
  }
});

test("ATLAS Place index exposes exactly 250 canonical entry points",async()=>{
  const response=await call("/places");
  assert.equal(response.status,200);
  const html=await response.text();
  const links=new Set([...html.matchAll(/href="\/place\/([^"]+)"/g)].map(m=>m[1]));
  assert.equal(links.size,250);
  assert.match(html,/World Place Index/);
  assert.match(html,/Explore the world by place/);
});

test("representative Place has self canonical, map handoff and schema",async()=>{
  const response=await call("/place/berlin");
  assert.equal(response.status,200);
  const html=await response.text();
  assert.match(html,/<h1>Berlin<\/h1>/);
  assert.match(html,/rel="canonical" href="https:\/\/4planetatlas\.com\/place\/berlin"/);
  assert.match(html,/data-acquisition-entry="organic-place"/);
  assert.match(html,/\/atlas\/\?place=berlin/);
  assert.match(html,/BreadcrumbList/);
  assert.match(html,/Natural Earth/);
});

test("ATLAS sitemap exposes 250 Place URLs and 250 map images",async()=>{
  const response=await call("/sitemap.xml");
  assert.equal(response.status,200);
  const xml=await response.text();
  const pages=[...xml.matchAll(/<loc>https:\/\/4planetatlas\.com\/place\/[^<]+<\/loc>/g)];
  const images=[...xml.matchAll(/<image:loc>https:\/\/4planetatlas\.com\/place\/[^<]+\/map\.svg<\/image:loc>/g)];
  assert.equal(pages.length,250);
  assert.equal(new Set(pages.map(x=>x[0])).size,250);
  assert.equal(images.length,250);
});

test("unknown Place fails closed and HTTP canonicalises to HTTPS",async()=>{
  const unknown=await call("/place/__max_exposure_unknown__");
  assert.equal(unknown.status,404);
  assert.match(await unknown.text(),/noindex/);
  const http=await call("/place/berlin",{protocol:"http"});
  assert.equal(http.status,308);
  assert.equal(http.headers.get("location"),"https://4planetatlas.com/place/berlin");
});
