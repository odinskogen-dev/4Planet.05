from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: apply_finance_claude_premium_guard.py <site-dir>')

site = Path(sys.argv[1])
paths = [site/'app'/'money'/'index.html', site/'finance.html', site/'finance'/'index.html']

premium_style = r'''<style id="four-sapien-finance-claude-premium-v1">
/* Claude 2026-09-16 premium visible-layer merge, reconciled onto the newer AXE runtime/theme chain. */
#axeFin{--accent:#2E2EFF;--onAccent:#FFFFFF;--green:#3AE86F;--money:#FF4D22;--headline:var(--fsx-ink);--faint:var(--fsx-soft);--line:var(--fsx-line);--line2:var(--fsx-line);--ink:var(--fsx-ink)}
html[data-theme="dark"] #axeFin{--accent:#3AE86F;--onAccent:#000000;--money:#FF6A47;--headline:#3AE86F}
#axeFin .af h1{color:var(--headline,var(--ink))}
#axeFin .truth{color:var(--faint);letter-spacing:.14em}
#axeFin .quad{position:relative;padding:0;overflow:hidden;display:grid;grid-template-columns:1fr 1fr}
#axeFin .quad>*{position:relative;padding:20px clamp(16px,3vw,26px)}
#axeFin .quad>*::after{content:"";position:absolute;background:var(--line)}
#axeFin .quad>*:nth-child(1)::after{right:0;top:16%;bottom:0;width:1px}
#axeFin .quad>*:nth-child(1),#axeFin .quad>*:nth-child(2){border-bottom:1px solid var(--line)}
#axeFin .quad>*:nth-child(3)::after{right:0;top:0;bottom:16%;width:1px}
#axeFin .liqs .card .big{font:700 clamp(2rem,6vw,3rem)/1 'Instrument Sans',system-ui;letter-spacing:-.03em}
#axeFin .card .big{font-family:'Instrument Sans',system-ui;letter-spacing:-.02em}
#axeFin .lab{color:var(--faint);font-size:11px;letter-spacing:.06em;text-transform:uppercase}
#axeFin .card{background:var(--fsx-paper);color:var(--fsx-ink)}
#axeFin .btn.blue{background:var(--accent)!important;color:var(--onAccent)!important;border-color:var(--accent)!important;font-weight:600}
#axeFin .edit:focus,#axeFin .erow input:focus,#axeFin .erow select:focus{border-color:var(--accent)!important}
#axeFin .mo.on{border-color:var(--accent)!important;background:var(--fsx-wash)!important}
#axeFin .modal{border-top-color:var(--accent)!important;background:var(--fsx-paper)!important;color:var(--fsx-ink)!important}
#axeFin input,#axeFin select,#axeFin textarea{background:transparent;color:var(--ink);border-color:var(--line2)}
#axeFin ::placeholder{color:var(--faint)}
@media(max-width:430px){#axeFin .quad>*{padding:16px 14px}}
</style>'''

for path in paths:
    if not path.exists():
        raise SystemExit(f'Claude premium target missing: {path}')
    s = path.read_text(encoding='utf-8')
    for marker in ('AXE_FINANCE_EXPERIENCE_V2','FOUR_SAPIEN_FINANCE_TWIN_RUNTIME_V1_1','four-sapien-finance-final-type-guard','four-sapien-finance-theme-vars'):
        if marker not in s:
            raise SystemExit(f'Claude premium prerequisite missing {marker}: {path}')
    if 'four-sapien-finance-claude-premium-v1' in s:
        raise SystemExit(f'Claude premium duplicated: {path}')

    # Founder colour law: Finance uses brand blue on light only; dark Finance uses E4RTH green.
    s = s.replace('#7A7AFF', '#3AE86F')
    s = s.replace('rgba(122,122,255,0.12)', 'rgba(58,232,111,0.10)')

    if s.count('</head>') != 1:
        raise SystemExit(f'Claude premium head mismatch: {path}')
    s = s.replace('</head>', premium_style + '\n</head>', 1)

    for marker in (
        'four-sapien-finance-claude-premium-v1',
        '--accent:#3AE86F',
        'grid-template-columns:1fr 1fr',
        "clamp(2rem,6vw,3rem)",
        'FOUR_SAPIEN_FINANCE_TWIN_RUNTIME_V1_1',
    ):
        if marker not in s:
            raise SystemExit(f'Claude premium invariant missing {marker}: {path}')
    if '#7A7AFF' in s:
        raise SystemExit(f'Founder colour-law violation remains in Finance: {path}')
    path.write_text(s, encoding='utf-8')

print('4SAPIEN Claude Finance premium v1 applied: visible-layer only, current runtime preserved')
