from pathlib import Path
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
