import { Link } from "react-router-dom";
import { T } from "@/styles/tokens";
import { img } from "@/content/imageRegistry";

/**
 * AtlasHero — the front-page planetary hero + ENTER ATLAS handoff.
 *
 * PART 4 (Planetary Front Door): the live in-page interactive globe attract-mode is
 * TECHNICAL-VETO-DEFERRED — the World engine depends on external vector-tile / geocode
 * providers that can't be performance-verified in the build sandbox, and a weak/unstable
 * WebGL embed would be worse than a strong still. So the planet is made to feel alive here
 * WITHOUT the engine: a very slow "earth-breathe" drift + a pure-CSS atmospheric rim, so the
 * planet breathes before the interface. It still reads as the living planet and leads straight in.
 */
const still = img("heroEarth");

export function AtlasHero() {
  return (
    <section style={{ position: "relative", height: "100svh", minHeight: 560, overflow: "hidden", background: "#04060f" }}>
      <img
        src={still.src} alt={still.alt} decoding="async"
        className="earth-breathe"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 42%" }}
      />
      <div aria-hidden className="earth-atmos" />
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(4,6,15,.42) 0%, rgba(4,6,15,.08) 30%, rgba(4,6,15,.24) 62%, rgba(4,6,15,.9) 100%)" }} />
      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "clamp(28px,5vw,88px)", maxWidth: 1180 }}>
        <div style={{ fontFamily: T.mono, fontSize: 11.5, letterSpacing: ".18em", color: "#fff", opacity: .9 }}>4PLANET_ · FOR A LIVING PLANET</div>
        <h1 style={{ margin: "16px 0 0", fontFamily: T.display, fontWeight: 500, color: "#fff", letterSpacing: "-.035em", lineHeight: .98, fontSize: "clamp(34px,5vw,68px)", maxWidth: "18ch" }}>
          One connected living planet.
        </h1>
        <p style={{ margin: "18px 0 0", maxWidth: "56ch", color: "rgba(255,255,255,.88)", fontSize: "clamp(15px,1.5vw,20px)", lineHeight: 1.5 }}>
          4PLANET makes the living systems under pressure easier to understand, credible action easier to join, and real progress easier to follow.
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: "clamp(24px,3vw,36px)", flexWrap: "wrap" }}>
          <Link to="/atlas" style={{ fontFamily: T.mono, fontSize: 12, letterSpacing: ".1em", background: "#fff", color: "#000", padding: "13px 20px", textDecoration: "none" }}>ENTER ATLAS →</Link>
          <Link to="/impact" style={{ fontFamily: T.mono, fontSize: 12, letterSpacing: ".1em", background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,.5)", padding: "12px 20px", textDecoration: "none" }}>MAKE AN IMPACT</Link>
        </div>
        <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".2em", color: "rgba(255,255,255,.66)", marginTop: "clamp(22px,3vw,34px)" }}>CAUSE THERE IS NO PLANET B.</div>
      </div>
    </section>
  );
}
