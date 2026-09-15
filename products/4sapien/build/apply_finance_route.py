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

# Founder-approved Finance experience layer. Keep Claude donor + shared Supabase runtime intact;
# add direct editing, fast multi-row entry and the Personal Economic Digital Twin cockpit.
experience_path = product_dir / 'build' / 'finance_experience_v2.html'
if not experience_path.exists():
    raise SystemExit(f'Finance experience layer missing: {experience_path}')
experience = experience_path.read_text(encoding='utf-8')
if 'AXE_FINANCE_EXPERIENCE_V2' not in experience:
    raise SystemExit('Finance experience layer marker missing')
if 'AXE_FINANCE_EXPERIENCE_V2' in html:
    raise SystemExit('Finance experience layer already present in donor source')
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
    'Hurtigføring',
    'Din økonomiske tvilling',
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

# Canonical One Product route.
money_dir = site_dir / 'app' / 'money'
money_dir.mkdir(parents=True, exist_ok=True)
(money_dir / 'index.html').write_text(html, encoding='utf-8')

# Preserve legacy /finance and /finance/ links during convergence.
(site_dir / 'finance.html').write_text(html, encoding='utf-8')
finance_dir = site_dir / 'finance'
finance_dir.mkdir(parents=True, exist_ok=True)
(finance_dir / 'index.html').write_text(html, encoding='utf-8')

print('4SAPIEN Finance routes materialized: /app/money/ + legacy /finance + /finance/ + experience v2')
