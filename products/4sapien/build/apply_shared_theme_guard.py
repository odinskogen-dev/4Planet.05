from pathlib import Path
import re, sys

if len(sys.argv)!=2: raise SystemExit('usage: apply_shared_theme_guard.py <site-dir>')
site=Path(sys.argv[1]); root=site/'index.html'; food=site/'app'/'food'/'index.html'
money_paths=[site/'app'/'money'/'index.html',site/'finance.html',site/'finance'/'index.html']
for p in [root,food,*money_paths]:
    if not p.exists(): raise SystemExit(f'theme target missing: {p}')

shared=r'''(function(){const KEY='4sapien_theme';const valid=v=>v==='dark'||v==='light';function system(){return window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}function get(){try{const v=localStorage.getItem(KEY);return valid(v)?v:system()}catch(e){return system()}}function paint(mode){const t=valid(mode)?mode:'light';document.documentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme=t;const m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',t==='dark'?'#000000':'#FFFFFF');return t}function set(mode){const t=paint(mode);try{localStorage.setItem(KEY,t)}catch(e){}window.dispatchEvent(new CustomEvent('4sapien-theme-change',{detail:{mode:t}}));return t}function toggle(){return set(get()==='dark'?'light':'dark')}function subscribe(fn){const c=e=>fn(e.detail&&e.detail.mode?e.detail.mode:get()),s=e=>{if(e.key===KEY)fn(get())};window.addEventListener('4sapien-theme-change',c);window.addEventListener('storage',s);return()=>{window.removeEventListener('4sapien-theme-change',c);window.removeEventListener('storage',s)}}window.FourSapienTheme={key:KEY,get,set,toggle,subscribe,paint};paint(get())})();'''
(site/'4sapien-theme.js').write_text(shared)

def inject(s,label):
    if '/4sapien-theme.js' not in s:
        if s.count('</head>')!=1: raise SystemExit(f'{label}: head mismatch')
        s=s.replace('</head>','<script src="/4sapien-theme.js"></script>\n</head>',1)
    return s

# Public front: keep Claude's exact palette and existing button; only centralise state/persistence.
s=inject(root.read_text(),'front')
pat=re.compile(r" var root=document\.documentElement,tb=document\.getElementById\('tbtn'\),tm=document\.querySelector\('meta\[name=theme-color\]'\);\n function applyTheme\(t\)\{.*?\}\n function toggleTheme\(\)\{.*?\}\n \(function\(\)\{var m=.*?\}\)\(\);",re.S)
rep=""" var root=document.documentElement,tb=document.getElementById('tbtn'),tm=document.querySelector('meta[name=theme-color]');
 function syncFrontTheme(t){root.setAttribute('data-theme',t);document.querySelectorAll('.themebtn').forEach(function(b){b.textContent=t==='dark'?'☀':'◐';b.setAttribute('aria-label',t==='dark'?'Switch to light mode':'Switch to dark mode');});if(tm)tm.setAttribute('content',t==='dark'?'#000000':'#FFFFFF');}
 function applyTheme(t){window.FourSapienTheme.set(t);}
 function toggleTheme(){window.FourSapienTheme.toggle();}
 syncFrontTheme(window.FourSapienTheme.get());window.FourSapienTheme.subscribe(syncFrontTheme);"""
s,n=pat.subn(rep,s,1)
if n!=1: raise SystemExit(f'front theme runtime mismatch: {n}')
root.write_text(s)

FONT="display:\"'Instrument Sans',sans-serif\",body:\"'DM Sans',sans-serif\",mono:\"'Fragment Mono',monospace\""
LIGHT_COMMON='paper:"#FFFFFF",ink:"#0A0A0A",blue:"#2E2EFF",red:"#FF4D22",green:"#3AE86F",grey:"#CFCACA",soft:"#565048",faint:"#6C675F",line:"rgba(10,10,10,0.10)",line2:"rgba(10,10,10,0.16)",blueWash:"rgba(46,46,255,0.06)",redWash:"rgba(255,77,34,0.08)"'
DARK_COMMON='paper:"#000000",ink:"#FFFFFF",blue:"#7A7AFF",red:"#FF6A47",green:"#3AE86F",grey:"#6B6B6B",soft:"#C7C2BA",faint:"#8C877F",line:"rgba(255,255,255,0.13)",line2:"rgba(255,255,255,0.22)",blueWash:"rgba(122,122,255,0.12)",redWash:"rgba(255,106,71,0.12)"'

