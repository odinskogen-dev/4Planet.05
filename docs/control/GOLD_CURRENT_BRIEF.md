Warning: truncated output (original token count: 52407)
Total output lines: 2333

# ATLAS DISCOVERY OBJECTS — EMBEDDED MAP JOURNEY — 24 OCTOBER 2026

**STATUS:** RETURNED INDEPENDENT QA_CORRECT / BOUNDED HEIR CORRECTION / RE-GOLD REQUIRED / NO MERGE, DEPLOYMENT OR LIVE RELEASE.

**USER ARRIVES BECAUSE:** Earth, Fires and Whales discovery pages should let a visitor explore the relevant governed ATLAS view without losing the source explanation, limitations or a working continuation when the embedded map is unavailable.

**ROOT CAUSE:** the lawful HEIR retained the three human-readable object pages and full-ATLAS link, but the integrated object component had diverged from the accepted donor's embedded-map journey. The first correction then used the unregistered `/embed/atlas` path: the four-state review worker only proxies the registered `/atlas` path, so the iframe fell through to the Product Control dashboard. The owning regression asserted only the iframe path instead of the routed embedded content.

**CORRECTION:** derive the registered first-party `/atlas?embed=news&surface=atlas-discovery` URL from each existing `atlasHref`, render the governed view between the object introduction and explanation, retain a visible same-view fallback to full ATLAS, and replace the visible `Read this correctly` label with `A note on the data`.

**REGRESSION EVIDENCE:** physical runtime inspection on the baseline shows Product Control inside the Earth iframe. The new semantic contract fails on that baseline, requires the registered `/atlas` embed route and forbids `/embed/atlas` in this journey, while retaining the iframe, accessible fallback, same-view continuation and human note. Existing Earth Now, discovery, source, route, sitemap and prerender contracts remain green.

**WHAT MUST BE REUSED:** PR #384, issue #503 context, the existing ATLAS object inventory, registered `/atlas` embedded renderer, PublicShell, human-first public styles, source links, limitations and sole `king/test` HEIR. The homepage and current Earth Now component remain untouched.

**TRUTH BOUNDARY:** passing proves the bounded candidate code, build and semantic journey only. It does not certify WebGL rendering, mobile browser behaviour, production deployment, Google indexing, user use or ecological impact.

**BASE / ROLLBACK:** `king/test@80706e57c84fe499f3caeec0bab9b8639417fbf5`; revert this three-file correction if independent Gold finds a map, route, source, layout, accessibility or fallback regression.

**MAKER ≠ JUDGE:** Factory supplies failing-first and corrected evidence. Independent Gold must test Earth, Fires and Whales on the exact returned SHA at 390, 430 and desktop widths with WebGL available and unavailable, then return QA_ACCEPT or the smallest failing selector/screenshot.

---

# ANALYTICS PRIVACY — PUBLIC ID VALUE SEMANTICS — 24 OCTOBER 2026

**STATUS:** RETURNED INDEPENDENT QA_CORRECT / P0 BOUNDED HEIR CORRECTION / RE-GOLD REQUIRED / NO MERGE, DEPLOYMENT OR LIVE RELEASE.

**USER ARRIVES BECAUSE:** consented analytics must preserve useful anonymous public-product events without sending values shaped like personal identity, telephone or payment-card data to GA4 or PostHog.

**ROOT CAUSE:** the key allowlist restricted telemetry property names, but `legal_identity`, `source_id`, `object_id` and `product_key` still shared the generic token validator. Arbitrary long digit strings therefore survived through the common payload into both sinks.

**CORRECTION:** apply field-specific public semantics before the generic token path: `legal_identity` is the bounded `brreg_exact|unresolved` state; `source_id` is a `source:` namespace; `object_id` is a public slug/namespaced identifier; `product_key` is a public slug. All four reject raw or embedded runs of seven or more digits. Existing consent, host, sensitive-navigation and shared-sink controls remain unchanged.

**REGRESSION EVIDENCE:** the exact four synthetic Gold values fail before correction and are removed after correction. The executable harness runs the real `trackEvent` and `dispatchAnalyticsEvent` bodies with consent granted on an allowed host and proves both mocked GA4 and PostHog receive only `product_area` plus the canonical site/path fields. Positive cases protect the current BRREG state, IMR source namespace, object slug and live market-product slug.

**WHAT MUST BE REUSED:** PR #476, PR #131 lawful `king/test` HEIR, the existing explicit key allowlist, consent/host/navigation gates, shared sanitised payload and both analytics sinks.

**TRUTH BOUNDARY:** passing proves only the bounded synthetic confidentiality contract on the exact HEIR code. It does not assert a real personal-data leak, production deployment, LIVE safety, user use or impact.

**BASE / ROLLBACK:** `king/test@05ee4a3de7d60fb687d5ccf7df4cfaf46792fd3c`; revert the returned three-file correction if independent Gold finds a legitimate public-ID, consent, dispatch or sink regression.

**MAKER ≠ JUDGE:** Factory supplies failing-first and corrected evidence. Independent Gold must rerun the four exact synthetic values through both sinks, the four positive public values, retained historical bypasses and dispatch gates on the exact returned SHA.

---

# DISCOVERY SITEMAP — CLOSED ATTRIBUTE CONTRACT — 23 OCTOBER 2026

**STATUS:** RETURNED INDEPENDENT QA_CORRECT / BOUNDED HEIR CORRECTION / RE-GOLD REQUIRED / NO MERGE, DEPLOYMENT OR LIVE RELEASE.

**USER ARRIVES BECAUSE:** sitemap evidence must fail closed when standard sitemap elements carry undeclared application attributes instead of certifying schema-invalid discovery data.

**ROOT CAUSE:** the native SAX path validated element namespace, sequence, cardinality and values but ignored `tag.attributes`, so schema-invalid attributes on `urlset`, `url`, `loc` and optional value elements survived the audit.

**CORRECTION:** reject every non-namespace attribute on sitemap elements; preserve XML namespace declarations and the standard root `xsi:schemaLocation` hint without broadening the accepted sitemap element model.

**REGRESSION EVIDENCE:** four independent Gold fixtures reproduce unexpected attributes on `urlset`, `url`, `loc` and `priority` through the native generator-to-audit path; a positive fixture protects namespace declarations and root schemaLocation.

**WHAT MUST BE REUSED:** issue #483, PR #131, the existing `saxes` parser, generator-to-parser fixture harness, all retained XML/schema/URL-identity tests and sole `king/test` HEIR.

**TRUTH BOUNDARY:** passing proves only that the bounded generated-sitemap evaluator rejects these attribute defects during execution. It does not prove deployment, crawl, indexation, ranking, traffic, human use or LIVE value.

**MOBILE-FIRST RISK:** none; evaluator and regression-harness correction only, with no rendered-product mutation.

**BASE / ROLLBACK:** `king/test@e67a11c24b5269215fa01f05f01043ea4c2e4672`; revert this bounded three-file correction if independent Gold finds an attribute, namespace, generator-restoration or retained-matrix regression.

**MAKER ≠ JUDGE:** Factory supplies failing-first and corrected evidence. Independent Gold must rerun the four held-out attribute fixtures, the namespace/schemaLocation positive fixture and the complete retained matrix on the exact returned SHA.

---

# DISCOVERY SITEMAP — OPTIONAL FIELD SEQUENCE, CARDINALITY AND LASTMOD — 23 OCTOBER 2026

**STATUS:** RETURNED INDEPENDENT QA_CORRECT / BOUNDED HEIR CORRECTION / RE-GOLD REQUIRED / NO MERGE, DEPLOYMENT OR LIVE RELEASE.

**USER ARRIVES BECAUSE:** search and discovery evidence must fail closed when a sitemap contains repeated or out-of-order optional fields or an invalid modification date, rather than certify an XML document that violates the sitemap schema.

**ROOT CAUSE:** the namespace-aware SAX audit enforced one `loc` and validated `priority` / `changefreq` values, but did not enforce the sitemap XSD child sequence, optional-field cardinality or the W3C date/dateTime type for `lastmod`.

**CORRECTION:** require `loc` first, then optional `lastmod`, `changefreq` and `priority` in schema order; allow each optional field at most once; validate `lastmod` as a real W3C-profile calendar date or dateTime including bounded timezone offsets.

**REGRESSION EVIDENCE:** four independent Gold fixtures reproduce duplicate `priority`, duplicate `changefreq`, optional-field-before-`loc`, and invalid `lastmod` false accepts; an ordered positive matrix protects valid date and dateTime values.

**WHAT MUST BE REUSED:** issue #483, PR #131, the existing `saxes` parser, generator-to-parser fixture harness, all retained XML/schema/URL-identity tests and sole `king/test` HEIR.

**TRUTH BOUNDARY:** passing proves only that the bounded generated-sitemap evaluator rejects these XML schema defects during execution. It does not prove deployment, crawl, indexation, ranking, traffic, human use or LIVE value.

**MOBILE-FIRST RISK:** none; evaluator and regression-harness correction only, with no rendered-product mutation.

**BASE / ROLLBACK:** `king/test@d5d42070f5edafeabbbd2ba9eaf24beac02bf600`; revert this bounded three-file correction if independent Gold finds a schema, generator-restoration or retained-matrix regression.

**MAKER ≠ JUDGE:** Factory supplies failing-first and corrected evidence. Independent Gold must rerun the four held-out fixtures, the ordered positive matrix and the complete retained negative matrix on the exact returned SHA.

---

# DISCOVERY SITEMAP — ROOT CHILD AND OPTIONAL VALUE SCHEMA — 23 OCTOBER 2026

**STATUS:** RETURNED INDEPENDENT QA_CORRECT / BOUNDED HEIR CORRECTION / RE-GOLD REQUIRED / NO MERGE, DEPLOYMENT OR LIVE RELEASE.

**USER ARRIVES BECAUSE:** search and discovery evidence must fail closed when a generated sitemap contains invalid root children or invalid protocol values, rather than certify an incomplete approximation of the sitemap schema.

**ROOT CAUSE:** XML well-formedness and URL identity were enforced, but the SAX handlers allowed foreign-namespace elements directly under `urlset` and accumulated `priority` and `changefreq` without validating their protocol values.

**CORRECTION:** require every direct `urlset` child to be a sitemap-namespaced `url`; validate `priority` as a decimal from 0.0 through 1.0 and `changefreq` against the seven protocol values; retain optional `lastmod` without inventing a new date policy.

**REGRESSION EVIDENCE:** four Gold fixtures reproduce the false accepts for foreign root children before/after a valid URL, priority `999`, and changefreq `sometimesish`; a positive boundary matrix protects valid priorities and all seven valid change frequencies.

**WHAT MUST BE REUSED:** issue #483, PR #131, the existing `saxes` parser, generator-to-parser fixture harness, all retained XML/schema/URL identity tests and sole `king/test` HEIR.

**TRUTH BOUNDARY:** passing proves only that the bounded generated sitemap evidence obeyed these XML, document-model, URL-identity and protocol-value checks during execution. It does not prove deployment, crawl, indexation, ranking, traffic, human use or LIVE value.

**MOBILE-FIRST RISK:** none; this is an evaluator and regression-harness correction with no rendered-product mutation.

**BASE / ROLLBACK:** `king/test@b06c3dadb0b67a033371fb51e8966fc339ff3643`; revert this bounded three-file correction if independent Gold finds a schema, generator-restoration or retained-matrix regression.

**MAKER ≠ JUDGE:** Factory supplies failing-first and corrected evidence. Independent Gold must rerun the four held-out fixtures, the valid optional-value matrix and the complete retained negative matrix on the exact returned SHA.

---

# DISCOVERY SITEMAP — ALL-ENTRY CANONICAL IDENTITY — 23 OCTOBER 2026

**STATUS:** RETURNED INDEPENDENT QA_CORRECT / BOUNDED HEIR CORRECTION / RE-GOLD REQUIRED / NO MERGE, DEPLOYMENT OR LIVE RELEASE.

**USER ARRIVES BECAUSE:** every URL emitted by the public sitemap must remain inside the approved HTTPS 4PLANET origin, including routes outside the small required-entry checklist.

**ROOT CAUSE:** origin and raw-identity checks ran only inside `requiredDiscoveryRoutes`. A valid sitemap containing all required routes plus an unlisted foreign-origin or HTTP location could therefore pass the audit.

**CORRECTION:** validate every parsed sitemap location before required-route coverage: exact HTTPS origin, no credentials/query/fragment, and exact raw identity equal to the canonical origin plus parsed path. Retain the required-route check only for coverage.

**REGRESSION EVIDENCE:** four Gold fixtures first reproduce the false accepts for a foreign unlisted path, foreign nested path, HTTP canonical-host path, and combined foreign/HTTP extras; all must fail for their exact emitted values after correction. The full XML and URL-identity matrix remains mandatory.

**WHAT MUST BE REUSED:** issue #483, PR #131, the current sitemap generator, namespace-aware parser, user-entry audit, user-proof analytics contract and sole `king/test` HEIR.

**TRUTH BOUNDARY:** passing proves only that every location emitted by the current generator was canonical during that execution. It does not prove deployment, crawl, indexation, ranking, traffic, human use or LIVE value.

**MOBILE-FIRST RISK:** none; this is an evaluator and regression-harness correction with no rendered-product mutation.

**BASE / ROLLBACK:** `king/test@7d3a4631e6704c88f3faef9ef4fe761fc1476fee`; revert this bounded audit/test/brief correction if independent Gold finds a canonical-location or generated-file restoration regression.

**MAKER ≠ JUDGE:** Factory supplies failing-first and corrected evidence. Independent Gold must rerun all four unlisted-entry fixtures and the complete existing negative matrix on the exact returned SHA.

---

# LIVING SYSTEMS — CLOSED SITEMAP URL SCHEMA — 23 OCTOBER 2026

**STATUS:** RETURNED INDEPENDENT QA_CORRECT / BOUNDED HEIR CORRECTION / RE-GOLD REQUIRED / NO MERGE, DEPLOYMENT OR LIVE RELEASE.

**USER ARRIVES BECAUSE:** a person or crawler needs the discovery audit to reject structurally incomplete or foreign sitemap records instead of treating any well-formed namespaced XML as route evidence.

**ROOT CAUSE:** the parser verified the root namespace and extracted direct `url > loc` text, but it did not enforce the closed structure around those values. A namespaced `<url/>`, duplicate `<loc>`, unexpected same-namespace element or non-whitespace CDATA could therefore survive as accepted document structure.

**CORRECTION:** require every namespaced `<url>` to contain exactly one non-empty direct `<loc>`; permit only the standard text-valued URL fields; reject unexpected same-namespace elements and non-whitespace CDATA/text outside permitted values.

**REGRESSION EVIDENCE:** four held-out Gold fixtures first reproduced the false accepts, then failed for their specific causes. The five earlier XML standards fixtures now assert their precise parser reason rather than a generic XML word match; the complete focused contract remains mandatory.

**WHAT MUST BE REUSED:** issue #483, PR #131, the current sitemap generator, user-entry audit, user-proof analytics contract and sole `king/test` HEIR.

