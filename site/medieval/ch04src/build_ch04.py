from pathlib import Path
import sys,hashlib
if len(sys.argv)!=3:raise SystemExit('usage: build_ch04.py BUILD03_ROOT_OUTPUT.html DESTINATION.html')
base=Path(sys.argv[1]);out=Path(sys.argv[2]);root=Path(__file__).resolve().parent
source=base.read_text()
base_sha=hashlib.sha256(base.read_bytes()).hexdigest()
if base_sha!='3a676e40e0dfdc4f91a413a9c8f4691851c55a0a6cf0a55dfa064bedc399ca83':raise SystemExit('Refusing non-Build03 source')
anchor='const Ot=new Q0;'
assert source.count(anchor)==1
patch='\n'.join((root/name).read_text() for name in ['ch04_extra_geometry.js','challenger04_patch.js'])
css='\n'.join((root/name).read_text() for name in ['clean-hud.css','challenger04.css'])
source=source.replace(anchor,patch+'\n'+anchor)
source=source.replace('</head>','<style id="mk04-style">'+css+'</style></head>',1)
source=source.replace('<title>MEDIEVAL KINGDOMS — Hattin & Belvoir | CUB Game Lab</title>','<title>MEDIEVAL KINGDOMS — CHALLENGER 04 | CUB GAME LAB</title>')
out.parent.mkdir(parents=True,exist_ok=True);out.write_text(source)
print('CH04_CREATED',out,len(source.encode()),hashlib.sha256(out.read_bytes()).hexdigest())
