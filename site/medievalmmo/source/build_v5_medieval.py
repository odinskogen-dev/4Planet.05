#!/usr/bin/env python3
"""Build experimental MEDIEVAL from exact founder-supplied newest ROMA bundle.
Does not overwrite original source or claim a true server-authoritative multiplayer game.
"""
from pathlib import Path
import subprocess, hashlib, sys, tempfile

if len(sys.argv)!=3:
    raise SystemExit('usage: build_v5_medieval.py <source-parts-dir> <destination.html>')
root=Path(sys.argv[1]); out=Path(sys.argv[2]); out.parent.mkdir(parents=True,exist_ok=True)
parts=sorted(root.glob('roma-v5-brotli-*.txt'))
assert len(parts)==28, f'Expected 28 source segments, found {len(parts)}'
compressed_b64=''.join(p.read_text(encoding='ascii').replace('\n','') for p in parts)
with tempfile.TemporaryDirectory() as d:
    infile=Path(d)/'payload.txt'; sourcefile=Path(d)/'latest_roma.html'; infile.write_text(compressed_b64)
    js="const fs=require('fs'),z=require('zlib');const p=fs.readFileSync(process.argv[1],'utf8');fs.writeFileSync(process.argv[2],z.brotliDecompressSync(Buffer.from(p,'base64')));"
    subprocess.run(['node','-e',js,str(infile),str(sourcefile)],check=True)
    raw=sourcefile.read_bytes()
assert hashlib.sha256(raw).hexdigest()=='4beee0beb2a8313e8e89d7722aed4babd6397d84498ddaaf495c2462c1853e3f', 'Original code hash mismatch'
s=raw.decode('utf-8')
assert s.count('const Ot=new KP;')==1
assert s.count('<canvas id="world"></canvas>')==1

# Do not change simulation command logic or rendering pipelines. Patch the data dictionaries
# before the original app is instantiated and retitle the original functioning menu.
patch=r'''
/* CUB MEDIEVAL EXPERIMENTAL V5 — original Three.js world/soldier code preserved. */
const CUB_MEDIEVAL_V5={version:'medieval-challenger-v5-01',provenance:'ROMA_CHALLENGER_01_5',mode:'historical-strategy-engine-preview'};
const CUB_TROOPS={
 worker:['Villager','Gatherer'],hastati:['Frankish Shield Infantry','Shield infantry'],principes:['Hospitaller Foot','Veteran infantry'],triarii:['Frankish Spearmen','Defensive spearmen'],velites:['Light Skirmishers','Ranged light infantry'],equites:['Frankish Knights','Heavy cavalry'],
 libyans:['Ayyubid Spearmen','Spearmen'],iberians:['Ayyubid Swordsmen','Sword infantry'],gauls:['Ayyubid Guard','Veteran infantry'],balearics:['Ayyubid Skirmishers','Ranged infantry'],numidians:['Ayyubid Horsemen','Mounted skirmishers'],iberian_cav:['Ayyubid Cavalry','Medium cavalry']
};
for(const [id,[name,role]] of Object.entries(CUB_TROOPS))if(qA[id]){qA[id].name=name;qA[id].latin='';qA[id].role=role;}
const CUB_BUILDINGS={forum:'Great Hall',domus:'House',farm:'Farmstead',horreum:'Granary',lumber:'Lumber Yard',quarry:'Stone Quarry',macellum:'Market',barracks:'Infantry Barracks',stables:'Stables',fabrica:'Smithy',temple:'Chapel',tower:'Watchtower',wall:'Curtain Wall',gate:'Fortified Gate',castra:'Field Camp',palisade:'Wooden Palisade',citadel:'Hill Fort',punic_hq:'Ayyubid Headquarters',punic_barracks:'Ayyubid Barracks',punic_stables:'Ayyubid Stables',punic_tent:'Ayyubid Houses'};
for(const [id,name]of Object.entries(CUB_BUILDINGS))if(eA[id]){eA[id].name=name;eA[id].latin='';}
const CUB_ORIGINAL_TITLE=KP.prototype.showTitle;
KP.prototype.showTitle=function(...args){
 const result=CUB_ORIGINAL_TITLE.apply(this,args),screen=document.querySelector('.screen');
 if(screen){
  const t=screen.querySelector('.title-roma');if(t)t.textContent='MEDIEVAL KINGDOMS';
  const sub=screen.querySelector('.title-sub');if(sub)sub.textContent='THE NORTHERN MARCHES · HISTORICAL RTS';
  const tag=screen.querySelector('.title-tag');if(tag)tag.textContent='Build your settlement, raise your army, command real-time battles. The living-world online mode is under development.';
  const primary=screen.querySelector('#bNew');if(primary)primary.textContent='ENTER THE WORLD';
  const saved=screen.querySelector('#bCont');if(saved)saved.textContent='CONTINUE KINGDOM';
  const small=screen.querySelector('.small-note');if(small)small.textContent='CUB GAME LAB · Latest animated combat engine candidate. A local RTS campaign, not yet online multiplayer.';
  screen.classList.add('cub-medieval-title');
 }
 return result;
};
const CUB_ORIGINAL_NEW=KP.prototype.newGame;
KP.prototype.newGame=function(...args){const result=CUB_ORIGINAL_NEW.apply(this,args);this.hud.toast('MEDIEVAL KINGDOMS · Experimental engine preview','info',true);return result;};
'''
s=s.replace('const Ot=new KP;',patch+'\nconst Ot=new KP;',1)
# Standalone title metadata, fullscreen game viewport, and save isolation.
s=s.replace('<title>ROMA — The Republic</title>','<title>MEDIEVAL KINGDOMS — New Engine Challenger V5 · CUB</title>',1)
s=s.replace('ROMA: The Republic — Challenger 01. A real-time strategy game of building and battle in Apulia, 216 BC.',
            'MEDIEVAL KINGDOMS: experimental Three.js strategy game. A live 3D engine candidate, multiplayer infrastructure pending.',1)
