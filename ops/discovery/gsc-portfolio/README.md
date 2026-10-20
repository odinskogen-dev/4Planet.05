# 4PLANET · GSC portfolio OAuth bridge (read-only, first-party)

**Goal:** one free Google-account authorisation (the already-verified GSC owner) -> dynamically list **all** Search Console properties -> daily read-only snapshot into the single Google Sheet that AXE can read using the existing Google Drive connector.

**Destination:** [4PLANET GSC Portfolio Telemetry](https://docs.google.com/spreadsheets/d/1KlA2sDXaZEKNYTAV7UK7bLYD7Ls6-MK1WNbnmDkzKTg/edit). This is a transport/readback surface, **not** another canonical BRAIN or standalone SEO registry. Google Search Console remains the data authority. Keep Google Analytics (GA4) untouched.

## Founder: one-time authorisation (prefer desktop browser)

1. Sign into the Google account that owns the existing Search Console domains.
2. Open the linked Google Sheet and choose **Extensions -> Apps Script** (use a desktop browser if the mobile editor fails). Apps Script must be created **from this sheet** so it is bound.
3. In the new editor, replace the default \`Code.gs\` contents with the exact contents of [Code.gs](./Code.gs).
4. Open Project Settings, turn on **Show "appsscript.json" manifest file in editor**, then replace its contents with [appsscript.json](./appsscript.json). These are the minimum intended OAuth scopes: Search Console read-only, this spreadsheet, external Google API requests, and installing a daily trigger.
5. Select \`setup4PlanetGSC\`, click **Run**, and authorise with the same existing Google owner account. Review the permissions; it must **not** ask for Search Console write access. Do not share OAuth tokens, passwords, secret keys or consent screenshots containing secrets.
6. Inspect the sheet: **Properties** should show all existing Search Console properties; **Performance**, **Sitemaps**, **Queries** and **Diagnostics** should be populated. \`setup4PlanetGSC\` installs one daily time-based sync trigger (around 07:00 Europe/Oslo). Send AXE only "authorised" and a screenshot of the non-sensitive properties list; AXE will independently read the sheet via Google Drive.

If Google returns \`HTTP 403\` mentioning **API has not been used/enabled in project**, use Apps Script Project Settings to find its Google Cloud project and enable the **Google Search Console API** in that project, then rerun. **Do not** add DNS verification or new domains. A normal \`403\` can also indicate wrong signed-in Google account or missing Search Console permissions; use Diagnostics/Executions and fix the specific cause.

## Boundaries and guarantees

- Google Search Console \`sites.list\` discovers every property visible to that Google identity on each sync, including additional domains later. It does **not** alter any property, its ownership, sitemap or DNS.
- Search Analytics uses one 28-day period ending ~3 days before the run to favour finalised Google data; zeros are not invented when there are no result rows. Search Queries takes the top 10 per property (rare queries are withheld by Google).
- Every 4PLANET/other accessible property is included without manual per-domain HYPD account selections or per-property service-account grants. Properties without permission are flagged in Diagnostics.
- Each source API failure is isolated; a failure to fetch **the entire property list** preserves the previous successful snapshot.
- The Google OAuth bearer token is ephemeral inside owner-authorised Google Apps Script, never written to GitHub, Google Sheets, Google Drive or an external endpoint. This script is read-only against GSC, although it writes its owned output tabs.
- Google Analytics (GA4) stays separate and untouched.
- Access for AXE is through the already-connected Google Drive tool, which can read the linked Sheet. Changes to Search Console (including sitemap submission) require a different intentionally approved write-capable workflow.
- Do not share the output Sheet publicly; it can contain private search and business analytics.
- \`sync4PlanetGSC\` can be run manually for immediate refresh, or via the daily trigger.

## Acceptance

- [x] Google-owned private readback Sheet and five export tabs created.
- [x] Source in canonical GitHub repo, isolated branch.
- [x] Automated contract tests for all-property discovery, read-only scopes, trigger deduplication, fail-closed behaviour, per-property error isolation, formula injection protection.
- [ ] Founder runs the bound script with existing verified Google account and grants OAuth consent.
- [ ] Real Google response demonstrates all domain properties in **Properties**.
- [ ] AXE independently reads/compares sheet and verifies periodic sync receipt.
