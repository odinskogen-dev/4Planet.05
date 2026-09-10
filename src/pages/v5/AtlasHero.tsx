import { Link } from "react-router-dom";
import { T } from "@/styles/tokens";
import { img } from "@/content/imageRegistry";

/**
 * Founder-selected LOST GOLD donor: build/market-sale-01-poster.
 * Brand invitation first; ATLAS remains the secondary product handoff.
 */
const still = img("heroEarth");

export function AtlasHero() {
  return (
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
        <div className="planet-hero__actions" style={{ display: "flex", alignItems: "center", gap: 10, marginTop: "clamp(26px,3.5vw,38px)", flexWrap: "wrap" }}>
          <Link
            to="/join"
            className="planet-hero__cta planet-hero__cta--join"
            style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: ".11em", background: T.blue, border: `1px solid ${T.blue}`, color: "#fff", padding: "13px 19px", borderRadius: 999, textDecoration: "none" }}
          >
            JOIN US 4PLANET
          </Link>
          <Link
            to="/atlas"
            className="planet-hero__cta planet-hero__cta--atlas"
            style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: ".11em", background: "rgba(4,6,15,.28)", border: "1px solid rgba(255,255,255,.62)", color: "#fff", padding: "13px 19px", borderRadius: 999, textDecoration: "none", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
          >
            ENTER ATLAS →
          </Link>
        </div>
      </div>

      <style>{`
        /* Homepage: account entry belongs in the hero, not beside MENU. The
           identity runtime remains mounted and the /join CTA still opens it. */
        .fourplanet-id-utility{display:none!important}
        @keyframes lost-gold-earth-in{0%{transform:scale(1.12) translate3d(0,1.2%,0);opacity:.68}100%{transform:scale(1.035) translate3d(0,0,0);opacity:1}}
        @keyframes lost-gold-earth-breathe{0%{transform:scale(1.035) translate3d(0,0,0)}100%{transform:scale(1.09) translate3d(0,-1.8%,0)}}
        .earth-breathe{animation:lost-gold-earth-in 2.1s cubic-bezier(.22,.61,.36,1) both,lost-gold-earth-breathe 26s ease-in-out 2.1s infinite alternate;will-change:transform}
        .earth-atmos{position:absolute;inset:0;pointer-events:none;background:radial-gradient(120% 80% at 50% 8%,rgba(120,150,255,.15),transparent 42%),radial-gradient(140% 90% at 50% 108%,rgba(4,6,15,.7),transparent 46%)}
        .planet-hero__cta{display:inline-flex;align-items:center;justify-content:center;min-height:46px;transition:transform .18s ease,background .18s ease,border-color .18s ease,opacity .18s ease}
        .planet-hero__cta:hover,.planet-hero__cta:focus-visible{transform:translateY(-1px)}
        .planet-hero__cta--join:hover,.planet-hero__cta--join:focus-visible{background:#2020ff!important;border-color:#2020ff!important}
        .planet-hero__cta--atlas:hover,.planet-hero__cta--atlas:focus-visible{background:rgba(255,255,255,.12)!important;border-color:#fff!important}
        @media(max-width:720px){.planet-hero{min-height:640px!important}.planet-hero__content{padding-bottom:42px!important}.planet-hero__actions{gap:8px!important}.planet-hero__cta{min-height:44px;padding:11px 15px!important;font-size:9.5px!important}}
        @media(prefers-reduced-motion:reduce){.earth-breathe{animation:none!important}.planet-hero__cta{transition:none!important}}
      `}</style>
    </section>
  );
}
