#!/usr/bin/env python3
"""Exact 2 old JS URL repair. NO original 57 HTML/JSON/photo, Worker or existing route mutated."""
import concurrent.futures,hashlib,json,os,re,subprocess,sys,time,urllib.error,urllib.request,xml.etree.ElementTree as ET
from pathlib import Path
SITE='https://4species.com'
API='https://api.cloudflare.com/client/v4'
TOKEN=os.getenv('CLOUDFLARE_API_TOKEN','').strip()
WORKER='4species-legacy-js-exact-two-p0-20261028'
ORIG='4species-router'
OVERLAY='4species-premium-61-additive-20261028'
V_ORIG='3ea0b7fa-bd4e-4583-9471-867e7a0c6db6'
V_OVERLAY='49b3afed-a2bd-418c-b360-b5204b502839'
PATTERNS=['4species.com/assets/index-DLiHR8tZ.js','4species.com/assets/index-DJRRK0k4.js']
SOURCE=Path('ops/discovery/4species-router.js')
REC=Path('/tmp/4species-legacy-p0-bundle.json')
ROUTES=Path('/tmp/4species-legacy-p0-attached.json')
USERAGENT={'User-Agent':'Mozilla/5.0 (4PLANET zero-loss original 57-P0)','Cache-Control':'no-cache'}

def web(url):
 q=urllib.request.Request(url,headers=USERAGENT)
 try:
  with urllib.request.urlopen(q,timeout=30) as r:return r.status,r.read(500000),dict(r.headers),r.geturl()
 except urllib.error.HTTPError as e:return e.code,e.read(12000),dict(e.headers),e.geturl()

def cf(method,url,payload=None):
 if not TOKEN:raise RuntimeError('Cloudflare token unavailable')
 req=urllib.request.Request(API+url,method=method,data=json.dumps(payload).encode() if payload is not None else None,
   headers={'Authorization':'Bearer '+TOKEN,'Content-Type':'application/json'})
 try:
  with urllib.request.urlopen(req,timeout=25) as r:return r.status,json.load(r)
 except urllib.error.HTTPError as e:
  try:result=json.load(e)
  except:result={}
  return e.code,result

def sha(b):return hashlib.sha256(b).hexdigest()
def old_slugs():
 s=SOURCE.read_text()
 m=re.search(r'export const CURRENT_PUBLIC_SPECIES_SLUGS = new Set\(\[([\s\S]*?)\]\);',s)
 if not m:raise RuntimeError('Protected registry missing')
 slugs=re.findall(r'"([a-z0-9-]+)"',m.group(1))
 if len(slugs)!=57 or len(set(slugs))!=57:raise RuntimeError('Protected registry drift')
 return slugs

def get_live_owner():
 status,z=cf('GET','/zones?name=4species.com')
 zs=[v for v in z.get('result',[]) if v.get('name')=='4species.com' and v.get('status')=='active']
 if status!=200 or len(zs)!=1:raise RuntimeError('Exact zone authority unavailable')
 zone=zs[0];acc=(zone.get('account') or {}).get('id')
 if not acc:raise RuntimeError('Cloudflare account absent')
 status,domains=cf('GET','/accounts/'+acc+'/workers/domains')
 if status!=200 or not any(d.get('hostname')=='4species.com' and d.get('service')==ORIG for d in domains.get('result',[])):raise RuntimeError('Original custom domain owner changed')
 for name,wanted in ((ORIG,V_ORIG),(OVERLAY,V_OVERLAY)):
  code,data=cf('GET','/accounts/'+acc+'/workers/scripts/'+name+'/deployments')
  if code!=200 or not data.get('success'):raise RuntimeError('Protected Worker version unreadable '+name)
  current=data.get('result',{}).get('deployments',[{}])[0].get('versions',[{}])[0].get('version_id')
  if current!=wanted:raise RuntimeError('Protected Worker version drift '+name+' '+str(current))
 code,route=cf('GET','/zones/'+zone['id']+'/workers/routes')
 if code!=200 or not route.get('success'):raise RuntimeError('Route owner unreadable')
 existing={x.get('pattern'):x.get('script') for x in route.get('result',[])}
 if any(p in existing for p in PATTERNS):raise RuntimeError('Exact route already owned')
 if existing.get('4species.com/assets/*')!=OVERLAY or existing.get('4species.com/sitemap.xml')!=OVERLAY:
  raise RuntimeError('Other protected release routes have drifted')
 return acc,zone['id']

def snap():
 slugs=old_slugs()
 def inspect(slug):
  st,html,_,end=web(SITE+'/'+slug)
  code,raw,_,_=web(SITE+'/species-data/v1/'+slug+'.json')
  if st!=200 or code!=200 or end!=SITE+'/'+slug:raise RuntimeError('Original HTML/JSON unavailable '+slug)
  data=json.loads(raw)
  if data.get('slug')!=slug or data.get('schema')!='4PLANET_SPECIES_PAGE_01':raise RuntimeError('Original JSON identity '+slug)
  if ('https://4species.com/'+slug).encode() not in html:raise RuntimeError('Original canonical missing '+slug)
  return slug,{'html':sha(html),'json':sha(raw)}
 with concurrent.futures.ThreadPoolExecutor(max_workers=9) as pool:return dict(pool.map(inspect,slugs))

