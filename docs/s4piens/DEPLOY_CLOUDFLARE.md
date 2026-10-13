# S4PIENS Human Systems 01 — DEPLOY (Cloudflare)

Status: **OUTPUT RECEIVED / AWAITING GPT AUDIT.** Not LIVE. Release needs Founder authority.
Branch `claude/s4piens-human-systems-01` (stacked on `claude/4nation-country-object-01`, PR #444). Merge #444 first, then this PR, both into `king/test`.

## How s4piens.com is served (verify in Cloudflare)
The repo treats `s4piens.com` as a custom domain of Pages project **`4planet-05`**: `functions/_middleware.js` has a `PUBLIC_HOSTS["s4piens.com"]` entry (title, description, canonical, sitemap) and `src/identity/identityClient.ts` already trusts the origin. There is no separate Worker for s4piens.com in `ops/`.
**AXE: confirm in Cloudflare → Workers & Pages → 4planet-05 → Custom domains that s4piens.com points at the production deployment.** If it points elsewhere (a Worker or another project), route it to the 4planet-05 deployment that contains this build.

## Build
Same project as 4NATION: build `npm ci && npm run build`, output `dist`, Node 22 (`NODE_VERSION=22`), Functions from `functions/`. No new env vars. Uses existing `/api/climate-trace` (env `CLIMATE_TRACE_BASE` optional, defaults to `https://api.climatetrace.org/v7`).

## Preview
```bash
npm ci && npm run build
npx --yes wrangler@4.128.0 pages deploy dist --project-name 4planet-05 \
  --branch claude-s4piens-human-systems-01 --commit-hash "$(git rev-parse HEAD)" --commit-dirty=false
```
Dashboard alternative: Workers & Pages → 4planet-05 → Create deployment → upload `dist/` to a preview branch.

Review on the preview origin (path form):
- `/human-systems` — home (human + needs orbit)
- `/human-systems/system/food` — FOOD; try `?step=production&c=BR`
- `/human-systems/system/energy-and-industry?step=processing&c=NO`
- `/4nation/country/norway` — check the cross-link both ways

On s4piens.com the same pages are host-root: `/`, `/system/food`, `/system/energy-and-industry`.

## Production
Production on s4piens.com = the 4planet-05 production deployment (from `king/test` per the existing release practice). No worker switch is needed, unlike 4nation.org. Founder go required.

## Post-deploy checks (real data)
- Climate TRACE country lens: NO / BR / CN / US for Agriculture, Power, Fossil-fuel operations and Manufacturing return ranked sources with t CO₂e and year. If a sector returns `EMPTY_OR_CONTRACT_MISMATCH`, the UI says so (not zero). **Verify the v7 sector ids `agriculture`, `power`, `fossil-fuel-operations`, `manufacturing`** against the Climate TRACE API.
- Atlas embeds render and layer chips change the map; "Open in full ATLAS" works.
- `https://s4piens.com/sitemap.xml` lists `/`, `/system/food`, `/system/energy-and-industry`; system pages have their own canonical.
- Sign in round trip returns to the same URL.
- WebKit: `node scripts/nation-visual-qa.mjs <url> qa-s4 --s4piens --browser=webkit`.

## Rollback
`git revert` the PR. The middleware change only affects s4piens.com metadata; the previous home metadata is restored by the revert.
