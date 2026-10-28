#!/usr/bin/env python3
"""
Founder authorised, four-URL additive 4SPECIES live release.
Actual existing Worker CUSTOM DOMAIN is immutable. Only scoped Routes added.
Mode preflight -> immutable evidence; mode attach -> guarded creation and
automatic rollback of all owned routes on Gold failure.
"""
import concurrent.futures, hashlib, html.parser, json, os, re, sys, time, urllib.request, urllib.error, xml.etree.ElementTree as ET
from pathlib import Path

SITE="https://4species.com"
ADDITIONS=("atlas-moth","peacock-spider","emperor-scorpion","dragon-blood-tree")
EXPECTED_PROTECTED=57
ORIGINAL_WORKER="4species-router"
EXPECTED_VERSION="3ea0b7fa-bd4e-4583-9471-867e7a0c6db6"
WORKER="4species-premium-61-additive-20261028"
UA={"User-Agent":"4SPECIES-independent-live-preservation/1.0","Cache-Control":"no-cache"}
API="https://api.cloudflare.com/client/v4"
PREVIEW=os.environ.get("SPECIES_IMMUTABLE_PREVIEW","").strip().rstrip("/")
TOKEN=os.environ.get("CLOUDFLARE_API_TOKEN","").strip()
NAMES=Path("/tmp/4species-additive-preflight.json")
ROUTES=Path("/tmp/4species-additive-route-ids.json")
URL_PATHS=["/assets/*","/species-data/v1/atlas-moth.json","/species-data/v1/peacock-spider.json",
 "/species-data/v1/emperor-scorpion.json","/species-data/v1/dragon-blood-tree.json",
 "/atlas-moth","/peacock-spider","/emperor-scorpion","/dragon-blood-tree",
 "/sitemap.xml"]
SLUG_SOURCE=Path("ops/discovery/4species-router.js")

def web(url, timeout=28, cap=1300000):
 req=urllib.request.Request(url,headers=UA)
 try:
  with urllib.request.urlopen(req,timeout=timeout) as r:
   b=r.read(cap+1)
   if len(b)>cap:raise RuntimeError("Response exceeds cap "+url)
   return r.status,b,dict(r.headers),r.geturl()
 except urllib.error.HTTPError as e:
  return e.code,e.read(10000),dict(e.headers),e.geturl()
def cf(method,path,payload=None):
 if not TOKEN: raise RuntimeError("Cloudflare token unavailable")
 req=urllib.request.Request(API+path,method=method,data=json.dumps(payload).encode() if payload is not None else None,headers={"Authorization":"Bearer "+TOKEN,"Content-Type":"application/json"})
 try:
  with urllib.request.urlopen(req,timeout=22) as r:return r.status,json.load(r)
 except urllib.error.HTTPError as e:
  try:j=json.load(e)
  except:j={}
  return e.code,j
def sha(b):return hashlib.sha256(b).hexdigest()
def xml_locs(body):
 root=ET.fromstring(body)
 return [e.text for e in root.findall(".//{http://www.sitemaps.org/schemas/sitemap/0.9}loc") if e.text]
class H(html.parser.HTMLParser):
 def __init__(self):
  super().__init__();self.canonical=[];self.robot=[];self.h1=0;self.script=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=="link" and a.get("rel","").lower()=="canonical":self.canonical.append(a.get("href",""))
  if tag=="meta" and a.get("name","").lower()=="robots":self.robot.append(a.get("content",""))
  if tag=="h1":self.h1+=1
  if tag=="script" and a.get("src","").startswith("/assets/"):self.script.append(a["src"])
def headers_get(h,k):
 return next((v for key,v in h.items() if key.lower()==k.lower()),"")
def check_species(url,slug,need_noindex,strict=True):
 st,b,h,final=web(url)
 parser=H()
 try:parser.feed(b.decode("utf-8","replace"))
 except:pass
 index=' '.join(parser.robot)+' '+headers_get(h,"x-robots-tag")
 good=(st==200 and final==url and parser.canonical==[SITE+"/"+slug] and parser.h1>=1)
 if need_noindex:good=good and "noindex" in index.lower()
 else:good=good and "noindex" not in index.lower()
 return good,st,sha(b),parser,final
def live_source_identity():
 st,z=cf("GET","/zones?name=4species.com")
 arr=[v for v in z.get("result",[]) if v.get("name")=="4species.com" and v.get("status")=="active"]
 if st!=200 or len(arr)!=1:raise RuntimeError("Cannot verify 4species zone")
 zone=arr[0];acc=(zone.get("account") or {}).get("id")
 if not acc:raise RuntimeError("Cloudflare account missing")
 st,d=cf("GET","/accounts/"+acc+"/workers/domains")
 if st!=200 or not d.get("success") or not any(v.get("hostname")=="4species.com" and v.get("service")==ORIGINAL_WORKER for v in d.get("result",[])):raise RuntimeError("Original custom-domain Worker drift")
 st,v=cf("GET","/accounts/"+acc+"/workers/scripts/"+ORIGINAL_WORKER+"/deployments")
 if st!=200 or not v.get("success") or not v.get("result",{}).get("deployments"):raise RuntimeError("Original custom Worker deployment unreadable")
 deployments=v["result"]["deployments"]
 latest=deployments[0]["versions"][0]["version_id"]
 if latest!=EXPECTED_VERSION:raise RuntimeError("Existing live Worker version changed: "+latest+"; HOLD to protect 57")
 st,rs=cf("GET","/zones/"+zone["id"]+"/workers/routes")
 if st!=200 or not rs.get("success"):raise RuntimeError("Zone route audit denied")
 originals=rs.get("result",[])
 for path in URL_PATHS:
  pattern="4species.com"+path
  if any(x.get("pattern")==pattern for x in originals):raise RuntimeError("Route conflict "+pattern)
 return acc,zone["id"]

