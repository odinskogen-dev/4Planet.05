"""Offline browser test: inject exact shared module sources in isolated HTML candidates.
No networking allowed in this environment; module network import itself remains to be tested on a real host.
"""
import re,json
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
parts=[]
for p in ['src/rng.js','src/navigation.js','src/siege.js','src/battles.js','src/saves.js']:
 s=(root/p).read_text()
 s=re.sub(r'^import [^;]+;\s*','',s,flags=re.M)
 s=s.replace('export function ','function ')
 parts.append(s)
bridge=(root/'integrations/bridge.mjs').read_text()
bridge=re.sub(r'^import [^;]+;\s*','',bridge,flags=re.M)
bundle='\n'.join(parts)+'\n'+bridge
results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 for game,name in [('roma','ROMA_ORIGINAL_PLUS_SHARED_CORE_02.html'),('medieval','MEDIEVAL_BUILD03_PLUS_SHARED_CORE_02.html')]:
  page=browser.new_page(viewport={'width':1280,'height':720},device_scale_factor=1)
  errs=[];page.on('pageerror',lambda error:errs.append(str(error)[:350]))
  html=(root/'integrations/previews'/name).read_text()
  html=html.replace('<script type="module" src="../bridge.mjs"></script>', '<script>'+bundle+'</script>')
  page.set_content(html,wait_until='domcontentloaded',timeout=30000)
  result=page.evaluate('window.__CUB_SHARED_PROOF || null')
  overlay=page.locator('#cub-core-diagnostic').count()
  if overlay:page.locator('#cub-core-diagnostic button').click(timeout=8000)
  clicked=bool(overlay and page.locator('#cub-core-detail').is_visible())
  results.append({'game':game,'pass':bool(result and overlay and clicked),'diagnostic':result,
   'overlay':overlay,'buttonWorks':clicked,'errors':errs[:6],'testingLimit':'standalone offline inline-source injection; network module import untested'})
  print(game,'PASS' if result and overlay and clicked else 'FAIL','pageerrors',len(errs))
  page.close()
 browser.close()
report={'schema':'cub.browser.smoke.v1','pass':all(x['pass'] for x in results),'results':results}
(root/'qa/browser-integration-smoke.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report)[:5500])
if not report['pass']:raise SystemExit(2)