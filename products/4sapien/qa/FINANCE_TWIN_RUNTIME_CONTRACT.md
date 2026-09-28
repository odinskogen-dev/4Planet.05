# 4SAPIEN Finance Twin Runtime Contract v1.1

Canonical production branch: `build/ask-embla-live-20260909`
Canonical Supabase project: `ghvdzetmplqkdtfqiror`

## Truth laws

- UNKNOWN is never coerced to zero.
- A recorded account with unknown balance remains NULL/UNKNOWN, never 0.
- Actual is never forecast.
- Imported is never confirmed until explicit confirmation.
- Unconfirmed imports are excluded from actuals, forecasts, liquidity and balance-sheet calculations; they remain separately visible for review.
- Asset value is never liquidity.
- Recurring templates are schedules/forecasts until a dated occurrence is confirmed.
- Missing values must reduce certainty/completeness rather than silently disappear.

## Canonical RPCs

- `four_sapien_calculate_liquidity()` — bank+cash only; NULL when no eligible liquid accounts exist or any included liquid balance is unknown.
- `four_sapien_finance_monthly_timeline(year)` — Jan–Dec actual / scheduled_unconfirmed / forecast / imported_unconfirmed.
- `four_sapien_finance_twin(year)` — accounts, liquidity, quadrants, net worth, freedom months, timeline and data-quality state.
- `four_sapien_finance_save_event(id, patch)` — owner-scoped partial insert/update seam for inline editing.
- `four_sapien_finance_batch_save_events(rows)` — atomic owner-scoped batch write seam for spreadsheet/quick-entry mode.
- `four_sapien_finance_soft_delete_event(id)` — reversible logical event delete; no hard data destruction.
- `four_sapien_finance_save_account(id, patch)` — owner-scoped account insert/update; omitted/blank balance remains NULL.
- `four_sapien_finance_soft_delete_account(id)` / `four_sapien_finance_restore_account(id)` — reversible account archive/restore.
- `four_sapien_plan_food_until_payday_context()` — permission-gated bounded Food→Finance context.

## UI integration contract

Finance UI may render the canonical twin without reimplementing calculations in the browser.

`quadrants` order is locked:

1. Income
2. Expense
3. Assets
4. Debt

For Jan–Dec:

- Past month: actual only; unresolved recurring schedules stay visibly separate.
- Current month: actual + remaining confirmed-source forecast; already-due recurring templates remain `scheduled_unconfirmed` until confirmed.
- Future month: forecast.
- Imported-unconfirmed rows are excluded from actual/forecast and shown separately.
- `net_worth.amount` may be NULL when recorded account values are incomplete; `known_recorded_amount` remains available as partial context.

## Food × Money boundary

`plan_food_until_payday` is an explicit capability alongside `read_budget_context`.
The bounded context may expose liquidity truth, payday date, known obligations, planned spend, Food profile/budget and unknown fields.
It MUST NOT expose salary amount, debts, holdings or full transaction history to Food.
Shopping-list writes still require explicit current-turn user intent.

## Category audit

Runtime can flag suspicious category/type combinations through `data_quality.category_review_count`.
It MUST NOT rewrite user categories automatically.

## Merge law

Any Claude donor must preserve these RPC names and truth semantics. UI can change; these contracts cannot silently change.