def prerelease():
 if not re.fullmatch(r"https://[a-zA-Z0-9-]+\.4planet-05\.pages\.dev",PREVIEW):raise RuntimeError("Not immutable Cloudflare Pages URL")
 if "__IMMUTABLE" in PREVIEW:raise RuntimeError("Preview not bound")
 acc,zid=live_source_identity()
 source=SLUG_SOURCE.read_text()
 m=re.search(r"export const CURRENT_PUBLIC_SPECIES_SLUGS = new Set\(\[([\s\S]*?)\]\);",source)
 slugs=re.findall(r'"([a-z0-9-]+)"',m.group(1)) if m else []
 if len(slugs)!=57 or len(set(slugs))!=57:raise RuntimeError("Protected 57 registry drift")
 st,live_sitemap,_,_=web(SITE+"/sitemap.xml")
 if st!=200:raise RuntimeError("Original sitemap not readable")
 locs=xml_locs(live_sitemap)
 if len(locs)!=62 or len(set(locs))!=62:raise RuntimeError("Original sitemap already changed")
 if any(SITE+"/"+s in locs for s in ADDITIONS):raise RuntimeError("Candidates already public sitemap - classify before deploy")
 all57={}
 def snapshot(slug):
  ok,st,h,p,final=check_species(SITE+"/"+slug,slug,False)
  if not ok:raise RuntimeError("Public protected species invalid "+slug+" HTTP "+str(st))
  j,b,_,_=web(SITE+"/species-data/v1/"+slug+".json")
  if j!=200:raise RuntimeError("Public protected JSON gone "+slug)
  page=json.loads(b)
  if page.get("slug")!=slug or page.get("schema")!="4PLANET_SPECIES_PAGE_01":raise RuntimeError("Protected species source invalid "+slug)
  return slug,{"html":h,"json":sha(b)}
 with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
  for slug,data in ex.map(snapshot,slugs):all57[slug]=data
 if len(all57)!=57:raise RuntimeError("Protected profile count drift")
 preview_records={}
 for slug in ADDITIONS:
  ok,st,digest,parsed,final=check_species(PREVIEW+"/"+slug,slug,True)
  if not ok:raise RuntimeError("Preview route lacks immutable NOINDEX, H1 or selfcanonical "+slug+" status="+str(st))
  st,b,_,_=web(PREVIEW+"/species-data/v1/"+slug+".json")
  if st!=200:raise RuntimeError("Preview JSON unavailable "+slug)
  p=json.loads(b)
  hero=p.get("hero",{})
  photo_path=hero.get("url","").replace(SITE,"")
  if p.get("schema")!="4PLANET_SPECIES_PAGE_01" or p.get("slug")!=slug or p.get("provenance",{}).get("founderRelease")!="PREMIUM_V1_2026-10-22" or p.get("gallery")!=[] or not all(hero.get(k) for k in ("licence","credit","sourcePage","url")) or not photo_path.startswith("/assets/species/next61/"):
   raise RuntimeError("Unapproved photo/rights/identity "+slug)
  st,bytesimg,h,_=web(PREVIEW+photo_path,cap=15000000)
  if st!=200 or not headers_get(h,"content-type").startswith("image/") or sha(bytesimg)!=p["provenance"].get("photoSha256"):raise RuntimeError("Candidate photo SHA mismatch "+slug)
  preview_records[slug]={"html":digest,"json":sha(b),"photo":sha(bytesimg),"licence":hero["licence"],"artist":hero["credit"],"source":hero["sourcePage"],"alt":hero.get("alt",""),"photoPath":photo_path,"title":p["identity"]["commonName"]+" — photo by "+hero["credit"]+" · "+hero["licence"]}
  print("ASSET_BANK_RECORD "+json.dumps({"slug":slug,**preview_records[slug]},ensure_ascii=False))
 receipt={"preview":PREVIEW,"originalWorkerVersion":EXPECTED_VERSION,"zone":zid,"account":acc,"protected57":all57,"originalSitemap":locs,"candidatePhotos":preview_records}
 NAMES.write_text(json.dumps(receipt,indent=2))
 print("PRE_DEPLOY_57_EXACT_HTML_JSON_PASS; FOUR_PREVIEW_NOINDEX_PHOTO_SHA_CREDIT_PASS; LIVE_WORKER_UNCHANGED")
 with open(os.environ["GITHUB_ENV"],"a") as f:f.write("CLOUDFLARE_ACCOUNT_ID="+acc+"\n")
 with open(os.environ["GITHUB_STEP_SUMMARY"],"a") as f:f.write("## Four additional Claude premium species — prerelease\n\n57/57 existing source-backed HTML and JSON snapshotted; immutable Worker version pinned; four candidate preview HTML noindex and signed photo SHAs verified; no mutation so far.\n")

