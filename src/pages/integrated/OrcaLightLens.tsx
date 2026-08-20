import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { speciesBySlug, type EvidenceState } from "@/data/species";

const SCENES = [
  { id: "encounter", no: "01", title: "Encounter", kicker: "MEET ONE LIFE", note: "Begin with the animal before the system." },
  { id: "form", no: "02", title: "Form", kicker: "A BODY IN WATER", note: "Reveal only the structure that helps understanding." },
  { id: "pod", no: "03", title: "Pod", kicker: "SOCIAL LIVES", note: "Relationships appear as a network, not decoration." },
  { id: "world", no: "04", title: "World", kicker: "PLACE, NOT A PIN", note: "Move from species identity to bounded place context." },
  { id: "dependencies", no: "05", title: "Dependencies", kicker: "WHAT HOLDS A LIFE", note: "Food, habitat and pressures become visible as relationships." },
  { id: "real", no: "06", title: "Real world", kicker: "OPEN THE WINDOW", note: "Projection gives way to source-backed media and evidence." },
  { id: "choice", no: "07", title: "Choose", kicker: "FOLLOW THE WORLD", note: "Explore, listen, learn or meet another life." },
] as const;

const PALETTES = {
  green: { name: "4PLANET", accent: "#40ff74", soft: "#a8ffbd", rgb: "64,255,116" },
  ocean: { name: "OCEAN", accent: "#39cfff", soft: "#b9efff", rgb: "57,207,255" },
  amber: { name: "SIGNAL", accent: "#ffcc52", soft: "#ffe7a6", rgb: "255,204,82" },
} as const;

type PaletteKey = keyof typeof PALETTES;

function stateColour(state: EvidenceState, accent: string) {
  if (state === "KNOWN") return accent;
  if (state === "INTERPRETED") return "#9ca8ff";
  return "#d4a843";
}

function OrcaProjection({ accent }: { accent: string }) {
  return (
    <svg className="oll-orca" viewBox="0 0 900 430" role="img" aria-label="Stylised projected-light study of an orca">
      <defs>
        <filter id="ollGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <linearGradient id="ollFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={accent} stopOpacity=".18" />
          <stop offset=".52" stopColor={accent} stopOpacity=".72" />
          <stop offset="1" stopColor={accent} stopOpacity=".16" />
        </linearGradient>
      </defs>
      <g fill="none" stroke={accent} strokeLinecap="round" strokeLinejoin="round">
        <path filter="url(#ollGlow)" strokeWidth="2.2" d="M84 242 C151 176 278 132 407 137 C526 142 601 164 678 194 C738 216 792 217 836 199 C804 232 766 252 714 258 C639 267 579 285 517 310 C430 346 326 344 239 316 C171 294 116 270 84 242Z" />
        <path strokeWidth="1.25" opacity=".58" d="M189 190 C251 222 300 256 346 309 M249 160 C309 202 358 254 394 330 M332 142 C378 198 412 257 432 337 M427 139 C457 193 475 255 477 326 M513 150 C519 209 514 261 503 313 M590 168 C576 216 556 260 532 305" />
        <path strokeWidth="1.25" opacity=".48" d="M129 229 C243 236 361 234 482 225 C596 216 681 221 769 236 M111 255 C244 268 369 275 497 269 C591 265 661 258 714 249 M166 292 C269 297 376 302 517 286" />
        <path filter="url(#ollGlow)" strokeWidth="2" d="M427 138 C414 96 430 60 471 38 C470 86 486 115 522 146" />
        <path filter="url(#ollGlow)" strokeWidth="1.8" d="M303 155 C260 118 233 96 184 94 C211 125 218 149 214 176" />
        <path filter="url(#ollGlow)" strokeWidth="1.8" d="M522 310 C555 345 592 365 642 370 C617 337 613 311 622 281" />
        <path strokeWidth="1.5" opacity=".82" d="M83 242 C49 221 37 194 31 166 C66 184 91 200 113 221 M83 242 C49 265 37 293 31 321 C67 302 92 283 116 263" />
        <ellipse cx="684" cy="211" rx="4" ry="4" fill={accent} filter="url(#ollGlow)" />
        <path strokeWidth="1" opacity=".55" d="M642 188 C657 174 677 169 698 174 M649 237 C672 248 696 246 715 236" />
      </g>
      <path d="M85 242 C151 176 278 132 407 137 C526 142 601 164 678 194 C738 216 792 217 836 199 C804 232 766 252 714 258 C639 267 579 285 517 310 C430 346 326 344 239 316 C171 294 116 270 85 242Z" fill="url(#ollFade)" opacity=".18" />
      <g fill={accent} opacity=".9">
        {[146, 222, 310, 402, 493, 584, 675, 748].map((x, i) => <circle key={x} cx={x} cy={i % 2 ? 270 : 213} r="2.6" />)}
      </g>
    </svg>
  );
}