**TRUTH BOUNDARY:** passing proves only that the current generator emitted structurally bounded sitemap evidence with exact approved locations during that execution. It does not prove deployment, crawl, indexation, ranking, traffic, human use or LIVE value.

**MOBILE-FIRST RISK:** none; this is an evaluator and regression-harness correction with no rendered-product mutation.

**BASE / ROLLBACK:** `king/test@94d4fe7b020fa58544bf26e071efe192de43c514`; revert this bounded audit/test/brief correction if independent Gold finds a sitemap-schema, canonical identity or generated-file restoration regression.

**MAKER ≠ JUDGE:** Factory supplies failing-first and corrected evidence. Independent Gold must rerun the four structural held-outs and the complete existing negative matrix on the exact returned SHA.

---

# LIVING SYSTEMS — WELL-FORMED NAMESPACED SITEMAP EVIDENCE — 23 OCTOBER 2026

**STATUS:** RETURNED INDEPENDENT QA_CORRECT / BOUNDED HEIR CORRECTION / RE-GOLD REQUIRED / NO MERGE, DEPLOYMENT OR LIVE RELEASE.

**USER ARRIVES BECAUSE:** a person or crawler needs the discovery audit to accept only a well-formed sitemap document, not XML-shaped text that happens to contain canonical-looking locations.

**ONE THING TO UNDERSTAND:** matching tag names and stack depth is not XML validation; namespace binding, quoted attributes, case-sensitive names and the one-root document boundary are part of the evidence.

**PRIMARY ACTION:** require a well-formed `urlset` in the sitemap namespace before accepting exact raw canonical locations from namespaced `url > loc` elements.

**SECONDARY DEPTH:** reject missing namespaces, unbound prefixes, unquoted attributes, non-whitespace post-root text and uppercase sitemap element variants; retain comment, CDATA and every prior URL-identity negative.

**TEST-HARNESS ROOT CAUSE:** the fixture omitted the pre-existing `public/robots.txt`, so an unrelated `ROBOTS_GAP` could make status-only negative assertions pass. The fixture now includes that file, proving each XML negative fails for its intended cause.

**WHAT MUST BE REUSED:** issue #483, PR #131, the current sitemap generator, user-entry audit, user-proof analytics contract and sole `king/test` HEIR.

**TRUTH BOUNDARY:** passing proves only that the current generator emitted well-formed, namespaced sitemap evidence with exact approved locations during that execution. It does not prove deployment, crawl, indexation, ranking, traffic, human use or LIVE value.

**MOBILE-FIRST RISK:** none; this is an evaluator and regression-harness correction with no rendered-product mutation.

**HUMAN SUCCESS:** all five independent held-out malformed-document fixtures fail after first being reproduced as false accepts, while the canonical sitemap and the previous comment, CDATA and raw-URL matrix remain green.

**BASE / ROLLBACK:** `king/test@88ca18330b391aa0ef658e93987119c2fb2b181d`; revert this bounded audit/test/brief correction if independent Gold finds an XML, canonical identity or generated-file restoration regression.

**MAKER ≠ JUDGE:** Factory supplies failing-first and corrected evidence. Independent Gold must rerun the five held-out XML cases and the complete existing negative matrix on the exact returned SHA.

---

# LIVING SYSTEMS — STRUCTURAL SITEMAP XML IDENTITY — 23 OCTOBER 2026

**STATUS:** RETURNED INDEPENDENT QA_CORRECT / BOUNDED HEIR CORRECTION / RE-GOLD REQUIRED / NO MERGE, DEPLOYMENT OR LIVE RELEASE.

**USER ARRIVES BECAUSE:** a person or crawler needs the sitemap audit to recognise only a real URL element, not markup-shaped text hidden in a comment or CDATA section.

**ONE THING TO UNDERSTAND:** a regular expression cannot distinguish XML element nodes from arbitrary text; structural parsing must establish the `urlset > url > loc` relationship.

**PRIMARY ACTION:** parse the emitted sitemap structure and accept raw location text only from a real `<loc>` element directly inside `<url>` inside `<urlset>`.

**SECONDARY DEPTH:** ignore comment markup, treat CDATA as text rather than markup, preserve raw URL identity before WHATWG normalisation, and retain every prior output, shadow, origin, query, fragment, userinfo and dot-segment regression.

**P1 DOMINANT / P2 ORIENTATION / P3 ACTION / P4 DEPTH:** no UI changes; structural sitemap evidence is dominant, the required route orients the result, explicit failure type is the action, and the full negative matrix supplies depth.

**WHAT CAN BE REMOVED:** raw `<loc>` regular-expression matching that promotes non-element text to canonical evidence.

**WHAT MUST BE REUSED:** issue #483, PR #131, the current sitemap generator, user-entry audit, user-proof analytics contract and sole `king/test` HEIR.

**TRUTH BOUNDARY:** a passing audit proves only that the current generator emitted the exact approved URL inside a real sitemap element during that execution. It does not prove deployment, crawl, indexation, ranking, traffic, human use or LIVE value.

**MOBILE-FIRST RISK:** none; this is an evaluator-only correction with no rendered-product mutation.

**HUMAN SUCCESS:** comment-only and CDATA-contained pseudo-markup fail while a real canonical `<loc>` and every earlier deceptive-output fixture retain their expected results.

**BASE / ROLLBACK:** `king/test@33cb110da0b66cd6fbdd288d797826e70e2cfb34`; revert this bounded audit/test/brief correction if independent Gold finds a structural parsing, canonical identity or generated-file restoration regression.

**MAKER ≠ JUDGE:** Factory supplies failing-first and corrected evidence. Independent Gold must rerun the XML-structure cases and the full negative matrix on the exact returned SHA.

---

# LIVING SYSTEMS — RAW CANONICAL SITEMAP IDENTITY — 23 OCTOBER 2026

**STATUS:** RETURNED INDEPENDENT QA_CORRECT / BOUNDED HEIR CORRECTION / RE-GOLD REQUIRED / NO MERGE, DEPLOYMENT OR LIVE RELEASE.

**USER ARRIVES BECAUSE:** a person or crawler needs the sitemap to publish the one approved Living Systems URL, not a textually different URL that a parser silently normalises to it.

**ONE THING TO UNDERSTAND:** WHATWG URL parsing removes dot segments, so comparing only the parsed URL can erase the evidence that the emitted `<loc>` was noncanonical.

**PRIMARY ACTION:** retain the decoded raw `<loc>` text and require it to equal the exact approved canonical URL before accepting the route.

**SECONDARY DEPTH:** retain parsed URL data for path association and foreign-origin diagnosis; preserve every prior comment, filter, shadow, origin, query, fragment and userinfo regression.

**WHAT MUST BE REUSED:** issue #483, PR #131, the existing sitemap generator, user-entry audit, user-proof analytics contract and sole `king/test` HEIR.

**TRUTH BOUNDARY:** a passing audit proves only that the generator emitted the exact approved sitemap URL during that execution. It does not prove deployment, crawl, indexation, ranking, traffic, human use or LIVE value.

**BASE / ROLLBACK:** `king/test@27457e26f5e1bde8027fbcc1d195bba3aa66fd15`; revert this bounded audit/test/brief correction if independent Gold finds an approved-URL or generated-file restoration regression.

**HUMAN SUCCESS:** raw `/./`, encoded-dot and parent-segment variants fail while the exact canonical URL and all earlier deceptive-output fixtures retain their expected results.

**MAKER != JUDGE:** Factory supplies failing-first and corrected evidence. Independent Gold must rerun the full negative matrix on the exact returned SHA.

---

# LIVING SYSTEMS — EXACT CANONICAL SITEMAP URL IDENTITY — 23 OCTOBER 2026

**STATUS:** RETURNED INDEPENDENT QA_CORRECT / BOUNDED HEIR CORRECTION / RE-GOLD REQUIRED / NO MERGE, DEPLOYMENT OR LIVE RELEASE.

**USER ARRIVES BECAUSE:** a person or crawler needs one unambiguous Living Systems sitemap identity, without credentials, query state or fragments attached to the canonical URL.

**ONE THING TO UNDERSTAND:** matching scheme, host, port and pathname is still insufficient; URL userinfo, search and hash can differ while `URL.origin` and `URL.pathname` remain unchanged.

**PRIMARY ACTION:** require the emitted sitemap URL to equal the exact approved canonical URL `https://4planet.org/livingsystems/`.

**SECONDARY DEPTH:** preserve explicit foreign-origin reporting, add exact-URL diagnostics, retain every prior deceptive-output regression, and restore generated files byte-for-byte.

**P1 DOMINANT / P2 ORIENTATION / P3 ACTION / P4 DEPTH:** no UI changes; the evaluator's dominant result is exact canonical identity, oriented by the required route, with explicit failure type and generated-artifact evidence as depth.

**WHAT CAN BE REMOVED:** partial identity assumptions that treat origin plus pathname as complete canonical equality.

**WHAT MUST BE REUSED:** issue #483, PR #131, the existing sitemap generator, user-entry audit, user-proof analytics contract and sole `king/test` HEIR.

**TRUTH BOUNDARY:** a passing audit proves only that the current generator emitted each required exact canonical URL during that execution. It does not prove deployment, crawl, indexation, ranking, traffic, human use or LIVE value.

**MOBILE-FIRST RISK:** none; this is an evaluator-only correction with no rendered-product mutation.

**HUMAN SUCCESS:** held-out query, fragment and userinfo variants fail; the exact canonical URL and all prior comment/filter/shadow/foreign-origin fixtures retain their expected results.

**BASE / ROLLBACK:** `king/test@c4c20703c7b917a88c04213fc1f669d8f0312cb8`; revert this three-file correction if independent Gold finds an approved canonical or generated-file restoration regression.

**MAKER ≠ JUDGE:** Factory supplies failing-first and corrected evidence. Independent Gold must rerun every URL-identity and prior held-out fixture on the exact returned SHA.

---

# LIVING SYSTEMS — CANONICAL SITEMAP ORIGIN IMMUNITY — 23 OCTOBER 2026

**STATUS:** RETURNED QA GAP / BOUNDED HEIR CORRECTION / RE-GOLD REQUIRED / NO MERGE, DEPLOYMENT OR LIVE RELEASE.

**USER ARRIVES BECAUSE:** a person or crawler needs the Living Systems sitemap entry to identify the approved `4planet.org` resource, not merely reuse its path on another host.

**ONE THING TO UNDERSTAND:** pathname equality is not canonical URL equality; `https://example.invalid/livingsystems/` must not certify the `https://4planet.org/livingsystems/` entry.

**PRIMARY ACTION:** validate both the approved canonical origin and required pathname in the sitemap actually emitted by the real generator.

**SECONDARY DEPTH:** report foreign-origin entries explicitly, preserve all prior deceptive-output regressions, and restore generated files byte-for-byte after every audit.

**WHAT MUST BE REUSED:** issue #483, PR #131, the existing sitemap generator, user-entry audit, user-proof analytics contract and sole `king/test` HEIR.

**TRUTH BOUNDARY:** a passing audit proves only that the current generator emitted required URLs under the approved origin during that execution. It does not prove deployment, crawl, indexation, ranking, traffic, human use or LIVE value.

**HUMAN SUCCESS:** the audit rejects a correct required path emitted under a foreign origin while the unchanged generator and prior comment/filter/shadow negatives retain their expected results.

**BASE / ROLLBACK:** `king/test@fb97a5219e1020bc6e9657a10c95296a87e1b799`; revert this three-file correction if independent Gold finds an approved-origin or generator-restoration regression.

**MAKER ≠ JUDGE:** Factory supplies failing-first and corrected evidence. Independent Gold must rerun the foreign-origin and prior held-out fixtures on the exact returned SHA.

---

# LIVING SYSTEMS — EMITTED SITEMAP AUDIT IMMUNITY — 23 OCTOBER 2026

**STATUS:** RETURNED INDEPENDENT QA_CORRECT / BOUNDED HEIR CORRECTION / RE-GOLD REQUIRED / NO MERGE, DEPLOYMENT OR LIVE RELEASE.

**USER ARRIVES BECAUSE:** a person or crawler needs the Living Systems canonical to remain present in the sitemap that the product actually emits.

**ONE THING TO UNDERSTAND:** a route declaration is not proof of final output when later generator logic can remove it or a nested shadow declaration can mislead source analysis.

**PRIMARY ACTION:** run the real sitemap generator in a reversible audit boundary and verify required discovery paths against its emitted `<loc>` entries.

**SECONDARY DEPTH:** preserve the current canonical route, generator policy, public pages, analytics and generated files byte-for-byte after the audit.

**WHAT MUST BE REUSED:** issue #483, PR #131, the existing sitemap generator, user-entry audit, user-proof analytics contract and sole `king/test` HEIR.

**TRUTH BOUNDARY:** a passing audit proves only that the current generator emitted each required path during that execution. It does not prove deployment, crawl, indexation, ranking, traffic, human use or LIVE value.

**HUMAN SUCCESS:** the audit fails when `/livingsystems/` is commented out, removed by final-output filtering or present only in a nested shadow declaration; the unchanged generator passes.

**BASE / ROLLBACK:** `king/test@317bbe54e64e5469ba4f6c35b5b25801b3571d5e`; revert this three-file correction if independent Gold finds generator side effects or route-policy regression.

**MAKER ≠ JUDGE:** Factory supplies failing-first and corrected evidence. Independent Gold must rerun all held-out negative fixtures on the exact returned SHA.

---

# EARTH NOW — CANONICAL ALIAS NORMALISATION — 22 OCT 2026

**STATUS:** BOUNDED HEIR CORRECTION / INDEPENDENT GOLD REQUIRED / NO MERGE, DEPLOYMENT, INDEX SUBMISSION OR LIVE RELEASE.

**USER ARRIVES BECAUSE:** a person or crawler follows Earth Now and needs one stable public address rather than a visible trailing-slash alias that contradicts the page canonical.

**ONE THING TO UNDERSTAND:** Earth Now declares `https://4planet.org/now` as canonical, so `/now/` must redirect to `/now` rather than remain the browser URL.

**PRIMARY ACTION:** add the existing host-level permanent redirect pattern `/now/ → /now` and enforce it in the Discovery Engine contract.

**SECONDARY DEPTH:** keep Earth Now content, navigation, data, map, typography, homepage composition, sitemap and prerendered canonical unchanged.

**P1 / P2 / P3 / P4:** stable entry URL / matching canonical / unchanged human-first experience / existing source and truth boundaries.

**WHAT CAN BE REMOVED:** the duplicate trailing-slash URL signal.

**WHAT MUST BE REUSED:** issue #483, PR #131, `public/_redirects`, the existing Discovery Engine contract and sole `king/test` HEIR.

**TRUTH BOUNDARY:** matching redirect and canonical removes a technical contradiction. It does not prove deployment, recrawl, indexation, ranking, traffic, user use or LIVE value.

**MOBILE-FIRST RISK:** none introduced; no rendered page, interaction or asset changes.

**HUMAN SUCCESS:** `/now/` permanently redirects to `/now`; `/now` retains the no-trailing-slash canonical and the existing Earth Now experience.

**BASE / ROLLBACK:** `king/test@9ff75e3a47db7b6c9e27de45af0f2663097e1edf`; revert this three-file correction if independent Gold finds a host-routing regression.

