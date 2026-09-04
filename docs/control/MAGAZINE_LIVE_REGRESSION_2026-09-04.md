# Magazine live regression — 2026-09-04

## Outcome

The exact **Public Launch Gold 01** Magazine candidate was restored to the isolated Magazine deployment source and verified at https://4planetmagazine.com/.

- Candidate commit: `d27c841d3f15f26bf4feb7de3916a6a5fffe1795`
- Candidate tree: `5e645a7a502bf26e1ccc7d01abf554832eb240da`
- Restoration commit: `4145e04dfc65be67d3f9f3e164fe9d15cd343914`
- Immutable candidate deployment: https://feb9a95c.4planet-05.pages.dev
- Production surface: https://4planetmagazine.com/
- `king/test` and `main`: untouched
- Donor history: preserved

## Incident

The long white/black/blue Magazine front page was silently replaced by an older, shorter Magazine build.

Root cause: the production worker followed the mutable branch deployment URL for `recovery/testking-magazine`. A later sync moved that branch to older Magazine source. The branch name was treated as release identity even though its commit had changed.

Failure class:

- `MOVING_POINTER_AS_RELEASE_IDENTITY`
- `STALE_CANDIDATE_PROMOTION`
- `SILENT_PRODUCT_REGRESSION`

## Recovery evidence

Production returned the exact launch marker `4PLANET_MAGAZINE_PUBLIC_LAUNCH_GOLD_01`. The deployed Magazine bundle contains the Gold front-page signatures:

- `The world is alive. So is the story.`
- `Worth your attention.`
- `mag-story-mosaic`
- `Signals worth watching.`
- `Reasons to come back.`
- `The tools are getting stranger. Good.`
- `Meet 4PLANET ATLAS.`

Home, archive, about, topic, and article routes returned HTTP 200 after restoration.

## Regression immunity

The deployment workflow is pinned to the immutable Gold deployment and candidate SHA. A prebuild lock now checks the Git blob identity of 66 material Magazine files. Any missing or changed locked file fails the build before deployment, leaving the last successful production deployment in place.

A future Magazine candidate must be promoted explicitly by updating the immutable candidate identity and lock together.
