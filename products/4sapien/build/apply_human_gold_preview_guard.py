from pathlib import Path
import sys

p = Path(sys.argv[1])
s = p.read_text()


def replace_once(old, new, label):
    global s
    count = s.count(old)
    if count != 1:
        raise SystemExit(f"4SAPIEN Human Gold preview anchor mismatch: {label} ({count} matches)")
    s = s.replace(old, new, 1)


# A preview login must return to the preview origin. The production guard deliberately
# pins auth to 4sapien.com, so override it only in this isolated founder-preview build.
replace_once(
    'emailRedirectTo:"https://4sapien.com/"',
    'emailRedirectTo:window.location.origin+"/"',
    "email confirmation return",
)
replace_once(
    'redirectTo:"https://4sapien.com/"',
    'redirectTo:window.location.origin+"/"',
    "Google OAuth return",
)

# Make it visually impossible to confuse the isolated Human Gold preview with live.
preview_badge = '''<div id="human-gold-preview-badge" style="position:fixed;top:8px;right:8px;z-index:2147483647;background:#000;color:#FFFF00;border:1px solid #FFFF00;border-radius:999px;padding:5px 8px;font:700 9px/1.1 monospace;letter-spacing:.8px;pointer-events:none">HUMAN GOLD PREVIEW</div>'''
if 'id="human-gold-preview-badge"' not in s:
    if '<body>' in s:
        s = s.replace('<body>', '<body>' + preview_badge, 1)
    elif '<body ' in s:
        idx = s.find('>', s.find('<body '))
        if idx < 0:
            raise SystemExit("4SAPIEN Human Gold preview body anchor missing")
        s = s[:idx+1] + preview_badge + s[idx+1:]
    else:
        raise SystemExit("4SAPIEN Human Gold preview body anchor missing")

# Give the composer a stable target and add a small founder-only jump affordance.
replace_once(
    '<section aria-label="Ask Embla"',
    '<section id="human-gold-embla" aria-label="Ask Embla"',
    "Embla composer section",
)
preview_jump = '''<a id="human-gold-jump" href="#human-gold-embla" style="position:fixed;left:50%;bottom:12px;transform:translateX(-50%);z-index:2147483646;background:#000;color:#FFFF00;border:1px solid #FFFF00;border-radius:999px;padding:9px 14px;font:700 11px/1 monospace;letter-spacing:.6px;text-decoration:none;box-shadow:0 4px 20px rgba(0,0,0,.25)">SPØR EMBLA ↑</a>'''
if 'id="human-gold-jump"' not in s:
    marker = '<div id="root"></div>'
    if marker not in s:
        raise SystemExit("4SAPIEN Human Gold preview root anchor missing")
    s = s.replace(marker, preview_jump + marker, 1)

for marker in [
    'emailRedirectTo:window.location.origin+"/"',
    'redirectTo:window.location.origin+"/"',
    'id="human-gold-preview-badge"',
    'id="human-gold-embla"',
    'id="human-gold-jump"',
    'HUMAN GOLD PREVIEW',
    'SPØR EMBLA ↑',
]:
    if marker not in s:
        raise SystemExit(f"4SAPIEN Human Gold preview invariant missing: {marker}")

p.write_text(s)
print("4SAPIEN Human Gold preview auth + visibility guard applied")
