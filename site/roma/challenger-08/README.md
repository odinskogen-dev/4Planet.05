# ROMA Challenger 08 — isolated release candidate (23 October 2026)

Founder supplied `ROMA_CHALLENGER_01 8.zip` containing an actual self-contained Vite/Three.js game. It includes the **Imperium** campaign opening in 264 BC and **Cannae** tactical scenario in 216 BC.

The upload's original browser game SHA256 was `6ce526a7bbb95d1c57fad3c798d91d5a8e49986dcf63609a60b5db6ecd39b36c`.
The standalone release game is identical apart from two localStorage prefix replacements and title/meta description clarification. Release SHA256 is `fc5d999bf0099ab0e99523f76019f0f8b1089da678558c1d0f2c7d8c78ba949e`.
Old `/roma/` game source SHA256 `3135d7a68083a013e90735266240a05d1a15dceb87cde2002520832cf9b42ae3` is immutable. Never overwrite it.

Release target `/roma/challenger-08/`; tests create generated `index.html` in CI. Source blob parts are stored under `source/` in GitHub only and removed before Cloudflare publication. Homepage and product detail offer two independent play buttons.

Known limitations:
- Local-only saves; no cross-device profile or online PvP.
- Source archive README and QA screenshots were provided by the producer and should not substitute independent production smoke test.
- Historical world map is approximate in some regions; campaigns and tactical battle interaction require extended real player QA.
- CUB legal/asset review should still validate every third-party texture, model and attribution before wider marketing.
