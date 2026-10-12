#!/usr/bin/env python3
"""Small, bounded corrections ON TOP OF Claude's exact v53 source.
No alternative species template, source data model, or citation component.
Fail closed on unexpected upstream code instead of replacing approved work.
"""
import json
from pathlib import Path

def replace_once(path, before, after):
    p=Path(path)
    s=p.read_text()
    if s.count(before) != 1:
        raise ValueError(f"Expected unique upstream anchor in {path}: {before[:90]!r}, saw {s.count(before)}")
    p.write_text(s.replace(before,after,1))
    print("CLAUDE_EXISTING_COMPONENT_PATCHED", path)

# 1. ROOT CAUSE: /orca is swallowed by legacy AppRoutes because SpeciesHostRoute
# only appears as Home's fallback; its sibling single-slug routes take precedence.
# Honour Claude's standalone SPECIES host route as the top-level authority.
replace_once("src/routes/router.tsx",
    "export function AppRoutes() {\n  return (",
    "export function AppRoutes() {\n  if (isSpeciesHost()) return <SpeciesHostRoute fallback={<Home />} />;\n  return (")

# 2. Authoritative photographs from WILD subjects with individually recorded
# creator, licence and file description, stored IN Claude's existing page.hero.
# Completely block automatic galleries for these pages until wild-only review.
winners={
  "gray-wolf":{
    "url":"https://upload.wikimedia.org/wikipedia/commons/9/96/Yellowstone_Wolves.jpg",
    "sourcePage":"https://commons.wikimedia.org/wiki/File:Yellowstone_Wolves.jpg",
    "credit":"Doug Smith / US National Park Service",
    "licence":"Public domain (US NPS)",
    "alt":"The wild Gibbon wolf pack moves over snowy ground in Yellowstone National Park",
    "focus":"50% 50%"
  },
  "polar-bear":{
    "url":"https://upload.wikimedia.org/wikipedia/commons/2/24/A_polar_bear.jpg",
    "sourcePage":"https://commons.wikimedia.org/wiki/File:A_polar_bear.jpg",
    "credit":"KylePiira",
    "licence":"CC BY-SA 4.0",
    "alt":"Wild polar bear near Churchill, Manitoba, standing on a snowy shoreline",
    "focus":"49% 46%"
  },
  "black-rhinoceros":{
    "url":"https://upload.wikimedia.org/wikipedia/commons/e/e7/181_Black_rhinoceros_in_Etosha_National_Park_Photo_by_Giles_Laurent.jpg",
    "sourcePage":"https://commons.wikimedia.org/wiki/File:181_Black_rhinoceros_in_Etosha_National_Park_Photo_by_Giles_Laurent.jpg",
    "credit":"Giles Laurent",
    "licence":"CC BY-SA 4.0",
    "alt":"Wild black rhinoceros walking in Etosha National Park, Namibia",
    "focus":"51% 47%"
  },
  "blue-whale":{
    "url":"https://upload.wikimedia.org/wikipedia/commons/e/e5/Anim1754_-_Flickr_-_NOAA_Photo_Library_%281%29.jpg",
    "sourcePage":"https://commons.wikimedia.org/wiki/File:Anim1754_-_Flickr_-_NOAA_Photo_Library_(1).jpg",
    "credit":"NOAA Photo Library",
    "licence":"Public domain (U.S. Government/NOAA)",
    "alt":"Wild blue whale from above, swimming through deep open ocean",
    "focus":"50% 54%"
  },
  "green-sea-turtle":{
    "url":"https://upload.wikimedia.org/wikipedia/commons/a/a3/Green_sea_turtle_%28Chelonia_mydas%29_Moorea.jpg",
    "sourcePage":"https://commons.wikimedia.org/wiki/File:Green_sea_turtle_(Chelonia_mydas)_Moorea.jpg",
    "credit":"Charles J. Sharp",
    "licence":"CC BY-SA 4.0",
    "alt":"Wild green sea turtle photographed underwater at Moorea, French Polynesia",
    "focus":"50% 48%"
  },
}
for slug,hero in winners.items():
    p=Path("public/species-data/v1")/(slug+".json")
    d=json.loads(p.read_text())
    assert d["slug"]==slug and d["schema"]=="4PLANET_SPECIES_PAGE_01"
    assert d["provenance"]["review"]=="DRAFT"
    assert d["hero"] == "auto", "do not silently overwrite a pre-existing editorial selection"
    d["hero"]=hero
    # Original authorship, knowledge claims, evidence and citations untouched.
    p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+"\n")
    print("CLAUDE_PAGE_PHOTO_VERIFIED",slug,hero["sourcePage"])