**MAKER ≠ JUDGE:** Factory supplies a tested exact SHA. Independent Gold must verify redirect behaviour on the exact preview before any authorised release or index submission.

---

# 4PLANET JOURNEYS — SITEMAP/CANONICAL PATH ALIGNMENT — 22 OCT 2026

**STATUS:** BOUNDED HEIR CORRECTION / INDEPENDENT GOLD REQUIRED / NO MERGE, DEPLOYMENT, INDEX SUBMISSION OR LIVE RELEASE.

**USER ARRIVES BECAUSE:** a person or crawler discovers the Jaguar or Orca journey through a search engine and needs one stable public address rather than duplicate URL signals.

**ONE THING TO UNDERSTAND:** both public journeys declare a no-trailing-slash canonical, so the sitemap must advertise that exact path.

**PRIMARY ACTION:** emit `/journey/jaguar` and `/journey/orca` from the canonical sitemap generator.

**SECONDARY DEPTH:** keep the existing journey files, inbound slash aliases, navigation, analytics, content, visual presentation and rights boundaries unchanged.

**P1 / P2 / P3 / P4:** canonical path / journey identity / search discovery / existing evidence and analytics.

**WHAT CAN BE REMOVED:** the two duplicate trailing-slash sitemap signals.

**WHAT MUST BE REUSED:** issue #483, PR #131, the existing sitemap generator, user-entry audit, user-proof analytics contract and sole `king/test` HEIR.

**TRUTH BOUNDARY:** matching sitemap and canonical paths removes a technical contradiction. It does not prove recrawl, indexation, ranking, traffic, user use, deployment or LIVE value.

**MOBILE-FIRST RISK:** none introduced; no rendered page, interaction or asset changes.

**HUMAN SUCCESS:** generated sitemap contains exactly the declared no-trailing-slash Jaguar and Orca canonical URLs; the two public journeys and their return paths remain present.

**DONOR DECISION:** no donor; correct the current HEIR generator and its existing audits in place.

**BASE / ROLLBACK:** `king/test@b46410367696d472caa2963e23fe6623136bd65a`; revert this four-file correction if independent Gold finds a path-policy regression.

**MAKER ≠ JUDGE:** Factory supplies a tested exact SHA. Independent Gold must verify the generated artifact and preview before any authorised release or index submission.

---

# 4SPECIES — UNKNOWN PROFILE SOFT-404 CORRECTION — 22 OCT 2026

**STATUS:** BOUNDED HEIR CORRECTION / INDEPENDENT GOLD REQUIRED / NO MERGE, DEPLOYMENT OR LIVE RELEASE.

**USER ARRIVES BECAUSE:** a person or search crawler follows a species-looking URL and needs a truthful distinction between an available source-backed profile and a missing page.

**ONE THING TO UNDERSTAND:** an upstream SPA shell returning HTTP 200 is not evidence that a species profile exists.

**PRIMARY ACTION:** return HTTP 404 with a clear path back to Explore when the public edge cannot verify source-bearing profile data for a single-segment profile candidate.

**SECONDARY DEPTH:** valid REVIEWED/DRAFT profiles and the existing Home, Explore, Quiz and About routes retain their current behaviour.

**P1 / P2 / P3 / P4:** truthful HTTP state / human-readable explanation / Explore species / unchanged source and indexing gates.

**WHAT CAN BE REMOVED:** the misleading 200 SPA shell and canonical signal for missing profile-shaped paths.

**WHAT MUST BE REUSED:** SPEC-GS-11, issue #145, the existing `profileReviewState` source gate, canonical-host worker, PR #131 and sole `king/test` HEIR.

**TRUTH BOUNDARY:** a 404 proves only that this public edge did not find an eligible source-bearing profile at request time. It does not judge taxonomy, delete content, grant Gold, deploy, change LIVE or prove search-engine removal.

**MOBILE-FIRST RISK:** none beyond keeping the compact not-found response readable and the Explore link usable without client JavaScript.

**HUMAN SUCCESS:** GET and HEAD return 404, no canonical, and noindex for a missing profile candidate while known profiles and non-profile routes preserve their contracts.

**DONOR DECISION:** no donor; correct the current HEIR worker and its existing regression in place.

**BASE / ROLLBACK:** `king/test@042cad8a6d958af80d1c42a5c0e288ab47243e03`; revert the bounded worker/test/brief commit if independent Gold finds a valid route, asset or source-gate regression.

**MAKER ≠ JUDGE:** Factory implements and returns an exact SHA. Independent Gold must verify exact-head worker behaviour before any authorised release.

---

# 4SAPIEN — OWNER-BOUND NOTE-DELETE RECEIPT — 21 OCT 2026

**STATUS:** BOUNDED HEIR CORRECTION / INDEPENDENT GOLD REQUIRED / NO MERGE, DEPLOYMENT OR LIVE RELEASE.

**USER ARRIVES BECAUSE:** a signed-in person needs “removed” to mean that their exact private note was actually changed, not merely that an HTTP request completed.

**ONE THING TO UNDERSTAND:** absence from the active-note list is not an affected-row receipt; a nonexistent or other-owner id can also be absent.

**PRIMARY ACTION:** announce deletion and emit `note_deleted` only when the owner-scoped PATCH returns exactly one row matching the requested id, initiating actor, deleted state and deletion timestamp.

**SECONDARY DEPTH:** zero-row, duplicate, wrong-id, other-owner, stale-session or malformed receipts retain the existing fail-closed retry state and emit no deletion event.

**WHAT MUST BE REUSED:** existing 4SAPIEN note UI, owner RLS, auth-epoch guards, issue #317, PR #131 and sole `king/test` HEIR.

**TRUTH BOUNDARY:** a matching representation proves server acknowledgement for this mutation only. It does not prove later-session persistence, cross-owner RLS, deployment, LIVE state or realised user value.

**BASE / ROLLBACK:** `king/test@95dcd8701077f7c7d36b7fb652275370f6f95221`; revert this bounded source/test/brief commit.

**MAKER ≠ JUDGE:** Factory corrects the existing HEIR. Independent Gold must judge the exact resulting SHA and authenticated owner-isolation runtime before any release claim.

---

# EARTH NOW 02 — HUMAN-FIRST REPAIR — 21 OCT 2026

USER ARRIVES BECAUSE: they want to understand current natural events and environmental change without technical clutter.
ONE THING TO UNDERSTAND: choose one view; see its map, source and observation time.
PRIMARY ACTION: choose Events, Ocean, Land, Air or Life.
SECONDARY DEPTH: source limitations and the full guide index live in native disclosures.
P1 / P2 / P3 / P4: real map / selected view / open full map or guide / methodology and other guides.
WHAT CAN BE REMOVED: repeated fire rows, technical introductions, all-eight-layer default and oversized warnings.
WHAT MUST BE REUSED: PublicShell, current ATLAS renderer/layer keys, discoveryTopics, source links, SEO and consent.
TRUTH BOUNDARY: latest available is not real time; retain source/date/coverage limitations; no new data or observations.
MOBILE-FIRST RISK: overflow, undersized touch targets, blocked cross-origin frame, oversized type and text concatenation.
HUMAN SUCCESS: readable 390/430px view, functional URL-persisted category selection, no stray escaped newlines, visible map, unchanged homepage composition.
BRAND PREFLIGHT: DM Sans throughout discovery; White #FFFFFF / Black #000000; controlled blue; 16px reading, 32–48px display; shared soft geometry, thin rules and whitespace; documentary map is dominant anchor. Defer technical depth.
AUTHORITY: Founder explicitly ordered Earth Now and logo repairs with live iteration in this conversation on 21 Oct 2026. HEIR king/test parent aace934a6f616bba8b525e15c0033006b7c1a1f2; no sandbox; LIVE main a60355872550939ba8a810befbd7981570e1d35b read-only rollback/source donor. Scope only discovery UI, exact newline generation and same-origin NEWS embedding. No wholesale HEIR promotion.
PROGRAMME ADMISSION: not applicable; bounded repair to existing product. EXECUTION: deterministic edits/build/browser QA. Reversible via exact prior production deployment.
DONOR: preserve existing live homepage and shell unchanged; HEIR discovery evidence/layout primitives adapted, old oversized dark treatment rejected. NASA Worldview category and preselected-view mechanisms used, no visual copying.
MAKER != JUDGE: independent exact-diff review required; automated verification does not confer Founder visual acceptance or Gold.
WRITEBACK: existing Project Lead CURRENT/issue #132; no new project or system.

---

# ATLAS — PUBLIC DOMAIN MARK FAIL-CLOSED RIGHTS BOUNDARY — 21 OCT 2026

**STATUS:** BOUNDED HEIR CORRECTION / INDEPENDENT GOLD REQUIRED / NO MERGE, DEPLOYMENT OR LIVE RELEASE.

**RETURNED DEFECT:** OBIS records carrying Creative Commons Public Domain Mark 1.0 or an ambiguous `PUBLIC DOMAIN` token were classified as `OPEN_CC0` and could enter the ATLAS point layer.

**HUMAN VALUE:** a person inspecting or reusing an ATLAS occurrence must not be told that a public-domain marking is a CC0 dedication or waiver.

**RIGHTS BOUNDARY:** only a genuine Creative Commons Zero 1.0 URL or the exact vetted `CC0 1.0` token receives `OPEN_CC0`. Public Domain Mark 1.0 and ambiguous public-domain tokens require review, carry `UNKNOWN_OR_MISSING`, and are not map-admitted.

**PRESERVATION:** issued CC BY behaviour, attribution requirements, original dataset evidence and genuine CC0 admission remain unchanged.

**TRUTH BOUNDARY:** this classification correction prevents a false permission claim. It does not independently prove underlying public-domain status, dataset rights, release readiness, deployment or LIVE value.

**BASE / ROLLBACK:** `king/test@1d0de7aa9b067a5eba06e18ee66c6d577cdc2094`; revert this bounded source/test/brief commit.

**MAKER ≠ JUDGE:** Factory corrects the existing HEIR. Independent Gold must judge the exact resulting SHA and runtime/source behaviour before any release claim.

---

# 4SAPIEN FOOD — AUTHORITATIVE PANTRY-WRITE READBACK — 21 OCT 2026

**STATUS:** BOUNDED HEIR CORRECTION / INDEPENDENT GOLD REQUIRED / NO MERGE, DEPLOYMENT OR LIVE RELEASE.

**USER ARRIVES BECAUSE:** a signed-in person needs the private pantry shown as saved to match exactly what they just confirmed.

**ONE THING TO UNDERSTAND:** an owner-scoped row with the right namespace is not an authoritative receipt when its id, pantry items, budget or confirmation state differs from the attempted write.

**PRIMARY ACTION:** save the private pantry only after an active, user-confirmed row readback matches the canonical id and exact pantry/budget payload.

**SECONDARY DEPTH:** missing, stale, inferred, reordered or mismatched readbacks retain the existing fail-closed recheck state.

**P1 / P2 / P3 / P4:** private pantry / explicit saved state / continue to meal comparison / owner-RLS and later-session Gold evidence.

**WHAT CAN BE REMOVED:** treating `food_pantry_v1` namespace equality as sufficient proof of the write.

**WHAT MUST BE REUSED:** existing FOOD pantry UI, owner RLS, exact write/readback flow, issue #317, PR #131 and sole `king/test` HEIR.

**TRUTH BOUNDARY:** an exact matching row proves server readback for this write only. It does not prove later-session persistence, cross-owner isolation, deployment, LIVE state, meal completion or user value.

**MOBILE-FIRST RISK:** none introduced; no layout, copy or interaction geometry changes.

**HUMAN SUCCESS:** SAVED appears only when id, active state, user confirmation, pantry item order/content, budget and consumption boundary all match the attempted write.

**BASE / ROLLBACK:** `king/test@c6c56372b2f4ae346bd6bb417b750ef00f4f0317`; revert this bounded source/test/brief commit.

**MAKER ≠ JUDGE:** Factory implements the readback boundary. Independent Gold must verify the exact SHA and authenticated owner-RLS/later-session runtime before any release claim.

---

# 4SAPIEN — AUTHORITATIVE NOTE-WRITE RECEIPT — 20 OCT 2026

**STATUS:** BOUNDED HEIR CORRECTION / INDEPENDENT GOLD REQUIRED / NO MERGE, DEPLOYMENT OR LIVE RELEASE.

**USER ARRIVES BECAUSE:** a signed-in person needs a private note to be truly persisted before the product reports success or value.

**ONE THING TO UNDERSTAND:** an HTTP-successful PostgREST write attempt is not an authoritative saved-note receipt.

**PRIMARY ACTION:** create or edit a note only when the owner-scoped API returns exactly one active row with the expected canonical id and content.

**SECONDARY DEPTH:** failed, empty, duplicate, stale, deleted or mismatched representations remain unconfirmed and retain the existing retry/error path.

**P1 / P2 / P3 / P4:** personal note / explicit saved state / continue using it / owner-RLS and second-session Gold evidence.

**WHAT CAN BE REMOVED:** delivery and completed-value telemetry based only on `return=minimal` HTTP success.

**WHAT MUST BE REUSED:** existing 4SAPIEN note UI, owner RLS, #317, PR #131, `king/test`, notes pagination and existing event sink.

**TRUTH BOUNDARY:** a matching returned row proves server acknowledgement for this write only. It does not prove a later session, another device, cross-owner isolation, deployment, LIVE state or user value.

**MOBILE-FIRST RISK:** none introduced; no layout or interaction geometry changes.

**HUMAN SUCCESS:** note create/update success and its value event occur only after an exact active-row receipt; zero-row, mismatched and duplicate responses fail closed.

**BASE / ROLLBACK:** `king/test@9e39603c5a7be299180812799a5f7d3b16e33333`; revert this bounded source/test/brief commit.

**MAKER ≠ JUDGE:** Factory implements the receipt boundary. Independent Gold must verify exact-SHA contract, authenticated owner-RLS and second-session runtime before any release claim.

---

# IMPACT — ACTION IDENTITY / LABEL-COLLISION BOUNDARY — 20 OCT 2026

**STATUS:** FRESH NATUREBRAIN SOURCE QA CONSUMED ON SOLE HEIR / INDEPENDENT GOLD REQUIRED / NO MERGE, DEPLOYMENT OR LIVE RELEASE.

**SOURCE FINDING:** sixteen action records currently share one display label while retaining sixteen distinct canonical IDs, source URLs and source-checked action edges. A label is presentation, never identity.

**HUMAN VALUE:** a person following an IMPACT action must reach the exact source-backed route for that action, even when many actions use the same generic call-to-action wording.

**IDENTITY BOUNDARY:** the public CTA carries the canonical action ID, preserves its exact URL and records both in telemetry. No label-keyed deduplication, URL substitution or label-derived identity is permitted.

**TRUTH BOUNDARY:** preserving identity and route does not prove the action is current, delivered, funded, effective or endorsed. Source dates, external live status, evidence and outcome remain separate gates.

**BASE / ROLLBACK:** `king/test@dbe16d4e797345db848a26d61ac5dc97bf5f524b`; revert this bounded page/test/brief commit to restore the prior candidate.

