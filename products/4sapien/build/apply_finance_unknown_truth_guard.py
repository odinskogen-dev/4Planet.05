"""UNKNOWN is never ZERO across visible Money layers.

Runs after Daniel + truth math + B1c + Money Now. Corrects existing donor and
overlay calculations in place; no new store, schema or competing Finance engine.
AXE hardening extends Claude's 2026-10-05 candidate so NULL survives both the
overlay and the React donor instead of being coerced through unary + / || 0.
"""
from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit("usage: apply_finance_unknown_truth_guard.py <site-dir>")
site = Path(sys.argv[1])
paths = [site/"app"/"money"/"index.html", site/"finance.html", site/"finance"/"index.html"]
MARK = "FOUR_SAPIEN_UNKNOWN_TRUTH_V1"


def once(s, old, new, label):
    n = s.count(old)
    if n != 1:
        raise SystemExit(f"Unknown truth {label}: expected one anchor, found {n}")
    return s.replace(old, new, 1)


OLD_REG = ("function reg(i){let inn=0,out=0;S.e.forEach(e=>{let d=date(e);"
           "if(d.getFullYear()!=fsYear()||d.getMonth()!=i)return;"
           "let n=sg(e)*(+e.amount||0);n>0?inn+=n:out-=n});return{inn,out,net:inn-out}}")
NEW_REG = ("function reg(i){let inn=0,out=0,seen=0;S.e.forEach(e=>{let d=date(e);"
           "if(d.getFullYear()!=fsYear()||d.getMonth()!=i)return;seen++;"
           "let n=sg(e)*(+e.amount||0);n>0?inn+=n:out-=n});"
           "return{inn:seen?inn:null,out:seen?out:null,net:seen?inn-out:null,seen}}")
OLD_MONTHS = ("function months(){let now=new Date(),p=liquid();return MN.map((name,i)=>{"
              "let r=reg(i),st='REGISTRERT',end=null,net=r.net;")
NEW_MONTHS = ("function months(){let now=new Date(),p=liquid();return MN.map((name,i)=>{"
              "let r=reg(i),st=r.seen?'REGISTRERT':'UKJENT',end=null,net=r.net;")
OLD_LIQUID = ("function liquid(){let a=S.a.filter(x=>['bank','cash'].includes(x.kind));"
              "return !a.length||a.some(x=>!Number.isFinite(+x.balance))?null:a.reduce((s,x)=>s+ +x.balance,0)}")
NEW_LIQUID = ("function liquid(){let a=S.a.filter(x=>['bank','cash'].includes(x.kind));"
              "return !a.length||a.some(x=>fsBal(x)===null)?null:a.reduce((s,x)=>s+fsBal(x),0)}")
OLD_ASSETS = "function assets(){return S.a.reduce((s,x)=>s+(+x.balance||0),0)"
NEW_ASSETS = ("function fsBal(x){if(!x)return null;let v=x.balance;if(v===null||v===undefined||v==='')return null;"
              "v=Number(v);return Number.isFinite(v)?v:null}"
              "function fsUnknownAccounts(){return S.a.filter(x=>fsBal(x)===null).length}"
              "function assets(){return S.a.reduce((s,x)=>s+(fsBal(x)||0),0)")
OLD_INVEST = "S.a.filter(a=>a.kind==='invest')"
NEW_INVEST = "S.a.filter(a=>a.kind==='invest'||a.kind==='investment')"
OLD_DRILL_ACCT = "map(a=>({acct:1,id:a.id,name:a.name,amount:+a.balance||0,mt:'FORMUE · KONTO'}))"
NEW_DRILL_ACCT = ("map(a=>({acct:1,id:a.id,name:a.name,amount:fsBal(a),"
                  "mt:fsBal(a)===null?'FORMUE · KONTO · UKJENT SALDO':'FORMUE · KONTO'}))")

OLD_REACT_KR = 'const kr=(n)=>Math.round(n).toLocaleString("no-NO")+" kr";'
NEW_REACT_KR = ('const kr=(n)=>(n===null||n===undefined||n===""||!Number.isFinite(Number(n)))'
                '?"UKJENT":Math.round(Number(n)).toLocaleString("no-NO")+" kr";')
