import { Link } from "react-router-dom";
import { T } from "@/styles/tokens";
import { img } from "@/content/imageRegistry";
import { HomeAtlasShowcase } from "@/components/HomeAtlasShowcase";

/**
 * Planetary opening followed by a real source-aware window into the shared
 * ATLAS engine. The hero is atmospheric presentation, not live map data.
 */
const still = img("heroEarth");

export function AtlasHero() {
  return (
    <>
      <section className="planet-hero" style={{ position: "relative", height: "100svh", minHeight: 600, overflow: "hidden", background: "#04060f" }}>
        <img
          src={still.src}
          alt={still.alt}
          decoding="async"
          className="earth-breathe"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 42%" }}
        />
        <div aria-hidden className="earth-atmos" />
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(4,6,15,.42) 0%,rgba(4,6,15,.04) 32%,rgba(4,6,15,.12) 58%,rgba(4,6,15,.9) 100%)" }} />

        <div className="planet-hero__content" style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "clamp(30px,5vw,82px)", maxWidth: 1180 }}>
          <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: ".18em", color: "rgba(255,255,255,.82)" }}>4PLANET_ · FOR A LIVING PLANET</div>
          <h1 style={{ margin: "15px 0 0", fontFamily: T.display, fontWeight: 500, color: "#fff", letterSpacing: "-.048em", lineHeight: .92, fontSize: "clamp(46px,6.6vw,94px)", maxWidth: "12ch" }}>
            Everything you love is connected.
          </h1>
          <p style={{ margin: "20px 0 0", maxWidth: 650, color: "rgba(255,255,255,.82)", fontSize: "clamp(16px,1.45vw,20px)", lineHeight: 1.52 }}>
            Explore one living planet — its places, species, pressures and the relationships that keep life going.
          </p>
          <div className="planet-hero__actions" style={{ display: "flex", alignItems: "center", gap: "clamp(18px,3vw,34px)", marginTop: "clamp(26px,3.5vw,38px)", flexWrap: "wrap" }}>
            <a href="#living-atlas" style={{ fontFamily: T.mono, fontSize: 11.5, letterSpacing: ".11em", background: "#fff", color: "#000", padding: "13px 19px", textDecoration: "none" }}>EXPLORE THE PLANET ↓</a>
            <Link to="/about/story" style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: ".11em", color: "rgba(255,255,255,.72)", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,.3)", paddingBottom: 4 }}>WHY 4PLANET →</Link>
          </div>
        </div>

        <div aria-hidden className="planet-hero__rule" style={{ position: "absolute", right: "clamp(20px,5vw,72px)", bottom: "clamp(30px,5vw,82px)", width: 1, height: "clamp(70px,10vw,130px)", background: "linear-gradient(180deg,transparent,rgba(255,255,255,.42))" }} />
      </section>

      <div id="living-atlas">
        <HomeAtlasShowcase />
      </div>

      <style>{`
        @media(max-width:720px){.planet-hero{min-height:640px!important}.planet-hero__rule{display:none}.planet-hero__content{padding-bottom:42px!important}}
      `}</style>
    </>
  );
}