**MAKER ≠ JUDGE:** Factory consumes the source QA only. Independent Gold must judge the exact resulting SHA and runtime/source behaviour.

---

# ATLAS — GBIF ATTRIBUTION-PROVENANCE BOUNDARY — 20 OCT 2026

**STATUS:** FRESH INDEPENDENT GOLD QA_CORRECT CONSUMED ON SOLE HEIR / RE-GOLD REQUIRED / NO MERGE, DEPLOYMENT OR LIVE RELEASE.

**RETURNED DEFECT:** an issued CC BY token could admit a point without a responsible attribution identity; publisher, publishing-organisation title, rights holder, institution code and dataset citation were then dropped from the projected point and map detail. Token normalisation also widened hyphen/underscore aliases into canonical terms.

**HUMAN VALUE:** a person inspecting an ATLAS occurrence must be able to see who is responsible for attribution and retain the source citation before reusing the record.

**TRUTH BOUNDARY:** an issued licence family/version is necessary but not sufficient for CC BY map admission. The record must also name an explicit publisher, publishing organisation or rights holder. Institution code alone is not treated as a responsible rights identity. CC0 remains a distinct permission state.

**PRESERVATION:** publisher, publishingOrganizationTitle, rightsHolder, institutionCode and datasetCitation remain independent provenance fields. `attributionIdentity` selects the first explicit responsible identity for display without relabelling a rights holder as publisher.

**TOKEN BOUNDARY:** exact whitespace-normalised `CC BY <issued-version>`, `CC0 1.0` or `CC ZERO 1.0` tokens are recognised case-insensitively. Hyphen/underscore aliases remain REVIEW_REQUIRED.

**BASE / ROLLBACK:** `king/test@37e3a0a20f3a459ddaf18d4d47892cfa230f27be`; revert the bounded correction commit to restore the prior candidate.

**MAKER ≠ JUDGE:** Factory corrected the returned defect only. Independent Gold must judge the new exact SHA and actual runtime/source behaviour.

---

# ATLAS — GBIF ISSUED-LICENCE ADMISSION — 20 OCT 2026

**STATUS:** SOURCE QA_CORRECT CONSUMED ON SOLE HEIR / INDEPENDENT GOLD REQUIRED / NO DEPLOYMENT OR LIVE RELEASE.

**USER ARRIVES BECAUSE:** they want to explore species occurrences without mistaking unverifiable source terms for reusable open data.

**ONE THING TO UNDERSTAND:** an ATLAS GBIF point is admitted only when its record declares a recognised, issued CC BY or CC0 licence version.

**PRIMARY ACTION:** explore mapped occurrence evidence.

**SECONDARY DEPTH:** inspect the original GBIF record, dataset, licence and retrieval evidence.

**P1 DOMINANT:** the existing ATLAS map remains the dominant surface.

**P2 ORIENTATION:** existing presence, uncertainty and dataset context remain unchanged.

**P3 ACTION:** open the original record or dataset source.

**P4 DEPTH:** inspect the exact original licence and retrieval timestamp before reuse.

**WHAT CAN BE REMOVED:** admission of versionless, invented, non-issued, insecure or ambiguous licence labels.

**WHAT MUST BE REUSED:** issue #244, ATLAS-03, the existing `gbifOccurrencePoint` source boundary and the sole `king/test` receiver.

**TRUTH BOUNDARY:** licence admission proves only that a record declares an issued open licence. It does not prove identity, accuracy, abundance, coverage, timeliness or endorsement.

**MOBILE-FIRST RISK:** no layout or interaction change; the change only removes points that fail the source contract.

**HUMAN SUCCESS:** every visible GBIF point declares CC BY 1.0/2.0/2.5/3.0/4.0 or CC0 1.0, expressed as an exact token or official HTTPS Creative Commons URL.

**BASE / ROLLBACK:** `king/test@7bb4640489c2a585d6f03c9ab5e59205fe95c742`; revert the bounded commit to restore the previous classifier.

**MAKER ≠ JUDGE:** Factory has produced a candidate correction only. Independent QA/GOLD remains required.

---

# SPECIES — TAXON IDENTITY / CITATION SEPARATION — 19 OCT 2026

**STATUS:** FRESH SOURCE QA_CORRECT CONSUMED ON SOLE HEIR / INDEPENDENT GOLD REQUIRED / NO DEPLOYMENT OR LIVE RELEASE.
**USER ARRIVES BECAUSE:** a person or crawler needs a species profile whose evidence links do not overstate identity equivalence.
**ONE THING TO UNDERSTAND:** a source may support the page without being an unambiguous identity URL for the taxon.
**PRIMARY ACTION:** inspect the existing species profile and follow its visible source links.
**SECONDARY DEPTH:** consume the same links as `WebPage.citation` while Taxon identity remains limited to reviewed names and rank.
**P1 DOMINANT:** the existing species profile.
**P2 ORIENTATION:** common name, scientific name, limitations and source list.
**P3 ACTION:** follow the existing source links or continue into ATLAS.
**P4 DEPTH:** independent exact-head generated-HTML and structured-data validation before release.
**WHAT CAN BE REMOVED:** automatic promotion of every `sourceUrls` entry into `Taxon.sameAs`.
**WHAT MUST BE REUSED:** EXPO-04, SPEC-GS-11, issue #132, SPECIES #145, the existing discovery prerenderer, JSON-LD ownership contract, PR #131 and sole `king/test` HEIR.
**TRUTH BOUNDARY:** this separates page evidence from taxon identity equivalence; it does not judge any individual source false, invent an identity URL, grant Gold, deploy, alter LIVE or prove search-engine interpretation.
**MOBILE-FIRST RISK:** no layout or interaction change; visible source links and existing route content remain unchanged.
**HUMAN SUCCESS:** every existing source remains visible and emitted as a page citation, while no source is asserted as Taxon identity without a separate reviewed identity contract.
**BASE / ROLLBACK:** `king/test@c5bfa7fceee67c6c0845844a4b44f163741eafec`; revert the bounded generator/test/brief commit if independent Gold finds a citation, identity, generated-HTML or route regression.
**MAKER ≠ JUDGE:** Factory implements and returns an exact candidate SHA. Independent Gold judges the exact generated artifact; Founder release and runtime verification remain separate.

---

# 4SAPIEN FOOD — KEYBOARD + MOBILE PRIORITY CHOICE — 19 OCT 2026

**STATUS:** DOCUMENTED SOURCE QA_CORRECT CONSUMED ON SOLE HEIR / INDEPENDENT GOLD + REAL 390/430 BROWSER PROOF REQUIRED / NO DEPLOYMENT OR LIVE RELEASE.
**USER ARRIVES BECAUSE:** a person needs to choose the concern that matters most before Embla exposes an evidence path.
**ONE THING TO UNDERSTAND:** HEALTH, WALLET and PLANET stay separate; the selected concern controls the next evidence path without inventing a universal score.
**PRIMARY ACTION:** choose one priority by touch, pointer or standard radio-group keyboard controls.
**SECONDARY DEPTH:** continue to controlled comparison or product evidence only where that path is ready.
**P1 DOMINANT:** “What matters most today?”
**P2 ORIENTATION:** seven bounded priority choices with explicit readiness.
**P3 ACTION:** one selected priority with Arrow/Home/End movement and an obvious next step.
**P4 DEPTH:** comparison or scan evidence with UNKNOWN and category/SKU boundaries preserved.
**WHAT CAN BE REMOVED:** seven 170px mobile cards, extra keyboard tab stops and click-only radio behaviour.
**WHAT MUST BE REUSED:** FOOD-CHOICE-01, issue #342, existing priority data and evidence engines, current Embla visual grammar, PR #131 and sole `king/test` HEIR.
**TRUTH BOUNDARY:** accessibility and compact geometry improve access to the existing choice; they do not prove comprehension, utility, purchase, outcome, Gold, deployment or LIVE state.
**MOBILE-FIRST RISK:** compact cards must retain a >=44px target, readable evidence boundary, visible focus and no horizontal overflow at 390/430.
**HUMAN SUCCESS:** a keyboard user can enter the group once, change selection with Arrow keys, jump with Home/End, see focus and continue from the newly selected priority; a mobile user reaches the response with materially less scroll.
**BASE / ROLLBACK:** `king/test@20c24fc1af9c07ef7823d994d803671c73967fec`; revert the bounded UI/CSS/contract/brief commit if independent Gold finds focus, touch, hierarchy, truth or browser regression.
**MAKER ≠ JUDGE:** Factory implements and returns an exact candidate SHA. Independent Gold, rendered Chromium/WebKit 390/430 evidence and Founder release remain separate.

---

# IMPACT / ACTOR — CANONICAL IDENTITY BINDING — 17 OCT 2026

**STATUS:** RETURNED GOLD QA_CORRECT CONSUMED ON SOLE HEIR / INDEPENDENT GOLD REQUIRED / NO DEPLOYMENT OR LIVE RELEASE.
**USER ARRIVES BECAUSE:** a person following ORCA from an Actor profile into an IMPACT action needs both surfaces to refer to the same canonical organisation.
**ONE THING TO UNDERSTAND:** action-contract actor fields are projections, not identity authority; the public action must resolve through exactly one reviewed Actor Master record.
**PRIMARY ACTION:** inspect the bounded Bay of Biscay action while retaining an exact path back to the canonical ORCA Actor profile.
**SECONDARY DEPTH:** review the existing funding, delivery, outcome, evidence and claim boundaries without inferring partnership or ecological impact.
**P1 DOMINANT:** the existing bounded action and its fail-closed readiness.
**P2 ORIENTATION:** canonical ORCA organisation identity `P17-A036` and profile route `/actors/orca`.
**P3 ACTION:** continue through the existing Actor/IMPACT journey only when the Actor Master owns the action ID and its exact ID and route match the action projection.
**P4 DEPTH:** independent exact-head contract, browser and runtime verification before release.
**WHAT CAN BE REMOVED:** the caller-supplied identity gate, forged-pair bypass and any name/slug-based identity inference.
**WHAT MUST BE REUSED:** ACTOR-FP-01, issue #152, canonical Actor Master ID `P17-A036`, the existing Bay action contract, PR #131 and sole `king/test` HEIR.
**TRUTH BOUNDARY:** this binds an internal action projection to the existing canonical Actor identity; it does not create a partnership, approve funding, prove delivery/outcome/impact, grant Gold, deploy or alter LIVE.
**MOBILE-FIRST RISK:** no layout or interaction change; exact-head mobile/keyboard and cross-route browser verification remain release gates.
**HUMAN SUCCESS:** the existing ORCA action resolves only when one Actor Master record owns its action ID and matches `P17-A036` plus `/actors/orca`; forged pairs, wrong IDs, alternate routes and unlinked actions fail closed before the public proof renders.
**BASE / ROLLBACK:** `king/test@f49f5c062e0b3067a95cfcd472f9e7246ff1f117`; revert this bounded Actor/UI/contract/test/brief correction if independent Gold finds an identity, route, funding or claim-boundary regression.
**MAKER ≠ JUDGE:** Factory closes the returned identity defect; independent Gold judges the exact resulting SHA. Founder release and runtime verification remain separate.

---

# ATLAS / LIVING SYSTEMS — TAXON PHOTO MEDIA IDENTITY BOUNDARY — 17 OCT 2026

**STATUS:** RETURNED QA_CORRECT CONSUMED ON SOLE HEIR / INDEPENDENT GOLD REQUIRED / NO DEPLOYMENT OR LIVE RELEASE.
**USER ARRIVES BECAUSE:** a person opening a taxon needs the image, source link and licence evidence to describe the same authorised iNaturalist photo item.
**ONE THING TO UNDERSTAND:** a rights-compatible licence is necessary but insufficient; the admitted image URL must also be HTTPS, use an authorised iNaturalist media host and carry the same photo ID as the source item.
**PRIMARY ACTION:** inspect a rights-cleared taxon reference image whose visible media is bound to its canonical iNaturalist photo item.
**SECONDARY DEPTH:** follow the existing source link and verify item identity, attribution, licence and rights-check time.
**P1 DOMINANT:** the existing ATLAS taxon context and reference image.
**P2 ORIENTATION:** the existing source/licence caption or explicit no-rights-cleared-photo state.
**P3 ACTION:** open the canonical iNaturalist photo item.
**P4 DEPTH:** independent exact-head adapter, browser and runtime verification before release.
**WHAT CAN BE REMOVED:** trust in arbitrary, insecure, externally hosted or mismatched image URLs supplied beside an otherwise legitimate photo ID.
**WHAT MUST BE REUSED:** issue #244, TECH-07, the existing iNaturalist connector, taxon-photo source envelope, PR #131 and sole `king/test` HEIR.
**TRUTH BOUNDARY:** this validates media identity for the current iNaturalist hosts and item path; it does not prove the upstream file bytes, grant Gold, deploy, establish occurrence evidence or alter LIVE.
**MOBILE-FIRST RISK:** no layout or interaction change; exact-head 390/430 and assistive review remain release gates.
**HUMAN SUCCESS:** legitimate iNaturalist HTTPS photo URLs render only when their path ID matches the source item; mismatched IDs, external hosts, HTTP and non-network schemes fail closed.
**BASE / ROLLBACK:** `king/test@e0b85c206c9055943ebe60a456f65b260937e2c7`; revert this bounded connector/test/brief correction if independent Gold finds a media, rights or source-truth regression.
**MAKER ≠ JUDGE:** Factory closes the returned media-identity defect; independent Gold judges the exact resulting SHA. Founder release and runtime verification remain separate.

---

# S4PIENS / COMPANY-GOLD-01 — CLIMATE TRACE FAILURE CACHE BOUNDARY — 17 OCT 2026

**STATUS:** RETURNED SOURCE QA_CORRECT CONSUMED ON SOLE HEIR / INDEPENDENT GOLD REQUIRED / NO DEPLOYMENT OR LIVE RELEASE.
**USER ARRIVES BECAUSE:** a person needs recovered Climate TRACE data to become available immediately after a temporary upstream, schema or network failure.
**ONE THING TO UNDERSTAND:** successful source records may use the existing one-hour public cache, but a 502 is not valid source data and must never advertise reusable caching.
**PRIMARY ACTION:** retry the existing S4PIENS/ATLAS/4BRANDS Climate TRACE-backed view after a source failure without a stale error being treated like a successful response.
**SECONDARY DEPTH:** distinguish upstream HTTP failure, empty/schema mismatch, unmappable coordinates and thrown network/parse failure while retaining the shared source truth boundary.
**P1 DOMINANT:** currently available source-backed emissions data.
**P2 ORIENTATION:** explicit unavailable/error state when the source cannot provide valid records.
**P3 ACTION:** retry through the existing product path after recovery.
**P4 DEPTH:** inspect source identity, year, geography, rights and limitations on successful records only.
**WHAT CAN BE REMOVED:** the assumption that one cache policy is safe for both 200 source data and 502 source failures.
**WHAT MUST BE REUSED:** COMPANY-GOLD-01, issue #148, the shared Climate TRACE proxy and contract, PR #131 and sole `king/test` HEIR.
**TRUTH BOUNDARY:** `no-store` prevents the application response from advertising a reusable failure; it does not prove a particular CDN configuration, upstream recovery, deployment, browser behaviour, Gold or LIVE state.
**MOBILE-FIRST RISK:** no layout or interaction change; authorised browser and raw-response verification remain release gates.
**HUMAN SUCCESS:** all 502 paths return `Cache-Control: no-store`, while a subsequent va…22407 tokens truncated…thorised.