def attach():
 receipt=json.loads(NAMES.read_text())
 if receipt["preview"]!=PREVIEW:raise RuntimeError("Frozen preview identity drift")
 acc,zid=live_source_identity()
 if acc!=receipt["account"] or zid!=receipt["zone"]:raise RuntimeError("Zone/account drift")
 made=[]
 try:
  # Route order: JSON + assets first, four new HTML next, public sitemap last.
  order=[p for p in URL_PATHS if p.startswith("/species-data/")]+["/assets/*"]+[p for p in URL_PATHS if p in ["/"+x for x in ADDITIONS]]+["/sitemap.xml"]
  for path in order:
   pattern="4species.com"+path
   code,res=cf("POST","/zones/"+zid+"/workers/routes",{"pattern":pattern,"script":WORKER})
   if code not in (200,201) or not res.get("success"):raise RuntimeError("Scoped route attach rejected "+pattern+" HTTP "+str(code))
   route_id=(res.get("result") or {}).get("id")
   if not route_id:raise RuntimeError("Created route missing rollback ID "+pattern)
   made.append({"id":route_id,"pattern":pattern})
   ROUTES.write_text(json.dumps(made))
   print("EXACT_ROUTE_ACTIVATED "+pattern+" rollback "+route_id,flush=True)
  # GOLD: exact all originals unchanged after routing.
  def verify_original(item):
   slug,prev=item
   good,st,digest,p,final=check_species(SITE+"/"+slug,slug,False)
   j,b,_,_=web(SITE+"/species-data/v1/"+slug+".json")
   if not good or st!=200 or digest!=prev["html"] or j!=200 or sha(b)!=prev["json"]:raise RuntimeError("PROTECTED_57_REGRESSION "+slug)
   return slug
  with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:verified=list(ex.map(verify_original,receipt["protected57"].items()))
  if len(verified)!=57:raise RuntimeError("Invalid retained count")
  # GOLD: every new public profile exact, crawlable, JSON signed, photo and assets.
  for slug,p in receipt["candidatePhotos"].items():
   good,st,digest,html,final=check_species(SITE+"/"+slug,slug,False)
   if not good or st!=200:raise RuntimeError("NEW_SPECIES_NOT_CRAWLABLE "+slug)
   js,b,_,_=web(SITE+"/species-data/v1/"+slug+".json")
   if js!=200 or sha(b)!=p["json"]:raise RuntimeError("NEW_JSON_DRIFT "+slug)
   st,b,headers,_=web(SITE+p["photoPath"],cap=15000000)
   if st!=200 or sha(b)!=p["photo"]:raise RuntimeError("NEW_PHOTO_NOT_ORIGINAL "+slug)
   for asset in html.script[:2]:
    st,b,_,_=web(SITE+asset,cap=3200000)
    if st!=200 or len(b)<3000:raise RuntimeError("JS_BUNDLE_NOT_SERVABLE "+asset)
   print("LIVE_PREMIUM_SPECIES_PASS "+slug)
  status,xml,headers,_=web(SITE+"/sitemap.xml")
  locs=xml_locs(xml) if status==200 else []
  if locs!=receipt["originalSitemap"]+[SITE+"/"+s for s in ADDITIONS]:raise RuntimeError("SITEMAP_57_PLUS_FOUR_INCORRECT")
  if headers_get(headers,"x-4species-additive-release")!="four-premium-20261028":raise RuntimeError("Sitemap route owner not verified")
  with open(os.environ["GITHUB_STEP_SUMMARY"],"a") as f:f.write("## LIVE ✅ Four new Claude premium SPECIES\n\nOriginal 57/57 HTML+JSON SHA identities exact; new 4/4 canonical H1, crawlable, first-party assets+hero byte SHA, sitemap 66 exact; existing custom-domain Worker unchanged at "+EXPECTED_VERSION+".\n\nNew public URLs: "+", ".join(SITE+"/"+s for s in ADDITIONS)+"\n")
  print("FOUR_ADDITIVE_SPECIES_LIVE_GOLD_PASS 57 preserved + 4 = 61 indexed-eligible profiles",flush=True)
 except BaseException as exc:
  print("RELEASE_BLOCKED_ROLLBACK_START "+type(exc).__name__+" "+str(exc),flush=True)
  for rec in reversed(made):
   status,res=cf("DELETE","/zones/"+zid+"/workers/routes/"+rec["id"])
   print("ROLLED_BACK "+rec["pattern"]+" HTTP="+str(status)+" "+str(res.get("success")),flush=True)
  raise

if __name__=="__main__":
 if len(sys.argv)!=2 or sys.argv[1] not in ("preflight","attach"):raise SystemExit("Use preflight or attach")
 (prerelease if sys.argv[1]=="preflight" else attach)()
