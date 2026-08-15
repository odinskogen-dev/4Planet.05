# ASSET_MAP_V24 — verified photo pass

Version: 24.0.0
Rule: every image mapped from **visible pixel content**, verified on a contact sheet before placement — never from filename alone.
Colour law + FRAME LAW hold. Domain/mission accents on dark or over images only. 4CULTURE order locked (4PLAY→4FILM→4TELIER→M4GAZINE). No image captions. No black↔white seam.

## Pipeline used (disk-offload)
Drive connector download → large results offload to `/mnt/user-data/tool_results/*.json` (base64 never enters context) → `decode_all.py` decodes every result to `drive_raw/` (named from the JSON `title`) → `contact.py` builds grouped contact sheets → each frame viewed by eye → optimised into `public/assets` (desktop ≤2400px, mobile ≤1200px, q82 progressive).

## Homepage changes (the two you asked for)
| Slot | v23 | v24 | Why |
|------|-----|-----|-----|
| ACT 02 · "under pressure" (`pressureDoc`) | interim desaturated **farmland aerial** | Drive `pressurse`, graded to true **B&W** documentary | remove the agriculture image; keep the documentary-pressure intent |
| Homepage extra (`homepageBonus`) | — | Drive `homepagebonus`, new full-bleed cinematic between ACT 05 (culture) and ACT 06 (build) | "add one extra vs now" — net **+1** image, both neighbours white → no B/W seam |

## Everything placed this pass (all pixel-verified)
**Brand**
- `footer-planet` ← `FooterNASA` — Artemis II Earthset (blue Earth behind the cratered Moon), real NASA public domain. Credit added.
- `pressure-doc` ← `pressurse` (B&W).
- `homepage-bonus` ← `homepagebonus` (NEW slot).

**Domain heroes**
- `oce4n/hero` ← `ocean05` (open ocean — whale reserved for the WH4LES mission, not the domain).
- `e4rth/hero` ← `e4rthhero` (aerial forested valley).
- `s4piens/hero` ← `s4piens02` (human systems / material flows).
- `4culture/hero` ← `4CULTURE02` (cultural frame, near-square source, cover-cropped to 3/4).

**4CULTURE anchor**
- `brand/culture-anchor` ← `R1-06174-025A-Edit` (editorial film-scan portrait). This is **not** the diver portrait — see gaps.

**Mission heroes + second frames**
- WH4LES hero ← `wahleshero`; detail-01 ← `whales02` (new second frame, wired into `MISSION_SECONDARY`).
- COR4L hero ← `OceanImageBank_FrancoisBaelen_15` (vertical reef, fits 3/4); detail-01 ← `OceanImageBank_MasayukiAgawa_2`.
- PL4STIC hero ← `plastic02`; detail-01 ← `plastic03`.
- 4NTARCTICA hero ← `4ntarctia02`; detail-01 ← `4ntarctica01` (spare on disk).
- CLIM4TE hero ← `climte02`; detail-01 ← `CLIMATE01`.
- SPECIES hero ← `specieshero`; detail-01 ← `species03`.
- 4TELIER hero ← `4telierhero`.
- M4GAZINE hero ← `magazine03` (also drives the 4CULTURE homepage tile); detail-01 ← `magazine02`.

## Untouched on purpose
- **Diver portrait** — `missions/4play/hero.jpg` not touched; stays unused. `4PLAY hero.jpg` in Drive (15.7 MB) was **not** downloaded, so it cannot leak in.
- S4PIENS missions (FOOD/EN3RGY/CIRCULAR CITY/F4SHION), 4FILM hero, brand heroEarth / earthrise / astronaut / why / participation / founder — kept; no clearly-better verified Drive frame this pass.
- Dark-worlds system, colour law, 4CULTURE ordering — unchanged.

## Validation
typecheck clean · build clean (68 modules) · assets:verify PASS (0 missing). Duplicates listed by verify are intentional reuse (domain hero also used as impact/tile image); unassigned entries are spare detail files on disk.
