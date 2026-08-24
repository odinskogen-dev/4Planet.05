# 4PLANET Analytics Release Gate

Status: production control rule. This file does not by itself activate Google Analytics or authorise a live deploy.

## Required before a public 4PLANET hostname is considered measurement-ready

1. The hostname is explicitly listed in the production analytics allowlist.
2. `VITE_GA_MEASUREMENT_ID` is configured in the production build environment.
3. `VITE_ANALYTICS_DOMAINS` is either omitted to use the controlled default set or explicitly lists the approved production hosts.
4. `pages.dev`, localhost and other preview/test hosts remain excluded from GA4.
5. Optional GA4 loads only after explicit consent.
6. Consent Mode keeps analytics storage denied until consent and keeps advertising storage, ad-user-data and ad-personalisation denied.
7. SPA route changes emit `page_view` without automatic duplicate page views.
8. Product events use the shared analytics layer and must not contain names, email addresses, free text, exact coordinates or raw source payloads.
9. Cross-domain linking is configured across approved 4PLANET-controlled domains.
10. Cloudflare Web Analytics is enabled independently as cookie-free aggregate traffic/performance measurement where supported.
11. `/privacy` accurately describes the deployed measurement behaviour.
12. Search Console/SEO and basic runtime-error monitoring are checked as part of the same public release gate.

## Controlled production hostname set

- `4planet.org`
- `s4piens.com`
- `4species.com` — currently redirect-only; GA4 applies only if it serves public HTML later
- `cre4tors.com`
- `4planetmarket.com`

`www.` variants canonicalise to the same hostname. Additional hosts require an explicit config change; they are not implicitly trusted.

## GA4 activation dependency

The application is deliberately fail-closed. Without a real `VITE_GA_MEASUREMENT_ID`, it sends no GA4 traffic and shows no GA4 consent banner. The Measurement ID must come from a 4PLANET GA4 web data stream owned by the correct Google Analytics account.

Recommended GA4 structure: one 4PLANET property, one web stream used across the controlled 4PLANET domains, with hostname available for domain-level reporting and cross-domain measurement configured for the same controlled host set.

## Core measurement contract

Required baseline signals:

- `page_view`
- product entry and meaningful use
- SPECIES profile use
- ATLAS search / source-record open / layer interaction
- journey start / progress / completion
- Magazine article entry / reading depth / completion / share
- JOIN or enquiry interest once those actions are genuinely active
- external partner/source link use
- checkout/payment only after real commerce is production-authorised

Do not mark a future or inactive action as a conversion merely because an event name exists in code.

## Live verification

After production configuration and deploy:

1. open each live hostname in a clean browser state;
2. confirm no GA request before consent;
3. grant analytics consent;
4. confirm the `gtag/js` request and GA4 collect request use the intended Measurement ID;
5. navigate between SPA routes and confirm one page view per route;
6. traverse between controlled domains and verify one cross-domain session where supported;
7. confirm `pages.dev` preview hosts do not emit GA4;
8. confirm Cloudflare Web Analytics reports the intended HTML-serving domains;
9. verify Realtime/DebugView before declaring analytics LIVE.