export default function OrcaLightLens() {
  const profile = speciesBySlug("orca");
  const [sceneIndex, setSceneIndex] = useState(0);
  const [paletteKey, setPaletteKey] = useState<PaletteKey>("green");
  const [gridOn, setGridOn] = useState(true);
  const palette = PALETTES[paletteKey];
  const scene = SCENES[sceneIndex];

  const chapter = useMemo(() => {
    if (!profile?.narrativeChapters?.length) return undefined;
    const indexMap = [0, 0, 0, 2, 1, 3, 3];
    return profile.narrativeChapters[indexMap[sceneIndex] ?? 0];
  }, [profile, sceneIndex]);

  if (!profile) return null;

  const claim = chapter?.claims?.[0];

  return (
    <main className="oll" style={{ "--oll-accent": palette.accent, "--oll-soft": palette.soft, "--oll-rgb": palette.rgb } as React.CSSProperties}>
      <style>{`
        .oll{min-height:100svh;background:#030504;color:#f3f7f4;font-family:Inter,ui-sans-serif,system-ui,sans-serif;overflow:hidden;position:relative}
        .oll *{box-sizing:border-box}.oll a{color:inherit}.oll button{font:inherit}
        .oll-noise{position:fixed;inset:0;pointer-events:none;opacity:.13;background-image:radial-gradient(circle at 50% 20%,rgba(var(--oll-rgb),.07),transparent 34%),linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px);background-size:auto,100% 4px;mix-blend-mode:screen}
        .oll-top{height:72px;border-bottom:1px solid rgba(var(--oll-rgb),.2);display:flex;align-items:center;justify-content:space-between;padding:0 clamp(18px,3vw,48px);position:relative;z-index:5;background:rgba(2,4,3,.9);backdrop-filter:blur(18px)}
        .oll-brand{display:flex;gap:17px;align-items:center;text-decoration:none;font-size:14px;letter-spacing:.28em}.oll-brand-dot{width:27px;height:27px;border:1px solid var(--oll-accent);border-radius:50%;display:grid;place-items:center;box-shadow:0 0 26px rgba(var(--oll-rgb),.26)}
        .oll-brand-dot:after{content:"";width:9px;height:9px;border-radius:50%;background:var(--oll-accent);box-shadow:0 0 18px var(--oll-accent)}
        .oll-controls{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.oll-control{border:1px solid rgba(var(--oll-rgb),.28);background:#050806;color:#b9c3bd;padding:8px 11px;letter-spacing:.12em;font-size:9px;text-transform:uppercase;cursor:pointer}.oll-control[aria-pressed="true"]{color:#051008;background:var(--oll-accent);border-color:var(--oll-accent)}
        .oll-stage{min-height:calc(100svh - 72px);display:grid;grid-template-columns:minmax(0,1fr) minmax(290px,360px);position:relative}
        .oll-room{position:relative;min-height:720px;overflow:hidden;border-right:1px solid rgba(var(--oll-rgb),.18);perspective:1100px;background:radial-gradient(ellipse at 55% 48%,rgba(var(--oll-rgb),.08),transparent 45%),linear-gradient(180deg,#030604,#010201)}
        .oll-grid{position:absolute;left:-10%;right:-10%;bottom:-22%;height:64%;transform:rotateX(68deg);transform-origin:center bottom;background-image:linear-gradient(rgba(var(--oll-rgb),.18) 1px,transparent 1px),linear-gradient(90deg,rgba(var(--oll-rgb),.18) 1px,transparent 1px);background-size:46px 46px;mask-image:linear-gradient(to top,#000 20%,rgba(0,0,0,.78) 54%,transparent 100%);transition:opacity .5s ease}
        .oll-grid:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent 49.8%,var(--oll-accent) 50%,transparent 50.2%);opacity:.35}
        .oll-horizon{position:absolute;left:8%;right:8%;top:51%;height:1px;background:linear-gradient(90deg,transparent,var(--oll-accent),transparent);opacity:.28;box-shadow:0 0 24px rgba(var(--oll-rgb),.25)}
        .oll-copy{position:absolute;top:clamp(38px,6vw,92px);left:clamp(24px,6vw,92px);z-index:3;max-width:420px}.oll-kicker{font-size:10px;letter-spacing:.22em;color:var(--oll-accent);text-transform:uppercase;margin-bottom:14px}.oll-title{font-size:clamp(52px,7vw,104px);line-height:.88;letter-spacing:-.055em;font-weight:420;margin:0}.oll-title em{display:block;font-style:normal;color:transparent;-webkit-text-stroke:1px rgba(var(--oll-rgb),.62)}.oll-summary{font-size:14px;line-height:1.65;color:#a9b2ac;max-width:360px;margin-top:22px}
        .oll-species{position:absolute;left:28%;right:5%;top:17%;bottom:13%;display:grid;place-items:center;z-index:2}.oll-orca{width:min(800px,88%);filter:drop-shadow(0 0 24px rgba(var(--oll-rgb),.24));animation:ollFloat 9s ease-in-out infinite}.oll-scan{position:absolute;width:52%;height:1px;background:linear-gradient(90deg,transparent,var(--oll-accent),transparent);box-shadow:0 0 18px var(--oll-accent);opacity:.22;animation:ollScan 7s ease-in-out infinite}
        .oll-node{position:absolute;width:8px;height:8px;border:1px solid var(--oll-accent);border-radius:50%;box-shadow:0 0 16px rgba(var(--oll-rgb),.65)}.oll-node:after{content:"";position:absolute;width:96px;height:1px;background:linear-gradient(90deg,var(--oll-accent),transparent);left:7px;top:3px;opacity:.46}.oll-node span{position:absolute;left:106px;top:-7px;white-space:nowrap;font-size:8px;letter-spacing:.18em;color:var(--oll-soft);text-transform:uppercase}.n1{top:28%;left:58%}.n2{top:58%;left:38%}.n3{top:67%;left:68%}
        .oll-scene-rail{position:absolute;left:clamp(24px,6vw,92px);right:28px;bottom:28px;display:flex;gap:7px;z-index:4}.oll-scene{flex:1;min-width:58px;border:0;border-top:1px solid rgba(255,255,255,.15);background:transparent;color:#667068;text-align:left;padding:10px 3px 0;cursor:pointer;transition:.25s}.oll-scene strong{display:block;font-size:9px;letter-spacing:.16em}.oll-scene span{display:block;font-size:9px;margin-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.oll-scene.active{border-color:var(--oll-accent);color:var(--oll-accent)}
        .oll-panel{padding:clamp(24px,3vw,40px);display:flex;flex-direction:column;background:#030504;position:relative;z-index:4}.oll-mode{display:flex;gap:7px;margin-bottom:34px}.oll-pill{font-size:8px;letter-spacing:.15em;border:1px solid rgba(var(--oll-rgb),.28);padding:7px 8px;color:var(--oll-accent);text-transform:uppercase}.oll-panel h2{font-size:clamp(27px,3vw,42px);line-height:1;letter-spacing:-.035em;margin:0}.oll-note{margin:12px 0 28px;color:#8e9991;font-size:12px;line-height:1.55}.oll-rule{border-top:1px solid rgba(var(--oll-rgb),.18);padding:19px 0}.oll-rule-label{font-size:8px;letter-spacing:.18em;color:var(--oll-accent);text-transform:uppercase;margin-bottom:9px}.oll-rule p{font-size:12px;line-height:1.55;color:#c0c8c2;margin:0}.oll-evidence{border:1px solid rgba(var(--oll-rgb),.24);padding:17px;margin-top:6px;background:rgba(var(--oll-rgb),.025)}.oll-state{font-size:8px;letter-spacing:.15em;text-transform:uppercase}.oll-evidence h3{font-size:15px;margin:12px 0 8px}.oll-source{display:inline-block;margin-top:13px;font-size:9px;letter-spacing:.11em;color:var(--oll-accent)}.oll-bottom{margin-top:auto;padding-top:26px;display:grid;gap:9px}.oll-action{display:flex;justify-content:space-between;align-items:center;text-decoration:none;border:1px solid rgba(var(--oll-rgb),.32);padding:13px 14px;font-size:9px;letter-spacing:.13em;text-transform:uppercase}.oll-action.primary{background:var(--oll-accent);color:#041007;border-color:var(--oll-accent)}
        .oll-exp{position:absolute;right:28px;top:28px;font-size:8px;letter-spacing:.16em;color:#667068;text-transform:uppercase}.oll-exp b{color:var(--oll-accent);font-weight:500}
        @keyframes ollFloat{0%,100%{transform:translate3d(0,4px,0) rotate(-.4deg)}50%{transform:translate3d(0,-9px,0) rotate(.35deg)}}@keyframes ollScan{0%,100%{transform:translateY(-150px);opacity:.05}45%,55%{opacity:.3}50%{transform:translateY(150px)}}
        @media(max-width:900px){.oll-top{height:auto;min-height:68px;gap:12px;align-items:flex-start;padding-top:17px;padding-bottom:17px}.oll-controls{justify-content:flex-end}.oll-stage{grid-template-columns:1fr}.oll-room{min-height:72svh;border-right:0;border-bottom:1px solid rgba(var(--oll-rgb),.18)}.oll-panel{min-height:auto}.oll-species{left:13%;right:-8%;top:30%}.oll-copy{top:34px}.oll-title{font-size:clamp(50px,13vw,82px)}.oll-scene-rail{overflow-x:auto;left:20px;right:20px}.oll-scene{flex:0 0 72px}.oll-node span{display:none}}
        @media(max-width:560px){.oll-brand{letter-spacing:.16em}.oll-brand span:last-child{display:none}.oll-controls .oll-control:first-child{display:none}.oll-room{min-height:76svh}.oll-copy{left:20px;max-width:82%}.oll-summary{font-size:12px;max-width:275px}.oll-species{left:4%;right:-28%;top:29%;bottom:10%}.oll-node{display:none}.oll-grid{height:52%;bottom:-12%;background-size:30px 30px}}
        @media(prefers-reduced-motion:reduce){.oll-orca,.oll-scan{animation:none}.oll *{scroll-behavior:auto!important}}
      `}</style>

      <div className="oll-noise" />
      <header className="oll-top">
        <Link className="oll-brand" to="/species/orca">
          <span className="oll-brand-dot" /> <strong>4PLANET_</strong><span>ORCA · LIGHT LENS</span>
        </Link>
        <div className="oll-controls" aria-label="Light Lens controls">
          <Link className="oll-control" to="/species/orca">REAL WORLD</Link>
          {(Object.keys(PALETTES) as PaletteKey[]).map((key) => (
            <button key={key} className="oll-control" aria-pressed={paletteKey === key} onClick={() => setPaletteKey(key)}>{PALETTES[key].name}</button>
          ))}
          <button className="oll-control" aria-pressed={gridOn} onClick={() => setGridOn((value) => !value)}>GRID</button>
        </div>
      </header>

      <section className="oll-stage">
        <div className="oll-room">
          <div className="oll-exp"><b>EXPERIMENT</b> · SOURCE-AWARE · NOT LIVE TRACKING</div>
          <div className="oll-grid" style={{ opacity: gridOn ? 1 : 0 }} />
          <div className="oll-horizon" />
          <div className="oll-copy">
            <div className="oll-kicker">SCENE {scene.no} · {scene.kicker}</div>
            <h1 className="oll-title">ORCA <em>LIGHT LENS</em></h1>
            <p className="oll-summary">{chapter?.summary ?? profile.context}</p>
          </div>
          <div className="oll-species">
            <OrcaProjection accent={palette.accent} />
            <div className="oll-scan" />
            <div className="oll-node n1"><span>ORCINUS ORCA</span></div>
            <div className="oll-node n2"><span>SOCIAL RELATION</span></div>
            <div className="oll-node n3"><span>OCEAN CONTEXT</span></div>
          </div>
          <nav className="oll-scene-rail" aria-label="Journey scenes">
            {SCENES.map((item, index) => (
              <button key={item.id} className={`oll-scene ${index === sceneIndex ? "active" : ""}`} onClick={() => setSceneIndex(index)}>
                <strong>{item.no}</strong><span>{item.title}</span>
              </button>
            ))}
          </nav>
        </div>

        <aside className="oll-panel">
          <div className="oll-mode"><span className="oll-pill">LIGHT LENS</span><span className="oll-pill">SCENE {scene.no}/07</span></div>
          <h2>{scene.title}</h2>
          <p className="oll-note">{scene.note}</p>
          <div className="oll-rule"><div className="oll-rule-label">NATURE RULE</div><p>Nature is the hero. Light is the lens. Every line must reveal a real relationship or a clearly labelled interpretation.</p></div>
          <div className="oll-rule"><div className="oll-rule-label">MOTION RULE</div><p>Slow drift, trace, focus, settle. Water supplies the behaviour; the interface supplies the control.</p></div>
          {claim && (
            <div className="oll-evidence">
              <div className="oll-state" style={{ color: stateColour(claim.state, palette.accent) }}>{claim.state} · CHECKED {claim.checkedAt}</div>
              <h3>{claim.label}</h3>
              <p style={{ margin: 0, color: "#aab4ad", fontSize: 11.5, lineHeight: 1.55 }}>{claim.text}</p>
              {claim.sourceUrl && <a className="oll-source" href={claim.sourceUrl} target="_blank" rel="noreferrer">{claim.sourceLabel ?? "OPEN SOURCE"} ↗</a>}
            </div>
          )}
          <div className="oll-bottom">
            <button className="oll-action primary" onClick={() => setSceneIndex((sceneIndex + 1) % SCENES.length)}><span>NEXT SCENE</span><span>→</span></button>
            <Link className="oll-action" to="/species/orca"><span>OPEN ORCA PROFILE</span><span>↗</span></Link>
            <Link className="oll-action" to="/atlas?entity=taxon:gbif:2440483"><span>OPEN IN ATLAS</span><span>↗</span></Link>
          </div>
        </aside>
      </section>
    </main>
  );
}
