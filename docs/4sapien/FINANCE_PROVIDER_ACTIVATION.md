# 4SAPIEN Finance provider activation

Status: **NOT CONFIGURED · FOUNDER-GATED · NO LIVE MUTATION IN CORE FINANCE 01**

## Recommended first provider candidate

Evaluate GoCardless Bank Account Data first for read-only PSD2 account information. Its documented flow provides hosted bank consent, account details, balances and transactions while GoCardless operates the regulated AISP layer. Coverage must still be checked against the exact Norwegian banks before any agreement or promise.

- Product documentation: <https://docs.gocardless.com/docs/bank-account-data>
- Norwegian regulatory boundary: <https://www.finanstilsynet.no/tillatelser/opplysningsfullmektig/>

4SAPIEN must not access PSD2 bank data by pretending to be its own unlicensed account-information provider. Activation requires either an authorised provider contract or separate confirmed regulatory authority.

## Non-negotiable runtime contract

1. Read-only account information. No payment initiation, transfer or trading.
2. Explicit user consent before institution redirect and again when consent expires.
3. Provider client credentials only in Supabase Edge Function secrets/Vault.
4. Provider requisition/account references only in `four_sapien_private.finance_connection_refs`.
5. Browser receives only owner-scoped status and financial rows protected by RLS.
6. Target at most four successful refreshes per day, reduced automatically to the provider/bank limit.
7. Respect provider `remaining` and `reset` rate-limit state; never retry-loop on HTTP 429.
8. Record every attempt in `four_sapien_finance_sync_runs` with a non-sensitive error code.
9. Display last success, next eligible attempt, consent expiry and partial/stale gaps.
10. Disconnect revokes provider consent where supported, deletes private references and retains only the user-approved finance history policy.

## Activation sequence

1. Founder selects a licensed provider after exact Norway/institution coverage, commercial terms, DPA, subprocessor and retention review.
2. Apply `20260920200000_four_sapien_core_finance_connections_portfolio.sql` to a Supabase preview branch and rerun security/performance advisors.
3. Implement the server-only `AccountInformationProvider` interface in an Edge Function.
4. Configure callback allowlists and secrets; never put a service-role key or provider secret in Vite/browser variables.
5. Test consent, initial account/balance import, transaction pagination, 90-day re-consent, 429/reset behaviour, disconnect and deletion in TEST.
6. Verify owner isolation with two authenticated users and attempted cross-user IDs.
7. Run four scheduled invocations across a full day. The effective schedule must fall back when the bank allows fewer calls.
8. Present exact TEST SHA, provider agreement state, privacy evidence, rollback and browser proof for Founder review.
9. Promote the exact tested artifact only after a separate explicit Founder LIVE release.

## Market-data boundary

The HEIR accepts manual symbol, quantity, average cost and current price now. Automatic quotes require a source whose licence permits the intended production use, with timestamp, provider and stale state stored for every quote. Yahoo/yfinance is not the production default: the open-source project states that it is not affiliated with Yahoo and that Yahoo Finance data is intended for personal use. Reference: <https://github.com/ranaroussi/yfinance>.
