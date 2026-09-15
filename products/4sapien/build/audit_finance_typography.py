from pathlib import Path
import ast
import base64
import lzma
import re
import sys

if len(sys.argv) not in (2,3):
    raise SystemExit('usage: audit_finance_typography.py <apply_finance_route.py> [money.html]')

route = Path(sys.argv[1])
source = route.read_text(encoding='utf-8')
module = ast.parse(source)
experience_b64 = None
for node in module.body:
    if isinstance(node, ast.Assign):
        for target in node.targets:
            if isinstance(target, ast.Name) and target.id == 'experience_b64':
                experience_b64 = ast.literal_eval(node.value)
if not experience_b64:
    raise SystemExit('Finance experience_b64 not found')

experience = lzma.decompress(base64.b64decode(experience_b64)).decode('utf-8')
product_dir = route.resolve().parent.parent
source_dir = product_dir / 'source'
parts = [source_dir / f'finance-part-{i:02d}.b64' for i in range(4)]
for part in parts:
    if not part.exists():
        raise SystemExit(f'Claude Finance donor part missing: {part.name}')
encoded = ''.join(part.read_text(encoding='ascii') for part in parts)
donor = lzma.decompress(base64.b64decode(encoded)).decode('utf-8')

font_re = re.compile(r'font-family\s*:\s*([^;}]+)', re.I)
def vals(text):
    return {re.sub(r'\s+', ' ', m.strip()) for m in font_re.findall(text)}

print('CLAUDE_FINANCE_FONT_FAMILIES=' + ' | '.join(sorted(vals(donor))))
print('AXE_SOURCE_FONT_FAMILIES=' + ' | '.join(sorted(vals(experience))))

foreign_exact = (
    'font-family:"DM Sans",system-ui',
    'font-family:"Fragment Mono",monospace',
    'font:700 28px/1.05 "Instrument Sans",system-ui',
)

if len(sys.argv) == 2:
    present=[x for x in foreign_exact if x in experience]
    if present:
        raise SystemExit('Finance source still requires typography guard: ' + ' | '.join(present))
else:
    money = Path(sys.argv[2]).read_text(encoding='utf-8')
    if '<!-- AXE_FINANCE_EXPERIENCE_V2 -->' not in money:
        raise SystemExit('Rendered AXE Finance experience marker missing')
    remaining=[x for x in foreign_exact if x in money]
    if remaining:
        raise SystemExit('Rendered Finance still contains non-Claude typography: ' + ' | '.join(remaining))
    if money.count('font-family:inherit') < 3:
        raise SystemExit('Rendered Finance typography inheritance markers incomplete')

print('FINANCE_TYPOGRAPHY_PROVENANCE=PASS')
