"""Bolk 2: Penger nå / handlingsrom til lønning.

Additive. Exposes the already-deployed control contract
(public.four_sapien_finance_control_read) on the existing Finance Twin runtime
and mounts the visible surface. No new engine, no client-side truth invention.
Runs AFTER apply_finance_sync_b1c_guard.py.
"""
from pathlib import Path
import shutil
import sys

if len(sys.argv) != 2:
    raise SystemExit("usage: apply_money_now_guard.py <site-dir>")
site = Path(sys.argv[1])
src = Path(__file__).resolve().parents[1] / "source" / "4sapien-money-now.js"
if not src.exists():
    raise SystemExit(f"Money now: missing source {src}")
shutil.copyfile(src, site / "4sapien-money-now.js")

MARK = "FOUR_SAPIEN_MONEY_NOW_V1"
paths = [site/"app"/"money"/"index.html", site/"finance.html", site/"finance"/"index.html"]

def once(s, old, new, label):
    n = s.count(old)
    if n != 1:
        raise SystemExit(f"Money now {label}: expected one anchor, found {n}")
    return s.replace(old, new, 1)

for path in paths:
    s = path.read_text(encoding="utf-8")
    for need in ("FOUR_SAPIEN_FINANCE_TWIN_RUNTIME_V1_1", "FOUR_SAPIEN_FINANCE_SYNC_B1C"):
        if need not in s:
            raise SystemExit(f"Money now missing baseline {need}: {path}")
    if MARK in s:
        raise SystemExit(f"Money now duplicate: {path}")

    s = once(s,
        "  async function readTwin(year){",
        "  async function controlRead(days){\n"
        "    return await rpc('four_sapien_finance_control_read',{p_days:Number(days)||30});\n"
        "  }\n"
        "  async function readTwin(year){",
        "control read function")
    s = once(s,
        "    version:'FINANCE_TWIN_RUNTIME_V1_1',readTwin,saveEvent,batchSave,softDeleteEvent,restoreEvent,",
        "    version:'FINANCE_TWIN_RUNTIME_V1_1',readTwin,controlRead,saveEvent,batchSave,softDeleteEvent,restoreEvent,",
        "control read export")

    s = once(s, "<script src=\"/4sapien-live-hardening.js\">",
             "<script src=\"/4sapien-money-now.js\" defer></script>\n<script src=\"/4sapien-live-hardening.js\">",
             "money-now script tag")
    s = once(s, "</head>", f"<!-- {MARK}: money-now + until-payday on control contract -->\n</head>", "marker")
    path.write_text(s, encoding="utf-8")

print("PASS Money now: control read exposed on Twin, visible surface mounted, all three routes")
