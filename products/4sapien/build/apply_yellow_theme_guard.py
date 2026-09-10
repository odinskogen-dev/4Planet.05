from pathlib import Path
import sys

p = Path(sys.argv[1])
s = p.read_text()


def replace_once(old: str, new: str, label: str):
    global s
    count = s.count(old)
    if count != 1:
        raise SystemExit(f"4SAPIEN Yellow 02 anchor mismatch: {label} count={count}")
    s = s.replace(old, new, 1)


def replace_exact_count(old: str, new: str, expected: int, label: str):
    global s
    count = s.count(old)
    if count != expected:
        raise SystemExit(f"4SAPIEN Yellow 02 anchor mismatch: {label} count={count}, expected={expected}")
    s = s.replace(old, new, expected)


# TEMPORARY LIVE VISUAL TEST — YELLOW 02.
# Keep the 4SAPIEN shell/signature at exact #FFFF00 + #000000 while introducing
# the existing Claude donor off-white (#F5F3EF) only on sustained-use surfaces.
replace_once(
    '<meta name="theme-color" content="#FFFFFF" />',
    '<meta name="theme-color" content="#FFFF00" />\n<meta name="4sapien-theme-test" content="YELLOW-02 #FFFF00 #000000 #F5F3EF" />',
    "browser theme color",
)
replace_once(
    'html,body{margin:0;padding:0;background:#FFFFFF;-webkit-font-smoothing:antialiased}',
    'html,body,#root{margin:0;padding:0;min-height:100%;background:#FFFF00;color:#000000;-webkit-font-smoothing:antialiased}',
    "page background",
)
replace_once(
    'input::placeholder{color:#857F76}',
    'input::placeholder{color:#000000;opacity:.58}',
    "input placeholder",
)
replace_once(
    ':focus-visible{outline:2px solid #2E2EFF;',
    ':focus-visible{outline:2px solid #000000;',
    "focus outline",
)

old_tokens = '''const T={paper:"#FFFFFF",ink:"#0A0A0A",blue:"#2E2EFF",red:"#FF4D22",green:"#3AE86F",grey:"#CFCACA",
soft:"#565048",faint:"#6C675F",line:"rgba(10,10,10,0.10)",line2:"rgba(10,10,10,0.16)",
blueWash:"rgba(46,46,255,0.06)",redWash:"rgba(255,77,34,0.08)",fill:"#F5F3EF",'''
new_tokens = '''const T={paper:"#FFFF00",calm:"#F5F3EF",ink:"#000000",blue:"#000000",red:"#000000",green:"#000000",grey:"#000000",
soft:"#000000",faint:"#000000",line:"rgba(0,0,0,0.22)",line2:"rgba(0,0,0,0.50)",
blueWash:"#F5F3EF",redWash:"#F5F3EF",fill:"#F5F3EF",'''
replace_once(old_tokens, new_tokens, "central palette")

replace_once('rgba(255,77,34,.28)', 'rgba(0,0,0,.35)', "health warning border tint")
replace_once('rgba(46,46,255,.22)', 'rgba(0,0,0,.24)', "health positive border tint")

replace_once(
    'background:"rgba(255,255,255,0.94)",backdropFilter:"blur(8px)"',
    'background:"#FFFF00",backdropFilter:"blur(8px)"',
    "bottom navigation background",
)

