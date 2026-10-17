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
    "url":"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Anim1754_-_Flickr_-_NOAA_Photo_Library_%281%29.jpg/1920px-Anim1754_-_Flickr_-_NOAA_Photo_Library_%281%29.jpg",
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
      if (/zoo|captiv|enclos|aquarium|cage|jardin.des.plantes|dinosaur|acclimation.pen|working.with.wildlife|aufzucht|orphanage|orphaned|rehabilitation|wildlife.sanctuary|panda.base/.test(description)) return;
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
    if (["gray-wolf","polar-bear","green-sea-turtle","black-rhinoceros","blue-whale","humpback-whale","sperm-whale","harbour-porpoise","bottlenose-dolphin","atlantic-cod","blue-mussel","whale-shark","leopard","eastern-gorilla","acropora-palmata","hyacinth-macaw"].includes(page.slug)) return out.slice(0,10);
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
    '  const [heroReady, setHeroReady] = useState(false);\n  const [failedUrls, setFailedUrls] = useState<string[]>([]);')
replace_once(template,
    '  const hero = slides[0];\n  const photoAt = (i: number) => (slides.length > 1 ? slides[1 + ((i - 1) % (slides.length - 1))] : undefined);\n  const reel = slides.slice(0, 5);',
    '  const usableSlides = slides.filter((s) => !failedUrls.includes(s.url));\n  const hero = usableSlides[0];\n  const photoAt = (i: number) => (usableSlides.length > 1 ? usableSlides[1 + ((i - 1) % (usableSlides.length - 1))] : undefined);\n  const reel = usableSlides.slice(0, 5);')
replace_once(template,
    'onLoad={() => (i === 0 ? setHeroReady(true) : setLoaded((l) => ({ ...l, [s.url]: true })))} />',
    'onError={() => { setHeroReady(false); setFailedUrls((bad) => bad.includes(s.url) ? bad : [...bad, s.url]); }}\n                      onLoad={() => (i === 0 ? setHeroReady(true) : setLoaded((l) => ({ ...l, [s.url]: true })))} />')
# The regular story figure also uses the same skip list if a Wikimedia
# URL breaks, preserving the original caption and source attribution.
replace_once(template,
    '<img src={s.url} alt={s.alt} loading="lazy" draggable={false} style={{ objectPosition: s.focus || "50% 36%" }} />',
    '<img src={s.url} alt={s.alt} loading="lazy" draggable={false} style={{ objectPosition: s.focus || "50% 36%" }} onError={() => setFailedUrls((bad) => bad.includes(s.url) ? bad : [...bad, s.url])} />')

# Card words and photo licence use TWO distinct existing Claude authorities.
# The catalogue already provides lineSource, but SpeciesCard showed photo
# credit only. Surface both; hide any descriptive copy without a fact source.
card_path="src/species/universe/SpeciesCard.tsx"
replace_once(card_path,
    '  const photo = useCardPhoto(item);',
    '  const photo = useCardPhoto(item);\n  const [failedSrc, setFailedSrc] = useState("");\n  const visiblePhoto = photo && photo.url !== failedSrc ? photo : undefined;')
replace_once(card_path,
    'spx-card-media${photo ? " has-photo" : ""}',
    'spx-card-media${visiblePhoto ? " has-photo" : ""}')
replace_once(card_path,
    '{photo ? <img src={photo.url} alt={photo.alt} loading="lazy" draggable={false} /> : door ? <DoorGlyph plan={door.plan} /> : null}',
    '{visiblePhoto ? <img src={visiblePhoto.url} alt={visiblePhoto.alt} loading="lazy" draggable={false} onError={() => setFailedSrc(visiblePhoto.url)} /> : door ? <DoorGlyph plan={door.plan} /> : null}')
replace_once(card_path,
    '{showLine && item.line && <span className="spx-card-line">{item.line}</span>}',
    '{showLine && item.line && item.lineSource?.url && <span className="spx-card-line">{item.line}</span>}')
replace_once(card_path,
    '{photo && <a className="spx-card-credit" href={photo.sourcePage} target="_blank" rel="noopener noreferrer">{photo.credit} · {photo.licence}</a>}',
    '''{visiblePhoto && <a className="spx-card-credit" href={visiblePhoto.sourcePage} target="_blank" rel="noopener noreferrer">{visiblePhoto.credit} · {visiblePhoto.licence}</a>}
      {item.lineSource?.url
        ? <a className="spx-card-source" href={item.lineSource.url} target="_blank" rel="noopener noreferrer">Source · {item.lineSource.label} ↗</a>
        : <SLink className="spx-card-source" to={speciesPath("/" + item.slug)}>Open sources & limits →</SLink>}''')
print("CLAUDE_SPECIES_CARD_FACT_SOURCE_AND_MEDIA_RIGHTS_DISTINCT_PASS")

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

styling += """
.spx .spx-card-source {
  display:block; margin-top:7px; padding:0 2px 2px;
  font-size:10px; line-height:1.5; letter-spacing:.025em;
  color:inherit; opacity:.72; overflow-wrap:anywhere;
  text-decoration:underline; text-underline-offset:2px;
}
.spx .spx-card-source:hover { opacity:1; }
"""

css.write_text(css.read_text().rstrip()+"\n"+styling)

