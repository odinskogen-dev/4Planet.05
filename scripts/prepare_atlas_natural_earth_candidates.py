#!/usr/bin/env python3
"""Prepare a non-public ATLAS Place candidate cohort from Natural Earth GeoJSON.

This is a staging tool only. It does not publish routes, sitemap entries, or ecological
relationships. Public release remains governed by the canonical ATLAS Place quality gate
and observed search-engine scale signals.
"""
from __future__ import annotations
import argparse, json, math, re, unicodedata
from pathlib import Path

ALLOWED_CLASSES = {
    "Admin-0 capital", "Admin-0 capital alt", "Admin-0 region capital",
    "Admin-1 capital", "Admin-1 region capital", "Populated place",
}
SOURCE_URL = "https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-populated-places/"
RIGHTS_URL = "https://www.naturalearthdata.com/about/terms-of-use/"

def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii").lower()
    return re.sub(r"[^a-z0-9]+", "-", value).strip("-")

def norm(value) -> str:
    return slugify(str(value or ""))

def usable(value) -> bool:
    return value not in (None, "", -99, "-99")

def load_live(path: str | None):
    if not path:
        return set(), set()
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    rows = data.get("places", data if isinstance(data, list) else [])
    slugs, ne_ids = set(), set()
    for row in rows:
        if isinstance(row, str):
            slugs.add(row)
        elif isinstance(row, dict):
            if row.get("slug"): slugs.add(str(row["slug"]))
            if row.get("naturalEarthId") or row.get("neId"):
                ne_ids.add(str(row.get("naturalEarthId") or row.get("neId")))
    return slugs, ne_ids

