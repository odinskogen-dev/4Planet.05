#!/usr/bin/env python3
"""Create source-attributed, mobile-first SPECIES image derivatives from approved Wikimedia Commons image files.

Runs only for the four SPECIES v52 verification species. Never changes facts,
licences, original URLs or photo credit metadata in canonical JSON profiles.
Derivatives are reproducible and served from 4PLANET-controlled asset storage.
"""
import io
import json
import pathlib
import random
import sys
import time
from PIL import Image, ImageOps
import requests

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/species-data/v1"
DEST = ROOT / "public/species-media"
SPECIES = ["atlantic-puffin", "western-honey-bee", "fly-agaric", "common-octopus"]
AGENT = "4PLANET SPECIES image rights QA / 1.0 (https://4species.com; Wikimedia Commons licence respected)"

def retrieve(url):
    session = requests.Session()
    session.headers.update({
        "User-Agent": AGENT,
        "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    })
    reasons = []
    for retry in range(7):
        try:
            answer = session.get(url, timeout=55, allow_redirects=True)
            answer.raise_for_status()
            if not answer.headers.get("content-type", "").startswith("image/"):
                raise ValueError("Expected an image, received " + answer.headers.get("content-type", "unknown"))
            body = answer.content
            with Image.open(io.BytesIO(body)) as img:
                img.verify()
            return body
        except Exception as exc:
            reasons.append(f"attempt {retry+1}: {exc}")
            time.sleep(min(4 + retry * 3, 15))
    raise RuntimeError("Photo fetch failed: " + url + "\n" + "\n".join(reasons))

def main():
    manifest = []
    for slug in SPECIES:
        profile = json.loads((SOURCE / (slug + ".json")).read_text())
        pages = [profile["hero"]] + profile.get("gallery", [])
        for number, photo in enumerate(pages):
            if not ("commons.wikimedia.org" in photo["sourcePage"] and photo["licence"].startswith(("CC", "Public domain"))):
                raise RuntimeError("Rights metadata incomplete for " + slug)
            print("Fetching", slug, number, photo["sourcePage"], flush=True)
            data = retrieve(photo["url"])
            with Image.open(io.BytesIO(data)) as img:
                img = ImageOps.exif_transpose(img).convert("RGB")
                if min(img.size) < 700:
                    raise RuntimeError("Source image too small: " + slug + " " + str(img.size))
                img.thumbnail((2300, 2300), Image.Resampling.LANCZOS)
                output = DEST / slug / f"{number}.jpg"
                output.parent.mkdir(parents=True, exist_ok=True)
                img.save(output, "JPEG", quality=88, optimize=True, progressive=True, subsampling=0)
                if output.stat().st_size < 15000:
                    raise RuntimeError("Unreasonably small JPEG " + str(output))
                print("PASS",slug,number, img.size, output.stat().st_size,flush=True)
            manifest.append({
                "slug": slug, "index": number, "sourcePage": photo["sourcePage"],
                "sourceUrl": photo["url"], "credit": photo["credit"], "licence": photo["licence"],
                "derivative": f"public/species-media/{slug}/{number}.jpg"
            })
    (DEST / "MANIFEST.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print("ALL_IMAGES_PREPARED", len(manifest), flush=True)

if __name__ == "__main__":
    main()
