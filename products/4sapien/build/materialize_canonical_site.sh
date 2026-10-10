#!/usr/bin/env bash
# Canonical 4SAPIEN materialization chain. Candidate and LIVE MUST call this
# exact file so a previously-proven guard cannot disappear from one release path.
set -euo pipefail

SITE="${1:-products/4sapien/site}"
DROP="${2:-/tmp/4sapien-unified-20260917}"
FOOD="$SITE/app/food/index.html"

rm -rf "$SITE" "$DROP"
mkdir -p "$SITE/app/food" "$SITE/app" "$DROP"

python products/4sapien/build/materialize_unified_drop.py products/4sapien/source/claude-unified-20260917 "$DROP"
cp products/4sapien/source/4sapien-design.css "$SITE/4sapien-design.css"
cp products/4sapien/source/4sapien-theme.js "$SITE/4sapien-theme.js"
cp public/favicon.svg "$SITE/favicon.svg"
python products/4sapien/build/apply_front_v2_release.py "$DROP/4sapien_app_unified.html" "$SITE/index.html"
cp "$DROP/4sapien_food_MERGED.html" "$FOOD"

python products/4sapien/build/apply_finance_route.py "$SITE/index.html" "$DROP/4sapien_finance_MERGED.html" "$DROP/4sapien_finance_AXE_experience_MERGED.html"
python products/4sapien/build/apply_finance_typography_guard.py "$SITE"
python products/4sapien/build/apply_unified_design_guard.py "$SITE"

cp products/4sapien/source/4sapien-live-hardening.css "$SITE/4sapien-live-hardening.css"
cp products/4sapien/source/4sapien-live-hardening.js "$SITE/4sapien-live-hardening.js"
cp products/4sapien/source/4sapien-local-week.js "$SITE/4sapien-local-week.js"
python products/4sapien/build/apply_live_hardening_guard.py "$SITE"
python products/4sapien/build/apply_document_intake_guard.py "$SITE"

# Proven Finance chain — order is a release invariant.
python products/4sapien/build/apply_finance_daniel_feedback_guard.py "$SITE"
python products/4sapien/build/apply_finance_truth_math_guard.py "$SITE"
python products/4sapien/build/apply_finance_sync_b1c_guard.py "$SITE"
python products/4sapien/build/apply_money_now_guard.py "$SITE"
python products/4sapien/build/apply_finance_unknown_truth_guard.py "$SITE"

python products/4sapien/build/apply_pantry_first_return_guard.py "$SITE"

cp products/4sapien/cloudflare/_headers "$SITE/_headers"
cp products/4sapien/cloudflare/_redirects "$SITE/_redirects"

# Shell must be LAST: it binds every materialized route, including documents/import.
python products/4sapien/build/apply_shell_nav_guard.py "$SITE"
python products/4sapien/build/apply_discoverability_guard.py "$SITE"

for f in   "$SITE/index.html"   "$SITE/app/food/index.html"   "$SITE/app/money/index.html"   "$SITE/app/money/documents/index.html"   "$SITE/app/money/import/index.html"   "$SITE/brain/index.html"; do
  test -s "$f"
done

echo "PASS canonical 4SAPIEN materialization: Finance truth + Food + Brain + stable shell"
