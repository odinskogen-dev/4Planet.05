"""One stable shell across every public 4SAPIEN surface.

Runs LAST in the materialization chain, after every page exists. Additive: loads
one shared shell script; no user data or Finance truth is mutated.
"""
from pathlib import Path
import shutil
import sys

if len(sys.argv) != 2:
    raise SystemExit("usage: apply_shell_nav_guard.py <site-dir>")
site = Path(sys.argv[1])
src = Path(__file__).resolve().parents[1] / "source" / "4sapien-shell.js"
if not src.exists():
    raise SystemExit(f"Shell: missing source {src}")
shutil.copyfile(src, site / "4sapien-shell.js")

MARK = "FOUR_SAPIEN_SHELL_V1"
TAG = '<script src="/4sapien-shell.js" defer></script>'

pages = [
    site/"index.html",
    site/"app"/"money"/"index.html",
    site/"app"/"money"/"documents"/"index.html",
    site/"app"/"money"/"import"/"index.html",
    site/"app"/"food"/"index.html",
    site/"finance.html",
    site/"finance"/"index.html",
    site/"brain"/"index.html",
]

patched = 0
for path in pages:
    if not path.exists():
        raise SystemExit(f"Shell: expected page missing {path}")
    s = path.read_text(encoding="utf-8")
    if MARK in s:
        raise SystemExit(f"Shell duplicate: {path}")
    if s.count("</body>") != 1:
        raise SystemExit(f"Shell: expected one </body> in {path}, found {s.count('</body>')}")
    s = s.replace("</body>", f"<!-- {MARK}: stable shell + one world bar -->\n{TAG}\n</body>", 1)
    path.write_text(s, encoding="utf-8")
    patched += 1

print(f"PASS Shell: stable world bar on {patched} pages")
