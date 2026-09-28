from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: apply_auth_callback_guard.py <food/index.html>')

p = Path(sys.argv[1])
s = p.read_text(encoding='utf-8')

replacements = (
    ('emailRedirectTo:"https://4sapien.com/"', 'emailRedirectTo:"https://4sapien.com/app/food/"', 'email callback'),
    ('redirectTo:"https://4sapien.com/"', 'redirectTo:"https://4sapien.com/app/food/"', 'Google callback'),
)
for old, new, label in replacements:
    count = s.count(old)
    if count != 1:
        raise SystemExit(f'4SAPIEN auth callback anchor mismatch: {label} ({count})')
    s = s.replace(old, new, 1)

for marker in (
    'emailRedirectTo:"https://4sapien.com/app/food/"',
    'redirectTo:"https://4sapien.com/app/food/"',
    '4PLANET ID · INNLOGGET',
):
    if marker not in s:
        raise SystemExit(f'4SAPIEN auth callback invariant missing: {marker}')

if 'emailRedirectTo:"https://4sapien.com/"' in s or 'redirectTo:"https://4sapien.com/"' in s:
    raise SystemExit('4SAPIEN auth callback still targets public root')

p.write_text(s, encoding='utf-8')
print('4SAPIEN auth callback guard applied: callbacks -> /app/food/')
