import { Link } from "react-router-dom";
import { T } from "@/styles/tokens";

export function HomeAtlasEmbed() {
  return (
    <section className="home-atlas-embed" aria-label="Explore 4PLANET Atlas">
      <div className="home-atlas-embed__frame">
        <iframe
          title="4PLANET ATLAS interactive globe"
          src="/atlas?embed=home&l=bluemarble,fires,biodiv&z=1.65&c=5,18"
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

      <div className="home-atlas-embed__entry">
        <Link className="home-atlas-embed__open" to="/atlas?l=bluemarble,fires,biodiv">
          Enter 4Planet Atlas
        </Link>
        <span>Planetary intelligence</span>
      </div>

      <style>{`
        .home-atlas-embed{background:${T.blue};color:#fff;padding:0 clamp(20px,5vw,72px) clamp(34px,5vw,64px)}
        .home-atlas-embed__frame{position:relative;max-width:1440px;height:min(78vh,860px);min-height:560px;margin:0 auto;background:#000;border:1px solid rgba(255,255,255,.46);overflow:hidden}
        .home-atlas-embed__frame iframe{display:block;width:100%;height:100%;border:0;background:#000}
        .home-atlas-embed__layers{position:absolute;left:0;right:0;bottom:0;z-index:2;display:flex;flex-wrap:wrap;gap:0;pointer-events:none;background:rgba(0,0,0,.72);backdrop-filter:blur(8px);border-top:1px solid rgba(255,255,255,.22)}
        .home-atlas-embed__layers span{padding:11px 14px;font-family:${T.mono};font-size:8.5px;line-height:1;letter-spacing:.12em;border-right:1px solid rgba(255,255,255,.18);color:rgba(255,255,255,.75)}
        .home-atlas-embed__entry{max-width:1440px;margin:0 auto;padding-top:24px;display:flex;flex-direction:column;align-items:flex-start;gap:8px}
        .home-atlas-embed__open{display:inline-flex;color:#fff;text-decoration:none;font-family:${T.display};font-weight:500;font-size:clamp(22px,2.2vw,32px);line-height:1;letter-spacing:-.03em;border-bottom:1px solid rgba(255,255,255,.72);padding-bottom:7px}
        .home-atlas-embed__entry>span{font-family:${T.mono};font-size:9px;line-height:1;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.58)}
        @media(max-width:800px){.home-atlas-embed{padding-inline:0;padding-bottom:28px}.home-atlas-embed__frame{border-left:0;border-right:0;min-height:520px;height:72vh}.home-atlas-embed__entry{padding:22px 20px 0}.home-atlas-embed__layers span{font-size:7.5px;padding:10px 9px}}
        @media(prefers-reduced-motion:reduce){.home-atlas-embed__layers{backdrop-filter:none}}
      `}</style>
    </section>
  );
}