def priority(feature):
    p = feature["properties"]
    cap = 0 if p.get("adm0cap") == 1 else 1 if p.get("featurecla") == "Admin-0 capital alt" else 2 if p.get("worldcity") == 1 else 3 if p.get("megacity") == 1 else 4
    return (cap, float(p.get("scalerank") or 99), -float(p.get("pop_max") or 0), str(p.get("name") or ""))

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--places-geojson", required=True)
    ap.add_argument("--countries-geojson")
    ap.add_argument("--rich-geojson")
    ap.add_argument("--live-json")
    ap.add_argument("--output", required=True)
    ap.add_argument("--limit", type=int, default=500)
    ap.add_argument("--source-version", default="5.1.2")
    ap.add_argument("--source-file-sha", default="")
    args=ap.parse_args()
    if not 1 <= args.limit <= 5000:
        raise SystemExit("--limit must be 1..5000")

    places=json.loads(Path(args.places_geojson).read_text(encoding="utf-8"))["features"]
    rich={}
    if args.rich_geojson:
        for f in json.loads(Path(args.rich_geojson).read_text(encoding="utf-8"))["features"]:
            ne=f["properties"].get("NE_ID")
            if ne is not None: rich[str(ne)]=f["properties"]
    countries_by_iso2={}; countries_by_iso3={}; countries_by_name={}
    if args.countries_geojson:
        for f in json.loads(Path(args.countries_geojson).read_text(encoding="utf-8"))["features"]:
            p=f["properties"]
            for key in ("ISO_A2","ISO_A2_EH","WB_A2","POSTAL"):
                code=p.get(key)
                if usable(code): countries_by_iso2[str(code).upper()]=p
            for key in ("ISO_A3","ISO_A3_EH","ADM0_A3","SOV_A3","WB_A3"):
                code=p.get(key)
                if usable(code): countries_by_iso3[str(code).upper()]=p
            for key in ("ADMIN","NAME","NAME_LONG","NAME_EN","SOVEREIGNT"):
                name=p.get(key)
                if usable(name): countries_by_name[norm(name)]=p

    used_slugs, live_ne = load_live(args.live_json)
    out=[]
    for f in sorted(places, key=priority):
        p=f["properties"]; ne=str(p.get("ne_id") or "")
        if p.get("featurecla") not in ALLOWED_CLASSES or not ne or ne in live_ne:
            continue
        name=str(p.get("name") or "").strip(); country=str(p.get("adm0name") or "").strip()
        lat, lon=p.get("latitude"), p.get("longitude")
        if not name or not country or not isinstance(lat,(int,float)) or not isinstance(lon,(int,float)) or not math.isfinite(lat) or not math.isfinite(lon) or not (-90<=lat<=90 and -180<=lon<=180):
            continue
        slug=slugify(name)
        if not slug: continue
        base_slug=slug
        if slug in used_slugs:
            admin_slug=slugify(str(p.get("adm1name") or ""))
            if admin_slug and admin_slug != base_slug and f"{base_slug}-{admin_slug}" not in used_slugs:
                slug=f"{base_slug}-{admin_slug}"
            else:
                iso_suffix=str(p.get("iso_a2") or "").lower()
                if iso_suffix and iso_suffix != "-99" and f"{base_slug}-{iso_suffix}" not in used_slugs:
                    slug=f"{base_slug}-{iso_suffix}"
                else:
                    slug=f"{base_slug}-{ne}"
        if slug in used_slugs: continue
        used_slugs.add(slug)
        rp=rich.get(ne,{})
        iso2=str(p.get("iso_a2") or "").upper()
        iso3=str(p.get("adm0_a3") or "").upper()
        cp=(countries_by_iso2.get(iso2) or countries_by_iso3.get(iso3) or countries_by_name.get(norm(country)) or {})
        out.append({
            "status":"STAGING_ONLY","publishApproved":False,"slug":slug,"name":name,
            "nameAscii":p.get("nameascii"),"alternateName":p.get("namepar") or p.get("namealt"),
            "type":"City" if "capital" in str(p.get("featurecla","")).lower() else "Populated place",
            "featureClass":p.get("featurecla"),"country":country,"admin1":p.get("adm1name"),
            "iso2":p.get("iso_a2"),"iso3":p.get("adm0_a3"),"continent":cp.get("CONTINENT"),
            "region":cp.get("REGION_UN"),"subregion":cp.get("SUBREGION"),
            "countryNaturalEarthId":str(cp.get("NE_ID")) if usable(cp.get("NE_ID")) else None,
            "countryWikidataId":cp.get("WIKIDATAID") if usable(cp.get("WIKIDATAID")) else None,
            "lat":lat,"lon":lon,
            "naturalEarthId":ne,"wikidataId":rp.get("WIKIDATAID"),
            "geonamesId":str(rp["GEONAMESID"]) if rp.get("GEONAMESID") else None,
            "worldCity":p.get("worldcity")==1,"megaCity":p.get("megacity")==1,
            "scaleRank":p.get("scalerank"),"populationReference":p.get("pop_max"),
            "populationSemantics":"Natural Earth POP_MAX metropolitan/micropolitan reference; not asserted as current census population." if p.get("pop_max") else None,
            "source":{"dataset":"Natural Earth 1:50m Populated Places","version":args.source_version,
                "upstreamRepository":"nvkelso/natural-earth-vector","upstreamPath":"geojson/ne_50m_populated_places_simple.geojson",
                "upstreamFileSha":args.source_file_sha,"rights":"Public domain","sourceUrl":SOURCE_URL,
                "rightsUrl":RIGHTS_URL},
            "hierarchySource":{"dataset":"Natural Earth 1:10m Admin 0 — Countries","rights":"Public domain","rightsUrl":RIGHTS_URL},
            "qualityGate":{"verifiedIdentity":True,"stableSourceId":True,"validCoordinates":True,
                "countryContext":True,"provenance":True,"uniqueSlug":True,
                "ecologicalClaimsAdded":False,"publicIndexApproved":False},
        })
        if len(out)>=args.limit: break

    name_groups={}
    for x in out:
        name_groups.setdefault(norm(x["nameAscii"] or x["name"]),[]).append(x)
    ambiguous=[{"name":name,"places":[{"slug":x["slug"],"country":x["country"],"admin1":x.get("admin1"),"naturalEarthId":x["naturalEarthId"]} for x in rows]}
               for name,rows in name_groups.items() if len(rows)>1]
    coordinate_keys=[(round(x["lat"],6),round(x["lon"],6)) for x in out]
    qa={
        "duplicateSourceIds":len(out)-len({x["naturalEarthId"] for x in out}),
        "duplicateSlugs":len(out)-len({x["slug"] for x in out}),
        "duplicateCoordinates":len(coordinate_keys)-len(set(coordinate_keys)),
        "invalidCoordinates":sum(not(-90<=x["lat"]<=90 and -180<=x["lon"]<=180) for x in out),
        "missingCountry":sum(not x["country"] for x in out),
        "missingHierarchy":sum(not x.get("continent") or not x.get("region") or not x.get("subregion") for x in out),
        "missingProvenance":sum(not x["naturalEarthId"] for x in out),
        "ambiguousDisplayNameGroups":ambiguous,
        "excludedClasses":["Scientific station","Historic place"],
    }
    if any(qa[k] for k in ("duplicateSourceIds","duplicateSlugs","duplicateCoordinates","invalidCoordinates","missingCountry","missingHierarchy","missingProvenance")):
        raise SystemExit(f"QA failed: {qa}")
    payload={"state":"STAGING_ONLY_DO_NOT_PUBLISH","sourceDataset":"Natural Earth 1:50m Populated Places",
        "sourceVersion":args.source_version,"candidateCount":len(out),
        "publicationLaw":"Candidates remain non-public until scale-trigger evidence and canonical quality-gate approval.",
        "qa":qa,"places":out}
    Path(args.output).parent.mkdir(parents=True,exist_ok=True)
    Path(args.output).write_text(json.dumps(payload,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"Prepared {len(out)} staging-only candidates; QA PASS")

if __name__=="__main__":
    main()
