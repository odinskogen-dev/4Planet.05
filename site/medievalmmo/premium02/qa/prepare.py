#!/usr/bin/env python3
"""Premium02 site build normalization. Original founder sources are unmodified.
This step is version-controlled and applied after restoring the archived game.
"""
from pathlib import Path
import base64
root=Path.cwd()
css=root/'src/styles.css'; s=css.read_text()
for weight in ('600','400'):
    old=f"../node_modules/@fontsource/cinzel/files/cinzel-latin-{weight}-normal.woff2"
    path=root/'node_modules/@fontsource/cinzel/files'/f'cinzel-latin-{weight}-normal.woff2'
    if old not in s:raise SystemExit('font path missing: '+old)
    if not path.is_file():raise SystemExit('font binary unavailable: '+str(path))
    s=s.replace("url('"+old+"')","url('data:font/woff2;base64,"+base64.b64encode(path.read_bytes()).decode()+"')")
s += """
.screen.kingdom-title{background:linear-gradient(130deg,rgba(10,29,27,.94),rgba(18,36,28,.80),rgba(12,28,20,.92));backdrop-filter:blur(5px);justify-content:center;text-align:center;gap:9px}
.screen.kingdom-title .title-roma{font-size:clamp(31px,6.5vw,75px);line-height:1.08;letter-spacing:.045em;color:#f8efdb;text-shadow:0 3px 18px #0008}
.screen.kingdom-title .title-sub{color:#dcc79d;letter-spacing:.15em;margin:4px 0 0}
.screen.kingdom-title .title-tag{display:block!important;max-width:490px;color:#d9dbd0;line-height:1.65}
.screen.kingdom-title .menu-col{width:min(360px,85vw);gap:9px}
.screen.kingdom-title .mbtn{border-radius:9px;letter-spacing:.065em;background:rgba(243,237,212,.09);border-color:#d2c6a654}
.screen.kingdom-title .mbtn.primary{background:#cfb987;color:#17251b;border:1px solid #e0d2a7;text-shadow:none}
.screen.kingdom-title .small-note{font-size:10px;max-width:500px;line-height:1.5}
@media(max-height:650px){.screen.kingdom-title{gap:2px}.screen.kingdom-title .title-tag{margin:0 0 6px}.screen.kingdom-title .small-note{display:none}.screen.kingdom-title .mbtn{padding:10px}}
"""
css.write_text(s)
html=root/'index.html';text=html.read_text()
text=text.replace("</title>","</title>\n<link rel=\"icon\" href=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%231b382b'/%3E%3Ctext x='32' y='47' font-size='42' text-anchor='middle' fill='%23f1ddac'%3EM%3C/text%3E%3C/svg%3E\">",1)
html.write_text(text)
main=root/'src/main.js';text=main.read_text()
poster_import="import { POSTER_PORTRAIT, POSTER_LANDSCAPE } from './assets/art/posters.js';"
if poster_import not in text:raise SystemExit('Poster import anchor missing')
text=text.replace(poster_import,"")
old="s.classList.add('poster'); s.style.setProperty('--pp', `url(${POSTER_PORTRAIT})`); s.style.setProperty('--pl', `url(${POSTER_LANDSCAPE})`);"
if old not in text:raise SystemExit('Poster activation anchor missing')
text=text.replace(old,"s.classList.add('kingdom-title');")
text=text.replace("Challenger 01 · internal prototype. Key art: 4PLANET. In-game art, terrain and sound are generated in code for this project. Geography shaped after the real Aufidus valley near Cannae; alternate history is possible.",
"ALPHA 02 · Playable single-player kingdom campaign and 3D tactical combat. The strategic Levant geography is approximate; 3D settlement terrain and equipment are still development stand-ins. Multiplayer is not yet live.")
main.write_text(text)
config=root/'src/config/data.js';text=config.read_text()
replace=[
("name: 'Roman Republic', short: 'Rome'","name: 'Kingdom of Jerusalem', short: 'Jerusalem'"),
("name: 'Carthage — army of Hannibal', short: 'Carthage'","name: 'Ayyubid Sultanate', short: 'Ayyubids'"),
("name: 'Forum', latin: 'Forum'","name: 'Town Hall', latin: ''"),
("name: 'House', latin: 'Domus'","name: 'Village House', latin: ''"),
("name: 'Farm', latin: 'Villa rustica'","name: 'Farmstead', latin: ''"),
("name: 'Granary', latin: 'Horreum'","name: 'Granary', latin: ''"),
("name: 'Lumber Camp', latin: 'Lignarium'","name: 'Lumber Camp', latin: ''"),
("name: 'Quarry Camp', latin: 'Lapicidina'","name: 'Quarry', latin: ''"),
("name: 'Market', latin: 'Macellum'","name: 'Market', latin: ''"),
("name: 'Barracks', latin: 'Castra stativa'","name: 'Garrison Barracks', latin: ''"),
("name: 'Stables', latin: 'Stabulum'","name: 'Stables', latin: ''"),
("name: 'Smithy', latin: 'Fabrica'","name: 'Armoury', latin: ''"),
("name: 'Temple', latin: 'Aedes'","name: 'Abbey', latin: ''"),
("name: 'Watchtower', latin: 'Turris'","name: 'Watchtower', latin: ''"),
("name: 'Field Camp', latin: 'Castra'","name: 'Fortified Camp', latin: ''"),
("name: 'Stone Wall', latin: 'Murus'","name: 'Castle Wall', latin: ''"),
("name: 'Gate', latin: 'Porta'","name: 'Castle Gate', latin: ''"),
("name: 'Hannibal’s Camp', latin: 'Castra Punica'","name: 'Enemy Stronghold', latin: ''"),
("name: 'Cannae Citadel', latin: 'Arx Cannarum'","name: 'Stone Keep', latin: ''"),
("name: 'Velites', latin: 'Velites'","name: 'Skirmishers', latin: ''"),
("name: 'Hastati', latin: 'Hastati'","name: 'Foot Sergeants', latin: ''"),
("name: 'Principes', latin: 'Principes'","name: 'Men-at-Arms', latin: ''"),
("name: 'Triarii', latin: 'Triarii'","name: 'Veteran Spears', latin: ''"),
("name: 'Equites', latin: 'Equites'","name: 'Mounted Knights', latin: ''"),
("name: 'Libyan Spearmen'","name: 'Ayyubid Spearmen'"),
("name: 'Iberian Scutarii'","name: 'Levantine Infantry'"),
("name: 'Gallic Warband'","name: 'Sword Warriors'"),
("name: 'Balearic Slingers'","name: 'Slingers'"),
("name: 'Numidian Horse'","name: 'Mounted Scouts'"),
("name: 'Iberian Cavalry'","name: 'Heavy Horsemen'"),
("name: 'Gladius Hispaniensis'","name: 'Swordsmithing'"),
("name: 'Lorica Hamata'","name: 'Mail Armour'"),
("name: 'Weighted Pila'","name: 'Thrown Spear Craft'"),
]
for old,new in replace:
    if old not in text:raise SystemExit('Missing historical rename '+old)
    text=text.replace(old,new)
config.write_text(text)
print('PREMIUM02_ASSET_AND_PRESENTATION_PATCH_PASS')
