from pathlib import Path
import re, subprocess, sys

if len(sys.argv) != 2:
    raise SystemExit('usage: apply_finance_typography_guard.py <site-dir>')
site=Path(sys.argv[1])
paths=[site/'app'/'money'/'index.html',site/'finance.html',site/'finance'/'index.html']

bridge=r'''<script id="four-sapien-finance-theme-bridge">
(function(){
  function icon(mode){return mode==='dark'?'☀':'◐'}
  function mount(){
    if(!window.FourSapienTheme)return;
    var b=document.getElementById('afTheme');
    if(!b){b=document.createElement('button');b.id='afTheme';b.setAttribute('aria-label','Bytt tema');b.style.cssText='position:fixed;top:22px;right:20px;z-index:60;width:34px;height:34px;border-radius:99px;border:1px solid var(--line2);background:var(--paper);color:var(--ink);cursor:pointer;font-size:14px;line-height:1';document.body.appendChild(b)}
    function paint(mode){b.textContent=icon(mode);b.title=mode==='dark'?'Lys modus':'Mørk modus'}
    b.onclick=function(){window.FourSapienTheme.toggle()};
    paint(window.FourSapienTheme.get());window.FourSapienTheme.subscribe(paint);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
</script>'''

final_style=r'''<style id="four-sapien-finance-unified-type-guard">
#axeFin{font-family:'DM Sans',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif!important;scroll-padding-bottom:calc(150px + env(safe-area-inset-bottom))}
#axeFin .af{padding-bottom:calc(150px + env(safe-area-inset-bottom))!important}
/* Claude Premium 2026-09-19: full desktop Twin, mobile unchanged. */
@media(min-width:1000px){#axeFin .af{max-width:1280px}}
#axeFin h1,#axeFin h2,#axeFin h3,#axeFin h4,#axeFin h5,#axeFin h6{font-family:'Instrument Sans',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif!important;font-style:normal}
#axeFin button,#axeFin input,#axeFin select,#axeFin textarea{font-family:'DM Sans',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif!important}
#axeFin .mono,#axeFin .truth,#axeFin .mo b,#axeFin .mo small,#axeFin .detail b{font-family:'Fragment Mono',ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace!important;font-style:normal}
/* Premium large-number typography: mono remains limited to small metadata. */
#axeFin .big,#axeFin .val{font-family:'Instrument Sans',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif!important;letter-spacing:-.025em;font-style:normal}
</style>'''

legacy=re.compile(r"<script>\(function\(\)\{var r=document\.documentElement;function set\(t\)\{.*?window\.__toggleTheme=.*?</script>",re.S)
for p in paths:
    if not p.exists(): raise SystemExit(f'Finance unified target missing: {p}')
    s=p.read_text(encoding='utf-8')
    for m in ('AXE_FINANCE_EXPERIENCE_V2','AXE_FINANCE_UX_V3','CLAUDE_UNIFIED_REDESIGN_20260917','Instrument Sans','DM Sans','Fragment Mono'):
        if m not in s: raise SystemExit(f'Finance unified prerequisite missing {m}: {p}')
    if '/4sapien-theme.js' not in s:
        if s.count('</head>')!=1: raise SystemExit(f'Finance unified head mismatch: {p}')
        s=s.replace('</head>','<script src="/4sapien-theme.js"></script>\n</head>',1)
    s,n=legacy.subn('',s,count=1)
    if n not in (0,1): raise SystemExit(f'Finance legacy theme runtime duplicate: {p}')
    if 'window.__toggleTheme' in s: raise SystemExit(f'Finance second theme runtime remains: {p}')
    if 'four-sapien-finance-theme-bridge' not in s:
        if s.count('</body>')!=1: raise SystemExit(f'Finance body mismatch: {p}')
        s=s.replace('</body>',bridge+'\n</body>',1)
    if 'four-sapien-finance-unified-type-guard' not in s:
        if s.count('</head>')!=1: raise SystemExit(f'Finance type head mismatch: {p}')
        s=s.replace('</head>',final_style+'\n</head>',1)
    if 'font-family:serif' in s.lower(): raise SystemExit(f'Serif regression in Finance: {p}')
    p.write_text(s,encoding='utf-8')

# Runtime comes after Claude's visible layer; no older visual premium guard is applied.
finance_twin=Path(__file__).resolve().with_name('apply_finance_twin_runtime_guard.py')
if not finance_twin.exists(): raise SystemExit('Finance Twin runtime guard missing')
subprocess.run([sys.executable,str(finance_twin),str(site)],check=True)
print('4SAPIEN Finance unified typography/theme guard applied + canonical Finance Twin runtime')
