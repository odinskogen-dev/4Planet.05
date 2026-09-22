from pathlib import Path
import re
import sys

if len(sys.argv) != 2:
    raise SystemExit("usage: apply_pantry_first_return_guard.py <existing-4sapien-site>")

site = Path(sys.argv[1])
food = site / "app" / "food" / "index.html"
source = Path("src/food/pantry-decision.js")
component = Path("products/4sapien/source/4sapien-pantry-proof.jsx")
out = site / "4sapien-pantry-decision.js"
for path in (food, source, component):
    if not path.is_file():
        raise SystemExit(f"4SAPIEN pantry source missing: {path}")

matcher = source.read_text(encoding="utf-8")
anchor = "export function comparePantryMeals"
if matcher.count(anchor) != 1 or re.search(r"\bexport\b",matcher.replace(anchor,"")):
    raise SystemExit("Shared decision primitive export contract changed")
out.write_text(
    matcher.replace(anchor, "function comparePantryMeals", 1)
    + "\nwindow.FourSapienPantryDecision=Object.freeze({comparePantryMeals});\n",
    encoding="utf-8"
)

s = food.read_text(encoding="utf-8")
if "4sapien-pantry-decision.js" in s or "FoodPantryProof" in s:
    raise SystemExit("Pantry guard already applied; fail closed")
if s.count('const SB=window.supabase.createClient(') != 1:
    raise SystemExit("Existing authenticated SB client absent/ambiguous")
if s.count("function App(){") != 1:
    raise SystemExit("Authenticated Food App mount absent/ambiguous")
if s.count('<script type="text/babel"') != 1:
    raise SystemExit("Food Babel script loader absent/ambiguous")

markup = '<Meals addMany={addMany} budget={profile.budget} setBudget={setBudget} selectedMeals={mealPlan} setSelectedMeals={persistMealPlan}/>'
if s.count(markup) != 1:
    raise SystemExit("Existing Food meal-plan authority seam absent/ambiguous")
jsx = component.read_text(encoding="utf-8")
for marker in ("FoodPantryProof({user,avoid})", 'four_sapien_embla_memories',
               'confirmation_state:"user_confirmed"', 'setReturnCount(row?validated.length:null)',
               'SAVED_PREVIOUS_REVISION_REVIEW', 'dataState:"user_confirmed"'):
    if marker not in jsx:
        raise SystemExit(f"Pantry contract marker missing: {marker}")

s = s.replace("function App(){", jsx + "\nfunction App(){", 1)
s = s.replace(markup, "<>" + markup + '<FoodPantryProof user={user} avoid={avoid}/></>', 1)
s = s.replace('<script type="text/babel"',
              '<script src="/4sapien-pantry-decision.js"></script>\n<script type="text/babel"',1)
if s.count("<FoodPantryProof user={user} avoid={avoid}/>") != 1:
    raise SystemExit("Pantry in-app mount was not singular")
food.write_text(s, encoding="utf-8")
print("PASS 4SAPIEN pantry: reused shared decision primitive; inserted inside existing authenticated Food/Meals route; no extra DB/auth/Brain; no deploy")
