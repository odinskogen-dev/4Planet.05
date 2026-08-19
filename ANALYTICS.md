# 4PLANET Analytics Baseline

Status: prepared on 2026-08-19 for the active ONE INTERFACE release line.

## Architecture

### Layer 1 — Cloudflare Web Analytics

Use Cloudflare Web Analytics as the privacy-first baseline for aggregate traffic and real-user performance. For the existing Cloudflare Pages project, enable Web Analytics in **Workers & Pages → project → Metrics → Web Analytics**. Cloudflare injects its beacon on the next deployment; no application code or site token is required for the Pages one-click setup.

Cloudflare Web Analytics is independent from the optional Google layer below.

### Layer 2 — Google Analytics 4

GA4 is optional and consent-gated. The application does not load `googletagmanager.com` unless:

1. `VITE_GA4_MEASUREMENT_ID` contains a valid `G-...` measurement ID; and
2. the visitor explicitly chooses **Allow analytics**.

Advertising storage, ad user data, ad personalisation and Google Signals remain disabled by the application configuration.

Set the Pages production environment variable:

```text
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

Then redeploy. Without this variable the GA4 code is dormant and no consent UI is shown.

## Canonical events

Automatically measured after analytics consent:

- `page_view` — SPA route view.
- `surface_view` — high-level 4PLANET product surface (`home`, `atlas`, `species`, `living_systems`, `impact`, `missions`, `culture`, `other`).
- `outbound_click` — external link domain and restrained link label.

Explicit product events can be added to any interactive element without adding new analytics code:

```tsx
<button
  data-analytics-event="species_open"
  data-analytics-label="Orca"
  data-analytics-surface="species"
  data-analytics-entity-id="orca"
>
  Explore Orca
</button>
```

Recommended controlled vocabulary as product surfaces mature:

- `species_open`
- `atlas_open`
- `living_system_open`
- `source_open`
- `mission_open`
- `impact_open`
- `solution_open`
- `join_start`
- `join_complete`
- `partner_interest`
- `founding_interest`

Do not send names, email addresses, free-text form contents, precise location, personal identifiers, or private query parameters as event parameters.

## Consent behaviour

Consent is stored locally as `4p_analytics_consent = granted | denied`.

- No GA4 configuration → nothing loads, no consent panel.
- GA4 configured + no choice → consent panel appears, Google stays off.
- Declined → Google stays off.
- Granted → GA4 loads dynamically and SPA measurements begin.

Changing the consent model requires privacy/legal review before production.

## Regression control

`scripts/analytics-contract.test.mjs` is part of `npm run test:smoke`. It asserts that the Google layer remains consent-gated, ad signals remain disabled, and the app shell retains route and custom-event measurement.

## Remaining account-side activation

Two account-side actions cannot be performed from repository access alone:

1. Enable Cloudflare Web Analytics for the Pages project.
2. Create/select a GA4 web data stream for `4planet.org` and place its `G-...` ID in the Pages environment variable.

Everything else in the website code is prepared for those activations.
