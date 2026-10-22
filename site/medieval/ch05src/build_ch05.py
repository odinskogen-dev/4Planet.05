from pathlib import Path
import hashlib,sys
if len(sys.argv)!=3: raise SystemExit('usage: build_ch05.py CH04.html CH05.html')
source=Path(sys.argv[1]).read_text();target=Path(sys.argv[2]);root=Path(__file__).resolve().parent
assert source.count('const Ot=new Q0;')==1, 'Missing ROMA source anchor'
assert 'ch05-kingdoms-at-war-01' not in source, 'Source already modified'
js=(root/'challenger05_patch.js').read_text();css=(root/'challenger05.css').read_text()
source=source.replace('const Ot=new Q0;',js+'\nconst Ot=new Q0;',1)
source=source.replace('</head>','<style id="mk05-style">'+css+'</style></head>',1)
source=source.replace('MEDIEVAL KINGDOMS — CHALLENGER 04 | CUB GAME LAB','MEDIEVAL KINGDOMS — KINGDOMS AT WAR (CHALLENGER 05) | CUB GAME LAB',1)
target.parent.mkdir(parents=True,exist_ok=True);target.write_text(source)
print('CH05_BUILT',target, len(target.read_bytes()), hashlib.sha256(target.read_bytes()).hexdigest())
