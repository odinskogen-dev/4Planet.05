# 4SAPIEN — REAL DATA RUNTIME CONTRACT 03
**For Claude / AXE; canonical 4SAPIEN Finance + Food + Brain. No new ledger, app, auth or tenant store.**
Production baseline before this patch: `a0410606db9fc769707df22cd75e9b4a8a308a05`.
This branch only introduces additive, RLS-scoped SQL and this contract; Claude owns the UI.

## Money Now and Money Until Payday

Authenticated RPC `public.four_sapien_finance_control_read(p_days integer DEFAULT 30)`.
`p_days` must be 1–30. This **projects the existing Finance Twin and canonical finance events**; it does not write or replace either. Use an ordinary authenticated Supabase client, never service-role credentials in the browser.

Example call, with no real user data embedded:
```js
const {data,error}=await supabase.rpc('four_sapien_finance_control_read',{p_days:30});
if(error || data?.state!=='AVAILABLE') { /* show truthful unavailable state */ }
```

Fields:
- `money_now.state`: `KNOWN_RECORDED | STALE | UNKNOWN`. The known amount is **recorded bank/cash balances**, not confirmed spendable-after-reserves.
- `money_now.amount`: null unless state `KNOWN_RECORDED`; `last_recorded_amount` is a historical data point that MUST NOT be shown as currently available when stale or incomplete.
- `money_now.oldest_account_as_of`, `stale_account_count`, `unknown_balance_count`, `included_account_count`: explain incomplete data.
- `money_now.reserved`, `restricted`, `available_after_reserves`: deliberately `UNKNOWN`; **do not fabricate reserves or spendable balances**.
- `expected_income[]`, `scheduled_outgoings[]`: dated source events or recurring **models**; `truth` is `USER_DATED_NOT_PAYMENT_PROOF` or `SCHEDULED_MODELLED`. Future bill is not paid. One-off spend/income already dated today is **not** billed again in projected cashflow.
- `overdue_unconfirmed[]`: specifically one-off bills with explicit `NOT_MARKED_PAID/UNPAID` metadata. Absence is NOT proof nothing overdue exists.
- `next_income_date`: null when unknown or outside requested 1–30 day horizon.
- `before_next_income.projected_without_income`: null unless a usable recorded balance exists; even then strictly MODELLED, never a bank balance.
- `until_horizon.projected_without_income`: scheduled-outgoings projection only, no assumed incoming cash.
- `data_quality.has_bank_connection=false`, `last_bank_sync=null`: **no live connected bank**. `pending_csv_review_batches` indicates manual attention, not an automatically reconciled bank.

Finance Twin remains the only financial source of account balances and canonical year/month data. Avoid reproducing a separate cashflow formula in Home or Embla. `four_sapien_finance_monthly_timeline(year)` remains the canonical month/year source; do not merge scheduled_unconfirmed into actual.

## Receipt → Food, exactly once

Authenticated RPC:
```js
const {data,error}=await supabase.rpc('four_sapien_link_receipt_to_food',{
  p_finance_event_id: confirmedReceiptFinanceEventId,
  p_shop_id: null, // or EXPLICITLY chosen, existing user-owned Food shop UUID
  p_store: confirmedStoreName,
  p_item_lines: [] // optional manually confirmed [{name:"...",price_kr:42}]; never raw OCR
});
```
Requires an existing, user-confirmed NOK Finance `spend` with a privately stored document and `meta.document_kind='receipt'`, `meta.document_review='user_confirmed'`. It NEVER creates an additional Finance spend. It links the user-owned Food shop through **canonical Finance `meta.food_shop_id`**, preserving original document in private Finance Storage. Confirmed item lines are stored in this event's `meta.food_item_lines` (not a new financial ledger). Do not convert extracted OCR suggestions into confirmed lines without a human review action.

Responses:
- `LINKED`: read back `finance_event_id`, `shop_id`, `shop_created`, `no_second_finance_event=true`.
- `ALREADY_LINKED`: idempotent retry, do not re-register a shop or spend.
- `FOOD_SHOP_MATCH_REVIEW_REQUIRED`: existing matching user Food shop; show candidate `matching_shop_ids`, request explicit human selection, then call RPC again with selected `p_shop_id`. Do not automatically merge.
- Any error: fail closed; user checks original and existing event before retry. Cross-user UUID, unconfirmed receipt, bill, amount/date mismatch, or a shop linked to a different receipt are rejected.

Existing receipt data can be linked **only on user confirmation**. No automatic backfill or orphan deletion.

## CSV import and reconciliation

Already live: `four_sapien_finance_confirm_csv_import` with local `/app/money/import/` parser and explicit row selection. It prevents same file+row duplication and blocks exact possible overlaps with manual events. `POSSIBLE_EXISTING` rows are **review only**: they are not automatically reconciled. Existing `four_sapien_finance_import_batches.matched` currently counts `review_required`, NOT confirmed matches. Never call this full bank reconciliation without separate proof. CSV data is not a bank connector.

## Limits for Claude's interface

- Don't design a second balance store or a second Finance ledger.
- Don't promise OCR confidence or user-authenticated model grounding based only on build checks.
- Don't show old recorded balances as live bank cash.
- Don't imply `has_bank_connection=true` without real provider authorization and measured synchronization.
- Don't equate a bill, its reminder, and a settled bank transaction with three expenses.
- Person and company data/roles remain separate.
- No legal/financial recommendations or automated payment, creditor contact, or bank actions.
- If the client cannot load data, show UNKNOWN, not a fabricated 0.
- No external changes, subscriptions or financial service connections without Founder release.

## QA boundary

SQL fixture tests use authenticated role emulation and transaction rollback, including cross-user rejection and duplicate-receipt detection. This is NOT an authenticated real-mobile/browser or licensed bank-provider E2E test. OpenAI model account previously returned `MODEL_HTTP_429_credit_balance_exhausted`; no Embla Model PASS until a new real model call succeeds.
