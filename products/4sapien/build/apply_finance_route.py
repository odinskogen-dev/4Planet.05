from pathlib import Path
import base64
import lzma
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: apply_finance_route.py <site/index.html>')

target = Path(sys.argv[1]).resolve()
site_dir = target.parent
product_dir = Path(__file__).resolve().parent.parent
source_dir = product_dir / 'source'
parts = [source_dir / f'finance-part-{i:02d}.b64' for i in range(4)]
for source in parts:
    if not source.exists():
        raise SystemExit(f'Finance source missing: {source}')

try:
    encoded = ''.join(source.read_text(encoding='ascii') for source in parts)
    html = lzma.decompress(base64.b64decode(encoded)).decode('utf-8')
except Exception as exc:
    raise SystemExit(f'Finance source decode failed: {exc}') from exc

# Founder-approved Finance experience layer, compressed to keep the production source atomic.
experience_b64 = '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'
try:
    experience = lzma.decompress(base64.b64decode(experience_b64)).decode('utf-8')
except Exception as exc:
    raise SystemExit(f'Finance experience decode failed: {exc}') from exc
if 'AXE_FINANCE_EXPERIENCE_V2' not in experience or 'Din økonomiske tvilling' not in experience or 'Hurtigføring' not in experience:
    raise SystemExit('Finance experience QA marker missing')
if '</body>' not in html:
    raise SystemExit('Finance route QA missing </body> insertion point')
html = html.replace('</body>', experience + '\n</body>', 1)

required = (
    '<title>4SAPIEN Finance — Embla</title>',
    '4SAPIEN by 4PLANET',
    'four_sapien_finance_accounts',
    'four_sapien_finance_events',
    'four-sapien-finance-docs',
    'ghvdzetmplqkdtfqiror.supabase.co',
    'sb.auth.getSession()',
    'AXE_FINANCE_EXPERIENCE_V2',
    'Din økonomiske tvilling',
    'Hurtigføring',
)
for marker in required:
    if marker not in html:
        raise SystemExit(f'Finance route QA missing marker: {marker}')

forbidden = (
    'service_role',
    'sb_secret_',
    'SUPABASE_SERVICE_ROLE',
    'CLOUDFLARE_API_TOKEN',
    'KASSALAPP_API_KEY',
    'KASSALAPP_TOKEN',
)
low = html.lower()
for marker in forbidden:
    if marker.lower() in low:
        raise SystemExit(f'Finance route QA forbidden marker: {marker}')

money_dir = site_dir / 'app' / 'money'
money_dir.mkdir(parents=True, exist_ok=True)
(money_dir / 'index.html').write_text(html, encoding='utf-8')
(site_dir / 'finance.html').write_text(html, encoding='utf-8')
finance_dir = site_dir / 'finance'
finance_dir.mkdir(parents=True, exist_ok=True)
(finance_dir / 'index.html').write_text(html, encoding='utf-8')

print('4SAPIEN Finance routes materialized: /app/money/ + legacy /finance + /finance/ + AXE experience v2')
