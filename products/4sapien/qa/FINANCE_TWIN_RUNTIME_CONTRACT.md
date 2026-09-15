# 4SAPIEN Finance Twin Runtime Contract v1

Canonical production branch: `build/ask-embla-live-20260909`
Canonical Supabase project: `ghvdzetmplqkdtfqiror`

## Truth laws

- UNKNOWN is never coerced to zero.
- Actual is never forecast.
- Imported is never confirmed until explicit confirmation.
- Asset value is never liquidity.
- Recurring templates are schedules/forecasts until a dated occurrence is confirmed.

## Canonical RPCs

- `four_sapien_calculate_liquidity()` — bank+cash only; returns NULL liquidity when no liquid accounts exist.
- `four_sapien_finance_monthly_timeline(year)` — Jan–Dec actual / scheduled_unconfirmed / forecast / imported_unconfirmed.
- `four_sapien_finance_twin(year)` — accounts, liquidity, quadrants, net worth, freedom months, timeline and data-quality review count.
- `four_sapien_finance_save_event(id, patch)` — owner-scoped partial insert/update seam for inline editing.
- `four_sapien_finance_batch_save_events(rows)` — owner-scoped batch write seam for spreadsheet/quick-entry mode.
- `four_sapien_finance_soft_delete_event(id)` — reversible logical delete; no hard data destruction.
- `four_sapien_finance_save_account(id, patch)` — owner-scoped account insert/update.
- `four_sapien_plan_food_until_payday_context()` — permission-gated bounded Food→Finance context.

## UI integration contract

Finance UI may render the canonical twin without reimplementing calculations in the browser.

`quadrants` order is locked:

1. Income
2. Expense
3. Assets
4. Debt

For 2026 timeline:

- Past month: display actual; unresolved recurring schedules stay visibly separate.
- Current month: actual + remaining future forecast; already-due recurring templates remain `scheduled_unconfirmed` until confirmed.
- Future month: forecast.
- Imported rows stay `imported_unconfirmed` until confirmation.

## Category audit

Runtime can flag suspicious category/type combinations through `data_quality.category_review_count`.
It MUST NOT rewrite user categories automatically.

## Merge law

Any Claude donor must preserve these RPC names and truth semantics. UI can change; these contracts cannot silently change.