# Evidence correction from the linked primary sources, using CLAUDE's existing
# {state, source: {label,url}} references, not a second citation system.
# Cheetah's widely repeated 60-70 mph figure was NOT established by the WWF
# species page. Observations from wild GPS-collared individuals give 93 km/h.
p=Path("public/species-data/v1/cheetah.json")
cheetah=json.loads(p.read_text())
assert cheetah["provenance"]["review"]=="DRAFT"
speed=[x for x in cheetah["glance"] if x["label"].lower()=="speed"]
assert len(speed)==1 and speed[0]["value"]=="up to 60–70 mph"
speed[0]["value"]="93 km/h (58 mph), observed in a field study"
speed[0]["source"]={
    "label":"Wilson et al. (2013), Nature — observed wild hunting speeds",
    "url":"https://pubmed.ncbi.nlm.nih.gov/23765495/"
}
p.write_text(json.dumps(cheetah,ensure_ascii=False,indent=2)+"\n")
print("SOURCE_CLAIM_CORRECTED cheetah: unsupported speed replaced by wild GPS observation")

# The linked WWF Chimpanzee profile does not establish the old ">50 years"
# lifespan statement. Remove the factual assertion until a specific wild
# longevity study is linked, without inventing a new source.
p=Path("public/species-data/v1/chimpanzee.json")
chimp=json.loads(p.read_text())
assert chimp["provenance"]["review"]=="DRAFT"
old_count=len(chimp["glance"])
chimp["glance"]=[g for g in chimp["glance"] if not ("lifespan" in g["label"].lower() and "50" in g["value"])]
assert len(chimp["glance"])==old_count-1
p.write_text(json.dumps(chimp,ensure_ascii=False,indent=2)+"\n")
print("SOURCE_CLAIM_WITHHELD chimpanzee: 50+ year lifespan unsupported by cited WWF page")

# ADW's giraffe account dates from 2006 and predates disputed giraffe species
# splits. Explicitly disclose the taxonomic limit rather than silently updating
# taxonomy, creating a competing authority or pretending a fresh review.
p=Path("public/species-data/v1/giraffe.json")
gir=json.loads(p.read_text())
assert gir["provenance"]["review"]=="DRAFT"
gir["limits"].append("The cited Animal Diversity Web Giraffa camelopardalis account is dated 2006. Giraffe taxonomy and species boundaries have been revised and remain authority-dependent; this page must not imply that an older broad species concept describes every currently recognised giraffe species.")
p.write_text(json.dumps(gir,ensure_ascii=False,indent=2)+"\n")
print("SOURCE_LIMIT_ADDED giraffe: historical taxonomy now explicit")


# Critical indexability split: the prerendered static HTML is indexable, but
# Claude's runtime <Seo robots="noindex,nofollow"> was overriding it after
# hydration, making Google render a noindex page. Keep labs and preview hosts
# noindex; ONLY the public canonical host should be indexable at runtime.
# No new SEO component: use exactly the existing <Seo> in Claude's template.
public_robots='''robots={typeof window !== "undefined" && ["4species.com","www.4species.com"].includes(window.location.hostname.toLowerCase()) ? "index,follow,max-image-preview:large" : "noindex,nofollow"}'''
for source_file in ["src/pages/integrated/SpeciesHome.tsx","src/pages/integrated/SpeciesExplore.tsx"]:
    replace_once(source_file, 'robots="noindex,nofollow"', public_robots)

# The public About and Quiz page routes share Claude's existing <Seo>.
# They were also reverting to noindex after hydration. Preserve noindex on
# labs/preview and do not change any visual component.
for source_file in ["src/pages/integrated/SpeciesAbout.tsx",
                    "src/pages/integrated/SpeciesQuiz.tsx"]:
    pmeta=Path(source_file)
    meta=pmeta.read_text()
    if 'robots="noindex,nofollow"' in meta:
        count=meta.count('robots="noindex,nofollow"')
        pmeta.write_text(meta.replace('robots="noindex,nofollow"',public_robots))
        print("SPECIES_EXISTING_SEO_ABOUT_QUIZ_PUBLIC_INDEX_ONLY",source_file,count)
    elif '<Seo' in meta:
        print("SPECIES_SEO_RETAINS_EXISTING_DEFAULT",source_file)
    else:
        raise ValueError("Missing Claude <Seo> in "+source_file)

p=Path("src/pages/integrated/SpeciesTemplate.tsx")
template_source=p.read_text()
original_robots='robots="noindex,nofollow"'
assert template_source.count(original_robots)==2, "two known original Claude template metadata branches required"
# The detailed, source-grounded PAGE_FILE or CURATED profile is indexable.
# A LIVE_ONLY/unreviewed arbitrary lookup remains noindex on every host.
public_profile_robots='''robots={typeof window !== "undefined" && ["4species.com","www.4species.com"].includes(window.location.hostname.toLowerCase()) && origin !== "LIVE_ONLY" ? "index,follow,max-image-preview:large" : "noindex,nofollow"}'''
template_source=template_source.replace(original_robots,public_profile_robots,1)
p.write_text(template_source)
print("CLAUDE_SEO_PUBLIC_HOST_HYDRATION_INDEX_LABS_NOINDEX_PASS")

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
