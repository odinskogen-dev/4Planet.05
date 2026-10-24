# ROMA CHALLENGER V17 — RELEASE ASSET VERIFICATION 2026-10-24

Authoritative binary is a permanent GitHub release, tag `roma-cub-v17-20261024`, file `roma-v17-web.zip`, ZIP SHA256 `e9b8cb9dc0e5d5dc294ad3ea681626a5393672b330f51a8c408db75e2651f288`, index SHA256 `c405047771b7d79da9f10080668ba85db78701ca57224b7024fe23976a096af8`.

This release is based on user-uploaded `ROMA_CHALLENGER_01 17.zip` and `HANDOFF TO GPT AXE 7.md`. This is V17 **package naming**; its included development history reaches Iteration 38. It has exactly 242 static publication files (one `index.html`, 240 NASA Blue Marble terrain JPEGs with verified dimensions and SHA256s, plus tile MANIFEST.json). Each tile is a relative path `tiles/rRcC.jpg` and must deploy to `/rome/tiles` alongside `/rome/index.html`.

Production from this branch proceeds by merging to `cub-roma-republic-v12-release-20261023`, which triggers existing Cloudflare workflow to download the immutable ZIP (with SHA lock) and overwrite only the `site/rome` runtime fallback; existing Cannae `/roma/`, Challenger08 `/roma/challenger-08/` and Challenger12 `/roma/challenger-12/` are preserved.

The Git source `site/rome/index.html` is a fallback redirect until build-time extraction, not representative of deployed content; any deployment MUST use the locked Cloudflare release workflow (not raw `site` folder alone).

Cross-checks: 240 tiles, valid per-file hash, exact index, both hostnames, homepage CTA and game page, old game hashes and browser saves. Do not report live before Cloudflare job success.

No separate paid service, new spend or unrelated game edits. Physical iPhone Safari testing still pending even if automated mobile emulation succeeds.
