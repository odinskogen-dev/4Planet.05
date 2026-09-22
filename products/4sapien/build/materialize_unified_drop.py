from pathlib import Path
import hashlib, lzma, tarfile, io, sys

if len(sys.argv) != 3:
    raise SystemExit('usage: materialize_unified_drop.py <chunk-dir> <output-dir>')

src=Path(sys.argv[1]); out=Path(sys.argv[2]); out.mkdir(parents=True,exist_ok=True)
parts=sorted(src.glob('payload.part*'))
expected=[src/f'payload.part{i:02d}' for i in range(16)]
if parts != expected:
    raise SystemExit(f'Claude unified payload sequence mismatch: {[p.name for p in parts]}')
raw=b''.join(p.read_bytes() for p in parts)
want_archive='88c4148c605db4185b14cdfc9cbce9969fe0bcfd785927cafb27ada997fc5d11'
got_archive=hashlib.sha256(raw).hexdigest()
if got_archive!=want_archive:
    raise SystemExit(f'Claude unified archive hash mismatch: {got_archive} != {want_archive}')
try:
    tar_bytes=lzma.decompress(raw)
except Exception as exc:
    raise SystemExit(f'Claude unified archive decompress failed: {exc}') from exc

expected_files={
 '4sapien_app_unified.html':'a602e3b9fcae863ba05ec0adfd16d4aeea398c160a33a09c0cd090e29f1955b5',
 '4sapien_food_MERGED.html':'d6bbd0b436a10ceae77f4ed579edb32a73a635cc3af8e59623cbd1ca47757ab8',
 '4sapien_finance_MERGED.html':'8fc246b70d8842ff0d1f10b6ef043e9af63d0009de790bb60ba4264f5370ee90',
 '4sapien_finance_AXE_experience_MERGED.html':'4f586b4064fbbafbf1db6bc3440d2598f9c3985c9b84ff43a7fe333ff5147c21',
}
with tarfile.open(fileobj=io.BytesIO(tar_bytes),mode='r:') as tf:
    members={m.name:m for m in tf.getmembers() if m.isfile()}
    for name,want in expected_files.items():
        if name not in members: raise SystemExit(f'Claude unified source missing from archive: {name}')
        f=tf.extractfile(members[name]); data=f.read() if f else b''
        got=hashlib.sha256(data).hexdigest()
        if got!=want: raise SystemExit(f'Claude unified source hash mismatch {name}: {got} != {want}')
        (out/name).write_bytes(data)
        print(f'PASS {name} sha256={got}')
    for name in ('4sapien-design.css','4SAPIEN_UNIFIED_REDESIGN_HANDBACK.md','4SAPIEN_DESIGN_SYSTEM_note.md'):
        if name in members:
            f=tf.extractfile(members[name]); data=f.read() if f else b''
            (out/name).write_bytes(data)
print(f'4SAPIEN Claude unified redesign archive PASS sha256={got_archive}')
