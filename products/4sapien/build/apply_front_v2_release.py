from pathlib import Path
import re
import subprocess
import sys

if len(sys.argv) != 3:
    raise SystemExit('usage: apply_front_v2_release.py <donor.html> <target.html>')

donor = Path(sys.argv[1])
target = Path(sys.argv[2])
html = donor.read_text(encoding='utf-8')

# Keep Claude's visible design, but route actions into the real production worlds.
html = html.replace(
    '<a href="#" class="mark" onclick="closeApp();return false">4SAPIEN<small>BY 4PLANET</small></a>',
    '<a href="/" class="mark">4SAPIEN<small>BY 4PLANET</small></a>',
    1,
)
html = html.replace(
    '<a href="#" class="login" onclick="openApp();return false">Log in</a>',
    '<a href="/app/food/" class="login">Log in</a>',
    1,
)
html = html.replace(
    '<div class="cta-row"><a href="#" class="btn pri big" onclick="openApp();return false">Get started</a><a href="#" class="btn big" onclick="openApp();return false">Log in</a></div>',
    '<div class="cta-row"><a href="/app/food/" class="btn pri big">Get started</a><a href="/app/food/" class="btn big">Log in</a></div>',
    1,
)
html = html.replace(
    '<div class="head"><div class="id"><span class="pulse"></span>Embla<span id="mode">· asking</span></div>',
    '<div class="head"><div class="id"><span class="pulse"></span>Embla<span id="mode">· illustrative demo</span></div>',
    1,
)
html = html.replace(
    '<section class="band"><div class="wrap">\n  <div class="eyebrow reveal">Embla</div>',
    '<section class="band" id="method"><div class="wrap">\n  <div class="eyebrow reveal">Embla</div>',
    1,
)
html = html.replace(
    '<a href="#" onclick="openApp();return false">Open Food</a>',
    '<a href="/app/food/">Open Food</a>',
    1,
)
html = html.replace(
    '<a href="#" onclick="openApp();return false">Open Money</a>',
    '<a href="/app/money/">Open Money</a>',
    1,
)
html = html.replace(
    '<section class="band fill"><div class="wrap">\n  <div class="eyebrow reveal">Privacy</div>',
    '<section class="band fill" id="privacy"><div class="wrap">\n  <div class="eyebrow reveal">Privacy</div>',
    1,
)
html = html.replace(
    "Your data powers your 4SAPIEN and nothing else. What's sensitive stays yours. We claim only what we can prove.",
    'Your data is used to provide your 4SAPIEN experience. Sensitive personal data stays private to your account. We claim only what we can prove.',
    1,
)
html = html.replace(
    '<div class="cta-row reveal"><a href="#" class="btn pri big" onclick="openApp();return false">Get started</a><a href="#" class="btn big" onclick="openApp();return false">Log in</a></div>',
    '<div class="cta-row reveal"><a href="/app/food/" class="btn pri big">Get started</a><a href="/app/food/" class="btn big">Log in</a></div>',
    1,
)
html = html.replace(
    '<footer><div class="wrap"><div class="mono">4SAPIEN · BY 4PLANET</div><nav><a href="#" onclick="return false">Method</a><a href="#" onclick="return false">Privacy</a></nav></div></footer>',
    '<footer><div class="wrap"><div class="mono">4SAPIEN · BY 4PLANET</div><nav><a href="#method">Method</a><a href="#privacy">Privacy</a></nav></div></footer>',
    1,
)

# The embedded /app section is a Claude donor concept, not yet a real authenticated surface.
# Keep it in the source donor, but never ship the fake local-state app over the real product.
html, n = re.subn(
    r'\n<!-- /app — TODAY / UNDERSTAND home \(donor; GPT wires real data \+ routes\) -->\n<section id="app">.*?</section>\n\n<script>',
    '\n<script>',
    html,
    count=1,
    flags=re.S,
)
if n != 1:
    raise SystemExit('Front v2 integration failed: embedded app donor block not found exactly once')

html, n_open = re.subn(
    r'\n function openApp\(\)\{.*?\}\n function closeApp\(\)\{.*?\}',
    '',
    html,
    count=1,
    flags=re.S,
)
if n_open != 1:
    raise SystemExit('Front v2 integration failed: demo openApp/closeApp functions not found')

# Respect reduced motion for the new reveal/pulse layer as well as the Embla typing loop.
reduce_css = '''\n @media(prefers-reduced-motion:reduce){\n  html{scroll-behavior:auto}\n  .reveal{opacity:1;transform:none;transition:none}\n  .pulse,.caret{animation:none}\n  body{transition:none}\n }'''
html = html.replace('\n</style>', reduce_css + '\n</style>', 1)

required = (
    'See your life clearly.',
    'Food × Money · together',
    'Plan my food until payday.',
    '#2E2EFF', '#3AE86F', '#FF4D22', '#FF5ACD',
    '/app/food/', '/app/money/',
    '· illustrative demo',
    'Your data is used to provide your 4SAPIEN experience.',
    'id="method"', 'id="privacy"',
)
for marker in required:
    if marker not in html:
        raise SystemExit(f'Front v2 QA missing marker: {marker}')

for forbidden in ('function openApp', 'function closeApp', 'id="app"'):
    if forbidden in html:
        raise SystemExit(f'Front v2 QA forbidden demo marker: {forbidden}')

target.write_text(html, encoding='utf-8')
front_auth_guard = Path(__file__).resolve().with_name('apply_front_auth_guard.py')
subprocess.run([sys.executable, str(front_auth_guard), str(target)], check=True)
print('4SAPIEN Claude front v2 integrated for production + auth state guard')