# ATLAS — WH4LES ITEM TRUTH + OPEN-RIGHTS GATE — 10 OCT 2026

**STATUS:** BOUNDED HEIR INTEGRATION CORRECTION / NO GOLD / NO DEPLOYMENT / NO LIVE RELEASE.

**USER ARRIVES BECAUSE:** A person opens one WH4LES point and needs to know when and how precisely the occurrence was recorded, which dataset supplied it, and under what licence it may be reused.

**ONE THING TO UNDERSTAND:** An OBIS occurrence point is admissible only through the governed adapter and only when its per-record rights are explicitly open.

**PRIMARY ACTION:** Replace the direct browser-to-OBIS query with the existing `/api/obis` bridge and render event date, coordinate uncertainty, dataset, licence, occurrence identifier and OBIS source per point.

**SECONDARY DEPTH:** Preserve valid equator/prime-meridian coordinates by testing finiteness instead of truthiness; fail closed on unknown, non-commercial or no-derivatives rights.

**P1 DOMINANT:** WH4LES accepts only `OPEN_CC0` or `OPEN_ATTRIBUTION` records from the governed bridge.

**P2 ORIENTATION:** Latitude or longitude `0` remains a valid occurrence coordinate.

**P3 ACTION:** Every admitted point exposes date, uncertainty, dataset, licence, record identifier when supplied, and provider source.

**P4 DEPTH:** This bounded correction does not prove upstream availability, completeness, taxonomic correctness, independent Gold, deployment or LIVE behaviour.

**WHAT CAN BE REMOVED:** Direct public OBIS fetches, truthy coordinate filters and rights-blind point popups.

**WHAT MUST BE REUSED:** Existing `/api/obis` adapter, issue #244 receiver, ATLAS point renderer, source-bridge regression suite and sole `king/test` HEIR.

**TRUTH BOUNDARY:** Records remain occurrence evidence, not abundance, range, population trend or live position. Missing point fields are displayed as missing and are never invented.

**MOBILE-FIRST RISK:** Popup detail grows; exact-head mobile/WebKit Gold must confirm it remains readable and dismissible.

**HUMAN SUCCESS:** A WH4LES point can no longer hide its temporal, spatial, dataset or rights context, and valid zero coordinates are not discarded.

**BASE / ROLLBACK:** `king/test@7ac8d12cf6073ff2f62578fff6c94e9f972f5d55`; revert this bounded correction if independent Gold finds a valid occurrence or mobile interaction regression.

**MAKER ≠ JUDGE:** Factory implements F14; independent Gold judges the exact HEIR SHA. No product Gold, deployment or production release is authorised.

# CROSS-PRODUCT STRUCTURED-DATA OWNERSHIP — 10 OCT 2026

**STATUS:** BOUNDED HEIR SEO LIFECYCLE CORRECTION / NO GOLD / NO DEPLOYMENT / NO LIVE RELEASE.

**USER ARRIVES BECAUSE:** A person or search system opens a 4PLANET route and needs the page identity, canonical URL and principal subject to describe that route only.

**ONE THING TO UNDERSTAND:** Crawlable prerender schema and the active client-route schema are two lifecycle stages of one 4PLANET-owned graph, not independent graphs that may accumulate.

**PRIMARY ACTION:** Mark every 4PLANET prerender JSON-LD script as owned and remove all owned prerender/current-route variants before installing the active route graph.

**SECONDARY DEPTH:** Preserve one crawlable raw-HTML graph before JavaScript and preserve unrelated third-party JSON-LD during mount, navigation, cleanup and StrictMode replay.

**P1 DOMINANT:** Raw prerender HTML contains exactly one owned, crawlable graph for its route.

**P2 ORIENTATION:** Client mount and A→B→A navigation leave exactly one current 4PLANET route graph.

**P3 ACTION:** Cleanup removes only 4PLANET-owned schema nodes; third-party JSON-LD remains untouched.

**P4 DEPTH:** Deterministic lifecycle tests and a production build do not prove search indexing, ranking, traffic, independent Gold, deployment or LIVE behaviour.

**WHAT CAN BE REMOVED:** Unmarked discovery schema and separate Atlas-only ownership semantics.

**WHAT MUST BE REUSED:** Existing `Seo` manager, discovery/Atlas/Magazine prerenderers, issue #132 receiver, canonical routes and sole `king/test` HEIR.

**TRUTH BOUNDARY:** This prevents duplicate or stale 4PLANET-owned structured data. It does not upgrade any source, claim, publication state or search-engine interpretation.

**MOBILE-FIRST RISK:** None; no layout, route or interaction geometry changes.

**HUMAN SUCCESS:** A route transition cannot leave a ghost schema graph that names the previous page or conflicts with the visible destination.

**BASE / ROLLBACK:** `king/test@ce72270bb88bc9b3140acbd40e799c45cdd3befc`; revert this bounded correction if independent Gold finds a legitimate structured-data interoperability regression.

**MAKER != JUDGE:** Factory implements; independent Gold judges the exact HEIR SHA. No publication, deployment or production release is authorised.

# NATUREBRAIN / ATLAS — OBIS DATE-BOUNDARY INTEGRITY — 10 OCT 2026

**STATUS:** BOUNDED HEIR SOURCE-ADAPTER CORRECTION / NO GOLD / NO INGEST / NO LIVE RELEASE.

**USER ARRIVES BECAUSE:** A person narrows marine observations to an explicit period and needs the returned evidence to remain inside that period.

**ONE THING TO UNDERSTAND:** A supplied invalid date is not an absent filter. The adapter must reject it instead of silently widening the OBIS request.

**PRIMARY ACTION:** Validate real `YYYY-MM-DD` calendar dates and reject inverted date ranges before any upstream fetch.

**SECONDARY DEPTH:** Preserve the existing bounded query, occurrence semantics, per-record provenance/rights, upstream failure state and no-absence/no-live-position truth limits.

**P1 DOMINANT:** Invalid or impossible supplied dates fail with `INVALID_DATE` and never call OBIS.

**P2 ORIENTATION:** A start date after the end date fails with `INVALID_DATE_RANGE`.

**P3 ACTION:** Valid dates, including a real leap day, continue to the existing bounded OBIS occurrence request.

**P4 DEPTH:** This source-adapter correction does not prove ATLAS point-detail date/uncertainty presentation, provider availability, dataset rights, independent Gold, deployment or LIVE behaviour.

**WHAT CAN BE REMOVED:** Shape-only date validation and fail-open omission of an invalid supplied filter.

**WHAT MUST BE REUSED:** Existing `/api/obis` bridge, issue #244 receiver, PKD-158 source contract, ATLAS source-bridge regression suite and sole `king/test` HEIR.

**TRUTH BOUNDARY:** OBIS records remain occurrence evidence, not abundance, range, trend or live position. `eventDate` remains distinct from retrieval time. F14 ATLAS point-detail provenance is deferred to the existing #244 product scope.

**MOBILE-FIRST RISK:** None; no UI, route, layout or interaction change.

**HUMAN SUCCESS:** An explicit invalid or inverted date boundary can no longer produce a successful unbounded observation response.

**BASE / ROLLBACK:** `king/test@7705f680c253dc1c9bb1261111c3302cf65e6247`; revert this bounded correction if independent Gold finds a valid OBIS calendar regression.

**MAKER ≠ JUDGE:** Factory implements F11–F13; independent Gold judges the exact HEIR SHA. No ingest, product Gold, deployment or production release is authorised.

# UNIVERSAL IMPACT — PROVIDER-BOUND ACTION QUANTITY — 10 OCT 2026

**USER ARRIVES BECAUSE:** A person following a real IMPACT action needs the released provider, delivery unit and funded quantity to describe the same transaction.

**ONE THING TO UNDERSTAND:** Positive amount and quantity fields are insufficient unless the selected provider is an admitted candidate and the quantity satisfies that provider's exact unit and minimum.

**PRIMARY ACTION:** Keep resource flow closed until the caller supplies the selected provider's current diligence binding and it matches the Action Contract provider, quantity unit and minimum.

**SECONDARY DEPTH:** Preserve diligence, Founder release, blocker, payment/delivery/evidence/outcome/impact and remedy boundaries.

**P1 DOMINANT:** No provider binding, no resource flow.

**P2 ORIENTATION:** The selected provider must be one of the contract's existing candidates.

**P3 ACTION:** The known quantity must use that same provider's unit and meet its current minimum.

**P4 DEPTH:** A passing deterministic gate does not prove checkout terms, payment, delivery, evidence, outcome, impact, partnership or LIVE runtime.

**WHAT CAN BE REMOVED:** No new UI, provider store, payment path, database or public claim.

**WHAT MUST BE REUSED:** Existing Universal Action Contract, existing provider diligence pattern, issue #320/#151 receiver, sole HEIR and IMPACT contract suite.

**TRUTH BOUNDARY:** The caller must supply the current provider pattern; a provider ID or positive number alone cannot self-authorise resource flow. Exact checkout and Founder release remain external gates.

**MOBILE-FIRST RISK:** None; deterministic contract correction only.

**HUMAN SUCCESS:** A quantity for a different provider, unit or minimum cannot silently open a real IMPACT resource flow.

**DONOR DECISION:** No donor; correct the existing HEIR primitive in place.

# IMPACT — EVIDENCE TIMESTAMP INTEGRITY WITHOUT AGE POLICY — 09 OCT 2026

**STATUS:** BOUNDED HEIR TRUTH
# ATLAS-09 — ACCOUNT-ISOLATED MY ATLAS STATE — 13 OCT 2026

**STATUS:** RETURNED QA_CORRECT CONSUMED ON SOLE HEIR / INDEPENDENT GOLD PENDING / NO DEPLOYMENT / NO LIVE RELEASE.

**USER ARRIVES BECAUSE:** A person saves ATLAS views or follows on a shared browser and must not expose or upload those choices to another signed-in account.

**ONE THING TO UNDERSTAND:** Guest device state and each authenticated account are separate namespaces; sign-in is not consent to import guest state.

**PRIMARY ACTION:** Switch saved-view and Follow storage to the active account namespace before hydration, then merge only that account's local cache with its RLS-bound remote state.

**P1 DOMINANT:** Guest data is never automatically merged into a newly authenticated account.

**P2 ORIENTATION:** Account A and account B use disjoint local keys; sign-out restores the guest namespace.

**P3 ACTION:** Late hydration or debounced sync from an inactive account cannot update the current account's UI or sync state.

**P4 DEPTH:** Deterministic contracts and build/type checks do not prove independent Gold, RLS configuration, deployment or LIVE behaviour.

**WHAT MUST BE REUSED:** Existing My Atlas controls, existing Follow primitive, existing `four_planet_atlas_state` account endpoint, issue #244 and sole `king/test` HEIR.

**TRUTH BOUNDARY:** This correction isolates application-visible browser state. It does not add explicit guest import, change server schema/RLS or claim that browser storage is a secure vault.

**BASE / ROLLBACK:** `king/test@d63bd4106651c1f037df6afa21d72a1e56d706a7`; revert this bounded correction if independent Gold finds a valid account persistence regression.

**MAKER ≠ JUDGE:** Factory consumes the returned correction; independent Gold judges the exact HEIR SHA. No product Gold, deployment or production release is authorised.
# ACTOR GOLD / 4NGO — SHARED VALUE-PROOF CONTRACT — 14 OCT 2026

**STATUS:** EXISTING HEIR BUILD/FIX / INDEPENDENT GOLD PENDING / NO PUBLIC OR LIVE CHANGE.
**USER ARRIVES BECAUSE:** a person needs to understand what an organisation needs, can do, still requires, has delivered and has actually caused without partnership or impact inflation.
**ONE THING TO UNDERSTAND:** need, capability, partner/capital requirement, delivery evidence, outcome evidence and independently supported impact are separate states.
**PRIMARY ACTION:** connect a source-grounded Actor profile to the existing Universal IMPACT Action Contract while all unsupported delivery, outcome and impact claims fail closed.
**WHAT CAN BE REMOVED:** parallel NGO actor/action/proof models and string-only impact assertions.
**WHAT MUST BE REUSED:** the canonical Actor Gold projection, `ActionContract["id"]`, ACTOR-FP-01, issue #152, sole `king/test` HEIR and accepted PR #371 contract.
**TRUTH BOUNDARY:** typed fields and deterministic contract tests do not prove a named partnership, funding, delivery, outcome, impact, independent Gold, deployment or LIVE behaviour.
**HUMAN SUCCESS:** downstream 4NGO presentation can distinguish unknown requirements from proven capability and can publish delivery/outcome/impact only from reviewed source-and-evidence records.
**BASE / ROLLBACK:** `king/test@341925aad5e6ed17b08be3195ea5ae9e5752c4c2`; revert this bounded Actor contract correction if independent Gold finds a valid regression.
**MAKER != JUDGE:** Factory implements on the sole HEIR; independent Gold judges the exact resulting SHA. Founder release remains separate.


# RESOURCE COMPOUNDING — GEM ATLAS + ORCA ASSET PROOF — 14 OCT 2026

**STATUS:** FOUNDER-DIRECTED HEIR PRODUCT CANDIDATE / SOURCE-BOUNDED / INDEPENDENT GOLD REQUIRED / NO LIVE RELEASE.

**USER ARRIVES BECAUSE:** a person exploring a real place in ATLAS needs to understand nearby energy/industrial infrastructure and its sourced ownership context without turning source records into emissions, responsibility or impact claims.

**ONE THING TO UNDERSTAND:** PLACE intelligence can connect physical infrastructure, company/ownership context, emissions and living systems only when each edge preserves its own source, date, rights and confidence.

**PRIMARY ACTION:** add a bounded Norway Global Energy Monitor layer to the existing ATLAS layer registry and expose source-bound ownership traversal through the same product authority.

**P1 DOMINANT:** energy/industrial assets become visible as real place context, not a parallel map or new truth store.

**P2 ORIENTATION:** asset type, status, capacity and direct owner appear only when supplied by GEM; missing means missing.

**P3 ACTION / NEXT:** GEM ownership graph is available as a separate source-preserving drill-down; verified legal-company crosswalks must use identifiers such as LEI/PermID or independent evidence.

**P4 DEPTH:** later PLACE CELL work may combine population, buildings, AlphaEarth/change, Climate TRACE, nature, public investment and procurement through the same canonical Place object.

**ORCA ASSET PROOF:** register an Orca asset manifest in the existing physical asset path. Separate production media, real reference media, museum specimen metadata and future reconstruction needs. A procedural/reference-grounded Orca is never labelled a measured or Smithsonian-scanned 3D animal.

**WHAT MUST BE REUSED:** existing ATLAS LAYERS/World authority, existing Climate TRACE integration, existing canonical Orca identity/assets, existing source/evidence boundaries and sole `king/test` HEIR.

