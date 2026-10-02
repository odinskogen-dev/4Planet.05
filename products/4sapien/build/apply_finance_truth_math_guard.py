"""Finance truth math: one-off events reach the overview, and the year is real.

Runs AFTER apply_finance_daniel_feedback_guard.py. Additive, no new engine:
it corrects the existing overlay calculation in place.

P0-A  money(t) counted only recurring='monthly', so a saved one-off expense or
      income never changed the overview quad. Now the quad answers "this month":
      monthly recurring + yearly/one-off events dated in the current month.
P0-B  reg(), projected() and months() hard-coded the year 2026, and so did three
      visible labels. Every event outside 2026 was invisible, and the whole Money
      view would empty out on 1 January. The year is now the real current year.

Unknown stays unknown: nothing is estimated, no event is counted twice, and the
set of events read is unchanged.
"""
from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit("usage: apply_finance_truth_math_guard.py <site-dir>")
site = Path(sys.argv[1])
paths = [site/"app"/"money"/"index.html", site/"finance.html", site/"finance"/"index.html"]
MARK = "FOUR_SAPIEN_FINANCE_TRUTH_MATH_V1"

OLD_MONEY = ("function money(t){return S.e.filter(e=>e.type===t&&e.recurring==='monthly')"
             ".reduce((s,e)=>s+(+e.amount||0),0)}")
NEW_MONEY = ("function fsYear(){return new Date().getFullYear()}"
             "function money(t){let n=new Date(),y=n.getFullYear(),m=n.getMonth();"
             "return S.e.filter(e=>{if(e.type!==t)return false;let r=e.recurring||'once';"
             "if(r==='monthly')return true;let d=date(e);if(!d||isNaN(d))return false;"
             "if(r==='yearly')return d.getFullYear()<=y&&d.getMonth()===m;"
             "return d.getFullYear()===y&&d.getMonth()===m})"
             ".reduce((s,e)=>s+(+e.amount||0),0)}")

OLD_REG = "function reg(i){let inn=0,out=0;S.e.forEach(e=>{let d=date(e);if(d.getFullYear()!=2026||d.getMonth()!=i)return;"
NEW_REG = "function reg(i){let inn=0,out=0;S.e.forEach(e=>{let d=date(e);if(d.getFullYear()!=fsYear()||d.getMonth()!=i)return;"

OLD_PROJ = ("function projected(i,remaining=false){let now=new Date(),n=0,last=new Date(2026,i+1,0);"
            "S.e.forEach(e=>{let s=sg(e);if(!s)return;let d=date(e),a=+e.amount||0,due=null;"
            "if(e.recurring==='monthly'){if(d>last)return;due=new Date(2026,i,Math.min(d.getDate(),last.getDate()),12)}"
            "else if(e.recurring==='yearly'&&d.getMonth()==i)due=new Date(2026,i,Math.min(d.getDate(),last.getDate()),12);"
            "else if(e.recurring==='once'&&d.getFullYear()==2026&&d.getMonth()==i)due=d;else return;")
NEW_PROJ = ("function projected(i,remaining=false){let now=new Date(),Y=fsYear(),n=0,last=new Date(Y,i+1,0);"
            "S.e.forEach(e=>{let s=sg(e);if(!s)return;let d=date(e),a=+e.amount||0,due=null;"
            "if(e.recurring==='monthly'){if(d>last)return;due=new Date(Y,i,Math.min(d.getDate(),last.getDate()),12)}"
            "else if(e.recurring==='yearly'&&d.getFullYear()<=Y&&d.getMonth()==i)due=new Date(Y,i,Math.min(d.getDate(),last.getDate()),12);"
            "else if((e.recurring||'once')==='once'&&d.getFullYear()==Y&&d.getMonth()==i)due=d;else return;")

OLD_MONTHS = ("if(now.getFullYear()==2026&&i===now.getMonth()){st='NÅ';net=projected(i,true);if(p!==null)p+=net;end=p}"
              "else if(now.getFullYear()<2026||(now.getFullYear()==2026&&i>now.getMonth())){st='PROGNOSE';")
NEW_MONTHS = ("if(now.getFullYear()==fsYear()&&i===now.getMonth()){st='NÅ';net=projected(i,true);if(p!==null)p+=net;end=p}"
              "else if(now.getFullYear()<fsYear()||(now.getFullYear()==fsYear()&&i>now.getMonth())){st='PROGNOSE';")

LABELS = [
    ('<div class="truth">Din økonomiske tvilling · 2026</div>',
     '<div class="truth">Din økonomiske tvilling · ${fsYear()}</div>'),
    ('<div class="ttl">Likviditet 2026</div>', '<div class="ttl">Likviditet ${fsYear()}</div>'),
    ('<b>${x.name} 2026</b>', '<b>${x.name} ${fsYear()}</b>'),
]

def once(s, old, new, label):
    n = s.count(old)
    if n != 1:
        raise SystemExit(f"Truth math {label}: expected one anchor, found {n}")
    return s.replace(old, new, 1)

for path in paths:
    s = path.read_text(encoding="utf-8")
    if "FOUR_SAPIEN_DANIEL_FINANCE_FIX_01" not in s:
        raise SystemExit(f"Truth math missing Daniel baseline: {path}")
    if MARK in s:
        raise SystemExit(f"Truth math duplicate: {path}")

    s = once(s, OLD_MONEY, NEW_MONEY, "overview quad (one-off)")
    s = once(s, OLD_REG, NEW_REG, "registered month")
    s = once(s, OLD_PROJ, NEW_PROJ, "projection")
    s = once(s, OLD_MONTHS, NEW_MONTHS, "month states")
    for old, new in LABELS:
        s = once(s, old, new, f"label {old[:28]}")

    if "2026" in s.split("function money(")[1].split("function acct(")[0]:
        raise SystemExit(f"Truth math: hard-coded year still present in finance math: {path}")
    s = once(s, "</head>", f"<!-- {MARK}: one-off events in overview, real current year -->\n</head>", "marker")
    path.write_text(s, encoding="utf-8")

print("PASS Finance truth math: one-off income/spend reach the overview; year is dynamic; all three routes")
