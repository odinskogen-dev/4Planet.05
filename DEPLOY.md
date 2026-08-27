# DEPLOY — 4PLANET Public World (V19.1.0)

## Cloudflare Pages
Preset **None** · build `npm run build` · output `dist` · `NODE_VERSION=20`. SPA via `public/_redirects`. Pages Functions from repo-root `functions/` → `POST /api/leads`.

## Lead capture env (set server-side)
- `LEAD_WEBHOOK_URL` — forward validated leads (Make/Zapier/Brevo/HubSpot…).
- `LEAD_WEBHOOK_SECRET` — optional shared secret.
Configured → forms return delivered:true ("You're on the list…"). Absent → delivered:false ("Interest registration is opening soon… not collecting yet"). Never a fake success. Before launch, submit one test lead each from /people, /brands, /partners, /funders and confirm `workArea`/`fundingInterest` arrive.

## Local
```
npm ci
npm run typecheck
npm run build
npm run assets:verify
```
