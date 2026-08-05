from pathlib import Path

path = Path("src/earth/World.tsx")
text = path.read_text()
old = '''    const ln = patch.lens ?? lens;
    if (ln !== "EARTH") p.set("lens", ln);
    const f = "focus" in patch ? patch.focus : ctx ? idOfCtx(ctx) : "";
    if (f) p.set("entity", f);
    ["journey", "record"].forEach((key) => {
      const value = current.get(key);
      if (value) p.set(key, value);
    });
'''
new = '''    const ln = patch.lens ?? lens;
    if (ln !== "EARTH") p.set("lens", ln);

    // P17: Actor Mode is an additive ATLAS product context. Camera and layer
    // synchronisation must not erase its canonical actor identity or geography
    // role from the shareable URL.
    const actorMode = current.get("mode") === "actors";
    if (actorMode) {
      p.set("mode", "actors");
      const actorGeo = current.get("actorGeo");
      if (actorGeo) p.set("actorGeo", actorGeo);
      const actorEntity = current.get("entity");
      if (actorEntity?.startsWith("actor:p17:")) p.set("entity", actorEntity);
    } else {
      const f = "focus" in patch ? patch.focus : ctx ? idOfCtx(ctx) : "";
      if (f) p.set("entity", f);
    }
    ["journey", "record"].forEach((key) => {
      const value = current.get(key);
      if (value) p.set(key, value);
    });
'''
if old not in text:
    raise SystemExit("P17 URL preservation anchor not found")
path.write_text(text.replace(old, new, 1))