**WHAT MAY NOT BE CREATED:** second ATLAS engine, parallel BRAIN, parallel asset truth store, automatic owner→responsibility inference, fake measured 3D provenance.

**S4PIENS / 4SAPIEN BOUNDARY:** public human-system PLACE context belongs to S4PIENS; 4SAPIEN remains the personal life-helper application and may only consume private/user-relevant projections within tenant boundaries.

**MOBILE-FIRST RISK:** new point density and popup information must remain bounded; first slice is Norway-only and limited to 250 source records.

**HUMAN SUCCESS:** a person can switch on GEM in ATLAS, see real infrastructure context, understand what the source does and does not establish, and have a controlled path toward ownership intelligence.

**TRUTH BOUNDARY:** GEM asset ≠ emissions; owner ≠ responsibility; tracked status ≠ independently observed operation; source absence ≠ real-world absence. Orca reconstruction ≠ measured anatomy.

**ROLLBACK:** parent HEIR `b2dd0e09b13bb95b6fcafa55bd85921dfe6f0f7c`.

**MAKER ≠ JUDGE:** deterministic contracts and candidate build run on the HEIR; independent Gold judges the resulting exact SHA. LIVE remains Founder-gated.
# SPECIES — PROFILE REVIEW STATE FAIL-CLOSED — 16 OCT 2026

**STATUS:** RETURNED QA_CORRECT CONSUMED ON SOLE HEIR / INDEPENDENT GOLD PENDING / NO DEPLOYMENT / NO LIVE RELEASE.

**USER ARRIVES BECAUSE:** a person or search crawler opens a SPECIES profile and must not receive an indexable claim surface when the canonical human-review record is missing or unavailable.

**ONE THING TO UNDERSTAND:** only an explicit canonical `provenance.review === "REVIEWED"` permits a profile to be indexed; absence, error and ambiguity are not approval.

**PRIMARY ACTION:** fail closed to noindex and sitemap exclusion for missing, non-OK, malformed, incomplete or timed-out profile-review evidence.

**P1 DOMINANT / P2 ORIENTATION / P3 ACTION / P4 DEPTH:** keep the profile experience unchanged when reviewed; preserve enumerated public universe routes; apply one shared indexing predicate to HTML and sitemap; independently verify exact-SHA browser and deployed header/meta/sitemap behaviour before release.

**WHAT CAN BE REMOVED:** the `null`/unknown state that previously bypassed both the HTML robot gate and sitemap filter.

**WHAT MUST BE REUSED:** existing v53 router, canonical `/species-data/v1/{slug}.json` provenance, issue #145, PR #131 and sole `king/test` HEIR.

**TRUTH BOUNDARY:** deterministic source tests prove the HEIR gate semantics, not independent Gold, deployment, public runtime state or human review of any individual profile.

**MOBILE-FIRST RISK:** none introduced in presentation; required 390/430/1440 Chromium/WebKit verification remains an independent acceptance gate.

**HUMAN SUCCESS:** unreviewed or unverifiable profiles cannot silently become search-discoverable while reviewed profiles and explicit public universe routes remain reachable.

**DONOR DECISION:** no donor; correct the existing returned HEIR path in place.

**BASE / ROLLBACK:** `king/test@c9477d090e11cf4e3d440b59f1ec750f62c91139`; revert this bounded correction commit if independent Gold finds a valid regression.

**MAKER ≠ JUDGE:** Factory implements the returned correction; independent Gold judges the exact resulting HEIR SHA. Founder release remains separate.

## 16 OCTOBER 2026 — 4SPECIES SAFE PUBLIC DISCOVERY HOTFIX

**Founder instruction:** Fix the broken public SPECIES sitemap and improve real search discoverability, without publishing draft species or changing released species visuals or game assets.

**Source of authority:** Existing king/test sole HEIR and Worker ops/discovery/4species-router.js. No new project, competing BRAIN, feature changes, alternate production ownership, or bypass of release authority.

**Verified failure:** Direct public HTTP audit found https://4species.com/sitemap.xml returned HTTP 404 and https://4species.com/robots.txt did not advertise a sitemap. These behaviors match the active Worker route before the patch.

**Bounded implementation:** Route canonical /sitemap.xml to the existing review-gated sitemap proxy; retain fail-closed profile review; normalize legacy /species/ aliases and preview-domain entries to https://4species.com/{slug}; advertise sitemap in robots.txt. DRAFT and unavailable profiles are still excluded.

**Rollout and rollback:** The exact source must be rebased onto king/test, pass unit, browser, upstream and all product authority checks, then pass the existing immutable Cloudflare Pages preview / Worker-version rollback contract. Do not silently change or bypass manual-only deployment enforcement.

**Evidence needed:** HTTP 200 application/xml for /sitemap.xml on 4species.com, canonical URL list, no DRAFT species, and valid original product UX. An indexed status or live deployment is UNKNOWN until independently verified.

## USER ARRIVES BECAUSE
A person searches for a living species, receives a reliable species page and can interact with the existing product.

## ONE THING TO UNDERSTAND
Only approved source-backed species pages belong in public search and sitemap.

## PRIMARY ACTION
Open a factually reviewed 4SPECIES profile.

## SECONDARY DEPTH
Explore scientific sources and connected ATLAS mapping, without losing species context.

## P1 DOMINANT
Verified species content; no misleading index entries.

## P2 ORIENTATION
One canonical species URL per reviewed profile.

## P3 ACTION / NEXT
Continue to species knowledge, ATLAS, related species and real ecological context.

## P4 DEPTH
Sources, provenance and date limitations.

## WHAT CAN BE REMOVED
Dead 404 sitemap branch, preview URLs in sitemap.

## WHAT MUST BE REUSED
Current v53 species Worker, existing profileReviewState and permitsSpeciesIndexing, existing registry.

## TRUTH BOUNDARY
Search-engine crawlability does not prove actual Google indexation, traffic or human users.

## MOBILE-FIRST RISK
Preserve the existing responsive v53 UI and all media.

## HUMAN SUCCESS
Verified live public sitemap, preserved working animal cards, and discoverable reviewed species.

## 16 OCTOBER 2026 — P0 OAUTH / GA4 / POSTHOG USER PRIVACY, CANONICAL HEIR

**Founder direction:** Security first. Strip OAuth credentials and private values before analytics or identity cross-domain navigation. Any public release must preserve current UX, track legitimate anonymous value, and pass actual live verification.

**Source:** Existing sole `king/test` HEIR; no parallel production tree or replacement BRAIN.

**Bounded changes:** Sanitize `return_to` while preserving harmless ATLAS URL query state; reject URL fragments and sensitive callback paths; retain existing GA4 token-free `page_location` and internal traffic exclusion; filter credential / personal fields from `trackEvent` before GA4 and PostHog sinks. No account details or secret values printed by tests.

**Evidence:** The previous standalone source candidate passed security and typecheck tests. This canonical HEIR update includes dedicated regression tests and CI; verify new exact commit, build, browser login and Analytics network traffic. Historic GA4 sensitive data deletion and session revocation remain separate, unverifiable until a privileged admin data-deletion tool is connected.

**Rollback:** Save exact currently deployed Cloudflare production artifact before main promotion; no bypass of FOUNDER_GATED promotion or SOURCE_BRANCH=king/test. On regression, restore previous verified Worker/Pages version immediately.

**Truth state:** SOURCE CODE COMPLETE; PUBLIC LIVE REMEDIATION NOT VERIFIED BY THIS COMMIT.
## IMPACT proof-passport canonical-binding correction — 16 Oct 2026

- **USER ARRIVES BECAUSE:** they need to distinguish a contribution from delivery, outcome, and independently verified impact.
- **ONE THING TO UNDERSTAND:** an impact claim is eligible only when the displayed claim, quantity, evidence identity, and canonical proof records agree.
- **PRIMARY ACTION:** inspect the bounded proof chain and its source-linked verification.
- **SECONDARY DEPTH:** inspect limitations, double-count control, provider identity, and chronology.
- **P1 / P2 / P3 / P4:** verified state / proof-chain orientation / source inspection / limitations and method.
- **WHAT CAN BE REMOVED:** caller-supplied claim text, quantity, or context-only evidence as substitutes for canonical proof.
- **WHAT MUST BE REUSED:** existing `ProofPassport`, truth-spine records, claim-distance law, and independent-verifier gate.
- **TRUTH BOUNDARY:** CONTEXT_ONLY evidence cannot advance depth; blank verifier sources fail closed; an impact claim is emitted only for VERIFIED depth and remains ineligible if its text or quantity diverges from canonical records.
- **MOBILE-FIRST RISK:** none added; this correction changes the shared proof contract, not layout.
- **HUMAN SUCCESS:** a forged or stale projection cannot retain impact eligibility after its claim, quantity, source reference, or evidence relationship is altered.
- **DONOR DECISION:** no donor; correct the existing HEIR contract in place.
- **ROLLBACK:** parent HEIR `516c65ca5855164c985ec169223d71b3b6d537fb`.
# NATUREBRAIN / SPEC-GS-11 — REVIEWED-EDGE PRODUCT ADMISSION — 16 OCTOBER 2026

**STATUS:** HEIR SHARED-INFRASTRUCTURE CORRECTION / INDEPENDENT SCIENCE + PRODUCT GOLD REQUIRED / NO DB OR LIVE CHANGE.
**USER ARRIVES BECAUSE:** a person wants to understand a species or living system through ecological relationships without a bounded interpretation being presented as an approved fact.
**ONE THING TO UNDERSTAND:** reviewed evidence for a claim does not independently approve the relationship inferred from that evidence.
**PRIMARY ACTION:** consume only relationship records whose edge, referenced claim, reviewed source evidence and evidence-rights boundary all pass together.
**SECONDARY DEPTH:** preserve held and unreviewed relationships for scientific review without projecting them into SPECIES, ATLAS or LSI product links.
**P1 DOMINANT:** approved ecological relationship.
**P2 ORIENTATION:** relationship predicate and direction.
**P3 ACTION:** continue to the related entity only after full admission.
**P4 DEPTH:** claim, evidence, source record, review and rights context.
**WHAT CAN BE REMOVED:** product projection based only on entity presence or reviewed claim/evidence.
**WHAT MUST BE REUSED:** the canonical `NatureBrainEntityContext`, existing relationship IDs, claims/evidence, SPEC-GS-11, issue #145, ATLAS #244 and sole `king/test` HEIR.
**TRUTH BOUNDARY:** hiding a held edge does not disprove the relationship; source citation or reviewed claim does not approve a relationship; product admission does not prove deployment, scientific Gold or LIVE behaviour.
**MOBILE-FIRST RISK:** none introduced; this correction changes shared admission data before rendering and adds no layout.
**HUMAN SUCCESS:** a held synthesis cannot appear as an approved SPECIES/ATLAS/LSI relationship, while a fully reviewed and rights-bounded edge still transfers through the same shared adapter.
**BASE / ROLLBACK:** `king/test@ad7ab7bc49e7c050a4d158affe9efd02de65a90e`; revert the bounded adapter/test/brief commit if independent Gold finds a legitimate reviewed edge is wrongly suppressed.
**MAKER ≠ JUDGE:** Factory implements the returned gate; independent science/product Gold judges the exact SHA. Founder release remains separate.

## 16 OCTOBER 2026 — 4NGO ACTOR PUBLICATION AUTHORITY CORRECTION

**STATUS:** RETURNED QA_CORRECT IMPLEMENTED ON THE SOLE ACTOR HEIR / INDEPENDENT GOLD REQUIRED / RELEASE HOLD / NOT LIVE.

**USER ARRIVES BECAUSE:** a person needs to distinguish a source-backed Actor statement from a locally asserted delivery, outcome or impact claim.

**ONE THING TO UNDERSTAND:** profile-local source ids, authority labels and review dates do not create publication authority.

**PRIMARY ACTION:** show a material claim only after its projected source and evidence records match the closed canonical publication-authority register exactly.

**SECONDARY DEPTH:** inspect claim distance, source authority, evidence linkage, review chronology and limitations.

**P1 / P2 / P3 / P4:** admitted claim / distance and authority / source inspection / limitations and correction path.

**WHAT CAN BE REMOVED:** caller-local records as a substitute for canonical source/evidence approval, malformed review dates, future review dates and duplicate reference ids.

**WHAT MUST BE REUSED:** existing `ActorGoldProfile`, `actorClaimCanPublish`, Actor Master projection, ACTOR-FP-01, issue #152 and sole PR #131 `king/test` HEIR.

**TRUTH BOUNDARY:** the current ORCA development profile has no cleared public delivery, outcome or impact claims; the closed register therefore remains empty. This correction proves fail-closed source behavior, not Actor Gold, deployment, partnership, delivery, outcome or ecological impact.

**MOBILE-FIRST RISK:** none introduced; the correction changes claim admission before the existing responsive renderer.

**HUMAN SUCCESS:** forged local records and invalid dates cannot make a claim visible, while future canonically approved records have an explicit exact-match path.

**DONOR DECISION:** no donor or new actor store; correct the existing shared gate in place.

**BASE / ROLLBACK:** `king/test@69f333af1632be06296a7dfbd1ce588c90e52f15`; revert the bounded source/test/brief commit if independent Gold finds a legitimate canonical claim is wrongly suppressed.

**MAKER ≠ JUDGE:** Factory returns the exact SHA to independent Gold. Founder-authorised release remains separate.

## 17 OCTOBER 2026 — 4NGO ACTOR CLAIM CONTENT AUTHORITY CORRECTION

**STATUS:** RETURNED QA_CORRECT IMPLEMENTED ON THE SOLE ACTOR HEIR / INDEPENDENT GOLD REQUIRED / RELEASE HOLD / NOT LIVE.

**USER ARRIVES BECAUSE:** a person must see only the exact Actor statement that was reviewed, not new wording or a stronger claim distance attached to previously approved evidence.

**ONE THING TO UNDERSTAND:** approved sources and evidence do not approve every assertion that can be made from them.

**PRIMARY ACTION:** admit a claim only when its claim id, Actor id, revision, exact content and distance match the closed canonical claim-authority record as well as the approved source and evidence records.

**WHAT CAN BE REMOVED:** caller-controlled claim wording, Actor identity, distance or revision as a substitute for claim-level approval.

**WHAT MUST BE REUSED:** existing `ActorGoldProfile`, `ActorClaimBoundary`, `actorClaimCanPublish`, ACTOR-FP-01, issue #152 and sole PR #131 `king/test` HEIR.

**TRUTH BOUNDARY:** the current ORCA register remains empty. This correction adds no public claim and proves only that claim meaning cannot drift after approval.

**BASE / ROLLBACK:** `king/test@fe17879630c7fde69be3b871afa353722d01cec5`; revert the bounded source/test/brief commit if independent Gold finds a legitimate approved claim is wrongly suppressed.

**MAKER ≠ JUDGE:** Factory implements the returned boundary; independent Gold judges the exact resulting SHA. Founder release remains separate.

---


# PLACE CELL 01 — OSLOFJORD LIVE SOURCE COMPOSITION — 17 OCT 2026

