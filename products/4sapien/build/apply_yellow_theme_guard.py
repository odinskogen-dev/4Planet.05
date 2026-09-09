from pathlib import Path
import sys

p = Path(sys.argv[1])
s = p.read_text()


def replace_once(old: str, new: str, label: str):
    global s
    count = s.count(old)
    if count != 1:
        raise SystemExit(f"4SAPIEN yellow-theme anchor mismatch: {label} count={count}")
    s = s.replace(old, new, 1)


# TEMPORARY LIVE VISUAL TEST — exact founder-requested duotone.
# Product imagery remains photographic; interface chrome is #FFFF00 + #000000.
replace_once(
    '<meta name="theme-color" content="#FFFFFF" />',
    '<meta name="theme-color" content="#FFFF00" />\n<meta name="4sapien-theme-test" content="YELLOW-01 #FFFF00 #000000" />',
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
new_tokens = '''const T={paper:"#FFFF00",ink:"#000000",blue:"#000000",red:"#000000",green:"#000000",grey:"#000000",
soft:"#000000",faint:"#000000",line:"rgba(0,0,0,0.22)",line2:"rgba(0,0,0,0.50)",
blueWash:"#FFFF00",redWash:"#FFFF00",fill:"#FFFF00",'''
replace_once(old_tokens, new_tokens, "central palette")

# Explicit marker used by production QA/readback. Keep this test reversible by
# removing this build guard; canonical Claude source itself is untouched.
marker = '<!-- 4SAPIEN YELLOW TEST 01 | #FFFF00 + #000000 -->\n'
replace_once('<body>\n', marker + '<body>\n', "test marker")

for required in [
    '#FFFF00',
    '#000000',
    '4SAPIEN YELLOW TEST 01',
    'paper:"#FFFF00"',
    'ink:"#000000"',
    'blue:"#000000"',
    'fill:"#FFFF00"',
]:
    if required not in s:
        raise SystemExit(f"4SAPIEN yellow-theme invariant missing: {required}")

p.write_text(s)
print("4SAPIEN YELLOW TEST 01 applied: #FFFF00 / #000000")
