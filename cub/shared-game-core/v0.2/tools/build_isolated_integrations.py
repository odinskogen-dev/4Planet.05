#!/usr/bin/env python3
"""Creates two *isolated* full-game HTML candidates without modifying the original game sources."""
import hashlib, json, zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
ZIP=Path('/mnt/data/MEDIEVAL_KINGDOMS_PREMIUM_BUILD_03(1).zip')
PRE=ROOT/'integrations/previews'
PRE.mkdir(parents=True,exist_ok=True)
MAP={'ROMA_ORIGINAL_READ_ONLY.html':('roma','ROMA_ORIGINAL_PLUS_SHARED_CORE_02.html'),
     'MEDIEVAL_KINGDOMS_PREMIUM_CANDIDATE_03.html':('medieval','MEDIEVAL_BUILD03_PLUS_SHARED_CORE_02.html')}
results=[]
with zipfile.ZipFile(ZIP) as z:
 for src,(kind,outname) in MAP.items():
  original=z.read(src);s=original.decode('utf-8')
  assert s.count('</body>')==1,src
  assert s.count('<html')==1,src
  modified=s.replace('<html','<html data-cub-game="'+kind+'"',1)
  modified=modified.replace('</body>', '<script type="module" src="../bridge.mjs"></script>\n</body>',1)
  dest=PRE/outname;dest.write_text(modified)
  # The only changes must be the data attribute + appended standalone ES module entrypoint.
  restored=modified.replace('<html data-cub-game="'+kind+'"','<html',1).replace('<script type="module" src="../bridge.mjs"></script>\n</body>','</body>',1)
  assert restored==s, 'Original game source changed!'
  results.append({'game':kind,'originalFile':src,'candidate':str(dest.relative_to(ROOT)),
    'originalSHA256':hashlib.sha256(original).hexdigest(),'originalBytes':len(original),
    'candidateSHA256':hashlib.sha256(dest.read_bytes()).hexdigest(),
    'exactOriginalReversible':True,'integration':'read-only diagnostic overlay imports same shared core module; no gameplay hook'})
(ROOT/'integrations/proof/SOURCE_PRESERVATION.json').write_text(json.dumps({'schema':'cub.integration.proof.v1','sourceZip':ZIP.name,'builds':results},indent=2)+'\n')
for r in results:print(r['game'],r['candidate'],'original SHA256',r['originalSHA256'])