**STATUS:** FOUNDER-DIRECTED HEIR PRODUCT CANDIDATE / FIRST PLACE CELL / INDEPENDENT GOLD REQUIRED / NO LIVE RELEASE IMPLIED.

**USER ARRIVES BECAUSE:** a person exploring Oslofjord needs more than a map or ecological summary; they need source-grounded context about the human and physical systems acting in the same place.

**ONE THING TO UNDERSTAND:** PLACE is one canonical object. Energy infrastructure, emissions, population, buildings, Earth change, nature, species, procurement and solutions attach to the same place with separate source/rights/truth boundaries.

**PRIMARY ACTION:** compose the existing GEM and Climate TRACE adapters into the existing public `/place/oslofjord` route and provide one clear continuation into the same ATLAS object.

**P1 DOMINANT:** the public PLACE page gains live infrastructure/emissions context without creating a new map, database or duplicated place identity.

**P2 ORIENTATION:** current proof is deliberately partial. WorldPop, building footprints and AlphaEarth are registered but remain `REGISTERED_NOT_ACTIVE` until their bounded adapters are proven.

**P3 ACTION / NEXT:** open the Oslofjord extent in ATLAS with GEM infrastructure enabled; then add population/buildings/Earth-change to the same PLACE contract.

**P4 DEPTH:** ecological condition, infrastructure, emissions, demographics and model signals remain different evidence classes. Missing source records never mean real-world absence.

**WHAT MUST BE REUSED:** existing `/place/oslofjord`, existing AtlasEmbed, existing GEM adapter, existing Climate TRACE v7 adapter, existing canonical `place:4p:oslofjord`, sole HEIR `king/test`.

**S4PIENS / 4SAPIEN BOUNDARY:** PLACE public human-system context belongs to S4PIENS. 4SAPIEN remains the private personal life-helper application.

**MOBILE-FIRST RISK:** live records must remain concise and responsive; the first proof caps displayed records and never blocks the static PLACE page if a live source fails.

**HUMAN SUCCESS:** a visitor can understand that Oslofjord is simultaneously a living system and a human/industrial place, inspect current source records, see uncertainty/coverage limits and continue into ATLAS.

**TRUTH BOUNDARY:** bbox = navigation geometry; GEM asset ≠ emissions or responsibility; Climate TRACE source record ≠ complete emissions inventory or causal attribution; registered source ≠ active product layer.

**ROLLBACK:** parent HEIR `c73fb2487f659cdc2c026b38a46978d746967b80`.

**MAKER ≠ JUDGE:** deterministic contracts/build/preview establish candidate quality only. LIVE remains Founder-gated.


# NATURE SENSOR 01 — SENSOR-AGNOSTIC NATUREBRAIN INGRESS — 17 OCT 2026

**STATUS:** SOURCE-GROUNDED DATA CAPABILITY / SOFTWARE-ONLY PROOF PASSED / NO HARDWARE OR LICENCE COMMITMENT.

**USER VALUE:** future environmental sensors can enter one governed NATUREBRAIN evidence path rather than creating device-specific silos.

**CONTRACT:** provider/device event → source record → sensor entity → unreviewed observation → numeric measurement → evidence. Product publication remains false until review/rights/evidence gates are satisfied.

**PROOF:** synthetic TEST_RECORD `TEST-20261017-OSLOFJORD-TOC-01` staged end-to-end, read back at POINT(10.55 59.45), preserved RESTRICTED_INTERNAL rights, UNKNOWN calibration, TEST_ONLY quality and `measurement_only` interpretation, then was deleted. No synthetic Oslofjord environmental measurement remains.

**NASA ROUTE:** MiniTOCA/STELLA/other sensor technologies may later feed this same protocol. Hardware selection, licence, freedom-to-operate and procurement fit remain separate decisions.

**TRUTH BOUNDARY:** measurement ≠ ecological condition; point ≠ area; missing observation ≠ absence; sensor identity ≠ ownership/manufacturer identity; unreviewed ≠ publication-ready.

**MAKER ≠ JUDGE:** database readback proves protocol behaviour only. It does not prove hardware performance, environmental validity, user demand or LIVE product presentation.


# ORCA COMPOUND ASSET — THREE-SURFACE CANONICAL BINDING — 17 OCT 2026

**STATUS:** HEIR ASSET-FAMILY CONVERGENCE / SPECIES + ATLAS BOUND / WILD SOURCE PANEL UPDATE REQUIRED FOR CLOSURE / NO LIVE RELEASE IMPLIED.

**OBJECTIVE:** prove that one canonical Orca asset family can serve multiple products without collapsing evidence classes.

**CANONICAL ASSET FAMILY:** `4p:species:orca:asset-pack:v1` → `/assets/species/orca/ASSET-MANIFEST.json`.

**SPECIES:** the Orca profile exposes the canonical asset-family ID and manifest while preserving photograph/illustration rights and representation boundaries.

**ATLAS:** only `Orcinus orca` WH4LES occurrence popups expose the asset-family link. The link is labelled representation context and never becomes occurrence evidence.

**WILD:** Prototype 04 already maintains a controlled asset-source panel and live/reference/candidate classes. Closure requires binding that panel to the same canonical ID/manifest without changing gameplay.

**TRUTH BOUNDARY:** shared asset identity ≠ identical geometry; game mesh ≠ measured anatomy; museum specimen reference ≠ 3D whale; occurrence record ≠ asset proof; photo ≠ live position.

**HUMAN SUCCESS:** a person can move from Orca in SPECIES or ATLAS to one transparent asset/provenance family, while WILD can use optimised game assets under the same family without pretending scientific equivalence.

**ROLLBACK:** parent HEIR `fb2f672d1ba1c6e801e73fa11b09824a73e9e990`.

**MAKER ≠ JUDGE:** contract/build/preview evidence required. LIVE and external asset redistribution remain separately gated.


# EXPO-03 — PLACE PUBLICATION + CANONICAL OWNERSHIP GATE — 17 OCT 2026

**STATUS:** RETURNED RELEASE DEBT / HEIR CORRECTION / INDEPENDENT GOLD REQUIRED / NO LIVE RELEASE IMPLIED.

**USER ARRIVES BECAUSE:** a person searching for a real place should reach only a source-grounded PLACE object whose public publication and canonical owner are explicitly authorised.

**ONE THING TO UNDERSTAND:** source/usefulness curation is not publication authority. `indexable=true` alone cannot publish a PLACE candidate.

**PRIMARY ACTION:** fail closed across sitemap, prerender, Places UI and species-to-place discovery until one inventory object simultaneously has `indexable=true`, `publicationState=READY_FOR_FOUNDER_RELEASE`, and `canonicalOrigin` equal to the configured public origin.

**P1 DOMINANT:** no `HEIR_CANDIDATE` PLACE appears in public discovery surfaces.

**P2 ORIENTATION:** direct candidate routes remain available on the HEIR for review, but carry `noindex,follow` and omit canonical/JSON-LD ownership claims.

**P3 ACTION / NEXT:** Founder/canonical authority may explicitly assign `canonicalOrigin` to an already reviewed `READY_FOR_FOUNDER_RELEASE` object; independent Gold then verifies the exact resulting artifact before any release.

**P4 DEPTH:** species and other discovery inventories retain their existing bounded rules; this correction applies only to PLACE publication debt.

**WHAT CAN BE REMOVED:** the false assumption that source curation, public release and canonical ownership are one boolean.

**WHAT MUST BE REUSED:** existing `discoveryInventory.json`, sitemap/prerender pipelines, `/places`, `/place/:slug`, SPECIES related-place projection and sole HEIR `king/test`.

**TRUTH BOUNDARY:** this correction assigns no canonical domain, promotes no publication state and submits no URL. Current inventory intentionally has zero publicly discoverable PLACE objects because canonical ownership remains unresolved.

**MOBILE-FIRST RISK:** no new layout or interaction is introduced; fail-closed empty discovery must remain truthful rather than backfilling candidates.

**HUMAN SUCCESS:** an unreleased PLACE cannot be inferred as public from sitemap, prerender, UI, related links, canonical metadata or JSON-LD.

**BASE / ROLLBACK:** `king/test@ca42d70c55a7cee1a1129b8a1518e7f9a288b8ed`; revert the bounded source/test/brief commit if independent Gold finds an authorised PLACE suppressed by a conflicting current authority.

**MAKER ≠ JUDGE:** Factory closes the code-path conflation only. Independent Gold judges the exact SHA; Founder retains canonical assignment and release authority.
# SPECIES — EXACT PATH CANONICALITY GATE — 17 OCTOBER 2026

**STATUS:** RETURNED `QA_CORRECT` IMPLEMENTED ON THE SOLE HEIR / INDEPENDENT GOLD REQUIRED / RELEASE HOLD / NOT LIVE.

**USER ARRIVES BECAUSE:** a person or crawler should reach only an intentional public SPECIES route, never a malformed alternate path that silently inherits another route's publication authority.

**ONE THING TO UNDERSTAND:** path normalisation is navigation convenience, not review or indexing authority.

**PRIMARY ACTION:** decide profile and public-route eligibility from the exact raw pathname and fail closed on every non-canonical variant.

**SECONDARY DEPTH:** preserve the existing source-bearing profile review lookup only after the exact one-segment lowercase slug contract passes.

**P1 / P2 / P3 / P4:** canonical route / explicit review state / public profile or discovery action / source and limitation detail.

**WHAT CAN BE REMOVED:** pre-authority slash collapsing, dot-segment removal, query/fragment stripping and encoded-path equivalence.

**WHAT MUST BE REUSED:** existing `profileReviewState`, `permitsSpeciesIndexing`, public-route allowlist, issue #145 and sole PR #131 `king/test` HEIR.

**TRUTH BOUNDARY:** this correction proves deterministic source behaviour only. It does not prove hosted HTTP/CDN behaviour, search-engine removal, browser rendering, independent Gold, deployment or LIVE state.

**MOBILE-FIRST RISK:** none introduced; no layout or interaction changes.

**HUMAN SUCCESS:** exact canonical routes retain their current behavior, while redundant/trailing slash, dot-segment, encoded, case-variant and helper-input query/fragment forms cannot inherit indexing permission.

**DONOR DECISION:** no donor or new route system; correct the current HEIR gate in place.

**BASE / ROLLBACK:** `king/test@c05da699dacd39009d32a38932f88a6e84d3f0d6`; revert this bounded router/test/brief commit if independent Gold identifies a legitimate canonical path that is suppressed.

**MAKER ≠ JUDGE:** Factory consumes the returned QA correction; independent Gold judges the exact resulting SHA. Founder/release authority remains separate.


---

# S4PIENS / COMPANY-GOLD-01 — CLIMATE TRACE PAGE-COVERAGE DISCLOSURE — 19 OCT 2026

**STATUS:** SOURCE-GRAIN INTEGRATION DEBT CORRECTED ON SOLE HEIR / INDEPENDENT GOLD REQUIRED / NO DEPLOYMENT OR LIVE RELEASE.
**USER ARRIVES BECAUSE:** a person comparing physical emitting sources in a human system needs to know what the ranked list covers and what was excluded.
**ONE THING TO UNDERSTAND:** the visible eight are ranked only from one bounded Climate TRACE response page, not from the full dataset.
**PRIMARY ACTION:** inspect the page-scoped source ranking with its year, gas, upstream, mappable and excluded counts.
**SECONDARY DEPTH:** open the existing Climate TRACE source drawer for source identity, rights and limitations.
**P1 DOMINANT:** the existing country-and-system source ranking.
**P2 ORIENTATION:** page scope, query year/gas, page limit/offset and exact upstream/mapped/dropped counts.
**P3 ACTION:** continue through the existing country and source paths without treating the sample as a dataset total.
**P4 DEPTH:** independent exact-head contract and browser verification before release.
**WHAT CAN BE REMOVED:** the ambiguous “up to eight sources shown” disclosure that hid response-page grain and coordinate exclusions.
**WHAT MUST BE REUSED:** COMPANY-GOLD-01, issue #148, the shared Climate TRACE proxy, S4PIENS SystemPage, PR #131 and sole `king/test` HEIR.
**TRUTH BOUNDARY:** counts describe this proxy response page only. They do not prove full Climate TRACE dataset coverage, legal-company ownership, responsibility, live emissions or national totals.
**MOBILE-FIRST RISK:** the added disclosure must remain readable without horizontal overflow; independent 390/430 browser evidence remains a release gate.
**HUMAN SUCCESS:** every ready ranking visibly names its year, gas, page limit/offset, mapped/upstream/excluded counts and non-dataset-total boundary; missing or inconsistent coverage metadata fails closed as unavailable.
**BASE / ROLLBACK:** `king/test@6729cf24a11719c59dea92bb5eaf7cf40ae688ff`; revert this bounded proxy/UI/contract/brief correction if independent Gold finds source-grain, layout or availability regression.
**MAKER ≠ JUDGE:** Factory corrects the integration debt; independent Gold judges the exact resulting SHA. Founder release and runtime verification remain separate.


---

# S4PIENS / COMPANY-GOLD-01 — COUNTRY-RANKING HEADER SCOPE — 19 OCT 2026

**STATUS:** RETURNED GOLD QA_CORRECT CLOSED BY MAKER ON SOLE HEIR / INDEPENDENT REGOLD REQUIRED / NO DEPLOYMENT OR LIVE RELEASE.
**USER ARRIVES BECAUSE:** a person choosing a country needs the section introduction itself to state what the ranking covers before interpreting the list.
**ONE THING TO UNDERSTAND:** this is a top-eight ranking from one bounded Climate TRACE response page, not the largest sources across a country or the full dataset.
**PRIMARY ACTION:** choose a country and inspect the page-scoped ranking with its exact coverage disclosure.
**WHAT CAN BE REMOVED:** “biggest physical sources” and “largest ... for one country” language that outruns the bounded query.
**WHAT MUST BE REUSED:** the existing Climate TRACE proxy coverage envelope, S4PIENS country journey, source drawer, COMPANY-GOLD-01, issue #148 and sole PR #131 HEIR.
**TRUTH BOUNDARY:** the header and detailed disclosure describe one fetched response page. They do not establish national completeness, company responsibility, live emissions or dataset-wide ranking.
**HUMAN SUCCESS:** before reading a result, a user sees that the view ranks no more than eight mappable sources from one response page and is not the full dataset.
**BASE / ROLLBACK:** `king/test@7dcd77c300c45922dc4060c66f3077c81126f2cf`; revert this three-file copy/contract/brief correction if independent Gold finds comprehension or layout regression.
**MAKER ≠ JUDGE:** Factory closes the returned wording defect; independent Gold judges the exact resulting SHA. Release and runtime verification remain separate.


# SPECIES — CANONICAL HOST REINFORCEMENT — 21 OCTOBER 2026

**STATUS:** AXE SEARCH QA RETURN CONSUMED ON SOLE HEIR / INDEPENDENT GOLD REQUIRED / NO DEPLOYMENT OR LIVE RELEASE.

**USER ARRIVES BECAUSE:** a person searching for a species should reach one stable public SPECIES page instead of competing legacy and product-domain URLs.

**ONE THING TO UNDERSTAND:** the clean `https://4species.com/{slug}` URL is the SPECIES profile; Living Systems interpretations remain distinct ecological routes.