OLD_DB_ACCOUNT = ('const dbAccount=(r)=>({id:r.id,name:r.name,kind:r.kind,balance:+r.balance||0,'
                  'asOf:r.as_of,source:r.source});')
NEW_DB_ACCOUNT = ('const dbAccount=(r)=>({id:r.id,name:r.name,kind:r.kind,'
                  'balance:r.balance===null||r.balance===undefined?null:Number(r.balance),asOf:r.as_of,source:r.source});')
OLD_REACT_LIQUID = ('function liquidBalance(accounts){return accounts.filter((a)=>a.kind!=="investment")'
                    '.reduce((s,a)=>s+(+a.balance||0),0);}')
NEW_REACT_LIQUID = ('function fsReactBalance(a){if(!a||a.balance===null||a.balance===undefined||a.balance==="")return null;'
                    'const v=Number(a.balance);return Number.isFinite(v)?v:null;}'
                    'function liquidBalance(accounts){const rows=accounts.filter((a)=>a.kind==="bank"||a.kind==="cash");'
                    'return !rows.length||rows.some((a)=>fsReactBalance(a)===null)?null:rows.reduce((s,a)=>s+fsReactBalance(a),0);}'
                    'function investmentBalance(accounts){const rows=accounts.filter((a)=>a.kind==="investment");'
                    'return rows.some((a)=>fsReactBalance(a)===null)?null:rows.reduce((s,a)=>s+fsReactBalance(a),0);}')

