"""B1c: every visible Finance write refreshes every visible Finance layer.

Runs AFTER apply_finance_daniel_feedback_guard.py. Additive only:
- keeps Daniel guard, Finance Twin runtime and the React donor intact
- overlay inline edit / delete / quick-add now use the same invalidation
  event as the React add sheet (single, serialized readback path)
- React state silently re-reads when the overlay or a document wrote
- Finance Twin re-reads after any write (month detail / freedom months)
- a failed readback is marked STALE and said out loud; never shown as fresh
"""
from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit("usage: apply_finance_sync_b1c_guard.py <site-dir>")
site = Path(sys.argv[1])
paths = [site/"app"/"money"/"index.html", site/"finance.html", site/"finance"/"index.html"]
MARK = "FOUR_SAPIEN_FINANCE_SYNC_B1C"
EV = "four-sapien-finance-record-changed"

def once(s, old, new, label):
    n = s.count(old)
    if n != 1:
        raise SystemExit(f"B1c {label}: expected one anchor, found {n}")
    return s.replace(old, new, 1)

def fire(kind, idexpr="null"):
    return (f"window.dispatchEvent(new CustomEvent('{EV}',"
            f"{{detail:{{kind:{kind},id:{idexpr},source:'overlay'}}}}))")

for path in paths:
    s = path.read_text(encoding="utf-8")
    for need in ("FOUR_SAPIEN_DANIEL_FINANCE_FIX_01", "FOUR_SAPIEN_FINANCE_TWIN_RUNTIME_V1_1"):
        if need not in s:
            raise SystemExit(f"B1c missing baseline {need}: {path}")
    if MARK in s:
        raise SystemExit(f"B1c duplicate: {path}")

    s = once(s, "await load();render();toast('Lagret')",
             "toast('Lagret');" + fire("t===AT?'account':'event'", "id"),
             "overlay inline edit")
    s = once(s, "if(error)return toast('Kunne ikke slette');await load();render()",
             "if(error)return toast('Kunne ikke slette');" + fire("'event_deleted'", "id"),
             "overlay delete")
    s = once(s, "$('#afModal').classList.remove('on');await load();render();toast(p.length+' rader lagret')",
             "$('#afModal').classList.remove('on');toast(p.length+' rader lagret');" + fire("'event_batch'"),
             "overlay quick-add batch")

    s = once(s,
        f"window.addEventListener('{EV}',async()=>{{try{{await load();render()}}catch(e){{toast('Oppdatering kunne ikke hentes. Prøv igjen.')}}}});",
        f"let syncQ=Promise.resolve();window.addEventListener('{EV}',()=>{{syncQ=syncQ.then(async()=>{{let l=$('#axeFin');"
        "try{await load();render();l&&l.setAttribute('data-finance-sync','FRESH')}"
        "catch(e){l&&l.setAttribute('data-finance-sync','STALE');toast('Lagret, men visningen kunne ikke oppdateres. Prøv igjen.')}})});",
        "overlay serialized readback")

    s = once(s, "finally{setLoading(false);}};",
        "finally{setLoading(false);}};"
        "useEffect(()=>{let seq=0;const h=async ev=>{const d=(ev&&ev.detail)||{};"
        "if(d.source!=='overlay'&&d.source!=='document')return;const my=++seq;"
        "try{const[a,e]=await Promise.all([sb.from(\"four_sapien_finance_accounts\").select(\"*\").order(\"created_at\",{ascending:true}),"
        "sb.from(\"four_sapien_finance_events\").select(\"*\").order(\"occurred_on\",{ascending:true})]);"
        "if(my!==seq)return;if(a.error)throw a.error;if(e.error)throw e.error;"
        "setAccounts((a.data||[]).map(dbAccount));setEvents((e.data||[]).map(dbEvent));setErr(\"\");}"
        "catch(x){if(my===seq)setErr(\"Lagret, men visningen kunne ikke oppdateres. Prøv igjen.\");}};"
        f"window.addEventListener(\"{EV}\",h);return()=>window.removeEventListener(\"{EV}\",h);}},[]);",
        "react silent readback")

    s = once(s,
        "  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',hydrate,{once:true});",
        "  let twinTimer=null;\n"
        f"  window.addEventListener('{EV}',function(){{\n"
        "    clearTimeout(twinTimer);\n"
        "    twinTimer=setTimeout(async function(){\n"
        "      try{ await readTwin(new Date().getFullYear()); window.__FOUR_SAPIEN_FINANCE_TWIN_ERROR__=null; }\n"
        "      catch(e){\n"
        "        window.__FOUR_SAPIEN_FINANCE_TWIN_ERROR__=String(e&&e.message||e);\n"
        "        window.__FOUR_SAPIEN_FINANCE_TWIN__=null;\n"
        "        const d=document.querySelector('#axeFin .detail');\n"
        "        if(d){ d.setAttribute('data-truth','STALE'); d.textContent='Månedsdetaljer kunne ikke oppdateres. Prøv igjen.'; }\n"
        "      }\n"
        "    },120);\n"
        "  });\n"
        "  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',hydrate,{once:true});",
        "twin readback")

    if s.count(EV) < 9:
        raise SystemExit(f"B1c sync contract incomplete: {path}")
    s = once(s, "</head>", f"<!-- {MARK}: edit/delete/batch readback across overlay, React and Twin -->\n</head>", "marker")
    path.write_text(s, encoding="utf-8")

print("PASS B1c Finance sync: edit, delete, batch and add refresh overlay+React+Twin; failed readback marked STALE; all three routes")
