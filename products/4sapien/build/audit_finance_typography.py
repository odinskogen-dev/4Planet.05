from pathlib import Path
import sys
if len(sys.argv) not in (2,3):
    raise SystemExit('usage: audit_finance_typography.py <apply_finance_route.py> [money.html]')
route=Path(sys.argv[1]).read_text(encoding='utf-8')
for marker in ('AXE_FINANCE_UX_V3','CLAUDE_UNIFIED_REDESIGN_20260917','Finance V3 inline-edit bind seam'):
    if marker not in route: raise SystemExit(f'Finance route provenance missing: {marker}')
if len(sys.argv)==3:
    s=Path(sys.argv[2]).read_text(encoding='utf-8')
    for marker in ('AXE_FINANCE_EXPERIENCE_V2','AXE_FINANCE_UX_V3','CLAUDE_UNIFIED_REDESIGN_20260917','Instrument Sans','DM Sans','Fragment Mono','four-sapien-finance-unified-type-guard','four-sapien-finance-theme-bridge','FOUR_SAPIEN_FINANCE_TWIN_RUNTIME_V1_1','/4sapien-design.css','w-money'):
        if marker not in s: raise SystemExit(f'Finance final typography/runtime marker missing: {marker}')
    if 'font-family:serif' in s.lower(): raise SystemExit('Finance serif regression detected')
    if 'window.__toggleTheme' in s: raise SystemExit('Finance duplicate legacy theme runtime detected')
print('4SAPIEN Finance unified typography/provenance audit PASS')