# 3. Preserve Claude's photo-slide design, but refuse wrong-species/captive
# media, and disable unknown automatic photos on the 3 corrected profiles.
template="src/pages/integrated/SpeciesTemplate.tsx"
before='    const add = (s: Slide | null) => { if (s && !out.some((o) => o.url === s.url)) out.push(s); };'
after='''    const add = (s: Slide | null) => {
      if (!s || out.some((o) => o.url === s.url)) return;
      const description = [s.alt,s.url,s.sourcePage,s.credit].join(" ").toLowerCase();
      if (/zoo|captiv|enclos|aquarium|cage|jardin.des.plantes|dinosaur|acclimation.pen|working.with.wildlife/.test(description)) return;
      if (page.slug === "green-sea-turtle" && /wolf|canis.lupus|wolves/.test(description)) return;
      if (page.slug === "tiger" && /dinosaurs|hohhot/.test(description)) return;
      if (page.slug === "polar-bear" && /paris|jardin.des.plantes|nome.alaska/.test(description)) return;
      out.push(s);
    };'''
replace_once(template,before,after)
before='    if (page.hero !== "auto") add({ ...page.hero, source: "4PLANET" });\n    if (leadImage)'
after='''    if (page.hero !== "auto") add({ ...page.hero, source: "4PLANET" });
    // Wildlife-only editorial exceptions: never append an unverified captive
    // photograph or an unrelated Wikimedia image to the chosen wild hero.
    if (["gray-wolf","polar-bear","green-sea-turtle","black-rhinoceros","blue-whale"].includes(page.slug)) return out.slice(0,10);
    if (leadImage)'''
replace_once(template,before,after)
# Editorial focus applies to every gallery image, not just the first hero.
replace_once(template,
    '<img src={s.url} alt={s.alt} loading="lazy" draggable={false} />',
    '<img src={s.url} alt={s.alt} loading="lazy" draggable={false} style={{ objectPosition: s.focus || "50% 36%" }} />')

# Runtime resilience: a failed third-party image must not leave a broken
# carousel frame or an unrelated fallback animal. The existing Claude photo
# reel selects the next valid image; no new image service or media component.
replace_once(template,
    '  const [heroReady, setHeroReady] = useState(false);',
    '  const [heroReady, setHeroReady] = useState(false);\\n  const [failedUrls, setFailedUrls] = useState<string[]>([]);')
replace_once(template,
    '  const hero = slides[0];\\n  const photoAt = (i: number) => (slides.length > 1 ? slides[1 + ((i - 1) % (slides.length - 1))] : undefined);\\n  const reel = slides.slice(0, 5);',
    '  const usableSlides = slides.filter((s) => !failedUrls.includes(s.url));\\n  const hero = usableSlides[0];\\n  const photoAt = (i: number) => (usableSlides.length > 1 ? usableSlides[1 + ((i - 1) % (usableSlides.length - 1))] : undefined);\\n  const reel = usableSlides.slice(0, 5);')
replace_once(template,
    'onLoad={() => (i === 0 ? setHeroReady(true) : setLoaded((l) => ({ ...l, [s.url]: true })))} />',
    'onError={() => { setHeroReady(false); setFailedUrls((bad) => bad.includes(s.url) ? bad : [...bad, s.url]); }}\\n                      onLoad={() => (i === 0 ? setHeroReady(true) : setLoaded((l) => ({ ...l, [s.url]: true })))} />')
# The regular story figure also uses the same skip list if a Wikimedia
# URL breaks, preserving the original caption and source attribution.
replace_once(template,
    '<img src={s.url} alt={s.alt} loading="lazy" draggable={false} style={{ objectPosition: s.focus || "50% 36%" }} />',
    '<img src={s.url} alt={s.alt} loading="lazy" draggable={false} style={{ objectPosition: s.focus || "50% 36%" }} onError={() => setFailedUrls((bad) => bad.includes(s.url) ? bad : [...bad, s.url])} />')

