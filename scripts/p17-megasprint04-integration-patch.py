from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f"Missing integration anchor: {label}")
    return text.replace(old, new, 1)


shell = Path("src/components/layout/PublicShell.tsx")
text = shell.read_text()
menu_anchor = '  { key: "IMPACT_", to: "/impact", kind: "list", items: [["IMPACT HOME", "/impact"], ["IMPACT LAB", "/impact/lab"], ["TREE TEST JOURNEY", "/impact/lab/tree"], ["PLASTIC TEST JOURNEY", "/impact/lab/plastic"], ["PROOF & REPORTS", "/reports"]] },\n'
menu_item = '  { key: "ORGANISATIONS_", to: "/actors", kind: "list", items: [["Explore organisations", "/actors"], ["Organisations on the map", "/atlas?mode=actors"], ["Planetary data & research", "/actors?theme=PLANETARY_DATA_AND_RESEARCH"], ["Work you can support", "/actors?theme=OFFICIAL_SUPPORT_AVAILABLE"]] },\n'
if 'key: "ORGANISATIONS_"' not in text:
    text = replace_once(text, menu_anchor, menu_anchor + menu_item, "PublicShell ORGANISATIONS menu")
old_footer = '["EXPLORE", [["Enter the living world", "/domains"], ["Missions", "/missions"], ["Impact", "/impact"], ["4Culture", "/stories"]]],'
new_footer = '["EXPLORE", [["Enter the living world", "/domains"], ["Missions", "/missions"], ["Organisations", "/actors"], ["Impact", "/impact"], ["4Culture", "/stories"]]],'
if old_footer in text:
    text = text.replace(old_footer, new_footer, 1)
shell.write_text(text)

home = Path("src/pages/v5/Home.tsx")
text = home.read_text()
import_anchor = 'import type { DomainKey } from "@/types/content";\n'
if 'from "@/data/actors"' not in text:
    text = replace_once(text, import_anchor, import_anchor + 'import { ACTORS } from "@/data/actors";\n', "Home actor import")
section_anchor = '      {/* ACT 06 — build the future together */}\n'
organisations = '''      {/* ORGANISATIONS_ — visible discovery in the main universe */}
      <section aria-labelledby="home-organisations-title" style={{ borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(72px,10vw,150px) clamp(20px,5vw,72px)" }}>
          <Reveal>
            <div style={{ ...eyebrow, color: T.blue, marginBottom: 22 }}>ORGANISATIONS_ / WORKING FOR A LIVING PLANET</div>
            <div className="home-organisations-heading" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.15fr) minmax(280px,.85fr)", gap: "clamp(28px,6vw,90px)", alignItems: "end" }}>
              <h2 id="home-organisations-title" style={{ ...actHead, maxWidth: 760 }}>Meet the organisations turning knowledge, rights and field capacity into action.</h2>
              <div>
                <p style={{ ...bodyDim, margin: 0 }}>Independent 4PLANET profiles make important work easier to discover, understand and support while sources, limitations and relationship status remain visible.</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 24 }}>
                  <Button to="/actors" primary arrow>EXPLORE ORGANISATIONS</Button>
                  <Button to="/atlas?mode=actors" arrow>VIEW ON THE MAP</Button>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={60}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", borderTop: `1px solid ${T.ink}`, borderLeft: `1px solid ${T.line}`, marginTop: "clamp(34px,5vw,64px)" }} className="home-organisations-grid">
              {ACTORS.filter((actor) => actor.collections.includes("FEATURED")).slice(0, 3).map((actor) => (
                <Link key={actor.id} to={`/actors/${actor.slug}`} style={{ minHeight: 330, display: "flex", flexDirection: "column", padding: "clamp(24px,3vw,38px)", borderRight: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}`, color: T.ink, textDecoration: "none" }}>
                  <span className="mono" style={{ fontSize: 10.5, letterSpacing: ".11em", color: T.blue }}>{actor.actorTypeLabel}</span>
                  <h3 style={{ margin: "clamp(40px,5vw,72px) 0 0", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(26px,3vw,42px)", lineHeight: 1, letterSpacing: "-.035em" }}>{actor.name}</h3>
                  <p style={{ ...bodyDim, fontSize: 15, marginTop: 16 }}>{actor.tagline}</p>
                  <span className="mono" style={{ marginTop: "auto", paddingTop: 28, fontSize: 10.5, letterSpacing: ".1em", color: T.blue }}>OPEN PROFILE →</span>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

'''
if 'home-organisations-title' not in text:
    text = replace_once(text, section_anchor, organisations + section_anchor, "Home ORGANISATIONS module")
home.write_text(text)

actors = Path("src/pages/integrated/Actors.tsx")
text = actors.read_text()
text = text.replace(
    'import { type CSSProperties, type FormEvent, useEffect, useMemo, useState } from "react";',
    'import { type CSSProperties, type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";',
    1,
)
text = text.replace("children: React.ReactNode;", "children: ReactNode;")
text = text.replace(' className="actors-hero" id="main-content"', ' className="actors-hero"')
text = text.replace(' className="actor-profile-hero" id="main-content"', ' className="actor-profile-hero"')
text = text.replace(
    "    const form = new FormData(event.currentTarget);",
    "    const formElement = event.currentTarget;\n    const form = new FormData(formElement);",
    1,
)
text = text.replace("      if (result.persisted) event.currentTarget.reset();", "      if (result.persisted) formElement.reset();", 1)
actors.write_text(text)

world = Path("src/earth/World.tsx")
text = world.read_text()
site_anchor = '              ["/impact", "IMPACT", "Pathways and proof"],\n'
if '["/actors", "ORGANISATIONS"' not in text:
    text = replace_once(
        text,
        site_anchor,
        site_anchor + '              ["/actors", "ORGANISATIONS", "Who is working for a living planet"],\n',
        "World site menu ORGANISATIONS entry",
    )
world.write_text(text)
