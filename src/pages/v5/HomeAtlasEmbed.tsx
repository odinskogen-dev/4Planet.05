import { Link } from "react-router-dom";
import { T } from "@/styles/tokens";

export function HomeAtlasEmbed() {
  return (
    <section className="home-atlas-embed" aria-labelledby="home-atlas-live-title">
      <header className="home-atlas-embed__head">
        <div>
          <p className="home-atlas-embed__kicker">BUILT BY 4PLANET / PLANETARY INTELLIGENCE</p>
          <h2 id="home-atlas-live-title">Meet 4PLANET ATLAS.</h2>
        </div>
        <p>ATLAS is the interactive planetary interface we built to connect place, living systems and change on one explorable Earth. This live view opens with Blue Marble, active-fire detections and biodiversity density selected.</p>
      </header>

      <div className="home-atlas-embed__frame">
        <iframe
          title="4PLANET ATLAS interactive globe"
          src="/atlas?embed=mag&l=bluemarble,fires,biodiv&z=1.65&c=5,18"
          loading="lazy"
          allow="fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
        />
        <div className="home-atlas-embed__layers" aria-hidden>
          <span>BLUE MARBLE</span>
          <span>ACTIVE FIRES</span>
          <span>BIODIVERSITY</span>
        </div>
      </div>

      <Link className="home-atlas-embed__open" to="/atlas?l=bluemarble,fires,biodiv">
        ENTER FULL 4PLANET ATLAS →
      </Link>

      <style>{`
        .home-atlas-embed{background:${T.blue};color:#fff;padding:clamp(52px,7vw,94px) clamp(20px,5vw,72px) clamp(28px,4vw,52px)}
        .home-atlas-embed__head{max-width:1320px;margin:0 auto clamp(30px,4vw,54px);display:grid;grid-template-columns:minmax(0,1.25fr) minmax(280px,.75fr);gap:clamp(28px,6vw,88px);align-items:end}
        .home-atlas-embed__kicker{margin:0 0 14px;font-family:${T.mono};font-size:9.5px;line-height:1;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.68)}
        .home-atlas-embed__head h2{margin:0;font-family:${T.display};font-weight:500;font-size:clamp(44px,7vw,100px);line-height:.88;letter-spacing:-.055em}
        .home-atlas-embed__head>p{margin:0;max-width:590px;font-size:clamp(15px,1.35vw,18px);line-height:1.58;color:rgba(255,255,255,.78)}
        .home-atlas-embed__frame{position:relative;max-width:1440px;height:min(78vh,860px);min-height:560px;margin:0 auto;background:#000;border:1px solid rgba(255,255,255,.48);overflow:hidden}
        .home-atlas-embed__frame iframe{display:block;width:100%;height:100%;border:0;background:#000}
        .home-atlas-embed__layers{position:absolute;left:0;right:0;bottom:0;z-index:2;display:flex;flex-wrap:wrap;gap:0;pointer-events:none;background:rgba(0,0,0,.72);backdrop-filter:blur(8px);border-top:1px solid rgba(255,255,255,.22)}
        .home-atlas-embed__layers span{padding:11px 14px;font-family:${T.mono};font-size:8.5px;line-height:1;letter-spacing:.12em;border-right:1px solid rgba(255,255,255,.18);color:rgba(255,255,255,.75)}
        .home-atlas-embed__open{display:inline-flex;margin:22px max(0px,calc((100% - 1440px)/2)) 0;color:#fff;text-decoration:none;font-family:${T.mono};font-size:10px;line-height:1;letter-spacing:.14em;border-bottom:1px solid rgba(255,255,255,.65);padding-bottom:6px}
        @media(max-width:800px){.home-atlas-embed{padding-inline:0;padding-top:48px}.home-atlas-embed__head{grid-template-columns:1fr;padding:0 20px;margin-bottom:28px}.home-atlas-embed__frame{border-left:0;border-right:0;min-height:520px;height:72vh}.home-atlas-embed__open{margin-left:20px;margin-right:20px}.home-atlas-embed__layers span{font-size:7.5px;padding:10px 9px}}
        @media(prefers-reduced-motion:reduce){.home-atlas-embed__layers{backdrop-filter:none}}
      `}</style>
    </section>
  );
}
