#!/usr/bin/env python3
"""Prepare a non-public ATLAS Place candidate cohort from Natural Earth DBF data.

This is a staging tool only. It never publishes URLs. Output records contain geographic
identity/provenance only; ecological relationships must come from the shared evidence model.

Expected source:
Natural Earth 1:10m Populated Places (simple or full DBF), current upstream release.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import math
import re
import struct
from pathlib import Path


SOURCE_URL = "https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-populated-places/"
RIGHTS_URL = "https://www.naturalearthdata.com/about/terms-of-use/"
DATASET = "Natural Earth 1:10m Populated Places"


def read_dbf(path: Path, encoding: str = "utf-8"):
    data = path.read_bytes()
    if len(data) < 33:
        raise ValueError("DBF is too small")
    record_count = struct.unpack_from("<I", data, 4)[0]
    header_len = struct.unpack_from("<H", data, 8)[0]
    record_len = struct.unpack_from("<H", data, 10)[0]
    fields = []
    pos = 32
    while pos + 32 <= header_len and data[pos] != 0x0D:
        desc = data[pos : pos + 32]
        name = desc[:11].split(b"\x00", 1)[0].decode("ascii", "ignore").strip()
        field_type = chr(desc[11])
        length = desc[16]
        decimals = desc[17]
        fields.append((name.upper(), field_type, length, decimals))
        pos += 32
    records = []
    offset = header_len
    for _ in range(record_count):
        raw = data[offset : offset + record_len]
        offset += record_len
        if len(raw) != record_len or raw[:1] == b"*":
            continue
        cursor = 1
        item = {}
        for name, field_type, length, decimals in fields:
            cell = raw[cursor : cursor + length]
            cursor += length
            text = cell.decode(encoding, "replace").strip().strip("\x00")
            if field_type in {"N", "F"}:
                if not text:
                    value = None
                else:
                    try:
                        value = float(text) if decimals or "." in text else int(text)
                    except ValueError:
                        value = None
            else:
                value = text
            item[name] = value
        records.append(item)
    return records


def first(row, *keys):
    for key in keys:
        value = row.get(key)
        if value not in (None, ""):
            return value
    return None


def slugify(value: str) -> str:
    value = value.lower().strip()
    value = (
        value.replace("å", "a").replace("ä", "a").replace("á", "a").replace("à", "a")
        .replace("ã", "a").replace("â", "a").replace("æ", "ae").replace("ø", "o")
        .replace("ö", "o").replace("ó", "o").replace("ò", "o").replace("ô", "o")
        .replace("ü", "u").replace("ú", "u").replace("ù", "u").replace("é", "e")
        .replace("è", "e").replace("ê", "e").replace("í", "i").replace("ì", "i")
        .replace("ñ", "n").replace("ç", "c").replace("ß", "ss")
    )
    value = re.sub(r"[^a-z0-9]+", "-", value).strip("-")
    return value


def as_float(value):
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return number if math.isfinite(number) else None


def priority(row):
    feature = str(first(row, "FEATURECLA", "FEATURECLASS") or "").lower()
    capital = 0 if "admin-0 capital" in feature else 1 if "capital" in feature else 2
    scalerank = as_float(first(row, "SCALERANK", "LABELRANK"))
    scalerank = scalerank if scalerank is not None else 99
    population = as_float(first(row, "POP_MAX", "POPULATION"))
    population = population if population is not None else 0
    return (capital, scalerank, -population)


def make_candidates(rows, limit, existing_slugs, source_version, checked_at):
    candidates = []
    seen = set(existing_slugs)
    for row in sorted(rows, key=priority):
        name = str(first(row, "NAME", "NAMEASCII", "NAMEPAR") or "").strip()
        country = str(first(row, "ADM0NAME", "SOV0NAME") or "").strip()
        lat = as_float(first(row, "LATITUDE", "LAT"))
        lon = as_float(first(row, "LONGITUDE", "LON", "LONG"))
        if not name or not country or lat is None or lon is None:
            continue
        if not (-90 <= lat <= 90 and -180 <= lon <= 180):
            continue
        base = slugify(name)
        if not base:
            continue
        slug = base
        if slug in seen:
            country_suffix = slugify(country)
            slug = f"{base}-{country_suffix}" if country_suffix else base
        if slug in seen:
            continue
        seen.add(slug)
        feature = str(first(row, "FEATURECLA", "FEATURECLASS") or "Populated place").strip()
        source_id = first(row, "NE_ID", "GEONAMEID", "WIKIDATAID")
        candidate = {
            "status": "candidate_not_public",
            "slug": slug,
            "name": name,
            "type": "City" if "city" in feature.lower() or "capital" in feature.lower() else "Populated place",
            "context": country,
            "lat": round(lat, 6),
            "lon": round(lon, 6),
            "sourceDataset": DATASET,
            "sourceVersion": source_version,
            "sourceFeatureId": str(source_id) if source_id not in (None, "") else None,
            "sourceUrl": SOURCE_URL,
            "sourceRightsUrl": RIGHTS_URL,
            "sourceCheckedAt": checked_at,
            "featureClass": feature,
            "scaleRank": first(row, "SCALERANK"),
            "populationReference": first(row, "POP_MAX"),
            "qualityGate": {
                "verifiedIdentity": True,
                "coordinatesPresent": True,
                "provenancePresent": True,
                "ecologicalClaimsAdded": False,
                "publishApproved": False,
            },
        }
        candidates.append(candidate)
        if len(candidates) >= limit:
            break
    return candidates


def load_exclusions(path):
    if not path:
        return set()
    value = json.loads(Path(path).read_text(encoding="utf-8"))
    if isinstance(value, list):
        return {str(v) for v in value}
    if isinstance(value, dict):
        items = value.get("slugs") or value.get("places") or []
        if items and isinstance(items[0], dict):
            return {str(x.get("slug")) for x in items if x.get("slug")}
        return {str(v) for v in items}
    return set()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dbf", required=True, help="Natural Earth populated places DBF")
    parser.add_argument("--output", required=True, help="Candidate JSON output path")
    parser.add_argument("--limit", type=int, default=500)
    parser.add_argument("--exclude-json", help="JSON list/object of already-live slugs")
    parser.add_argument("--source-version", default="5.1.2")
    parser.add_argument("--encoding", default="utf-8")
    args = parser.parse_args()

    if not 1 <= args.limit <= 5000:
        raise SystemExit("--limit must be between 1 and 5000")

    checked_at = dt.date.today().isoformat()
    rows = read_dbf(Path(args.dbf), args.encoding)
    candidates = make_candidates(
        rows,
        args.limit,
        load_exclusions(args.exclude_json),
        args.source_version,
        checked_at,
    )
    if len(candidates) < min(args.limit, 200):
        raise SystemExit(f"quality gate produced only {len(candidates)} candidates")

    payload = {
        "state": "STAGING_ONLY_DO_NOT_PUBLISH",
        "sourceDataset": DATASET,
        "sourceVersion": args.source_version,
        "sourceUrl": SOURCE_URL,
        "sourceRightsUrl": RIGHTS_URL,
        "generatedAt": checked_at,
        "candidateCount": len(candidates),
        "publicationLaw": "Candidate geography may publish only through the canonical ATLAS quality gate. No ecological relationship is inferred from this file.",
        "places": candidates,
    }
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Prepared {len(candidates)} non-public Natural Earth Place candidates at {output}")


if __name__ == "__main__":
    main()
