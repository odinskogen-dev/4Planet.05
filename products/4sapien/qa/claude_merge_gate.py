#!/usr/bin/env python3
"""4SAPIEN Claude merge gate.

Usage:
  python products/4sapien/qa/claude_merge_gate.py <site-dir>

Fail closed on runtime/security regressions while allowing visible UX to change.
"""
from pathlib import Path
import re
import sys

if len(sys.argv) != 2:
    raise SystemExit("usage: claude_merge_gate.py <site-dir>")

site = Path(sys.argv[1]).resolve()
root = site / "index.html"
food = site / "app" / "food" / "index.html"
money = site / "app" / "money" / "index.html"

for p in (root, food, money):
    if not p.exists():
        raise SystemExit(f"MERGE_GATE_MISSING:{p}")

texts = {"root": root.read_text(errors="replace"), "food": food.read_text(errors="replace"), "money": money.read_text(errors="replace")}
all_html = "\n".join(texts.values())

# Shared product / route integrity.
required_any = {
    "root": ["4SAPIEN", "/app/food/", "/app/money/"],
    "food": ["4SAPIEN", "four_sapien_profiles", "four_sapien_list_items", "four_sapien_meal_plans", "functions/v1/embla-products"],
    "money": ["4SAPIEN", "four_sapien_finance_accounts", "four_sapien_finance_events", "ghvdzetmplqkdtfqiror.supabase.co", "sb.auth.getSession()"],
}
for surface, markers in required_any.items():
    for marker in markers:
        if marker not in texts[surface]:
            raise SystemExit(f"MERGE_GATE_MARKER:{surface}:{marker}")

# Browser secret / architecture regressions.
forbidden = [
    r"service[_-]?role", r"sb_secret_", r"SUPABASE_SERVICE_ROLE",
    r"CLOUDFLARE_API_TOKEN", r"KASSALAPP_API_KEY", r"KASSALAPP_TOKEN",
]
for pattern in forbidden:
    if re.search(pattern, all_html, re.I):
        raise SystemExit(f"MERGE_GATE_SECRET:{pattern}")

# Mobile baseline. Claude can redesign, but every surface must remain real mobile HTML.
for surface, text in texts.items():
    if not re.search(r'<meta[^>]+name=["\']viewport["\']', text, re.I):
        raise SystemExit(f"MERGE_GATE_VIEWPORT:{surface}")

# Finance Twin runtime contract must remain available in repo-side integration layer.
contract = site.parent / "qa" / "FINANCE_TWIN_RUNTIME_CONTRACT.md"
if not contract.exists():
    raise SystemExit("MERGE_GATE_FINANCE_CONTRACT_MISSING")

print("CLAUDE_MERGE_GATE:PASS")
