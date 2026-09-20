# CURRENT GOLD BRIEF

This file is the machine-readable human contract for the **current bounded TEST KING change**. Historical briefs belong in issue/PR evidence; this file always reflects the current mutation.

**CHANGE ID:** 4SAPIEN-CORE-FINANCE-01-2026-09-20

**STATUS:** HEIR / TEST-ONLY / PERSONAL ECONOMY CORE / NO PRODUCTION LIVE RELEASE

**BASE AUTHORITY:** `king/test` / sole HEIR integration line

**LIVE IDENTITY:** `https://4sapien.com/` remains unchanged; LIVE promotion is outside this change

**FOUNDER DIRECTION:** make personal economy useful in practice first; add legal/provider-ready bank connectivity and manual portfolio value without widening into a generic Life OS.

## USER ARRIVES BECAUSE
A person wants one honest view of the money they can use, what they owe, and what their manually entered investments are worth now.

## ONE THING TO UNDERSTAND
4SAPIEN can calculate a useful personal money picture immediately from user-entered facts. Bank data is shown as connected only after an authorised account-information provider and explicit user consent exist. Four bank refreshes per day is a target constrained by the bank/provider, never a universal guarantee.

## PRIMARY ACTION
Add or update an account or holding and immediately see recorded liquidity, debt, portfolio cost, current market value and unrealised change.

## SECONDARY DEPTH
Show source, as-of time, missing values, currency boundaries, bank consent/sync state, last successful sync, next eligible sync and provider limits. Manual current prices remain clearly manual until a licensed market-data source is configured.

## P1 DOMINANT
The dominant layer is the user's recorded economy: liquid accounts, debt and holdings. Empty states lead directly to a useful first entry.

## P2 ORIENTATION
The surface says whether data is MANUAL, CONNECTED, STALE, PARTIAL or UNKNOWN. It never presents a provider-ready seam as an active bank connection.

## P3 ACTION / NEXT
The next action is one of: add account, add holding, update current price, inspect sync status or remove local TEST data. No trade execution or personalised BUY / SELL instruction exists.

## P4 DEPTH
Deep evidence includes per-record source and as-of time, portfolio formula inputs, consent expiry, rate-limit state, sync receipts and explicit gaps. Provider credentials and bank link references stay server-side outside browser-readable tables.

## TRUTH BOUNDARY
- Manual values are user-entered facts, not bank-verified facts.
- Current holding price is a manual quote until a licensed provider is configured.
- Different currencies are never silently added together without an FX rate.
- Unknown is never coerced to zero.
- Four bank syncs per day is an adaptive target; provider/bank limits may allow fewer.
- Portfolio monitoring is factual arithmetic, not investment advice or trade execution.
- Yahoo/yfinance is not introduced as a commercial production dependency.

## PRIVACY AND SECURITY
- Authenticated canonical finance rows remain owner-scoped under RLS.
- Anonymous users receive no canonical finance-table privileges.
- Provider credentials and provider connection references are never exposed to the browser.
- The HEIR proof may use clearly labelled device-local storage only; it is not canonical authenticated state and can be cleared by the user.
- Analytics must never receive balances, holdings, tickers, quantities, prices, bank names or free text.

## MOBILE-FIRST RISK
Account and holding forms, summary cards, tables and sync state must remain complete at 390/430 widths with no horizontal overflow or hidden truth labels.

## HUMAN SUCCESS
Within two minutes, a first-time user can enter one liquid account and one holding, understand the resulting totals, update a price, reload without losing TEST state, and explain which values are manual versus bank/provider verified.

## WHAT MUST BE REUSED
Existing 4SAPIEN/Embla route, `king/test` HEIR, Product Surface Registry, Finance Twin truth rules, canonical `4Planet_ OS` Supabase project, owner RLS pattern, Cloudflare exact-SHA review surface and existing privacy-safe analytics spine. No new BRAIN, product, database, auth system or branch.

## CURRENT BOUNDED DELTAS
- Replace the `/4sapien/finance` placeholder with a working TEST-only manual economy and portfolio surface.
- Add deterministic finance arithmetic and adaptive bank-sync scheduling contracts.
- Add an additive Supabase migration for owner-scoped holdings, quotes, public connection status and private provider references.
- Record a provider boundary compatible with an authorised PSD2 account-information provider; do not activate credentials or consent externally.
- Correct the stale 4SAPIEN LIVE registry fact without granting LIVE write authority.
- Selectively adopt finance truth conventions from the read-only 4SAPIEN production donor; do not wholesale-merge it.

## OUT OF SCOPE / FOUNDER GATES
- No mutation or release to `4sapien.com`.
- No provider signup, commercial agreement, credential creation or bank consent.
- No production database migration or Edge Function deployment.
- No payment, transfer, order, trade execution, NAV workflow or personalised financial recommendation.
- No automated Yahoo Finance dependency.

## ACCEPTANCE
1. `king/test` remains the sole write-authorised HEIR; LIVE remains unchanged.
2. Manual accounts and holdings persist on the device in HEIR TEST and can be deliberately cleared.
3. Liquidity, debt, cost basis, market value and unrealised change are deterministic and currency-safe.
4. Bank status explicitly says NOT CONNECTED until an authorised provider is configured and consented.
5. The bank scheduler respects consent and provider rate limits while targeting at most four successful refreshes per day.
6. Database objects are owner-scoped, explicitly granted, indexed and separated from provider secrets.
7. No sensitive finance values or identifiers are emitted to analytics.
8. Typecheck, build, finance contracts, product-authority gate and relevant 390/430/desktop browser tests pass on the exact HEIR head.
9. A working Founder-visible HEIR URL exists before delivery is called complete.
10. Production release remains a separate explicit Founder decision.

## MAKER ≠ JUDGE
The builder may prove deterministic calculations, security shape and browser behaviour, but may not self-certify Human Gold or release to LIVE. Founder review and separate production authority remain required.
