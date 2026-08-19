import { Link } from "react-router-dom";
import { T } from "@/styles/tokens";
import { img } from "@/content/imageRegistry";
import { HomeAtlasShowcase } from "@/components/HomeAtlasShowcase";

/**
 * AtlasHero — the front-page planetary opening followed by a real shared-engine
 * ATLAS showcase. ATLAS itself owns the live map engine; the opening remains an
 * atmospheric invitation, then the page moves into source-aware interactive
 * states without pretending the hero still is live data.
 */
const still = img("heroEarth");

export function AtlasHero() {
  return (
    <>
      <section style={{ position: "relative", height: "100svh", minHeight: 560, overflow: "hidden", background: "#04060f" }}>
        <img
          src={still.src} alt={still.alt} decoding="async"
          className="earth-breathe"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 42%" }}
        />
        <div aria-hidden className="earth-atmos" />
        <div aria-hidden className="planet-awe">
          <div className="planet-awe__orbit planet-awe__orbit--one" />
          <div className="planet-awe__orbit planet-awe__orbit--two" />
          <div className="planet-awe__scan" />
        </div>
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(4,6,15,.5) 0%, rgba(4,6,15,.06) 30%, rgba(4,6,15,.22) 62%, rgba(4,6,15,.92) 100%)" }} />
        <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "clamp(28px,5vw,88px)", maxWidth: 1180 }}>
          <div style={{ fontFamily: T.mono, fontSize: 11.5, letterSpacing: ".18em", color: "#fff", opacity: .9 }}>4PLANET_ · FOR A LIVING PLANET</div>
          <h1 style={{ margin: "16px 0 0", fontFamily: T.display, fontWeight: 500, color: "#fff", letterSpacing: "-.045em", lineHeight: .94, fontSize: "clamp(42px,6.4vw,92px)", maxWidth: "13ch" }}>
            Everything you love is connected.
          </h1>
          <p style={{ margin: "20px 0 0", maxWidth: "58ch", color: "rgba(255,255,255,.9)", fontSize: "clamp(16px,1.55vw,21px)", lineHeight: 1.5 }}>
            Explore one living planet — its places, species, pressures and the relationships that keep life going.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: "clamp(24px,3vw,36px)", flexWrap: "wrap" }}>
            <a href="#living-atlas" style={{ fontFamily: T.mono, fontSize: 12, letterSpacing: ".1em", background: "#fff", color: "#000", padding: "13px 20px", textDecoration: "none" }}>EXPLORE THE PLANET ↓</a>
            <Link to="/species" style={{ fontFamily: T.mono, fontSize: 12, letterSpacing: ".1em", background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,.5)", padding: "12px 20px", textDecoration: "none" }}>MEET LIFE</Link>
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: ".17em", color: "rgba(255,255,255,.6)", marginTop: "clamp(22px,3vw,34px)" }}>
            SEE THE PLANET · MEET LIFE · UNDERSTAND THE SYSTEM · FIND A WAY TO HELP
          </div>
        </div>
      </section>
      <div id="living-atlas">
        <HomeAtlasShowcase />
      </div>
    </>
  );
}