s=s.replace('roma_challenger01_', 'cub_medievalmmo_v5_')
s=s.replace('<div id="loading"><b>ROMA</b>', '<div id="loading"><b>MEDIEVAL KINGDOMS</b>',1)
style=r'''<style id="cub-medieval-v5-theme">
html,body{height:100%;width:100%;overflow:hidden!important;overscroll-behavior:none!important;background:#1c2920!important}
#world{position:fixed!important;inset:0!important;width:100vw!important;height:100dvh!important;display:block!important}
.screen.poster.cub-medieval-title{background:linear-gradient(to bottom,rgba(12,26,21,.39),rgba(8,17,13,.9))!important;backdrop-filter:blur(1px)}
.cub-medieval-title .title-roma{font-family:system-ui,'DM Sans',sans-serif!important;font-size:clamp(2rem,6vw,5.5rem)!important;letter-spacing:-.065em!important;line-height:1.05!important;white-space:normal!important;text-align:center!important}
.cub-medieval-title .title-sub{font-family:system-ui,'DM Sans',sans-serif!important;letter-spacing:.19em!important;font-size:12px!important}
.cub-medieval-title .title-tag{display:block!important;max-width:460px!important;font-size:14px!important;line-height:1.6!important}
.cub-medieval-title .small-note{font:11px/1.5 system-ui,sans-serif!important;color:#bdc9bb!important}
@media(orientation:portrait){.screen.poster.cub-medieval-title .title-roma,.screen.poster.cub-medieval-title .title-sub,.screen.poster.cub-medieval-title .title-tag{display:block!important}}
</style>'''
s=s.replace('</head>',style+'</head>',1)
click=r'''<script id="cub-medieval-fullscreen-gesture">
document.addEventListener('click',function(e){
 const target=e.target&&e.target.closest&&e.target.closest('#bNew,#bCont');
 if(target&&!document.fullscreenElement&&document.documentElement.requestFullscreen){
  document.documentElement.requestFullscreen({navigationUI:'hide'}).catch(()=>{});
 }
},true);
</script>'''
s=s.replace('</body>',click+'</body>',1)
out.write_text(s,encoding='utf-8')
print('CUB_MEDIEVAL_V5_RENDERABLE_BUILD',out,len(s.encode()),hashlib.sha256(s.encode()).hexdigest())