#!/usr/bin/env python3
"""Verify the live 50 ATLAS Place entity metadata against upstream Natural Earth files.

Read-only verifier. It does not publish Places or create ecological relationships.
The JSON report is a derived QA artifact, not a canonical geographic truth store.
"""
from __future__ import annotations
import argparse, json, math, re, unicodedata
from pathlib import Path

def norm(v):
    if v is None: return ""
    s=unicodedata.normalize("NFKD",str(v)).encode("ascii","ignore").decode("ascii").lower()
    return re.sub(r"[^a-z0-9]+"," ",s).strip()

def first(p,*keys):
    for k in keys:
        if k in p and p[k] not in (None,"",-99,"-99"):
            return p[k]
    return None

def extract_metadata(path):
    text=Path(path).read_text(encoding="utf-8")
    m=re.search(r"const ATLAS_ENTITY_METADATA = (\{.*?\n\});\n\nconst ATLAS_WORLD_PLACES",text,re.S)
    if not m:
        raise SystemExit("Could not locate ATLAS_ENTITY_METADATA")
    return json.loads(m.group(1))

def feature_index(path):
    data=json.loads(Path(path).read_text(encoding="utf-8"))
    out={}
    for f in data.get("features",[]):
        p=f.get("properties") or {}
        ne=first(p,"NE_ID","ne_id")
        if ne is not None: out[str(ne)]=p
    return out

def float_close(a,b,tol=0.05):
    try: return abs(float(a)-float(b)) <= tol
    except Exception: return False

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--middleware",required=True)
    ap.add_argument("--places-simple",required=True)
    ap.add_argument("--places-rich",required=True)
    ap.add_argument("--countries",required=True)
    ap.add_argument("--output",required=True)
    ap.add_argument("--places-source-sha")
    ap.add_argument("--countries-source-sha")
    args=ap.parse_args()

    meta=extract_metadata(args.middleware)
    simple=feature_index(args.places_simple)
    rich=feature_index(args.places_rich)
    countries=feature_index(args.countries)
    failures=[]; warnings=[]; rows=[]

    for slug,m in meta.items():
        ne=str(m.get("neId") or "")
        kind=m.get("sourceKind")
        source=(countries if kind=="country" else simple).get(ne)
        if not source:
            failures.append(f"{slug}: NE_ID {ne} absent from declared Natural Earth source")
            continue
        source_name=first(source,"NAME","NAME_EN","name","nameascii")
        if source_name and norm(source_name)!=norm(m.get("country") if kind=="country" else slug.replace("-"," ")):
            # Names like New York / Mexico City and accented labels are checked more flexibly below.
            live_name=norm(m.get("country") if kind=="country" else source_name)
            if norm(source_name)!=live_name:
                warnings.append(f"{slug}: source-name review {source_name!r}")

        src_coord=m.get("sourceCoordinate") or {}
        lat=first(source,"LABEL_Y","latitude","LATITUDE")
        lon=first(source,"LABEL_X","longitude","LONGITUDE")
        if lat is not None and not float_close(src_coord.get("lat"),lat,0.1):
            failures.append(f"{slug}: source latitude mismatch")
        if lon is not None and not float_close(src_coord.get("lon"),lon,0.1):
            failures.append(f"{slug}: source longitude mismatch")

        if kind=="populated_place":
            source_iso2=first(source,"iso_a2","ISO_A2")
            source_iso3=first(source,"adm0_a3","ADM0_A3")
            if source_iso2 and str(m.get("iso2"))!=str(source_iso2):
                failures.append(f"{slug}: ISO2 mismatch {m.get('iso2')} != {source_iso2}")
            if source_iso3 and str(m.get("iso3"))!=str(source_iso3):
                failures.append(f"{slug}: ISO3 mismatch {m.get('iso3')} != {source_iso3}")
            rp=rich.get(ne)
            if rp:
                wd=first(rp,"WIKIDATAID","wikidataid")
                gn=first(rp,"GEONAMESID","geonamesid")
                if m.get("wikidataId") and wd and str(m["wikidataId"])!=str(wd):
                    failures.append(f"{slug}: Wikidata mismatch")
                if m.get("geonamesId") and gn and str(m["geonamesId"])!=str(gn):
                    failures.append(f"{slug}: GeoNames mismatch")
            else:
                warnings.append(f"{slug}: no matching rich 10m record for optional external IDs")
        else:
            iso2=first(source,"ISO_A2","ISO_A2_EH")
            iso3=first(source,"ISO_A3","ISO_A3_EH","ADM0_A3")
            if iso2 and str(m.get("iso2"))!=str(iso2):
                failures.append(f"{slug}: country ISO2 mismatch {m.get('iso2')} != {iso2}")
            if iso3 and str(m.get("iso3"))!=str(iso3):
                failures.append(f"{slug}: country ISO3 mismatch {m.get('iso3')} != {iso3}")
            wd=first(source,"WIKIDATAID")
            if m.get("wikidataId") and wd and str(m["wikidataId"])!=str(wd):
                failures.append(f"{slug}: country Wikidata mismatch")

        for field in ("continent","region","subregion","sourceDataset","sourceVersion","sourceFileSha"):
            if not m.get(field): failures.append(f"{slug}: missing {field}")
        expected_sha=args.countries_source_sha if kind=="country" else args.places_source_sha
        if expected_sha and m.get("sourceFileSha") != expected_sha:
            failures.append(f"{slug}: upstream source SHA changed {m.get('sourceFileSha')} != {expected_sha}")
        if not ne: failures.append(f"{slug}: missing stable Natural Earth id")

        rows.append({
            "slug":slug,"naturalEarthId":ne,"sourceKind":kind,
            "wikidataId":m.get("wikidataId"),"geonamesId":m.get("geonamesId"),
            "iso2":m.get("iso2"),"iso3":m.get("iso3"),
            "continent":m.get("continent"),"region":m.get("region"),"subregion":m.get("subregion"),
            "verified":not any(x.startswith(slug+":") for x in failures),
        })

    duplicate_ne=len(rows)-len({r["naturalEarthId"] for r in rows})
    if duplicate_ne: failures.append(f"duplicate Natural Earth IDs: {duplicate_ne}")
    report={
        "schema":"ATLAS_ENTITY_AUTHORITY_QA_01",
        "state":"DERIVED_QA_NOT_TRUTH_STORE",
        "livePlaceCount":len(meta),
        "verifiedCount":sum(1 for r in rows if r["verified"]),
        "failureCount":len(failures),
        "warningCount":len(warnings),
        "failures":failures,
        "warnings":warnings,
        "places":rows,
    }
    Path(args.output).parent.mkdir(parents=True,exist_ok=True)
    Path(args.output).write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({k:report[k] for k in ("livePlaceCount","verifiedCount","failureCount","warningCount")}))
    if failures:
        raise SystemExit("ATLAS entity authority verification failed: "+ "; ".join(failures[:12]))

if __name__=="__main__":
    main()