for path in paths:
    s = path.read_text(encoding="utf-8")
    for need in ("FOUR_SAPIEN_FINANCE_TRUTH_MATH_V1", "FOUR_SAPIEN_FINANCE_SYNC_B1C", "FOUR_SAPIEN_MONEY_NOW_V1"):
        if need not in s:
            raise SystemExit(f"Unknown truth: missing baseline {need} in {path}")
    if MARK in s:
        raise SystemExit(f"Unknown truth duplicate: {path}")

    s = once(s,
             "kr=x=>Number.isFinite(+x)?Math.round(+x).toLocaleString('no-NO')+' kr':'UKJENT'",
             "kr=x=>(x!==null&&x!==undefined&&x!==''&&Number.isFinite(+x))?Math.round(+x).toLocaleString('no-NO')+' kr':'UKJENT'",
             "overlay currency formatter")
    s = once(s, OLD_REG, NEW_REG, "registered month")
    old_money = ("return S.e.filter(e=>{if(e.type!==t)return false;let r=e.recurring||'once';"
                 "if(r==='monthly')return true;let d=date(e);if(!d||isNaN(d))return false;"
                 "if(r==='yearly')return d.getFullYear()<=y&&d.getMonth()===m;"
                 "return d.getFullYear()===y&&d.getMonth()===m})"
                 ".reduce((s,e)=>s+(+e.amount||0),0)}")
    new_money = ("let rows=S.e.filter(e=>{if(e.type!==t)return false;let r=e.recurring||'once';"
                 "if(r==='monthly')return true;let d=date(e);if(!d||isNaN(d))return false;"
                 "if(r==='yearly')return d.getFullYear()<=y&&d.getMonth()===m;"
                 "return d.getFullYear()===y&&d.getMonth()===m});"
                 "return rows.length?rows.reduce((s,e)=>s+(+e.amount||0),0):null}")
    s = once(s, old_money, new_money, "quad month total")
    s = once(s, OLD_MONTHS, NEW_MONTHS, "month state")
    s = once(s, OLD_LIQUID, NEW_LIQUID, "liquidity null semantics")
    s = once(s, OLD_ASSETS, NEW_ASSETS, "asset total")
    s = once(s, OLD_INVEST, NEW_INVEST, "investment account kind")
    s = once(s, OLD_DRILL_ACCT, NEW_DRILL_ACCT, "asset drilldown account")
    s = once(s,
             '<input class="edit mono ab" type="number" value="${+a.balance||0}">',
             '<input class="edit mono ab" type="number" value="${fsBal(a)===null?\'\':fsBal(a)}" placeholder="UKJENT">',
             "account input unknown")
    s = once(s,
             "editKey($('.ab',r),e=>up(AT,id,{balance:Math.round(+e.target.value||0),as_of:today()}))",
             "editKey($('.ab',r),e=>{let v=e.target.value.trim();up(AT,id,{balance:v===''?null:Math.round(Number(v)),as_of:today()})})",
             "account edit unknown")
    s = once(s,
             "let sum=items.reduce((s,i)=>s+i.amount,0);return`<button class=\"btn\" id=\"afBack\">",
             "let sum=items.some(i=>i.amount===null)?null:items.reduce((s,i)=>s+i.amount,0);return`<button class=\"btn\" id=\"afBack\">",
             "drilldown unknown sum")
    s = once(s,
             "<input class=\"edit mono da\" type=\"number\" value=\"${i.amount}\">",
             "<input class=\"edit mono da\" type=\"number\" value=\"${i.amount===null?'':i.amount}\" placeholder=\"${i.amount===null?'UKJENT':''}\">",
             "drilldown unknown input")
    s = once(s,
             "editKey2($('.da',r),e=>up(acct?AT:ET,id,{balance:acct?Math.round(+e.target.value||0):undefined,amount:acct?undefined:Math.abs(Math.round(+e.target.value||0))}))",
             "editKey2($('.da',r),e=>{let v=e.target.value.trim();up(acct?AT:ET,id,{balance:acct?(v===''?null:Math.round(Number(v))):undefined,amount:acct?undefined:Math.abs(Math.round(Number(v)||0))})})",
             "drilldown edit unknown")

    old_quad = "${q('Eiendeler',assets(),'','asset')}"
    s = once(s, old_quad,
             "${fsUnknownAccounts()?q('Eiendeler',null,'','asset'):q('Eiendeler',assets(),'','asset')}",
             "asset quad unknown")
    old_cell = "<div class=\"${m.net>=0?'pos':'neg'}\">${m.net>=0?'+':''}${Math.round(m.net/1000)}k</div>"
    new_cell = ("<div class=\"${m.net===null?'mut':(m.net>=0?'pos':'neg')}\">"
                "${m.net===null?'UKJENT':(m.net>=0?'+':'')+Math.round(m.net/1000)+'k'}</div>")
    s = once(s, old_cell, new_cell, "month cell")

    s = once(s, OLD_REACT_KR, NEW_REACT_KR, "React currency formatter")
    s = once(s, OLD_DB_ACCOUNT, NEW_DB_ACCOUNT, "React dbAccount null")
    s = once(s, OLD_REACT_LIQUID, NEW_REACT_LIQUID, "React liquidity definition")
    s = once(s, "const out=[];let bal=startLiquid;", "const out=[];let bal=startLiquid===null||startLiquid===undefined?null:Number(startLiquid);", "React forecast start")
    s = once(s,
             "if(hit){bal+=sign*e.amount;delta+=sign*e.amount;if(bal<low)low=bal;}",
             "if(hit){if(bal!==null){bal+=sign*e.amount;if(low===null||bal<low)low=bal;}delta+=sign*e.amount;}",
             "React forecast unknown propagation")
    s = once(s,
             'const dbEvent=(r)=>({id:r.id,type:r.type,amount:+r.amount||0,category:r.category,name:r.name,date:r.occurred_on,recurring:r.recurring||"once",',
             'const dbEvent=(r)=>({id:r.id,type:r.type,amount:r.amount===null||r.amount===undefined?null:Number(r.amount),category:r.category,name:r.name,date:r.occurred_on,recurring:r.recurring||"once",',
             "React dbEvent null")
    s = once(s,
             'const row={user_id:userId,name:a.name,kind:a.kind,balance:Math.round(+a.balance||0),as_of:dISO(new Date()),source:"manual"};',
             'const row={user_id:userId,name:a.name,kind:a.kind,balance:a.balance===null||a.balance===undefined||a.balance===""?null:Math.round(Number(a.balance)),as_of:dISO(new Date()),source:"manual"};',
             "React add account null")

    old_now = ('const conflict=dueSum>liq;  const assets=events.filter((e)=>e.type==="asset").reduce((a,b)=>a+b.amount,0)'
               '+accounts.filter((a)=>a.kind==="investment").reduce((s,a)=>s+(+a.balance||0),0);  '
               'const debts=events.filter((e)=>e.type==="debt").reduce((a,b)=>a+b.amount,0);const net=liq+assets-debts;  '
               'const mSpend=events.filter((e)=>e.type==="spend"&&e.recurring==="monthly").reduce((a,b)=>a+b.amount,0);  '
               'const runway=mSpend>0?(liq+assets)/mSpend:0;const has=accounts.length>0||events.length>0;')
    new_now = ('const conflict=liq!==null&&dueSum>liq;const coverageUnknown=liq===null;  const inv=investmentBalance(accounts);'
               'const assetEvents=events.filter((e)=>e.type==="asset").reduce((a,b)=>a+Number(b.amount||0),0);'
               'const assets=inv===null?null:assetEvents+inv;  const debts=events.filter((e)=>e.type==="debt").reduce((a,b)=>a+Number(b.amount||0),0);'
               'const net=liq===null||assets===null?null:liq+assets-debts;  const mSpend=events.filter((e)=>e.type==="spend"&&e.recurring==="monthly").reduce((a,b)=>a+Number(b.amount||0),0);  '
               'const runway=liq===null||assets===null||mSpend<=0?null:(liq+assets)/mSpend;const has=accounts.length>0||events.length>0;')
    s = once(s, old_now, new_now, "React Now truth")
    s = once(s, 'color:liq<0?T.red:T.ink', 'color:liq!==null&&liq<0?T.red:T.ink', "React Now liquidity colour")
    s = once(s, 'accounts.filter((a)=>a.kind!=="investment").length} likvide kontoer', 'accounts.filter((a)=>a.kind==="bank"||a.kind==="cash").length} likvide kontoer', "React Now liquid count")
    s = once(s,
             '{runway>=99?"99+":runway.toFixed(1).replace(".",",")}<span style={{fontSize:12,color:T.faint}}> mnd</span>',
             '{runway===null?"UKJENT":(runway>=99?"99+":runway.toFixed(1).replace(".",","))}<span style={{fontSize:12,color:T.faint}}>{runway===null?"":" mnd"}</span>',
             "React Now runway unknown")
    s = once(s,
             '{conflict?<div style={{fontFamily:T.body,fontSize:12.5,color:T.red,marginTop:8,lineHeight:1.5}}>Forfall de neste 30 dagene ({kr(dueSum)}) er større enn det du har tilgjengelig ({kr(liq)}). Gap: <b>{kr(dueSum-liq)}</b>. Ta tak nå — se «Ro i magen om inkasso» under Regninger for rolige, konkrete steg.</div>     :<div style={{fontFamily:T.body,fontSize:12,color:T.soft,marginTop:6}}>Du har dekning for det som forfaller. Betal gjerne nær forfall for å beholde likviditet.</div>}',
             '{coverageUnknown?<div style={{fontFamily:T.body,fontSize:12,color:T.soft,marginTop:6}}>Dekning er UKJENT fordi minst én likvid saldo mangler.</div>:conflict?<div style={{fontFamily:T.body,fontSize:12.5,color:T.red,marginTop:8,lineHeight:1.5}}>Forfall de neste 30 dagene ({kr(dueSum)}) er større enn det du har tilgjengelig ({kr(liq)}). Gap: <b>{kr(dueSum-liq)}</b>. Ta tak nå — se «Ro i magen om inkasso» under Regninger for rolige, konkrete steg.</div>     :<div style={{fontFamily:T.body,fontSize:12,color:T.soft,marginTop:6}}>Du har dekning for det som forfaller. Betal gjerne nær forfall for å beholde likviditet.</div>}',
             "React coverage unknown")

    s = once(s,
             'function Money({accounts,events,quickAdd,delEvent}){const liq=liquidBalance(accounts);  const inv=accounts.filter((a)=>a.kind==="investment").reduce((s,a)=>s+(+a.balance||0),0);',
             'function Money({accounts,events,quickAdd,delEvent}){const liq=liquidBalance(accounts);  const invAccounts=accounts.filter((a)=>a.kind==="investment");const inv=investmentBalance(accounts);',
             "React Money investments")
    s = once(s, '{inv>0&&<div style={{display:"flex",justifyContent:"space-between",marginTop:4,fontFamily:T.body,fontSize:12,color:T.faint}}>',
             '{invAccounts.length>0&&<div style={{display:"flex",justifyContent:"space-between",marginTop:4,fontFamily:T.body,fontSize:12,color:T.faint}}>',
             "React Money investment row")

    old_plan = ('function Plan({accounts,events}){const liq=liquidBalance(accounts);  '
                'const assets=events.filter((e)=>e.type==="asset").reduce((a,b)=>a+b.amount,0)+accounts.filter((a)=>a.kind==="investment").reduce((s,a)=>s+(+a.balance||0),0);  '
                'const debts=events.filter((e)=>e.type==="debt").reduce((a,b)=>a+b.amount,0);const net=liq+assets-debts;')
    new_plan = ('function Plan({accounts,events}){const liq=liquidBalance(accounts);  const inv=investmentBalance(accounts);'
                'const assetEvents=events.filter((e)=>e.type==="asset").reduce((a,b)=>a+Number(b.amount||0),0);const assets=inv===null?null:assetEvents+inv;  '
                'const debts=events.filter((e)=>e.type==="debt").reduce((a,b)=>a+Number(b.amount||0),0);const net=liq===null||assets===null?null:liq+assets-debts;')
    s = once(s, old_plan, new_plan, "React Plan truth")
    s = once(s, 'const runwayLiq=mSpend>0?liq/mSpend:0;const runwayAll=mSpend>0?(liq+assets)/mSpend:0;',
             'const runwayLiq=liq===null||mSpend<=0?null:liq/mSpend;const runwayAll=liq===null||assets===null||mSpend<=0?null:(liq+assets)/mSpend;',
             "React Plan runway")
    s = once(s, 'value={kr(liq)} color={liq<0?T.red:T.ink}', 'value={kr(liq)} color={liq!==null&&liq<0?T.red:T.ink}', "React Plan liquidity colour")
    s = once(s,
             '{runwayLiq>=99?"99+":runwayLiq.toFixed(1).replace(".",",")}<span style={{fontSize:13,color:T.faint}}> mnd</span>',
             '{runwayLiq===null?"UKJENT":(runwayLiq>=99?"99+":runwayLiq.toFixed(1).replace(".",","))}<span style={{fontSize:13,color:T.faint}}>{runwayLiq===null?"":" mnd"}</span>',
             "React Plan liquid runway")
    s = once(s,
             '{runwayAll>=99?"99+":runwayAll.toFixed(1).replace(".",",")}<span style={{fontSize:13,color:T.faint}}> mnd</span>',
             '{runwayAll===null?"UKJENT":(runwayAll>=99?"99+":runwayAll.toFixed(1).replace(".",","))}<span style={{fontSize:13,color:T.faint}}>{runwayAll===null?"":" mnd"}</span>',
             "React Plan all runway")

    s = once(s, "</head>", f"<!-- {MARK}: unknown months/balances stay unknown across overlay + React -->\n</head>", "marker")
    path.write_text(s, encoding="utf-8")