def check_sitemap():
 status,b,_,_=web(SITE+'/sitemap.xml')
 if status!=200:raise RuntimeError('Sitemap not served')
 root=ET.fromstring(b)
 locs=[x.text for x in root.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc') if x.text]
 if len(locs)!=66 or len(set(locs))!=66:raise RuntimeError('Live sitemap expected 66')
 return sha(b)

def preflight():
 url='https://api.github.com/repos/odinskogen-dev/4Planet.05/actions/runs/40763716483'
 r=json.loads(web(url)[1])
 if r.get('status')!='completed' or r.get('conclusion')!='success' or not r.get('head_sha','').startswith('23bcf196d13165c591ae'):
  raise RuntimeError('Independent two JS route browser proof not ACCEPTED; no LIVE action')
 acc,zone=get_live_owner()
 baseline=snap()
 sitemap=check_sitemap()
 for old in PATTERNS:
  code,body,h,_=web('https://4species.com/'+old.split('4species.com')[1])
  if code!=200 or 'javascript' in (h.get('Content-Type','')).lower():raise RuntimeError('Legacy path no longer broken; classify again')
 data={'account':acc,'zone':zone,'protected':baseline,'sitemap':sitemap,'routes':PATTERNS}
 REC.write_text(json.dumps(data))
 print('TWO_EXACT_JS_ROUTES_PRE_RELEASE_ALL_SAFE 57 original HTML/JSON snapshotted, custom Worker and overlay pinned; virtual Gold PASS',flush=True)
 with open(os.environ['GITHUB_STEP_SUMMARY'],'a') as f:f.write('## LIVE recovery preflight\n\n57 exact unchanged HTML/JSON hashes, 66 sitemap entries, pinned custom+overlay Worker versions, independent 16 browser preview Gold PASS. No mutations yet.\n')

def attach_and_test():
 baseline=json.loads(REC.read_text())
 acc,zone=get_live_owner()
 if baseline['zone']!=zone or baseline['account']!=acc:raise RuntimeError('Zone/account mismatch')
 made=[]
 try:
  for name in PATTERNS:
   status,resp=cf('POST','/zones/'+zone+'/workers/routes',{'pattern':name,'script':WORKER})
   if status not in (200,201) or not resp.get('success'):raise RuntimeError('Route attach rejected '+name+' HTTP '+str(status))
   route_id=(resp.get('result') or {}).get('id')
   if not route_id:raise RuntimeError('Route missing rollback ID')
   made.append({'id':route_id,'pattern':name})
   ROUTES.write_text(json.dumps(made))
  print('EXACT_TWO_LEGACY_JS_ROUTES_ATTACHED',made,flush=True)
  for p in PATTERNS:
   st,b,h,_=web('https://'+p)
   mime=h.get('Content-Type','').lower()
   if st!=200 or 'javascript' not in mime or b'document.querySelector("#root")?.replaceChildren()' not in b:
    raise RuntimeError('P0 exact JS repair response missing '+p+' HTTP '+str(st))
  if snap()!=baseline['protected']:raise RuntimeError('Original 57 HTML/JSON changed unexpectedly')
  if check_sitemap()!=baseline['sitemap']:raise RuntimeError('Original 61 sitemap changed')
  for slug in ('atlas-moth','peacock-spider','emperor-scorpion','dragon-blood-tree'):
   st,b,_,end=web(SITE+'/'+slug)
   if st!=200 or end!=SITE+'/'+slug:raise RuntimeError('New four broken '+slug)
  cp=subprocess.run(['node','ops/species/premium-61/old57-hydration-live-gold-20261028.mjs'],timeout=220)
  if cp.returncode!=0:raise RuntimeError('Real Chromium+WebKit UX regression')
  if snap()!=baseline['protected'] or check_sitemap()!=baseline['sitemap']:raise RuntimeError('Postbrowser zero-loss evidence changed')
  print('TWO_JS_ROUTES_PUBLIC_GOLD_PASS; 57 ORIGINAL HTML/JSON EXACT; four NEW preserved; 16 Chrome/WebKit UX cases',flush=True)
  with open(os.environ['GITHUB_STEP_SUMMARY'],'a') as f:f.write('## LIVE exact two JS route P0 GOLD\n\n57/57 unchanged HTML and species JSON bytes, 66 sitemap entries unchanged, 4 new premium intact, original Cloudflare Workers untouched; 16 Chromium+WebKit browser mobile cases pass. Rollback IDs: '+json.dumps(made)+'\n')
 except BaseException as exc:
  print('P0_LEGACY_JS_RELEASE_FAILURE_AUTO_ROLLBACK '+repr(exc),flush=True)
  for record in reversed(made):
   code,res=cf('DELETE','/zones/'+zone+'/workers/routes/'+record['id'])
   print('ROLLED_BACK_ROUTE',record['pattern'],code,res.get('success'),flush=True)
  raise

if __name__=='__main__':
 if len(sys.argv)!=2 or sys.argv[1] not in ('preflight','attach'):raise SystemExit('usage: preflight|attach')
 (preflight if sys.argv[1]=='preflight' else attach_and_test)()
