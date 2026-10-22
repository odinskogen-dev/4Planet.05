import fs from "node:fs";
import path from "node:path";
const report=JSON.parse(fs.readFileSync("reports/species-next61/research-report.json","utf8"));
const dist=path.resolve("dist");
if(report.records.length!==61)throw Error("Expected sixty-one separate reviewed-intake items");
const x=s=>String(s??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
const cards=report.records.map((r,i)=>{
 const p=r.pictures[0];
 const picture=p?.local?'<img loading="lazy" src="'+x(p.local)+'" alt="'+x(r.name||r.slug)+'" />':'<div class="missing">IMAGE NOT FOUND</div>';
 const creator=p?.artist??"UNRESOLVED";
 const licence=p?.license??"UNRESOLVED";
 return '<article><a href="/'+x(r.slug)+'">'+picture+'<h2>'+(i+1)+'. '+x(r.slug.replaceAll("-"," "))+'</h2></a><em>'+x(r.scientific)+'</em><p>GBIF: '+(r.quality.taxon?"exact match":"REQUIRES REVIEW")+'</p><p>Photo: '+x(creator)+' · '+x(licence)+'</p><p><a href="'+x(p?.sourcePage||"#")+'">Photographer, source and licence ↗</a></p><p>Image visual QA: <b>OPEN</b> · Scientific claim review: <b>OPEN</b></p></article>';
}).join("");
const html='<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="robots" content="noindex,nofollow,noarchive"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>4SPECIES 61 — private editorial contact sheet</title><style>body{font:15px system-ui;background:#fff;color:#161616;margin:0}header{padding:34px max(20px,4vw);border-bottom:1px solid #ddd}h1{font-size:clamp(22px,4vw,44px);letter-spacing:-.04em;margin:0 0 10px}p{line-height:1.5}main{padding:32px max(20px,4vw);display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px}article{border:1px solid #ddd;border-radius:17px;overflow:hidden;padding:0 0 18px}article img,.missing{width:100%;height:220px;object-fit:cover;background:#eee}article h2,article em,article p{display:block;margin:10px 14px}article h2{font-size:19px;text-transform:capitalize}article em{color:#666;font-size:13px}a{color:#143e9e;text-decoration:none}a:hover{text-decoration:underline}article p{font-size:12px}b{color:#a52820}.missing{display:grid;place-items:center;font-weight:bold}small{color:#666}</style></head><body><header><small>4PLANET SPECIES · PREVIEW ONLY · NEVER LIVE</small><h1>61 species / original Claude V53</h1><p>All 61 have source-selected imagery and GBIF taxonomy. None of the photographs has been visually verified or given independent rights sign-off; no science claim has final editorial approval. Review species-specific imagery, attribution, truth and composition before any publication.</p></header><main>'+cards+'</main></body></html>';
const target=path.join(dist,"_review-next61");fs.mkdirSync(target,{recursive:true});fs.writeFileSync(path.join(target,"index.html"),html);console.log("SPECIES61_REVIEW_CONTACT_SHEET "+target);