**PRIMARY ACTION:** open the source-bearing species profile on 4species.com.

**SECONDARY DEPTH:** follow source, provenance and related 4PLANET routes without changing canonical ownership.

**P1 DOMINANT / P2 ORIENTATION / P3 ACTION / P4 DEPTH:** species identity / provenance state / source follow-through / independent search and release verification.

**WHAT CAN BE REMOVED:** trailing-slash duplicates and inherited upstream canonical metadata.

**WHAT MUST BE REUSED:** issue #145, AXE comment #6298950923, the existing 4SPECIES Worker, reviewed/source-bearing publication gate, sitemap, legacy `/species/{slug}` redirect, PR #131 and sole `king/test` HEIR.

**TRUTH BOUNDARY:** an HTML canonical plus HTTP Link signal and clean redirect reduce ambiguity; they do not prove Google re-selection, indexing, ranking, clicks, deployment, Gold or Founder acceptance.

**MOBILE-FIRST RISK:** none introduced; no visual layout or interaction changes. Browser and crawler readback remain required on the exact released artifact.

**HUMAN SUCCESS:** a valid source-bearing profile emits exactly one self-canonical clean 4species.com URL for GET and HEAD; trailing-slash and legacy aliases converge without collapsing Living Systems routes.

**BASE / ROLLBACK:** `king/test@83b71dc8ccefb550ce6e7c196ccf1c30271225ea`; revert the bounded Worker/test/brief commit if independent Gold finds a routing, metadata or public-profile regression.

**MAKER ≠ JUDGE:** Factory implements the bounded correction. Independent Gold must judge the exact resulting SHA, then authorised release control must bind any deployment to that SHA before Search Console follow-up.

# IMPACT — INFORMATION ROUTE TRUTH CLASSIFICATION — 21 OCTOBER 2026

STATUS: SOURCE QA DEFECT CORRECTED IN THE EXISTING IMPACT HEIR; INDEPENDENT GOLD AND AUTHORISED RUNTIME VERIFICATION REMAIN OPEN.

- USER ARRIVES BECAUSE: they need to distinguish ways to support ecological work from official source context.
- ONE THING TO UNDERSTAND: not every outbound project link is an action.
- PRIMARY ACTION: external_support remains labelled ACTION_ and uses the established action telemetry.
- SECONDARY DEPTH: external_information is labelled SOURCE / LEARN_ and uses distinct information telemetry.
- P1: keep organisation-owned support routes useful without claiming delivery, outcome or impact.
- P2: keep official information routes visibly informational.
- P3: unknown future action types fail closed as information.
- P4: preserve NATUREBRAIN identifiers, citations and review-state boundaries.
- WHAT CAN BE REMOVED: the blanket assumption that every non-empty action URL is an action route.
- WHAT MUST BE REUSED: the existing IMPACT HEIR, NATUREBRAIN projection, action IDs, route structure and analytics adapter.
- TRUTH BOUNDARY: external_support is an organisation-owned support route, not proof; external_information and unknown types fail closed as information and never emit action telemetry.
- MOBILE-FIRST RISK: the longer information label must remain legible without obscuring the outbound link.
- HUMAN SUCCESS: a visitor can tell whether a link supports work or only opens official context before leaving 4PLANET.
- BASE / ROLLBACK: king/test@70ae08b5b5594c3f967f77b35cead9a3bb2871f4.
- MAKER ≠ JUDGE: this correction does not supply Gold, merge, release or LIVE authority.

# 4PLANET STORY — SERVER-READABLE ORGANIC ENTRY — 22 OCTOBER 2026

**STATUS:** CONFIRMED MAX EXPOSURE DEFECT / BOUNDED HEIR CORRECTION / INDEPENDENT GOLD AND AUTHORISED RUNTIME VERIFICATION REQUIRED / NO LIVE RELEASE.

**USER ARRIVES BECAUSE:** an existing organic result can land directly on `/about/story`; the first response must explain why 4PLANET exists even before JavaScript runs.

**ONE THING TO UNDERSTAND:** the living planet is the system beneath human life, and 4PLANET exists to make that system easier to see, understand and help.

**PRIMARY ACTION:** read the existing 4PLANET Story, then continue to the existing System, beliefs or Join routes.

**SECONDARY DEPTH:** the client-rendered visual Story remains unchanged and continues to carry the fuller editorial experience.

**P1 DOMINANT / P2 ORIENTATION / P3 ACTION / P4 DEPTH:** existing Story headline / existing premise and truth boundary / existing About and Join links / the existing React Story after hydration.

**WHAT CAN BE REMOVED:** the empty generic app shell as the only server response for an already public, measured organic landing.

**WHAT MUST BE REUSED:** `AboutStory` wording and route, the existing discovery prerender helper, sitemap generator, PublicShell, Brand OS and sole `king/test` HEIR.

**TRUTH BOUNDARY:** this is an organisational purpose/story page. It claims no ecological outcome, partner relationship, delivered impact, live data or independent verification.

**MOBILE-FIRST RISK:** no visual layout or client interaction changes; the bounded risk is crawler/server parity. Exact-head build and runtime HTML readback remain required.

**HUMAN SUCCESS:** without JavaScript, the response contains one H1, substantive existing Story text, self-canonical metadata and working continuations; with JavaScript, the current visual Story remains unchanged.

**QUESTION / DELETE / SIMPLIFY / REUSE:** no new story or page. Delete the empty-server-response failure, reuse approved wording, and extend the existing prerender route set only.

**SIMPLEST CAPABLE EXECUTION:** deterministic build-time HTML projection plus exact source contract; no new service, content store, component or agent layer.

**DOOR CLASS / ROLLBACK:** reversible HEIR-only code change. Base and rollback are `king/test@62927cf68ef2a8b2b00293d603cf2e30571efa34`.

**MAKER ≠ JUDGE:** Factory may correct and verify the candidate. Independent Gold judges the exact SHA; deployment, search submission and LIVE release remain separately authorised.

**RETURN CORRECTION — 24 OCTOBER 2026:** Independent Gold found that the new client SEO owner used a different title and description from the existing server projection. The bounded correction keeps the server-approved Story metadata unchanged through hydration and adds source plus desktop/mobile browser parity coverage for raw response, hydration and SPA away/back. Visible Story copy and layout remain unchanged. Base/rollback is `king/test@f865ba226341f3af00452a7823b3474c90cfaf93`; independent re-Gold remains required.

**SECOND RETURN CORRECTION — 24 OCTOBER 2026:** Independent Gold correctly rejected unconditional raw/client robots equality on preview hosts. The existing Cloudflare middleware already applies `X-Robots-Tag: noindex, nofollow, noarchive` and `Cache-Control: no-store` to `test.4planet.org`, `*.pages.dev` and localhost responses while leaving `4planet.org` indexable. This correction adds an exact `/about/story/` raw-response regression on that owning middleware path and makes the browser proof environment-aware: the prerendered production artifact remains indexable, preview hydration must be noindex, and title, description, canonical path and owned graph remain stable through SPA return. No global `_headers` noindex is added. Base/rollback is `king/test@5bf9e998b4187256444c7016053e50d70d1a0368`; independent re-Gold remains required.

# FLAGSHIP JOURNEYS — SOURCE HTML SEARCH + SHARE METADATA — 23 OCTOBER 2026

**STATUS:** CONFIRMED MAX EXPOSURE DEFECT / BOUNDED HEIR CORRECTION / INDEPENDENT GOLD REQUIRED / NO LIVE RELEASE.

**USER ARRIVES BECAUSE:** a search result or shared link leads directly to the existing Jaguar or Orca journey.

**ONE THING TO UNDERSTAND:** each page is a distinct, source-linked journey from one animal into its surrounding living system.

**PRIMARY ACTION:** enter the existing Jaguar rainforest journey or Orca ocean journey.

**SECONDARY DEPTH:** follow the existing evidence, ecosystem, place and action seams already inside each journey.

**P1 DOMINANT / P2 ORIENTATION / P3 ACTION / P4 DEPTH:** existing animal journey / unique species-and-system description / enter journey / existing evidence and ecosystem layers.

**WHAT CAN BE REMOVED:** the generic or missing search/share summary that makes two materially different journeys indistinguishable outside the rendered page.

**WHAT MUST BE REUSED:** the existing static journey documents, exact canonical routes, page titles, user-entry audit, issue #483 and sole `king/test` HEIR.

**TRUTH BOUNDARY:** metadata describes the existing source-linked journeys only. It does not claim live tracking, measured ecological outcome, independent impact or editorial Gold.

**MOBILE-FIRST RISK:** no rendered layout, interaction or asset changes; risk is confined to document-head metadata and must be checked in built HTML.

**HUMAN SUCCESS:** search and share surfaces can distinguish Jaguar from Orca before entry, while the current journeys render and behave unchanged.

**QUESTION / DELETE / SIMPLIFY / REUSE:** no new page, story or component. Add the missing document metadata at the owning static paths and lock exact canonical/Open Graph parity in the existing discovery contract.

**SIMPLEST CAPABLE EXECUTION:** deterministic HTML head tags plus one same-path regression; no new service, schema store, route or agent layer.

**DOOR CLASS / ROLLBACK:** reversible HEIR-only source change. Base and rollback are `king/test@14b763166af1cd760df1cb4c537445ba5f2d3389`.

**MAKER ≠ JUDGE:** Factory may correct and verify the candidate. Independent Gold judges the exact SHA; merge, deployment, indexing and LIVE release remain separately authorised.

# LIVING SYSTEMS — GENERATED-ROUTE AUDIT IMMUNITY — 23 OCTOBER 2026

**STATUS:** INDEPENDENT GOLD QA_CORRECT / BOUNDED EVALUATOR REPAIR / RELEASE HOLD.

**USER ARRIVES BECAUSE:** a visitor or crawler follows the existing public Living Systems entry.

**ONE THING TO UNDERSTAND:** the audit must prove the canonical route is active in the sitemap route set, not merely present as inert source text.

**PRIMARY ACTION:** retain the existing `/livingsystems/` public entry and its current journey.

**SECONDARY DEPTH:** preserve the existing redirect alias, analytics classifiers, sitemap output and public experience unchanged.

**P1 DOMINANT / P2 ORIENTATION / P3 ACTION / P4 DEPTH:** existing Living Systems entry / canonical route truth / enter the product / existing systems content.

**WHAT CAN BE REMOVED:** the false-positive source-substring evaluator that accepts a commented-out route.

**WHAT MUST BE REUSED:** issue #483, PR #131, the current sitemap generator, user-entry audit, analytics contract and sole `king/test` HEIR.

**TRUTH BOUNDARY:** a passing active-route audit proves only that the canonical is present in the generator's active static route array. It does not prove deployment, HTTP redirect behaviour, indexation, traffic, user use or Gold acceptance.

**MOBILE-FIRST RISK:** none; no rendered markup, styling, interaction or route output changes.

**HUMAN SUCCESS:** a future accidental comment/removal of the canonical route fails the audit before release while the existing public product remains unchanged.

**QUESTION / DELETE / SIMPLIFY / REUSE:** replace raw substring presence with deterministic syntax-tree extraction of the active array and lock the escaped failure with one isolated negative mutation.

**SIMPLEST CAPABLE EXECUTION:** one audit correction plus one same-path failing-first regression; no new service, store, route, page or product branch.

**DOOR CLASS / ROLLBACK:** reversible HEIR-only evaluator change. Base and rollback are `king/test@def5bef1c70b8fdb06112149fecfe8b1eb784d40`.

**MAKER ≠ JUDGE:** Factory repairs and verifies the evaluator. Independent Gold must re-run the exact negative mutation against the returned SHA; merge, deployment and LIVE release remain separately authorised.

# DISCOVERY SITEMAP — STANDARDS-VALID XML EVALUATION — 23 OCTOBER 2026

**STATUS:** INDEPENDENT GOLD QA_CORRECT / BOUNDED EVALUATOR CORRECTION / RELEASE HOLD.

**USER ARRIVES BECAUSE:** visitors and crawlers depend on the existing sitemap to expose the public 4PLANET routes without accepting malformed XML as evidence.

**ONE THING TO UNDERSTAND:** route coverage is evidence only when the emitted sitemap is a standards-valid, namespace-correct XML document.

**PRIMARY ACTION:** retain the current public discovery routes and their exact canonical URL identities.

**SECONDARY DEPTH:** preserve the existing comment, CDATA, namespace, origin, query, fragment and raw-path regression matrix.

**WHAT CAN BE REMOVED:** the bespoke lexical XML approximation that accepted duplicate expanded-name attributes, reserved namespace rebinding and raw XML 1.0 control characters.

**WHAT MUST BE REUSED:** issue #483, PR #131, the current sitemap generator, user-entry audit, full analytics/discovery contract and sole `king/test` HEIR.

**TRUTH BOUNDARY:** a passing evaluator proves standards-valid emitted XML and required canonical entries at build time. It does not prove deployment, indexing, traffic, user use, Gold acceptance or ecological outcome.

**MOBILE-FIRST RISK:** none; the correction changes only build-time audit parsing and regression fixtures, not public markup, layout, interaction or navigation.

**HUMAN SUCCESS:** malformed sitemap evidence fails before release while the valid current sitemap and existing public routes remain unchanged.

**ROOT CAUSE / FAILED TEST:** the hand-built tokenizer compared raw attribute names and omitted reserved namespace and raw-character constraints. Gold reproduced five false accepts against `a6fcf5e7188a09d3c28112d7ed5bc38ebccef1fc`; permanent failing-first fixtures now cover all five cases.

**SIMPLEST CAPABLE EXECUTION:** replace only the bespoke tokenizer with the small namespace-aware `saxes` XML 1.0 parser, retain the existing semantic sitemap checks and add the five owning-path regressions.

**DOOR CLASS / ROLLBACK:** reversible HEIR-only evaluator change. Base and rollback are `king/test@a6fcf5e7188a09d3c28112d7ed5bc38ebccef1fc`; revert the bounded parser/dependency/test/brief commit if independent Gold finds regression.

**MAKER ≠ JUDGE:** Factory corrects and verifies the candidate. Independent Gold must judge the exact returned SHA; merge, deployment, indexing and LIVE release remain separately authorised.

# FACTORY RETURN — ABOUT STORY HYDRATION CANONICAL (ISSUE #483)

**USER PROBLEM:** `/about/story` is server-readable and carries a self-canonical in prerendered HTML, but React hydration removes that canonical because the routed Story component does not own page metadata through the shared `Seo` manager.

**BOUNDED CORRECTION:** reuse the existing `Seo` manager on `AboutStory`, keep the existing Story design and text unchanged, and add source plus browser regression coverage proving the hydrated route retains `/about/story`, one owned AboutPage graph and the existing H1.

**TRUTH / RELEASE BOUNDARY:** this is a HEIR candidate on issue #483 and PR #131. It does not assert Gold, merge, deployment, indexation or user use. Independent Gold must judge the exact candidate SHA; Founder authority remains required for release.

**ROLLBACK:** revert the bounded Story metadata/test/brief commit if independent Gold finds an ownership, canonical or structured-data regression.

