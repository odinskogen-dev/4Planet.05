from pathlib import Path
import base64, hashlib, lzma, sys

if len(sys.argv) != 3:
    raise SystemExit('usage: materialize_unified_drop.py <encoded-source-dir> <output-dir>')

src=Path(sys.argv[1]); out=Path(sys.argv[2]); out.mkdir(parents=True,exist_ok=True)
FILES={
 '4sapien_app_unified.html':('4sapien_app_unified.html.xz.b64','a602e3b9fcae863ba05ec0adfd16d4aeea398c160a33a09c0cd090e29f1955b5'),
 '4sapien_food_MERGED.html':('4sapien_food_MERGED.html.xz.b64','d6bbd0b436a10ceae77f4ed579edb32a73a635cc3af8e59623cbd1ca47757ab8'),
 '4sapien_finance_MERGED.html':('4sapien_finance_MERGED.html.xz.b64','8fc246b70d8842ff0d1f10b6ef043e9af63d0009de790bb60ba4264f5370ee90'),
 '4sapien_finance_AXE_experience_MERGED.html':('4sapien_finance_AXE_experience_MERGED.html.xz.b64','4f586b4064fbbafbf1db6bc3440d2598f9c3985c9b84ff43a7fe333ff5147c21'),
}
for name,(enc_name,want) in FILES.items():
    p=src/enc_name
    if not p.exists(): raise SystemExit(f'Claude unified source missing: {p}')
    try: raw=lzma.decompress(base64.b64decode(p.read_text(encoding='ascii')))
    except Exception as exc: raise SystemExit(f'Claude unified source decode failed {enc_name}: {exc}') from exc
    got=hashlib.sha256(raw).hexdigest()
    if got!=want: raise SystemExit(f'Claude unified source hash mismatch {name}: {got} != {want}')
    (out/name).write_bytes(raw)
    print(f'PASS {name} sha256={got}')
print('4SAPIEN Claude unified redesign drop materialized with byte-level integrity')