# Calm sustained-use surfaces. Visual wrappers only; product/auth/data logic untouched.
replace_once(
    'function ProfileFields({p,setP}){const set=(k,v)=>setP({...p,[k]:v});const tog=(a)=>set("avoid",p.avoid.includes(a)?p.avoid.filter((x)=>x!==a):[...p.avoid,a]);\n return(<div>',
    'function ProfileFields({p,setP}){const set=(k,v)=>setP({...p,[k]:v});const tog=(a)=>set("avoid",p.avoid.includes(a)?p.avoid.filter((x)=>x!==a):[...p.avoid,a]);\n return(<div style={{background:T.calm,border:"1px solid "+T.line,borderRadius:16,padding:16}}>',
    "profile form calm surface",
)
replace_once(
    'function Detail({p,pool,avoid,onBack,openProduct,onAdd,added}){const[pr,setPr]=useState("balanced");const rec=useMemo(()=>recommend(p,pool,pr,avoid),[p,pool,pr,avoid]);const subs=pool.filter((x)=>x.group===p.group&&x.code!==p.code).slice(0,4);const ex=hasAvoid(p,avoid);\n return(<div style={{animation:"fade .22s ease"}}>',
    'function Detail({p,pool,avoid,onBack,openProduct,onAdd,added}){const[pr,setPr]=useState("balanced");const rec=useMemo(()=>recommend(p,pool,pr,avoid),[p,pool,pr,avoid]);const subs=pool.filter((x)=>x.group===p.group&&x.code!==p.code).slice(0,4);const ex=hasAvoid(p,avoid);\n return(<div style={{animation:"fade .22s ease",background:T.calm,border:"1px solid "+T.line,borderRadius:18,padding:16,margin:"0 -4px 12px"}}>',
    "product detail calm surface",
)
replace_once(
    '{st==="done"&&<div>{sorted.map((p)=><ProductRow key={p.code} p={p} onOpen={openP} onAdd={onAdd} added={inList(p.code)} avoid={avoid}/>)}</div>}',
    '{st==="done"&&<div style={{background:T.calm,border:"1px solid "+T.line,borderRadius:16,padding:"0 12px"}}>{sorted.map((p)=><ProductRow key={p.code} p={p} onOpen={openP} onAdd={onAdd} added={inList(p.code)} avoid={avoid}/>)}</div>}',
    "search results calm surface",
)
replace_once(
    '{list.length>0&&<div style={{marginTop:22,border:"1px solid "+T.line2,borderRadius:16,padding:16}}>',
    '{list.length>0&&<div style={{marginTop:22,border:"1px solid "+T.line2,borderRadius:16,padding:16,background:T.calm}}>',
    "shopping list calm surface",
)
replace_once(
    'return(<div style={{paddingBottom:sel.size>0?70:0}}>',
    'return(<div style={{paddingBottom:sel.size>0?70:16,background:T.calm,border:"1px solid "+T.line,borderRadius:18,paddingTop:16,paddingLeft:16,paddingRight:16}}>',
    "meals calm surface",
)
replace_once(
    'const byStore={};shops.forEach((s)=>{byStore[s.store]=(byStore[s.store]||0)+s.amount;});const stores=Object.entries(byStore).sort((a,b)=>b[1]-a[1]);\n return(<div>',
    'const byStore={};shops.forEach((s)=>{byStore[s.store]=(byStore[s.store]||0)+s.amount;});const stores=Object.entries(byStore).sort((a,b)=>b[1]-a[1]);\n return(<div style={{background:T.calm,border:"1px solid "+T.line,borderRadius:18,padding:16}}>',
    "economy calm surface",
)
replace_once(
    'function Learn({openProduct,addItem,inList,avoid}){const[mode,setMode]=useState("nutr");const[sel,setSel]=useState(null);return(<div>',
    'function Learn({openProduct,addItem,inList,avoid}){const[mode,setMode]=useState("nutr");const[sel,setSel]=useState(null);return(<div style={{background:T.calm,border:"1px solid "+T.line,borderRadius:18,padding:16}}>',
    "learn calm surface",
)
replace_once(
    '<form onSubmit={submit}>',
    '<form onSubmit={submit} style={{background:T.calm,border:"1px solid "+T.line,borderRadius:16,padding:14}}>',
    "auth form calm surface",
)
replace_exact_count(
    'style={{width:"100%",maxWidth:520,background:T.paper,borderTopLeftRadius:20,borderTopRightRadius:20,padding:"22px 20px 30px",animation:"sheet .22s ease",borderTop:"3px solid "+T.blue}}',
    'style={{width:"100%",maxWidth:520,background:T.calm,borderTopLeftRadius:20,borderTopRightRadius:20,padding:"22px 20px 30px",animation:"sheet .22s ease",borderTop:"3px solid "+T.blue}}',
    2,
    "about and add-shop calm sheets",
)

marker = '<!-- 4SAPIEN YELLOW TEST 02 | #FFFF00 + #000000 + #F5F3EF calm -->\n'
replace_once('<body>\n', marker + '<body>\n', "test marker")

for required in [
    '#FFFF00', '#000000', '#F5F3EF', '4SAPIEN YELLOW TEST 02',
    'paper:"#FFFF00"', 'calm:"#F5F3EF"', 'ink:"#000000"',
    'blue:"#000000"', 'fill:"#F5F3EF"',
    'background:"#FFFF00",backdropFilter:"blur(8px)"', 'background:T.calm',
]:
    if required not in s:
        raise SystemExit(f"4SAPIEN Yellow 02 invariant missing: {required}")

for forbidden in [
    'background:"rgba(255,255,255,0.94)"',
    '#2E2EFF', '#FF4D22', '#3AE86F', '#CFCACA', '#565048', '#6C675F',
    'rgba(46,46,255,.22)', 'rgba(255,77,34,.28)',
]:
    if forbidden in s:
        raise SystemExit(f"4SAPIEN Yellow 02 invariant failed; old UI colour remains: {forbidden}")

p.write_text(s)
print("4SAPIEN YELLOW TEST 02 applied: yellow shell / black interaction / off-white sustained-use surfaces")
