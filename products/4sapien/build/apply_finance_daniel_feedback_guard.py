"""Daniel real-user Finance fixes on the materialized Claude + AXE live donor.
Small post-guard patch: preserve Finance Twin, storage, auth and every world.
Do not mutate donor archive or copy an older HTML file over production.
"""
from pathlib import Path
import sys

if len(sys.argv)!=2: raise SystemExit("usage: apply_finance_daniel_feedback_guard.py <site-dir>")
site=Path(sys.argv[1])
paths=[site/"app"/"money"/"index.html",site/"finance.html",site/"finance"/"index.html"]

def once(s,old,new,label):
    hits=s.count(old)
    if hits!=1: raise SystemExit(f"Daniel Finance {label}: expected one anchor, found {hits}")
    return s.replace(old,new,1)

for path in paths:
    s=path.read_text(encoding="utf-8")
    for marker in ("AXE_FINANCE_EXPERIENCE_V2","FOUR_SAPIEN_FINANCE_TWIN_RUNTIME_V1_1","CLAUDE_UNIFIED_REDESIGN_20260917"):
        if marker not in s: raise SystemExit(f"Daniel Finance missing baseline {marker}: {path}")
    if "FOUR_SAPIEN_DANIEL_FINANCE_FIX_01" in s: raise SystemExit(f"Daniel Finance duplicate: {path}")

    # React add sheet: make intent explicit. Income drill in Claude/AXE overlay
    # informs the existing global React Add button; no competing modal.
    s=once(s,
      'const[cat,setCat]=useState(p0.category||"Mat");',
      'const[cat,setCat]=useState(p0.category||(p0.type==="income"?"Lønn":"Mat"));',
      "correct income default category")
    s=once(s,
      '<Btn kind="blue" size={13.5} onClick={()=>setAdd({type:window.__FOUR_SAPIEN_FINANCE_ADD_TYPE__||"spend"})}',
      '<Btn kind="blue" size={13.5} onClick={()=>setAdd({type:window.__FOUR_SAPIEN_FINANCE_ADD_TYPE__||"spend"})}',
      "already patched header") if False else s
    s=once(s,
      '<Btn kind="blue" size={13.5} onClick={()=>setAdd({})}',
      '<Btn kind="blue" size={13.5} onClick={()=>setAdd({type:window.__FOUR_SAPIEN_FINANCE_ADD_TYPE__||"spend"})}',
      "React global add from category intent")
    # A modal write updates React immediately, and explicitly tells the
    # older visible Finance experience to refetch canonical rows before rendering.
    s=once(s,
      'setAccounts(L=>[...L,dbAccount(data)]);setAdd(null);',
      'setAccounts(L=>[...L,dbAccount(data)]);setAdd(null);window.dispatchEvent(new CustomEvent("four-sapien-finance-record-changed",{detail:{kind:"account",id:data.id}}));',
      "account write invalidation")
    s=once(s,
      'setEvents(L=>[...L,dbEvent(saved)]);setAdd(null);',
      'setEvents(L=>[...L,dbEvent(saved)]);setAdd(null);window.dispatchEvent(new CustomEvent("four-sapien-finance-record-changed",{detail:{kind:"event",id:saved.id}}));',
      "event write invalidation")
    s=once(s,
      'setEvents(L=>L.filter(e=>e.id!==id));',
      'setEvents(L=>L.filter(e=>e.id!==id));window.dispatchEvent(new CustomEvent("four-sapien-finance-record-changed",{detail:{kind:"event_deleted",id}}));',
      "event delete invalidation")

    # Visible overlay reuses its original category drill. Only income/spend/
    # asset/debt map to the React event-type intent. Back and tab navigation clear it.
    s=once(s,
      'el.onclick=()=>{S.drill=c;render()}',
      'el.onclick=()=>{S.drill=c;window.__FOUR_SAPIEN_FINANCE_ADD_TYPE__=["income","spend","asset","debt"].includes(c)?c:null;render()}',
      "visible drill intent")
    s=once(s,
      "if(bk)bk.onclick=()=>{S.drill=null;render()}",
      "if(bk)bk.onclick=()=>{S.drill=null;window.__FOUR_SAPIEN_FINANCE_ADD_TYPE__=null;render()}",
      "visible drill back")
    s=once(s,
      "function render(){let m=mode(),l=$('#axeFin');if(!m){l.style.display='none';return}",
      "function render(){let m=mode(),l=$('#axeFin');if(!m){S.drill=null;window.__FOUR_SAPIEN_FINANCE_ADD_TYPE__=null;l.style.display='none';return}",
      "clear hidden overlay intent")

    # The visible overlay has its own snapshot. React setEvents alone does not
    # refresh that snapshot: it previously appeared stale until navigating.
    s=once(s,
      "S.a=a.data||[];S.e=e.data||[]}",
      "if(a.error||e.error)throw(a.error||e.error);S.a=a.data||[];S.e=e.data||[];return true}",
      "fail closed on Finance read errors")
    s=once(s,
      "await load();render();new MutationObserver(()=>setTimeout(render,60)).observe($('#root'),{subtree:true,childList:true,characterData:true})",
      "await load();render();window.addEventListener('four-sapien-finance-record-changed',async()=>{try{await load();render()}catch(e){toast('Oppdatering kunne ikke hentes. Prøv igjen.')}});$('#root').addEventListener('click',e=>{if(e.target.closest('nav button')){S.drill=null;window.__FOUR_SAPIEN_FINANCE_ADD_TYPE__=null;}});new MutationObserver(()=>setTimeout(render,60)).observe($('#root'),{subtree:true,childList:true,characterData:true})",
      "post-save live refetch and tab intent reset")

    # Event-driven refresh must run against existing canonical data, not duplicate
    # synthetic UI entries or manufacture balances.
    if s.count("FOUR_SAPIEN_FINANCE_TWIN_RUNTIME_V1_1")<1: raise SystemExit("Twin disappeared")
    if s.count('four-sapien-finance-record-changed')<4: raise SystemExit("write sync contract missing")
    s=once(s,'</head>','<!-- FOUR_SAPIEN_DANIEL_FINANCE_FIX_01: category-specific add + visible snapshot invalidation -->\n</head>',"marker")
    path.write_text(s,encoding="utf-8")
print("PASS Daniel Finance: selected income intent, visible readback after save, all three routes, no donor replacement")
