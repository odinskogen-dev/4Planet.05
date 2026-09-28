from pathlib import Path
import sys

if len(sys.argv) != 4:
    raise SystemExit('usage: apply_finance_route.py <site/index.html> <finance-donor.html> <finance-experience.html>')

target = Path(sys.argv[1]).resolve()
site_dir = target.parent
donor = Path(sys.argv[2]).resolve()
experience_source = Path(sys.argv[3]).resolve()
for source in (donor, experience_source):
    if not source.exists():
        raise SystemExit(f'Finance unified source missing: {source}')

html = donor.read_text(encoding='utf-8')
experience = experience_source.read_text(encoding='utf-8')

# Claude unified redesign keeps the known AXE seam. Preserve the existing V3
# interaction refinement (wide desktop canvas + Enter/Esc direct editing) while
# taking Claude's new visible layer as the source of truth.
if experience.count('<!-- AXE_FINANCE_EXPERIENCE_V2 -->') != 1:
    raise SystemExit('Finance unified experience marker mismatch')
experience = experience.replace(
    '<!-- AXE_FINANCE_EXPERIENCE_V2 -->',
    '<!-- AXE_FINANCE_EXPERIENCE_V2 --><!-- AXE_FINANCE_UX_V3 --><!-- CLAUDE_UNIFIED_REDESIGN_20260917 -->',
    1,
)
if '.af{max-width:720px;' not in experience:
    raise SystemExit('Finance V3 width seam missing')
experience = experience.replace('.af{max-width:720px;', '.af{max-width:1080px;', 1)
experience = experience.replace(
    'Klikk direkte på feltene. Endringer lagres når du forlater feltet.',
    'Klikk direkte på feltene. Enter lagrer · Esc avbryter. Dato, kategori og gjentakelse ligger på samme rad.',
    1,
)
old_bind = """function bind(){$('#afQuick')?.addEventListener('click',quick);$('#afScan')?.addEventListener('click',()=>{let b=$$('#root button').find(x=>x.textContent.includes('Scan med Embla'));b?.click()});$$('[data-m]').forEach(x=>x.onclick=()=>{S.m=+x.dataset.m;render()});$$('[data-a]').forEach(r=>{let id=r.dataset.a;$('.an',r).onchange=e=>up(AT,id,{name:e.target.value.trim()||'Konto'});$('.ab',r).onchange=e=>up(AT,id,{balance:Math.round(+e.target.value||0),as_of:today()})});$$('[data-e]').forEach(r=>{let id=r.dataset.e;$('.en',r).onchange=e=>up(ET,id,{name:e.target.value.trim()});$('.ea',r).onchange=e=>up(ET,id,{amount:Math.abs(Math.round(+e.target.value||0))});$('.ed',r).onchange=e=>up(ET,id,{occurred_on:e.target.value});$('.ec',r).onchange=e=>up(ET,id,{category:e.target.value});$('.er',r).onchange=e=>up(ET,id,{recurring:e.target.value});$('.del',r).onclick=()=>del(id)})}function guess"""
new_bind = """function editKey(el,save){if(!el)return;let original=el.value,cancel=false;el.onfocus=()=>{original=el.value;cancel=false};el.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();cancel=true;el.value=original;el.blur()}else if(e.key==='Enter'){e.preventDefault();el.blur()}};el.onchange=e=>{if(cancel){cancel=false;return}save(e)}}function bind(){$('#afQuick')?.addEventListener('click',quick);$('#afScan')?.addEventListener('click',()=>{let b=$$('#root button').find(x=>x.textContent.includes('Scan med Embla'));b?.click()});$$('[data-m]').forEach(x=>x.onclick=()=>{S.m=+x.dataset.m;render()});$$('[data-a]').forEach(r=>{let id=r.dataset.a;editKey($('.an',r),e=>up(AT,id,{name:e.target.value.trim()||'Konto'}));editKey($('.ab',r),e=>up(AT,id,{balance:Math.round(+e.target.value||0),as_of:today()}))});$$('[data-e]').forEach(r=>{let id=r.dataset.e;editKey($('.en',r),e=>up(ET,id,{name:e.target.value.trim()}));editKey($('.ea',r),e=>up(ET,id,{amount:Math.abs(Math.round(+e.target.value||0))}));editKey($('.ed',r),e=>up(ET,id,{occurred_on:e.target.value}));$('.ec',r).onchange=e=>up(ET,id,{category:e.target.value});$('.er',r).onchange=e=>up(ET,id,{recurring:e.target.value});$('.del',r).onclick=()=>del(id)})}function guess"""
if old_bind not in experience:
    raise SystemExit('Finance V3 inline-edit bind seam missing')
experience = experience.replace(old_bind, new_bind, 1)

for marker in (
    'AXE_FINANCE_EXPERIENCE_V2', 'AXE_FINANCE_UX_V3', 'CLAUDE_UNIFIED_REDESIGN_20260917',
    'max-width:1080px', 'function editKey(', 'Din økonomiske tvilling', 'Hurtigføring',
    '#FF4D22', '#FF6A47', 'Instrument Sans', 'DM Sans', 'Fragment Mono',
):
    if marker not in experience:
        raise SystemExit(f'Finance unified experience QA missing marker: {marker}')

if html.count('</body>') != 1:
    raise SystemExit('Finance unified donor body insertion point mismatch')
html = html.replace('</body>', experience + '\n</body>', 1)

required = (
    '<title>4SAPIEN Finance — Embla</title>', '4SAPIEN by 4PLANET',
    'four_sapien_finance_accounts', 'four_sapien_finance_events', 'four-sapien-finance-docs',
    'ghvdzetmplqkdtfqiror.supabase.co', 'sb.auth.getSession()',
    'AXE_FINANCE_EXPERIENCE_V2', 'CLAUDE_UNIFIED_REDESIGN_20260917',
)
for marker in required:
    if marker not in html:
        raise SystemExit(f'Finance unified route QA missing marker: {marker}')
for marker in ('service_role','sb_secret_','SUPABASE_SERVICE_ROLE','CLOUDFLARE_API_TOKEN','KASSALAPP_API_KEY','KASSALAPP_TOKEN'):
    if marker.lower() in html.lower():
        raise SystemExit(f'Finance unified route QA forbidden marker: {marker}')

money_dir = site_dir / 'app' / 'money'
money_dir.mkdir(parents=True, exist_ok=True)
for p in (money_dir/'index.html', site_dir/'finance.html'):
    p.write_text(html, encoding='utf-8')
finance_dir = site_dir / 'finance'
finance_dir.mkdir(parents=True, exist_ok=True)
(finance_dir/'index.html').write_text(html, encoding='utf-8')
print('4SAPIEN Finance unified redesign materialized: /app/money/ + legacy routes + AXE V3 seam')
