# ROMA: THE REPUBLIC — ITERATION 59 / CUB production
Date: 27 October 2026.

Requested source: user-uploaded ROMA_CHALLENGER_01_iter59 2.zip, single-file ready-to-publish HTML from ROMA_CHALLENGER_01/publish/web/index.html. Exact bytes: 9,968,709. SHA-256: 4f07165fe3bc21f557e547d7eb349b16ccb38965619c1eba0e4c65b311d53811.

Source transport: 17 base64-encoded LZMA segments under site/rome/source/iter59; concatenated length 5,939,496; LZMA binary length 4,454,620, SHA-256 20619ec76b98eeb9e960dee2df1f48e169e978eb98d1a770344de632a2ea2f68. GitHub Action reconstructs source exactly with hash checking; strips transport from released static worker bundle.

Existing immutable ROMA V17 NASA terrain release is reused without changing art: roma-cub-v17-20261024 / roma-v17-web.zip, sha e9b8cb9dc0e5d5dc294ad3ea681626a5393672b330f51a8c408db75e2651f288, manifest 240 files with individual SHA verification. The Iter59 archive itself contains no tiles. Game references relative tiles/rNcN.jpg, matching this layout.

The existing cub-lab-p4nther Cloudflare Worker is the ONLY production target. The existing /rome/ URL replaces Iter54; /roma/ Cannae, /roma/challenger-08/, the retired Challenger12 redirect, and all other games remain untouched. Both / and /games/roma/ link to /rome/, now labelled Iteration 59.

Release requires green isolated preflight then green pre-existing full CUB production workflow, successful Cloudflare deployment, exact SHA proof on worker plus singular and plural domains, links check and original-games checksum. Automated browser smoke is a minimum, not physical iPhone Safari QA; commercial asset rights are a separate approval gate.