# 4. Keep Claude's design system. Add a little cinema on the SPECIES HOME hero,
# with greater photo height, correct responsive focus, and controlled crops.
css=Path("src/styles/species-template.css")
styling='''
/* Founder 12 Oct: premium cinematic homepage using Claude's original hero. */
.spx-u .spx-u-hero {
  --hero-h: clamp(820px, 112svh, 1440px);
  min-height: var(--hero-h);
}
.spx-u .spx-u-hero .spx-hero-media { height: var(--hero-h); }
.spx-u .spx-u-hero .spx-hero-img { object-position: 50% 32%; }
@media (max-width: 767px) {
  .spx-u .spx-u-hero { --hero-h: 108svh; }
}
/* Respect editorial focal points; keep images from being reduced to closeups. */
.spx-story .spx-figure img { object-position: center 36%; }
'''
# Browser QA identified unreviewed related-species card thumbnails of
# completely different animals (iguana on wolf, wolf on sea turtle), including
# broken image requests. Preserve Claude's relational cards and link text but
# suppress those images until wild-only proof and correct rights are recorded.
styling += """
.spx .spx-partners img { display: none !important; }
"""

styling += """
/* Mobile: the hero is ONE real visible screen.  The search belongs at its
   lower safe-area edge, not at a percentage of an oversized image. */
@media (max-width: 767px) {
  .spx-u .spx-u-hero {
    --hero-h: 100svh !important;
    height: 100svh !important;
    min-height: 100svh !important;
    position: relative;
    overflow: hidden;
  }
  .spx-u .spx-u-hero .spx-hero-media {
    height: 100svh !important;
    inset: 0 0 auto !important;
  }
  .spx-u .spx-u-hero .spx-u-hero-body {
    position: absolute !important;
    inset: auto 0 max(16px, env(safe-area-inset-bottom, 0px)) 0 !important;
    margin: 0 !important;
    padding: 0 20px !important;
    box-sizing: border-box;
    width: 100%;
    max-width: none;
    z-index: 3;
  }
  /* Same Today link already appears immediately below the hero as its own
     tile. Avoid leaving empty space underneath the one primary search. */
  .spx-u .spx-u-hero .spx-u-today { display: none; }
  .spx-u .spx-u-hero .spx-hero-img { object-position: 50% 24% !important; }
}
/* Group related cards keep Claude taxonomy/source text while image review
   remains separate from evidence review. */
"""

css.write_text(css.read_text().rstrip()+"\n"+styling)

# SOURCE INTEGRITY: no replacement source engine. Assert Claude references,
# Glance source superscripts, and Sources-and-limits list remain present.
source=Path(template).read_text()
for token in ['const sources = useMemo(() => pageSources(page), [page]);',
              '<Ref n={g.ref.n} state={g.ref.state} onOpen={openSource} />',
              'className="spx-source-list"']:
    assert token in source, 'Claude provenance component unexpectedly changed: '+token
# Correct source URLs to verified canonical pages in existing Claude citations.
# These are editorial redirect fixes, not new reference entities or sources.
redirects={
  "https://www.worldwildlife.org/species/asian-elephant":
    "https://www.worldwildlife.org/species/elephant/asian-elephant/",
  "https://www.worldwildlife.org/species/bornean-orangutan":
    "https://www.worldwildlife.org/species/orangutan/bornean-orangutan/",
}
for slug in ["asian-elephant","bornean-orangutan"]:
    p=Path("public/species-data/v1")/(slug+".json")
    before=p.read_text()
    d=json.loads(before)
    assert d["provenance"]["review"] == "DRAFT"
    for old_url,new_url in redirects.items():
        if old_url in before:
            before=before.replace(old_url,new_url)
    d=json.loads(before)
    assert d["slug"]==slug
    p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+"\n")
    print("CLAUDE_EXISTING_CITATION_URL_CANONICAL",slug)

print("CLAUDE_SOURCES_EXISTING_COMPONENTS_PRESERVED")
