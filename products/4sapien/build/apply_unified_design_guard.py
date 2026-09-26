from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: apply_unified_design_guard.py <site-dir>')
site = Path(sys.argv[1])
items = [
    (site/'index.html','w-embla'),
    (site/'app'/'food'/'index.html','w-food'),
    (site/'app'/'money'/'index.html','w-money'),
    (site/'finance.html','w-money'),
    (site/'finance'/'index.html','w-money'),
]
for p, cls in items:
    if not p.exists(): raise SystemExit(f'unified design target missing: {p}')
    s=p.read_text(encoding='utf-8')
    if '/4sapien-design.css' not in s:
        if '<style>' in s:
            s=s.replace('<style>','<link rel="stylesheet" href="/4sapien-design.css">\n<style>',1)
        elif '</head>' in s:
            s=s.replace('</head>','<link rel="stylesheet" href="/4sapien-design.css">\n</head>',1)
        else: raise SystemExit(f'unified design head anchor missing: {p}')
    if '<body>' in s:
        s=s.replace('<body>',f'<body class="{cls}">',1)
    elif '<body class=' not in s:
        raise SystemExit(f'unified design body anchor missing: {p}')
    for marker in ('/4sapien-design.css', cls):
        if marker not in s: raise SystemExit(f'unified design marker missing {marker}: {p}')
    p.write_text(s,encoding='utf-8')
print('4SAPIEN unified design grammar linked: root + Food + Finance')
