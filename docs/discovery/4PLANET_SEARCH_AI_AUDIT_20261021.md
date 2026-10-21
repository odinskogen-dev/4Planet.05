# VERIFIED EXECUTION UPDATE — MAX EXPOSURE MEGASPRINT 01 · 2026-10-21

**Wave 1 main and separate ATLAS canonical release SHIPPED and independently verified. Full megasprint NOT complete.**

- Production source (main): `d3a49774d21e027e4031de6a3a0bb8a3229d24db`, narrow [PR #492](https://github.com/odinskogen-dev/4Planet.05/pull/492) six-file SEO patch; previous production commit `abeb4825c21629791b5e57180db8d53adaaf9826`.
- Dedicated Cloudflare 4planet-05 release: `a0a6026f-ac1d-4062-bbd6-c8154049721c`. Previous rollback deployment: `360e78e3-b335-4d78-bf14-42184624bdb9`.
- Live 4planet.org sitemap increased **58 → 70 canonical page URLs**, no detected duplicates, preserving all existing 58 and adding 12 substantive Living Systems pages.
- All 12 new Living Systems subpages were read from the real live domain, HTTP200, canonical self URL and WebPage JSON-LD: [independent GOLD live audit](https://github.com/odinskogen-dev/4Planet.05/actions/runs/39637749565) PASS.
- `robots.txt` exact private /os pattern corrected to `/os$`, `/os/`, `/os?` while opening public `/oslofjord`. Confirmed real live readback.
- Living Systems v1.4.2 original 88 source files byte-identical; zero-loss source recovery controls PASS.
- Concurrent Earth Now exclusion preserved in changed-source diff (no Earth Now code changed). [Chrome same-host mobile/desktop parity](https://github.com/odinskogen-dev/4Planet.05/actions/runs/39636828195) PASS; identical actual visible content, buttons and links on the live hostname.
- The shared legacy [discoverability release workflow](https://github.com/odinskogen-dev/4Planet.05/actions/runs/39637121574) built and deployed successfully but its aggregate **post-release status FAILED**: a stale raw HTML copy assertion at What We Believe and failing cross-product ATLAS/general checks. This must remain separately triaged; independent SEO GOLD success is not a claim that the whole release pipeline is green.
- Atlas standalone production source found exactly `fceab8e18f2fb403184dcac9f04180b2d05cf36c` and last deployment `c142d837-b2ac-4d81-995a-27eb2c4f6adb`, on Cloudflare Pages project `4planet-atlas`. Separate Atlas one-line sitemap canonical patch built and passed all protected 250-place source tests [39638872658](https://github.com/odinskogen-dev/4Planet.05/actions/runs/39638872658). Atlas [PR #493](https://github.com/odinskogen-dev/4Planet.05/pull/493) **MERGED AND LIVE GOLD PASS** via the exact existing dedicated release pipeline [39639506455](https://github.com/odinskogen-dev/4Planet.05/actions/runs/39639506455), source commit `c60a670a3ceade04ac6f2d50e706948bd835d65d`: canonical sitemap root aligned with published HTML, all 250 places + 250 image links preserved, representative place pages and unknown place 404 checked. The rollback baseline was updated to the precise last verified production source `fceab8e18f2fb403184dcac9f04180b2d05cf36c`.
- Legacy PR #490 and PR #491 were closed without merging, superseded by published narrow PR #492. The previous SEO research was retained in this canonical document.\n- No Google indexed counts, organic clicks/positions, or Bing AI citation metrics can be asserted. GSC Wizard returned `payment_required` and Ahrefs API `Insufficient plan`. Do not purchase tools. Crawler permits ≠ actual crawling ≠ indexing ≠ search ranking ≠ AI citations.
- No external outreach or new editorial releases in this sprint. Next work ranked: reliable existing release QA, Atlas unknown-path soft404, main unknown-path soft404, 20 original high-demand location explainers, source-rich topic depth, useful cross-product links, then actual GSC/Bing measurement.

---

# 4PLANET — SEARCH + AI CRAWL AUDIT · 2026-10-21
Status: VERIFIED TECHNICAL INVENTORY / STAGED FIXES / NO SEARCH CONSOLE RANKING CLAIMS.

## Authority and evidence
- Read-only live crawl: GitHub Actions [39569074108](https://github.com/odinskogen-dev/4Planet.05/actions/runs/39569074108) — 44 probes including HTTP, head metadata, robots.txt and HTML.
- Full sitemap integrity: [39570127936](https://github.com/odinskogen-dev/4Planet.05/actions/runs/39570127936) — 402 public page URLs across three hosts, no HTTP failures. Counts below are listed URLs, NOT Google-indexed pages.
- Living Systems preview / full build / zero-loss: [39569824800](https://github.com/odinskogen-dev/4Planet.05/actions/runs/39569824800), https://ef7079dc.4planet-05.pages.dev. Twelve original source-preserving improvements staged, NOT production.
- Robots correction test: [39570711421](https://github.com/odinskogen-dev/4Planet.05/actions/runs/39570711421), draft PR #490 targeting production main, NOT released.
- Google Search Console and Bing Webmaster real impression/index/citation counts unavailable in this run. Do not conflate permitted crawl, published sitemap, impressions and AI citations.
- The canonical 1.4.2 Living Systems 88-file original recovery baseline is immutable. Do not replace it with the SEO export patch.

## Verified inventory
| Host/surface | Verified canonical sitemap entries | Technical findings |
| --- | ---: | --- |
| 4planet.org | 58 | Valid HTML home/most routes; /journey/jaguar/ and /journey/orca/ have weak raw HTML SEO, /privacy lacked canonical; an unknown route returns 200 with generic app shell; /os prefix robot block also captures /oslofjord |
| 4planet.org/livingsystems/ | 1 home route among above | Real HTML for 12 high-value tested pages; most subpages have no canonical or distinct description and are absent from sitemap. Staged fix adds 12 more canonicals. |
| 4planetatlas.com | 252 (home route and /places plus 250 place pages) | 250 image references via image sitemap extension; no 404 among sitemap entries. /atlas/ sitemap URL canonicalises to root; unknown random URL returns 200 homepage canonical, creating potential soft 404. |
| 4planetmagazine.com | 92 | Tested URLs all responded 200. Distinct canonicals and editorial URLs. |
| 4nation.org | 6 | Simple canonical page collection and crawler-open robots. |
| 4species.com | 39 public taxon profiles confirmed separately in corrective audit | Image Gold review distinct from publication and indexing; do not reuse unverified media or imply all 39 are Google-indexed. |

Important: An early regex-only canonical report wrongly shortened URLs containing x, 2, 7; this was an audit parser artefact, NOT a site fault. Only the ATLAS /atlas/ vs / canonical difference is confirmed there. Do not re-open false alarms.

## Current code changes ready for controlled promotion
1. Draft [PR #491](https://github.com/odinskogen-dev/4Planet.05/pull/491): 12 source-grounded Living Systems search entries with unique metadata, canonical, schema WebPage and existing main sitemap integration; build/preview PASS. Built from king/test which differs materially from current production (candidate sitemap 109 vs live 58), so DO NOT deploy its complete artifact to production.
2. Draft [PR #490](https://github.com/odinskogen-dev/4Planet.05/pull/490): exact robots restriction /os$ /os/ /os? preserves private OS and frees public /oslofjord; tests PASS; target production main. Not yet deployed.
3. No production DNS change, third-party outreach, paid placement, Google recrawl request, IndexNow submission or independent GSC account change authorised in this audit.

## Prioritized roadmap by genuine public page intent

P0 — Content ownership / security / crawl:
- 4planet.org/oslofjord: remove overbroad /os disallow while protecting private /os; verify robot group handling for Googlebot/OAI-SearchBot/Bingbot and post-release live robots.
- 4planet.org unknown URLs: generate real 404 or robots noindex for unsupported app routes, preserving React SPA deep links. Test route inventory before production because blind catch-all 404 is unsafe.
- ATLAS unknown URLs: return 404 for unrecognised place slugs, not successful homepage HTML. Preserve recognised /atlas, /place, /places and other public routes.
- Cross-domain: one canonical owner for each Place, Species, Magazine and ATLAS object, no competing indexable clones.

P1 — Existing unique knowledge that can be indexed without inventing content:
- Living Systems /start, /ecosystems, /ecosystems/EC_AMAZON_RAINFOREST, /species, /species/western-honey-bee, /dependencies, /solutions, /decisions, /sources, /trust, /learning, /about: promote only individually validated canonical SEO enhancements with original v1.4.2 content intact.
- 4planet.org/topics: /now, /wildfires, /earthquakes, /climate-change, /biodiversity, /deforestation, /plastic-pollution, /coral-bleaching, /air-quality, /orca, /whales, /bees, /amazon-rainforest, /oslofjord, /renewable-energy, /solar-energy, /food-waste, /fast-fashion, /rewilding, /climate-solutions and /environmental-jobs: strengthen source date, measurement method, scope/limits, questions and carefully typed links into ATLAS/Living Systems/SPECIES. Ensure 'now' never mislabels delayed data as live.
- 4planetatlas.com/places: 250 distinct mapped places; strengthen 20 high-evidence flagship pages first with ecological phenomena, primary sources, measured data, limitations, dated updates, connected species/ecosystems and original explanatory value. Do not multiply thin autogenerated place cards.
- 4planetatlas.com/atlas/ canonical: remove noncanonical duplicate sitemap entry or safely normalise to one owner, not both.
- Main 4planet.org /journey/jaguar and /journey/orca: give actual crawlable explanatory content or remove from sitemap until there is substantial HTML for search.
- Magazine 92 entries: increase original authorship, primary study citations, updates/corrections, related field images, and original commentary for film listings; keep documentary copyright/credits honest.

P2 — Topical authority, internal graph and search intent:
- Homepage: explicit navigation for 'Explore Earth signals', 'Understand ecosystems', 'Discover species', 'See sources', and separately 'Support verified action'; one clear value proposition.
- Missions and brands: each meaningful public mission gets independently sourced problem → location → affected system → plausible response → implementation → actual proof, with appropriate cross-product links; avoid thin mission-synonym pages.
- ATLAS Earth/fires/whales: distinct authoritative explanatory landing pages with field definitions, source freshness and links to same map context.
- Species: publish only source-and-media-verified deep pages, connect native habitat ecology into Living Systems and ATLAS via typed relationships and exact canonical names.
- Impact: separate interventions from measured outcomes, costs and evidence status. Avoid unsupported efficacy claims.
- Search/AI answer opportunities: source-grounded definitions, cited observations, transparent methods, regularly updated original comparisons, open data where rights permit.

## Measurement / release gates
- Google Search Console: verified properties, URL Inspection for 12 LSI + 20 ATLAS flagship + /oslofjord, sitemap submitted/accepted, indexed vs excluded, clicks, impressions, organic CTR and query-topic growth; distinguish Google AI-inclusive Web performance.
- Bing Webmaster Tools: verified hosts, IndexNow only after founder release, 2026 AI Performance and Topics Portfolio where available: cited URLs, grounding queries and citations.
- Cloudflare: genuine verified bot requests (Googlebot, Bingbot, OAI-SearchBot) with user-agent and reverse identity, 2xx/4xx, WAF challenges, long-term crawl trends. robots.txt alone does not establish a bot visit.
- Quality acceptance: mobile/desktop true raw HTML, 200 on canonical known pages, 404 on invalid URLs, self-canonical, one H1, unique intent descriptions, actual source/rights links, no uncited claims, visible text matching JSON-LD, true lastmod only when underlying public content changed, no regression in product workflows.
- Production release: exact current live asset and commit preflight, diff scope, rollback, live post-release QA. Do not replace production with unreleased king/test without reconciliation.

## Official research references
- Google AI features: https://developers.google.com/search/docs/appearance/ai-features
- Google 2026 AI optimisation: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Google JS SEO: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- Google content quality: https://developers.google.com/search/docs/fundamentals/using-gen-ai-content/
- Google sitemap: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google Discover imagery: https://developers.google.com/search/docs/appearance/google-discover
- OpenAI publisher crawler: https://help.openai.com/en/articles/12627856-publishers-and-developers-faq
- Bing AI Performance: https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/
- Bing Topics Portfolio: https://blogs.bing.com/webmaster/2026/10/introducing-topics-portfolio-beta-in-ai-performance/
- Our World in Data example of source transparency, citations and open data: https://ourworldindata.org/grapher/red-list-index
