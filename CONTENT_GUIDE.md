# CONTENT_GUIDE — 4PLANET Public World (V19.1)

## Content layer (`src/content/`)
- **missions.ts** — 16 Missions (name, code, domain, hero line, whyItMatters, livingSystem[], whatCanHelp, fourPlanetRole, sources[]).
- **narratives.ts** — the documentary article per Mission as blocks: `lead | para | quote | sub`. Grounded in the content pack — no invented facts.
- **domainNarratives.ts** — per-domain descriptor, manifesto, "why this world matters".
- **stories.ts** — M4GAZINE articles (`/stories/:slug`).
- **imageRegistry.ts** — single source of truth for imagery (see ASSET_MAP_V19.md). Alt-text matches verified pixels.
- **status.ts**, **fieldNotes.ts** — status strings and per-domain field notes.

## Page classification (`Missions.tsx`)
CULTURAL {4play,4film,4telier,m4gazine} → CULTURAL PROJECT · SYSTEM {food,en3rgy,circular-city,f4shion} → SYSTEM DOSSIER · else → MISSION DOSSIER. FLAGSHIP {wh4les,clim4te,am4zonia,pl4stic} gets a second image.

## Truth ladder for labels
MISSION DOSSIER / MISSION BRIEF / SYSTEM DOSSIER / CULTURAL PROJECT — safe now. FIELD NOTE / FIELD REPORT / IMPACT REPORT — only with real documented material.

## Imagery rules (hard-won)
- Never assign an image by filename. Open it, read the real subject, then map it.
- Domain-correct only: E4RTH = land, OCE4N = water/marine, S4PIENS = human systems, 4CULTURE = culture (plural).
- Drop convention: `public/assets/domains/<key>/hero.jpg`, `public/assets/missions/<slug>/hero.jpg` + `detail-01.jpg` (+ `-mobile.jpg`).

## 4CULTURE order (locked)
4PLAY → 4FILM → 4TELIER → M4GAZINE everywhere.
