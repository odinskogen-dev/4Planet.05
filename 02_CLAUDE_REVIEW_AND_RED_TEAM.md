# RED TEAM: CAMPAIGN QUALITY AND BUGS
Evidence basis: direct source inspection of the campaign AppDeploy snapshot. Not a claim of completed manual playtesting.

## P0 — Must fix before claiming the first playable chapter is premium
RT-01 INACCURATE COST LABELS. renderUI in campaign.js shows partial costs. Actual develop() costs:
Farm = 45 wood + 45 treasury.
Granary = 65 wood + 25 stone + 35 treasury.
Fortification = 70 wood + 60 stone + 65 treasury.
Recruit 150 = 95 treasury + 65 food + 28 iron + 150 manpower; requires a Roman army on site.
Display ALL actual costs from a shared manifest; affordability and projected impact, never divergent literals.

RT-02 HIDDEN ESSENTIAL RESOURCES. HUD only shows food/treasury/manpower/senate. Wood, stone, iron can be spent but are invisible; add simple expandable resource display and deltas.

RT-03 FALSE MISSION VICTORY. In calculateBattle(), any victorious Roman encounter sets state.grainSafeguarded=true, clears the Canusium-Cannae blockade and raises the strategic objective, regardless of actual battle location. Gate victory on actual map state and route. Do not edit tactical engine.

RT-04 ARMY VISUALLY TELEPORTS. Map paint uses army.move?.to || army.at, so moving troops are already shown at destination. Draw interpolated progress, accurate arrival, route and time while preserving backward-compatible saves.

RT-05 HOLLOW INVESTMENTS. Any granary count >0 gives the same tiny +3 grain boost. Fortification does not meaningfully affect the auto-resolve score. Loyalty underused. Make investment mechanically meaningful OR remove the button until it is. Show cause/effect.

RT-06 DEAD-END RESOURCE SUPPLY. Food/treasury tick, but wood/stone/iron are finite with no production/trade/scenario framing. Design an honest small closed-loop system or explicitly finite tactical campaign resources.

## P1 — User experience
RT-07 No strong first 30 seconds, three decisions, victory/defeat debrief or chapter progression.
RT-08 Drawn city-to-city lines are SCHEMATIC routes, not historically verified Roman road alignments; don't label as actual period roads.
RT-09 Modern 2016 imagery/modern land and river shapes can imply false ancient accuracy. Mark modern physical substrate vs reconstructed period layers.
RT-10 Enemy moves are predictable and limited; require recon/scouting, visible threat, at least two credible strategies.
RT-11 Most of huge canvas is outside active theatre; explain active Apulia vs future-scope regions.
RT-12 Many UI labels are 7–10 px, especially bad on phones; improve clear tap targets, hierarchy and map dominance.
RT-13 Saves are one browser localStorage entry and SAVED is displayed too eagerly. Introduce truthful status, backup/export, migration.
RT-14 Remote tile services lack production uptime promises; have timeouts, cache bounds, request throttling and visual fallback.
RT-15 Scaled armies are not historical and current static factions/dates are not a rigorous 216 BCE reconstruction.
RT-16 'SUMMER 216 BCE · DAY N' is a relative fictional campaign clock, not a sourced actual calendar.
RT-17 Daily gain/loss and recruitment impact have inadequate forecasts, logs and before-after explanations.

## Critical economic/route code details
campaign.js: economicDay() computes food from c.farms*11 + (c.granaries ? 3 : 0); consumption depends on Roman army count plus blocked road, plus treasury military upkeep. Supply recovers under friendly road conditions, otherwise drains; morale drops if supply low.
chooseMove() charges 20 food per march, uses ten hardcoded edge pairs, checks army and blockade, and sets move={from,to,left:days} with no original duration persisted.
movementDay() teleports an army's simulation position only when left reaches zero (correct logically); map renderer falsely shows destination from start (incorrect visually).
enemyTurn() only triggers occasional Cannae->Canusium threat after day 9. No map-scaled opponent.
calculateBattle() computes losses, changes morale, moves loser to another hardcoded town, and always declares Roman grain secured on a Roman victory.

## Premium test target
A newcomer must understand threat and timeframe, choose one of 2–3 meaningful trade-offs, provision/recruit/fortify, preview and issue march, see movement and its costs, resolve an authentic consequence without losing campaign state, earn a truthful chapter result and safely resume/retry. Target 15–30 genuinely interesting minutes, not simply 15 minutes of waiting.

Stop-ship: costs shown falsely; loss of player save; fake completed objective; moving army at impossible location; broken map without remote tiles; original 3D engine altered; controls inaccessible on mobile; invisible third-party credits; empty distant world presented as fully playable.