hard = site / "4sapien-live-hardening.js"
h = hard.read_text(encoding="utf-8")
OLD_MOD = ("function modelled(m){if(!m)return{income:0,expense:0,net:0};"
           "const income=Number(m.actual?.income||0)+Number(m.forecast?.income||0)+Number(m.scheduled_unconfirmed?.income||0);"
           "const expense=Number(m.actual?.expense||0)+Number(m.forecast?.expense||0)+Number(m.scheduled_unconfirmed?.expense||0);"
           "return{income,expense,net:income-expense}}")
NEW_MOD = ("function modelled(m){if(!m)return{income:null,expense:null,net:null};"
           "const parts=[m.actual,m.forecast,m.scheduled_unconfirmed];"
           "const has=k=>parts.some(p=>p&&p[k]!==null&&p[k]!==undefined&&p[k]!=='');"
           "const sum=k=>parts.reduce((s,p)=>s+Number((p&&p[k])||0),0);"
           "const income=has('income')?sum('income'):null;const expense=has('expense')?sum('expense'):null;"
           "return{income,expense,net:income===null&&expense===null?null:Number(income||0)-Number(expense||0)}}")
if h.count(OLD_MOD) != 1:
    raise SystemExit(f"Unknown truth: live-hardening modelled anchor count {h.count(OLD_MOD)}")
h = h.replace(OLD_MOD, NEW_MOD, 1)
if MARK not in h:
    h = h.replace("(function(){\n'use strict';", f"(function(){{\n'use strict';\n/* {MARK} */", 1)
hard.write_text(h, encoding="utf-8")

print("PASS Unknown truth: NULL never becomes visible zero; investment kind fixed; React+overlay fail closed")
