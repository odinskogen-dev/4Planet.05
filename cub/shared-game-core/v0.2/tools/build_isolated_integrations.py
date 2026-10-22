#!/usr/bin/env python3
"""Creates two *isolated* full-game HTML candidates without modifying the original game sources."""
import hashlib, json, zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
ZIP=Path('/mnt/data/MEDIEVAL_KINGDOMS_PREMIUM_BUILD_03(1).zip')  # optional; no dependency on its presence
PRE=ROOT/'integrations/previews'
PRE.mkdir(parents=True,exist_ok=True)
MAP={'ROMA_ORIGINAL_READ_ONLY.html':('roma','ROMA_ORIGINAL_PLUS_SHARED_CORE_02.html'),
     'MEDIEVAL_KINGDOMS_PREMIUM_CANDIDATE_03.html':('medieval','MEDIEVAL_BUILD03_PLUS_SHARED_CORE_02.html')}
results=[]
prior_report=ROOT/'integrations/proof/SOURCE_PRESERVATION.json'
expected={r['game']:r['originalSHA256'] for r in json.loads(prior_report.read_text())['builds']} if prior_report.exists() else {}
for src,(kind,outname) in MAP.items():
    dest=PRE/outname
    if ZIP.exists():
        with zipfile.ZipFile(ZIP) as z:
            original=z.read(src)
    elif dest.exists():
        # Portable/offline replay: the full original source can be exactly recovered
        # from the additive preview even if the original user-upload ZIP is unavailable.
        modified=dest.read_text()
        assert modified.count('<html data-cub-game="'+kind+'"')==1
        assert modified.count('<script type="module" src="../bridge.mjs"></script>\n</body>')==1
        restored=modified.replace('<html data-cub-game="'+kind+'"','<html',1).replace('<script type="module" src="../bridge.mjs"></script>\n</body>','</body>',1)
        original=restored.encode('utf-8')
    else:
        raise FileNotFoundError('No supplied source ZIP and no reversible existing preview for '+kind)
    original_hash=hashlib.sha256(original).hexdigest()
    if expected and expected.get(kind)!=original_hash:
        raise ValueError('Original source SHA changed — refuse to rebuild '+kind)
    s=original.decode('utf-8')
    assert s.count('</body>')==1,src
    assert s.count('<html')==1,src
    modified=s.replace('<html','<html data-cub-game="'+kind+'"',1)
    modified=modified.replace('</body>', '<script type="module" src="../bridge.mjs"></script>\n</body>',1)
    dest.write_text(modified)
    restored=modified.replace('<html data-cub-game="'+kind+'"','<html',1).replace('<script type="module" src="../bridge.mjs"></script>\n</body>','</body>',1)
    assert restored==s, 'Original game source changed!'
    results.append({'game':kind,'originalFile':src,'candidate':str(dest.relative_to(ROOT)),
        'originalSHA256':original_hash,'originalBytes':len(original),
        'candidateSHA256':hashlib.sha256(dest.read_bytes()).hexdigest(),
        'exactOriginalReversible':True,'integration':'read-only diagnostic overlay imports same shared core module; no gameplay hook'})
(ROOT/'integrations/proof/SOURCE_PRESERVATION.json').write_text(json.dumps({'schema':'cub.integration.proof.v1','sourceZip':ZIP.name,'builds':results},indent=2)+'\n')
for r in results:print(r['game'],r['candidate'],'original SHA256',r['originalSHA256'])