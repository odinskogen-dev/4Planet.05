from pathlib import Path
import ast
import base64
import lzma
import re
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: audit_finance_typography.py <apply_finance_route.py>')

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

donor_fonts = vals(donor)
experience_fonts = vals(experience)

def normalized(value):
    return value.strip().lower().replace('"', "'")

allowed_dynamic = {'inherit', 'initial', 'unset', 'var(--font)', 'var(--body)', 'var(--display)', 'var(--mono)'}
donor_norm = {normalized(v) for v in donor_fonts}
foreign = []
for value in sorted(experience_fonts):
    n = normalized(value)
    if n in allowed_dynamic or n.startswith('var('):
        continue
    if n not in donor_norm:
        foreign.append(value)

print('CLAUDE_FINANCE_FONT_FAMILIES=' + ' | '.join(sorted(donor_fonts)))
print('AXE_EXPERIENCE_FONT_FAMILIES=' + (' | '.join(sorted(experience_fonts)) if experience_fonts else 'NONE_EXPLICIT'))
if foreign:
    for value in foreign:
        for match in font_re.finditer(experience):
            if re.sub(r'\s+', ' ', match.group(1).strip()) != value:
                continue
            start=max(0,match.start()-160); end=min(len(experience),match.end()+160)
            context=re.sub(r'\s+',' ',experience[start:end])
            print('FOREIGN_FONT_CONTEXT=' + context)
    raise SystemExit('Finance experience introduces non-Claude font-family values: ' + ' | '.join(foreign))
print('FINANCE_TYPOGRAPHY_PROVENANCE=PASS')
