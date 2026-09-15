from pathlib import Path
import subprocess
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: apply_finance_typography_guard.py <site-dir>')

site = Path(sys.argv[1])
paths = [site/'app'/'money'/'index.html', site/'finance.html', site/'finance'/'index.html']

replacements = (
    ('font-family:"DM Sans",system-ui', 'font-family:inherit'),
    ('font-family:"Fragment Mono",monospace', 'font-family:inherit'),
    ('font:700 28px/1.05 "Instrument Sans",system-ui', 'font-weight:700;font-size:28px;line-height:1.05;font-family:inherit'),
)

for path in paths:
    if not path.exists():
        raise SystemExit(f'Finance typography target missing: {path}')
    s = path.read_text(encoding='utf-8')
    if '<!-- AXE_FINANCE_EXPERIENCE_V2 -->' not in s:
        raise SystemExit(f'AXE Finance experience marker missing: {path}')
    for old, new in replacements:
        count = s.count(old)
        if count != 1:
            raise SystemExit(f'Finance typography anchor mismatch {old!r}: {count} in {path}')
        s = s.replace(old, new, 1)
    for forbidden in ('font-family:"DM Sans",system-ui','font-family:"Fragment Mono",monospace','font:700 28px/1.05 "Instrument Sans",system-ui'):
        if forbidden in s:
            raise SystemExit(f'Foreign Finance typography remains: {forbidden}')
    path.write_text(s, encoding='utf-8')

print('4SAPIEN Finance typography guard applied: AXE layer inherits Claude donor')

# Apply the shared theme first. Typography normalization below is deliberately last so
# no theme/runtime layer can reintroduce browser/editorial serif defaults into AXE Finance.
shared_theme = Path(__file__).resolve().with_name('apply_shared_theme_guard.py')
if shared_theme.exists():
    subprocess.run([sys.executable, str(shared_theme), str(site)], check=True)
    print('4SAPIEN canonical visual chain: shared theme applied')

# Final Founder visual guard for the injected Finance experience.
# Claude's typography system is sans-first: Instrument Sans display, DM Sans UI/body,
# Fragment Mono for machine-like values. This also creates enough mobile clearance so
# fixed navigation cannot visually cover the next Finance section/action row.
final_style = '''<style id="four-sapien-finance-final-type-guard">
#axeFin{font-family:"DM Sans",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;scroll-padding-bottom:calc(150px + env(safe-area-inset-bottom))}
#axeFin .af{padding-bottom:calc(150px + env(safe-area-inset-bottom))!important}
#axeFin p,#axeFin span,#axeFin label,#axeFin a,#axeFin li,#axeFin div,#axeFin button,#axeFin input,#axeFin select,#axeFin textarea{font-family:inherit}
#axeFin h1,#axeFin h2,#axeFin h3,#axeFin h4,#axeFin h5,#axeFin h6{font-family:"Instrument Sans",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;font-style:normal}
#axeFin button,#axeFin input,#axeFin select,#axeFin textarea{font-family:"DM Sans",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important}
#axeFin .mono,#axeFin .val,#axeFin .truth,#axeFin .mo b,#axeFin .mo small,#axeFin .detail b{font-family:"Fragment Mono",ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace!important;font-style:normal}
</style>'''

for path in paths:
    s = path.read_text(encoding='utf-8')
    if 'four-sapien-finance-final-type-guard' in s:
        raise SystemExit(f'Final Finance type guard duplicated: {path}')
    if s.count('</head>') != 1:
        raise SystemExit(f'Finance final type guard head mismatch: {path}')
    s = s.replace('</head>', final_style + '\n</head>', 1)
    for marker in (
        'four-sapien-finance-final-type-guard',
        'font-family:"Instrument Sans"',
        'font-family:"DM Sans"',
        'font-family:"Fragment Mono"',
        'padding-bottom:calc(150px + env(safe-area-inset-bottom))',
    ):
        if marker not in s:
            raise SystemExit(f'Finance final visual marker missing {marker!r}: {path}')
    path.write_text(s, encoding='utf-8')

print('4SAPIEN Finance final typography + mobile nav clearance guard applied')
