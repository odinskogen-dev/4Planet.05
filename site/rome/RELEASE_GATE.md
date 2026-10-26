# CUB LAB — ROMA iteration 54 release gate (26 October 2026)

Production assembly target: /rome/ on cub-lab-p4nther Cloudflare Worker, via existing GitHub Actions branch cub-roma-republic-v12-release-20261023.

Authoritative single-file game: ROMA_CHALLENGER_01_iter54(1).zip, publish/web/index.html, length 9864877 bytes, SHA256 c2fd5cf171f873cd48a772732cba78b684adab3612d18816e864af162ff44164. Gzip length 4920646, SHA256 a7f1f398e3ccfbb8d8fc0c33a5a242c32fcabb82224255cb9150fd4d10e6804a. Base64 in 19 verified chunks (6560864 characters). This archive has no public/tiles payload: it reuses the 240 unchanged verified NASA terrain tiles from the immutable ROMA V17 GitHub release. The build script verifies them before publishing.

Only target site/rome runtime and entry labels in site/index.html and site/games/roma/index.html. Preserve /roma/ original Cannae, /roma/challenger-08/, retired /roma/challenger-12/ redirect, other games, static assets, domain bindings, and existing cloud worker. Existing site/rome/index.html in Git is the fallback; production reconstructs the game during the GitHub Action. Do NOT deploy raw site/ without workflow assembly.

Production success requires GitHub Action success AND both lab.p4nther.com and labs.p4nther.com responding with exact SHA, game index, map tile, homepage and ROMA page. iPhone Safari physical FPS check and independent licensing review remain separate release risks.