def patch_world(p,world):
    s=inject(p.read_text(),world)
    if world=='food':
        tpat=re.compile(r'const T=\{paper:"#FFFFFF".*?fill:"#F5F3EF",\s*'+re.escape(FONT)+r'\};',re.S)
        light='{'+LIGHT_COMMON+',fill:"#F5F3EF"}'
        dark='{'+DARK_COMMON+',fill:"#0B0B0B"}'
    else:
        tpat=re.compile(r'const T=\{paper:"#FFFFFF".*?greenInk:"#1c7a4a",greenWash:"rgba\(58,232,111,0\.16\)",fill:"#F5F3EF",\s*'+re.escape(FONT)+r'\};',re.S)
        light='{'+LIGHT_COMMON+',greenInk:"#1c7a4a",greenWash:"rgba(58,232,111,0.16)",fill:"#F5F3EF"}'
        dark='{'+DARK_COMMON+',greenInk:"#3AE86F",greenWash:"rgba(58,232,111,0.12)",fill:"#0B0B0B"}'
    m=tpat.search(s)
    if not m: raise SystemExit(f'{world}: Claude token anchor missing')
    engine=m.group(0)+f'''\nconst FS_THEMES={{light:{light},dark:{dark}}};const FS_INITIAL_THEME=(window.FourSapienTheme&&window.FourSapienTheme.get())||"light";function fsApplyTheme(mode){{const x=FS_THEMES[mode]||FS_THEMES.light;Object.assign(T,x);document.documentElement.setAttribute("data-theme",mode);document.documentElement.style.background=T.paper;if(document.body)document.body.style.background=T.paper;const r=document.getElementById("root");if(r)r.style.background=T.paper;}}fsApplyTheme(FS_INITIAL_THEME);'''
    s=s[:m.start()]+engine+s[m.end():]
    if s.count('function App(){')!=1: raise SystemExit(f'{world}: App entry count {s.count("function App(){")}')
    app='''function App(){\n const[theme,setThemeState]=useState(FS_INITIAL_THEME);const toggleTheme=()=>window.FourSapienTheme.toggle();useEffect(()=>window.FourSapienTheme.subscribe((mode)=>{fsApplyTheme(mode);setThemeState(mode);}),[]);'''
    s=s.replace('function App(){',app,1)
    toggle='<button onClick={toggleTheme} aria-label={theme==="dark"?"Bytt til lys modus":"Bytt til mørk modus"} title={theme==="dark"?"Lys modus":"Mørk modus"} style={{border:"1px solid "+T.line2,background:"transparent",borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:T.ink,padding:0,flexShrink:0}}><span aria-hidden="true" style={{fontFamily:T.mono,fontSize:13,lineHeight:1}}>{theme==="dark"?"☀":"◐"}</span></button>'
    if world=='food':
        a='<button onClick={()=>setTab(tab==="meg"?"hjem":"meg")} aria-label={tab==="meg"?"Lukk profil":"4PLANET ID – innlogget"}'
        if s.count(a)!=1: raise SystemExit(f'food header anchor {s.count(a)}')
        s=s.replace(a,toggle+a,1)
    else:
        a='<div style={{display:"flex",gap:7}}><button aria-label="Logg ut"'
        if s.count(a)!=1: raise SystemExit(f'money header anchor {s.count(a)}')
        s=s.replace(a,'<div style={{display:"flex",gap:7}}>'+toggle+'<button aria-label="Logg ut"',1)
    s=s.replace('body{margin:0;padding:0;background:#FFFFFF;-webkit-font-smoothing:antialiased}','body{margin:0;padding:0;background:var(--fs-shell,#FFFFFF);-webkit-font-smoothing:antialiased}',1)
    s=s.replace('</style>','html[data-theme="dark"]{--fs-shell:#000000}html[data-theme="light"]{--fs-shell:#FFFFFF}\n</style>',1)
    for x in ['/4sapien-theme.js','FS_THEMES=','FourSapienTheme.subscribe','Bytt til mørk modus','Bytt til lys modus']:
        if x not in s: raise SystemExit(f'{world}: missing {x}')
    return s

food.write_text(patch_world(food,'food'))
for p in money_paths:
    s=patch_world(p,'money'); marker='<!-- AXE_FINANCE_EXPERIENCE_V2 -->'; i=s.find(marker)
    if i<0: raise SystemExit(f'money AXE marker missing: {p}')
    before,axe=s[:i],s[i:]
    for old,new in {'#fff':'var(--fsx-paper)','#0a0a0a':'var(--fsx-ink)','#e3e3e8':'var(--fsx-line)','#d7d7dd':'var(--fsx-line)','#d9d9df':'var(--fsx-line)','#ececf0':'var(--fsx-line)','#777':'var(--fsx-soft)','#85858d':'var(--fsx-soft)','#fafafa':'var(--fsx-fill)','#f7f7ff':'var(--fsx-wash)','#16794b':'var(--fsx-pos)','#1c7a4a':'var(--fsx-pos)','#b42318':'var(--fsx-neg)','#0000000b':'var(--fsx-shadow)'}.items(): axe=axe.replace(old,new)
    vars='''<style id="four-sapien-finance-theme-vars">#axeFin{--fsx-paper:#FFFFFF;--fsx-ink:#0A0A0A;--fsx-line:#E3E3E8;--fsx-soft:#777;--fsx-fill:#FAFAFA;--fsx-wash:#F7F7FF;--fsx-pos:#16794B;--fsx-neg:#B42318;--fsx-shadow:#0000000b}html[data-theme="dark"] #axeFin{--fsx-paper:#000000;--fsx-ink:#FFFFFF;--fsx-line:#2A2A2A;--fsx-soft:#A9A59E;--fsx-fill:#0B0B0B;--fsx-wash:#11111B;--fsx-pos:#3AE86F;--fsx-neg:#FF6A47;--fsx-shadow:#00000055}html[data-theme="dark"] #axeFin input,html[data-theme="dark"] #axeFin select,html[data-theme="dark"] #axeFin textarea{color:var(--fsx-ink);background:var(--fsx-fill);border-color:var(--fsx-line)}html[data-theme="dark"] #axeFin button{color:inherit}</style>'''
    s=before+marker+vars+axe[len(marker):]
    if 'font-family:"DM Sans"' in s or 'font-family:"Fragment Mono"' in s: raise SystemExit('money: foreign typography reintroduced')
    p.write_text(s)
print('4SAPIEN SHARED THEME 01 applied: front + Food + Finance')