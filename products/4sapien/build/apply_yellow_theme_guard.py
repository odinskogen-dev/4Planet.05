from pathlib import Path
import subprocess
import sys

here = Path(__file__).resolve().parent
target = sys.argv[1]

# Preserve Yellow 02 as the exact light-mode base, then apply the isolated
# Light/Dark runtime switch. Functional/auth/data code remains untouched.
subprocess.run([sys.executable, str(here / "apply_yellow_theme_base.py"), target], check=True)
subprocess.run([sys.executable, str(here / "apply_theme_switch_guard.py"), target], check=True)

print("4SAPIEN theme pipeline applied: Yellow 02 base + Light/Dark 01")
