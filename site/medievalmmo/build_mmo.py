#!/usr/bin/env python3
"""CUB MEDIEVAL MMO: isolated full-window game derivative.
Builds the current proven medieval CH05 game into the new MMO game lane.
Does not claim multiplayer has been implemented. Does not touch source games.
"""
from pathlib import Path
import sys, hashlib
if len(sys.argv) != 3:
    raise SystemExit("Usage: build_mmo.py <verified-medieval-ch05> <output-html>")
source=Path(sys.argv[1]); output=Path(sys.argv[2])
text=source.read_text(encoding="utf-8")
if '<canvas id="world"></canvas>' not in text:
    raise SystemExit("GAME_CANVAS_MISSING: do not publish a landing page in place of the game")
if len(text)<1000000: raise SystemExit("NON_GAME_SOURCE: expected complete Three.js RTS")
if text.count('</head>')!=1 or text.count('</body>')!=1: raise SystemExit("HTML_STRUCTURE_INVALID")
# A distinct save namespace prevents /roma/ and /medieval/ from corrupting each other.
text=text.replace('roma_challenger01_', 'cub_medievalmmo_')
text=text.replace('ROMA — The Republic', 'MEDIEVAL KINGDOMS — Living Realm')
text=text.replace('<title>MEDIEVAL KINGDOMS', '<title>MEDIEVAL KINGDOMS MMO — ')
text=text.replace('content="ROMA', 'content="MEDIEVAL KINGDOMS')
style = """<style id="cub-medievalmmo-full-window">
html,body{height:100%;width:100%;margin:0!important;overflow:hidden!important;overscroll-behavior:none;background:#111b16}
#world{position:fixed;inset:0;width:100vw;height:100dvh;display:block}
#loading{position:fixed;inset:0}
@supports(height:100dvh){html,body{height:100dvh}}
</style>"""
text=text.replace('</head>',style+'</head>',1)
# Gameplay starts in full window. Browser-level fullscreen is requested only
# after a real gesture, silently failing on Safari where unsupported.
script = """<script id="cub-mmo-viewport">
(function(){
  function requestGameFullscreen(e){
    var trigger=e.target&&e.target.closest&&e.target.closest('#bNew,#bCont,[data-action="play"]');
    if(!trigger)return;
    var root=document.documentElement;
    if(root.requestFullscreen && !document.fullscreenElement){
      root.requestFullscreen({navigationUI:'hide'}).catch(function(){});
    }
  }
  document.addEventListener('click',requestGameFullscreen,true);
  document.addEventListener('touchmove',function(e){
    if(e.target && e.target.closest && e.target.closest('#world')) e.preventDefault();
  },{passive:false});
})();
</script>"""
text=text.replace('</body>',script+'</body>',1)
# Branding only; protect all actual buttons/game code/physics.
text=text.replace('<div id="loading"><b>ROMA</b>', '<div id="loading"><b>MEDIEVAL KINGDOMS</b>')
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(text,encoding="utf-8")
print("CUB_MMO_FULLFRAME_GAME_BUILT",len(text.encode()),hashlib.sha256(text.encode()).hexdigest())
