from pathlib import Path
import re
import sys

p = Path(sys.argv[1])
s = p.read_text()


def replace_once(old: str, new: str, label: str):
    global s
    count = s.count(old)
    if count != 1:
        raise SystemExit(f"4SAPIEN Light/Dark anchor mismatch: {label} count={count}")
    s = s.replace(old, new, 1)


def replace_regex(pattern: str, repl: str, label: str):
    global s
    s2, count = re.subn(pattern, repl, s, count=1)
    if count != 1:
        raise SystemExit(f"4SAPIEN Light/Dark regex anchor mismatch: {label} count={count}")
    s = s2


# LIGHT is exactly the current Yellow 02 token system. DARK is a second token set.
# No auth/data/product/persistence logic is changed here.
replace_once(
    'input::placeholder{color:#000000;opacity:.58}',
    'input::placeholder{color:currentColor;opacity:.58}',
    'placeholder follows theme',
)
replace_once(
    ':focus-visible{outline:2px solid #000000;',
    ':focus-visible{outline:2px solid var(--4sapien-focus,#000000);',
    'focus follows theme',
)
replace_once(
    'background:"#FFFF00",backdropFilter:"blur(8px)"',
    'background:T.paper,backdropFilter:"blur(8px)"',
    'bottom nav follows theme',
)

font_anchor = 'display:"\'Instrument Sans\',sans-serif",body:"\'DM Sans\',sans-serif",mono:"\'Fragment Mono\',monospace"};'
theme_engine = font_anchor + '''
const THEMES={
 light:{paper:"#FFFF00",calm:"#F5F3EF",ink:"#000000",blue:"#000000",red:"#000000",green:"#000000",grey:"#000000",soft:"#000000",faint:"#000000",line:"rgba(0,0,0,0.22)",line2:"rgba(0,0,0,0.50)",blueWash:"#F5F3EF",redWash:"#F5F3EF",fill:"#F5F3EF",browser:"#FFFF00"},
 dark:{paper:"#000000",calm:"#111111",ink:"#FFFFFF",blue:"#FFFF00",red:"#FFFF00",green:"#FFFF00",grey:"#FFFFFF",soft:"#E8E8E8",faint:"#B8B8B8",line:"rgba(255,255,255,0.22)",line2:"rgba(255,255,255,0.50)",blueWash:"rgba(255,255,0,0.10)",redWash:"rgba(255,255,0,0.10)",fill:"#171717",browser:"#000000"}
};
function readTheme(){try{return localStorage.getItem("4sapien_theme")==="dark"?"dark":"light";}catch(e){return "light";}}
function applyTheme(mode){const x=THEMES[mode]||THEMES.light;Object.assign(T,x);try{localStorage.setItem("4sapien_theme",mode);}catch(e){}if(typeof document!=="undefined"){document.documentElement.style.background=x.paper;if(document.body)document.body.style.background=x.paper;const root=document.getElementById("root");if(root)root.style.background=x.paper;document.documentElement.style.setProperty("--4sapien-focus",x.blue);const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute("content",x.browser||x.paper);}}
const INITIAL_THEME=readTheme();applyTheme(INITIAL_THEME);'''
replace_once(font_anchor, theme_engine, 'theme engine after central tokens')

replace_regex(
    r'function App\(\)\{\n\s*const\[authReady,setAuthReady\]',
    'function App(){\n const[theme,setThemeState]=useState(INITIAL_THEME);const toggleTheme=()=>{const next=theme==="dark"?"light":"dark";applyTheme(next);setThemeState(next);};\n const[authReady,setAuthReady]',
    'App theme state',
)

id_button = '<button onClick={()=>setTab(tab==="meg"?"hjem":"meg")} aria-label={tab==="meg"?"Lukk profil":"4PLANET ID – innlogget"}'
toggle = '''<button onClick={toggleTheme} aria-label={theme==="dark"?"Bytt til lys modus":"Bytt til mørk modus"} title={theme==="dark"?"Lys modus":"Mørk modus"} style={{border:"1px solid "+T.line,background:T.paper,borderRadius:999,width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:T.ink,padding:0,flexShrink:0}}><span aria-hidden="true" style={{fontFamily:T.mono,fontSize:13,lineHeight:1}}>{theme==="dark"?"☀":"◐"}</span></button>'''
replace_once(id_button, toggle + id_button, 'header theme toggle')

old_marker = '<!-- 4SAPIEN YELLOW TEST 02 | #FFFF00 + #000000 + #F5F3EF calm -->'
replace_once(old_marker, old_marker + '\n<!-- 4SAPIEN LIGHT DARK 01 | local preference only | one runtime -->', 'theme marker')

for required in [
    '4SAPIEN LIGHT DARK 01',
    'const THEMES={',
    'localStorage.getItem("4sapien_theme")',
    'localStorage.setItem("4sapien_theme",mode)',
    'theme==="dark"?"light":"dark"',
    'Bytt til mørk modus',
    'Bytt til lys modus',
    'paper:"#000000"',
    'blue:"#FFFF00"',
    'calm:"#111111"',
    'background:T.paper,backdropFilter:"blur(8px)"',
]:
    if required not in s:
        raise SystemExit(f"4SAPIEN Light/Dark invariant missing: {required}")

p.write_text(s)
print("4SAPIEN LIGHT/DARK 01 applied: Light=Yellow02, Dark=black/yellow; local-only preference")
