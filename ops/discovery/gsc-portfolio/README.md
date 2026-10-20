# 4PLANET · GSC portfolio OAuth bridge (read-only, first-party)

**Goal:** one free Google-account authorisation (the already-verified GSC owner) -> dynamically list **all** Search Console properties -> daily read-only snapshot into the single Google Sheet that AXE can read using the existing Google Drive connector.

**Destination:** the private Google-owned GSC portfolio readback spreadsheet created for the founder (URL provided privately in ChatGPT; do not publish its file ID in this public repository). This is a transport/readback surface, **not** another canonical BRAIN or standalone SEO registry. Google Search Console remains the data authority. Keep Google Analytics (GA4) untouched.

## Founder: one-time authorisation (works with standalone Apps Script on iPhone)

1. Sign into the Google account that owns the existing Search Console domains.
2. Open https://script.google.com/home/projects/create in Chrome on iPhone. This makes a **standalone** Apps Script project; it is supported.
3. Replace the default `Code.gs` contents with the exact contents of [Code.gs](./Code.gs).
4. Go to the Project Settings (gear icon) and open **Script Properties**. Add `GSC4P_SHEET_ID` = the document ID shown between `/d/` and `/edit` in the private Google Sheets URL previously provided in ChatGPT (never paste it into public GitHub). Save it.
5. In Project Settings, turn on **Show `appsscript.json` manifest file in editor**, then replace its contents with [appsscript.json](./appsscript.json). The standalone editor needs the Google Sheets scope (permits spreadsheet editing); this script only opens the configured private sheet. Search Console itself stays **read-only**.
6. Select `setup4PlanetGSC`, click **Run**, and authorise with the same existing Google owner account. Review the permissions; it must **not** ask for Search Console write access. Do not share OAuth tokens, passwords, secret keys or consent screenshots containing secrets.
7. Inspect the sheet: **Properties** should show all existing Search Console properties; **Performance**, **Sitemaps**, **Queries** and **Diagnostics** should be populated. \`setup4PlanetGSC\` installs one daily time-based sync trigger (around 07:00 Europe/Oslo). Send AXE only "authorised" and a screenshot of the non-sensitive properties list; AXE will independently read the sheet via Google Drive.

If Google returns \`HTTP 403\` mentioning **API has not been used/enabled in project**, use Apps Script Project Settings to find its Google Cloud project and enable the **Google Search Console API** in that project, then rerun. **Do not** add DNS verification or new domains. A normal \`403\` can also indicate wrong signed-in Google account or missing Search Console permissions; use Diagnostics/Executions and fix the specific cause.

## Boundaries and guarantees

- Google Search Console \`sites.list\` discovers every property visible to that Google identity on each sync, including additional domains later. It does **not** alter any property, its ownership, sitemap or DNS.
- Search Analytics uses one 28-day period ending ~3 days before the run to favour finalised Google data; zeros are not invented when there are no result rows. Search Queries takes the top 10 per property (rare queries are withheld by Google).
- Every 4PLANET/other accessible property is included without manual per-domain HYPD account selections or per-property service-account grants. Properties without permission are flagged in Diagnostics.
- Each source API failure is isolated; a failure to fetch **the entire property list** preserves the previous successful snapshot.
- Because standalone Apps Script must open an existing sheet, its OAuth consent grants broader Google Sheets editing scope than a bound script. Only run code you trust; this code edits the configured private Sheet and does not read or alter other files.
- The Google OAuth bearer token is ephemeral inside owner-authorised Google Apps Script, never written to GitHub, Google Sheets, Google Drive or an external endpoint. This script is read-only against GSC, although it writes its owned output tabs.
- Google Analytics (GA4) stays separate and untouched.
- Access for AXE is through the already-connected Google Drive tool, which can read the linked Sheet. Changes to Search Console (including sitemap submission) require a different intentionally approved write-capable workflow.
- Do not share the output Sheet publicly; it can contain private search and business analytics.
- \`sync4PlanetGSC\` can be run manually for immediate refresh, or via the daily trigger.

## Acceptance

- [x] Google-owned private readback Sheet and five export tabs created.
- [x] Source in canonical GitHub repo, isolated branch.
- [x] Automated contract tests for all-property discovery, read-only scopes, trigger deduplication, fail-closed behaviour, per-property error isolation, formula injection protection.
- [x] Founder ran **standalone** Apps Script under the existing Search Console owner account and authorised Google OAuth (2026-10-20).
- [x] Google Search Console API enabled in the existing 4Planet Google Cloud project; standalone Apps Script project linked (project number `826846756755`).
- [x] Real Google response on 2026-10-20T17:37:17Z returned 20 properties / 20 readable, all `siteOwner`; first snapshot has 20 performance rows, 26 sitemaps, 60 query rows.
- [x] Daily `sync4PlanetGSC` trigger installed; Apps Script log explicitly reports installation.
- [x] AXE independently read all five export tabs via connected Google Drive and verified 20 distinct properties, 20 OK performance responses, no diagnostic failures.
- [ ] Observe next-day scheduled run and verify snapshot freshness; trigger installed but subsequent execution not yet observed.


## 20 October 2026 — organisation-only page/URL expansion (candidate, NOT installed)

**What is already verified:** Google-owner authorisation and daily-trigger creation succeeded on 20 October; the existing five tabs contained 20 account-visible properties and authentic Google performance/sitemap/query records. This does NOT prove the next daily trigger has run. The Google owner account also contains non-organisational properties; this candidate must not copy their traffic data to the 4PLANET operating corpus.

**New code candidate on this same PR #485:** `Code.gs` now explicitly allows 17 documented 4PLANET organisational root domains only, ignoring other Google-account properties. It adds three **existing-Sheet** projection tabs: `Pages`, `PageQueries`, and `URLInspections`; their headers have already been created in the same private Google-owned readback Sheet. No new Google property, project, API key, separate SEO registry, BRAIN, or OAuth client is needed.

- `Pages`: up to 150 top page rows per organisational property per finalised 28-day period.
- `PageQueries`: up to 150 page+query combinations per organisational property. Query rows do not sum to site totals because Google anonymises rare queries.
- `URLInspections`: up to three public indexable pages per property, directly inspected using official `urlInspection.index.inspect` API. Coverage/crawl/canonical results are Google's last-known index state, not a fresh live HTTP check. Parameterised, private/auth and third-party URLs are deliberately excluded from exported page and inspection records.
- `Sitemaps`: nonzero warning and error counts now display `WARNINGS` or `ERRORS` rather than a misleading `OK` status.
- `Diagnostics`: records account discovery count, organisational eligibility, excluded properties, error stages, time window, and snapshot freshness. Existing successful snapshots are preserved if the full property listing fails.

**What was independently populated before deploying the new script:** AXE used an authorised direct GSC read of `4planet.org` to add dated rows to the above three tabs (102 clean page rows, 138 page/query rows, 17 URL inspections). This is a **one-time** observation, not proof of daily automation or cross-domain inspection capability.

**Only remaining activation step**, in the existing standalone Apps Script (not a second project): replace **only** the current `Code.gs` with the version in this PR, save, and run `sync4PlanetGSC` once. The manifest and `GSC4P_SHEET_ID` Script Property remain unchanged; the existing read-only OAuth grant should generally remain valid. Read the execution log: `discovered=20`, `properties=17`, `excluded=3` if the current 20-property account inventory is unchanged, plus nonzero `pageRows`/`inspectionRows` for eligible published pages. If Google changes portfolio membership, use observed counts rather than hardcoding expectations.

**Fail closed:** Do not paste modified or unreviewed script text from third parties, publish the private Sheet, expose credentials, grant root Knowledge OS access, merge PR or promote live without its existing Gold/release gate. No script automation is claimed COMPLETE until a second day independently confirms new UTC timestamps in `Pages`, `PageQueries`, `URLInspections` and `Diagnostics`.

**Source:** https://github.com/odinskogen-dev/4Planet.05/pull/485 . Google Search Console stays authoritative; this Sheet is a limited private readback projection.
