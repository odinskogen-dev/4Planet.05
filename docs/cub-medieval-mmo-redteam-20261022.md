# CUB GAME LAB — MEDIEVAL MMO RED TEAM 2026-10-22
STATUS: FOUNDATIONAL ARCHITECTURE NOT YET A FUNCTIONAL MMO.
Project PRJ-ODIN-003. Zero new subscriptions. Existing ROMA and MEDIEVAL original release hashes stay protected.

## Reviewed evidence
- Founder screenshot IMG_0715.jpeg: fullscreen battle with unit insignia, mineral HUD and build/worker/army/castle controls; no campaign or player-owned settlement at game entry.
- Founder ROMA_CHALLENGER_01 6.zip: game source with src/campaign/state.js, world_data.js, mapView.js, mode.js, and RTS engine. Uploaded exact build SHA-256 `13409bae3a5bbb4bd75f85b257c223068d0eb203d18cd4dd402e9e80fba580e2`.
- MEDIEVAL CH05 Cloudflare game: RTS sandbox with AI, settlements/builds, recruitment, local saves, castle capture.
- Cloudflare `cloudflare/cub-mmo/realm.js`: bounded shared metagame with 40 guest identities and resource ledger; disconnected from the 3D RTS simulation. `site/medievalmmo/realm-client.js` is a separate client UI, not a unified strategy game.
- AppDeploy medieval MMO prototype: separately hosted account system and persistent resources, not canonical with Cloudflare or ROMA.
- ROMA06 campaign local 5-year simulation: 160 provinces, 62 faction IDs, 140 armies at end, no invalid numerical resources/armies, 83,896-byte save. Five unit tests (battle/bridge/builders/spawn/wallgap) passed.

## P0 FAILURES
1. PRODUCT LOOP: /medievalmmo launches an RTS battle/scenario; no kingdom/world campaign as primary user experience.
2. STATE: at least three unconnected state sources (local browser RTS, AppDeploy backend, Cloudflare DO realm); identity/save conflicts inevitable until canonical ownership is defined.
3. ONLINE PROOF: tactical combat remains local, not a multiplayer-battle server. No 2 independent users' battlefield proof or reconnect outcome.
4. IDENTITY: guest bearer key in localStorage can be lost, no unified CUB ID, no secure user-account linking or cross-game ownership.
5. SECURITY: campaign state.js build(pid,k) and recruit(pid,type) do not take/validate the acting player. This permits arbitrary local state edits; cannot expose these as game-server commands without per-request verified actor binding. This is a confirmed test failure for future MMO trust boundaries, not remote exploitation of a deployed backend.
6. CONTENT: ROMA06 campaign is 264 BC with Roman/other classical factions. It is not medieval simply because the map contains Europe and the Levant.
7. VISUAL UX: battle badges and double resource HUD dominate mobile; there is no persistent-city first-touch experience or relevant kingdom tutorial.
8. HISTORICAL DESIGN: ROMA06 has 160 geographic provinces but no actual medieval era geography, population, trade, settlements and faction roster.
9. DEPLOY PIPELINE: exact game sources built by GitHub Actions, while AppDeploy deploy budget and separate source versions may diverge. Each public release must identify its source hash and tested engine.
10. RIGHTS: licenses present in ROMA ZIP; a released medieval derivative still needs license inventory and truthful attribution confirmation.

## GREEN ASSETS TO PRESERVE
A. Existing Three.js/WebGL RTS engine, tactical formations, camera, construction and animated troops.
B. ROMA06 Imperium campaign state, province map engine, marching, province economy, diplomacy, sieges, auto-resolve and handoff to 3D battles. This is a strong single-player strategy foundation.
C. Cloudflare Durable Objects experimental online metagame design; secure and extend rather than layering another separate economy.
D. Static Cloudflare hosting at lab.p4nther.com with verifiable releases, original game SHA guardrails and regression tests.

## LOCK PRODUCT MODEL
Game opens the *persistent world* at player's own medieval castle.
- Realm layer: authenticated CUB ID, territory, provinces, trade, ownership, alliances, economy, clock, quests, purchases (disabled).
- Settlement layer: enter your actual place, construct buildings on 3D terrain, assign workers, train troops. Server records confirmed actions; deterministic timestamps for offline production.
- Battlefield layer: take a persistent army into a tactical instance. Result returns to realm transactionally with losses, loot and territorial changes; no client-supplied victory outcomes.
- Shared history: one canonical server state; no separate AppDeploy/Cloudflare resource ledgers for the same account. A match can support 2-8 humans initially; 10k registered users is not 10k concurrent.

## BUILD ORDER / DEFINITION OF DONE
P0. Choose one era: Third Crusade / Levant around 1191 CE. Lock small playable region with historically sourced settlements/factions. Do not relabel a 264 BC map as 1191 CE.
P1. Put ROMA06 campaign on a safe separate test URL at /roma/imperium-v6; validate browser and exact SHA. Retain current medieval fullframe RTS until conversion verified.
P2. Extract source-canonical campaign, change time scale, faction data and units to medieval; implement player-owned capital as an actual enterable 3D settlement.
P3. Give the 'Play' action three useful choices in a full-screen game: CONTINUE KINGDOM (world), NEW KINGDOM (choose house and region), SKIRMISH (existing RTS). This is not a marketing site or popup.
P4. Implement authoritative realm API: verified player ID, idempotent orders, per-player authorization, atomic cost+ownership updates, unique settlement slots, anti-cheat receipts, versioned saves, migration and deletion.
P5. Complete multiplayer test with two real accounts: both see towns, A constructs, B sees authorised state, A trades, reconnect retains state, unauthorized actions rejected.
P6. Integrate battle results with stored world transaction; server computes/validates outcome. Reconcile disconnects. Two-human real-time tactical battle remains a separate stretch milestone.
P7. Only then public alpha and growth; do not call any phase 'MMO live' until proven shared world.

## RELEASE PROOFS
- Existing ROMA and MEDIEVAL SHA checks unchanged.
- New ROMA06 campaign route isolated and exact-byte verified, QA with desktop/mobile 160-province view.
- One playable history campaign asset exists; this does NOT upgrade /medievalmmo to persistent medieval MMO.
- Manual iPhone gameplay review required; automated emulation cannot certify framerate.
