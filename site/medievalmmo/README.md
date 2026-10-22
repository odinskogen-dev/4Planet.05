# MEDIEVAL KINGDOMS MMO / game-first candidate 01

This path hosts a complete playable Three.js tactical battle + settlement game, not a marketing page or iframe. The release workflow builds it from the currently verified MEDIEVAL KINGDOMS CH05 3D engine (itself based on ROMA Challenger 01 and earlier medieval patches), so all existing medieval/ROMA source routes remain unchanged.

## Founder-supplied source provenance
The founder supplied a later ROMA_CHALLENGER_01 5.zip and MEDIEVAL_KINGDOMS_PREMIUM_BUILD_03(2).zip on 22 Oct 2026. The later 2.64 MB ROMA single-file game was inspected separately. It is not yet present as exact bytes in GitHub hosting; DO NOT claim this hosted derivative is from that latest exact binary until the newer code is integrated.

## Product status
- **Verified target**: first actual full-viewport playable 3D RTS at `https://lab.p4nther.com/medievalmmo/`.
- **Gameplay**: terrain, buildings, soldiers, formations, economy, construction, tactical combat, local saves.
- **Not implemented**: server-authoritative multiplayer, unified CUB ID, persistent shared campaigns, PvP between authenticated humans, economy server synchronisation.
- **Technical guardrails**: no new subscriptions, no modifications to ROMA original or MEDIEVAL Build03; save namespace isolated, no false login badge or paid content.
- The retired /medivalmmo/ URL redirects to this full game route.

## Next P0
1. Integrate the founder's *newer* ROMA source, with medieval gameplay conversion audited.
2. Authoritative multiplayer lobby, identities, saves and order replay with websocket synchronization.
3. Battle commands must be server-verified, with a turn/event reconciliation layer and two independent identities.
4. Verify the actual game on physical iPhone, Chrome and desktop; performance metrics in battle.
