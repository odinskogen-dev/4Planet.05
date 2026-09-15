import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { T } from "@/styles/tokens";

const WORKS = [
  {
    id: "OO-014",
    title: "Arctic White Angel",
    place: "Norway",
    year: "2020",
    image: "https://drive.google.com/thumbnail?id=18DxTXvytbR73SqlQtrYYVEf-Ht8kjbrV&sz=w1800",
    alt: "Arctic White Angel — photograph by Odin Oddekalv",
  },
  {
    id: "OO-030",
    title: "Mulafossur",
    place: "Faroe Islands",
    year: "2022",
    image: "https://drive.google.com/thumbnail?id=1G3H8_isp5mq-HE61vICNQ4r5LEIBiLJz&sz=w1800",
    alt: "Mulafossur — photograph by Odin Oddekalv",
  },
  {
    id: "OO-045",
    title: "Unstad Arctic Surf",
    place: "Lofoten, Norway",
    year: "2020",
    image: "https://drive.google.com/thumbnail?id=1mb-8vRTdGQGE6H_LhECy4jUsaCg9MN_y&sz=w1800",
    alt: "Unstad Arctic Surf — photograph by Odin Oddekalv",
  },
] as const;

const mono: React.CSSProperties = {
  fontFamily: T.mono,
  fontSize: 10.5,
  letterSpacing: ".14em",
  textTransform: "uppercase",
};

const display: React.CSSProperties = {
  fontFamily: T.display,
  fontWeight: 500,
  letterSpacing: "-.045em",
};

function CreatorHeader() {
  return (
    <section style={{ background: "#f5f3ee", color: T.ink, borderBottom: `1px solid ${T.lineStrong}` }}>
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "clamp(96px,11vw,170px) clamp(20px,5vw,72px) clamp(52px,7vw,92px)" }}>
        <div style={{ ...mono, color: T.blue }}>CRE4TOR_01 · ODIN ODDEKALV</div>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(280px,.8fr)", gap: "clamp(34px,8vw,120px)", alignItems: "end", marginTop: 22 }}>
          <h1 style={{ ...display, margin: 0, fontSize: "clamp(54px,9vw,132px)", lineHeight: .82, maxWidth: "8ch" }}>Nature as witness.</h1>
          <div>
            <p style={{ margin: 0, maxWidth: 560, fontSize: "clamp(17px,1.5vw,21px)", lineHeight: 1.62, color: T.dim }}>
              Photography by Odin Oddekalv. The first creator in 4PLANET MARKET — a shared home for work made from, with and for the living planet.
            </p>
            <div style={{ ...mono, marginTop: 22, color: T.dim }}>PHOTOGRAPHY · LIMITED PRINT RELEASE / FIRST COLLECTION</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkCard({ work, index }: { work: typeof WORKS[number]; index: number }) {
  return (
    <article style={{ borderTop: `1px solid ${T.lineStrong}`, paddingTop: 18 }}>
      <div style={{ position: "relative", aspectRatio: index === 0 ? "4 / 5" : "3 / 2", overflow: "hidden", background: "#dedbd3" }}>
        <img src={work.image} alt={work.alt} loading={index === 0 ? "eager" : "lazy"} decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 22, alignItems: "baseline", paddingTop: 14 }}>
        <div>
          <h2 style={{ ...display, margin: 0, fontSize: "clamp(22px,2.4vw,34px)", lineHeight: 1 }}>{work.title}</h2>
          <div style={{ ...mono, color: T.dim, marginTop: 8 }}>{work.place} · {work.year}</div>
        </div>
        <div style={{ ...mono, color: T.blue }}>{work.id}</div>
      </div>
      <div style={{ marginTop: 14, padding: "13px 0 0", borderTop: `1px solid ${T.lineStrong}` }}>
        <div style={{ ...mono, color: T.dim }}>PRINT RELEASE · PRICE / SIZE / FULFILMENT LOCK IN PROGRESS</div>
      </div>
    </article>
  );
}

export function OdinCreatorPage() {
  return (
    <PublicShell>
      <CreatorHeader />
      <main style={{ background: "#fff", color: T.ink }}>
        <section style={{ maxWidth: 1440, margin: "0 auto", padding: "clamp(52px,7vw,96px) clamp(20px,5vw,72px)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 24, alignItems: "baseline", marginBottom: 34 }}>
            <div style={{ ...mono, color: T.blue }}>SELECTED WORKS_</div>
            <div style={{ ...mono, color: T.dim }}>01 / FIRST CREATOR PROOF</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))", gap: "clamp(34px,5vw,74px) clamp(22px,3vw,44px)" }}>
            {WORKS.map((work, index) => <WorkCard key={work.id} work={work} index={index} />)}
          </div>
        </section>

        <section style={{ background: "#090909", color: "#fff" }}>
          <div style={{ maxWidth: 1440, margin: "0 auto", padding: "clamp(70px,9vw,132px) clamp(20px,5vw,72px)", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(280px,.7fr)", gap: "clamp(36px,8vw,120px)", alignItems: "end" }}>
            <div>
              <div style={{ ...mono, color: "#85a7ff" }}>4PLANET MARKET_</div>
              <h2 style={{ ...display, margin: "16px 0 0", fontSize: "clamp(44px,7vw,96px)", lineHeight: .88, maxWidth: "9ch" }}>Creators for a living planet.</h2>
            </div>
            <div>
              <p style={{ margin: 0, color: "rgba(255,255,255,.76)", fontSize: "clamp(16px,1.4vw,19px)", lineHeight: 1.65 }}>
                CRE4TOR is the creator-facing layer of 4PLANET MARKET. Creator identity, rights, work, product, fulfilment, transaction and proof stay connected without creating a second marketplace truth system.
              </p>
              <Link to="/market" style={{ ...mono, display: "inline-flex", marginTop: 26, color: "#fff", textDecoration: "none" }}>ENTER 4PLANET MARKET →</Link>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}

export function MarketHome() {
  return (
    <PublicShell>
      <main style={{ background: "#f5f3ee", color: T.ink, minHeight: "100vh" }}>
        <section style={{ maxWidth: 1440, margin: "0 auto", padding: "clamp(110px,13vw,190px) clamp(20px,5vw,72px) clamp(72px,8vw,120px)" }}>
          <div style={{ ...mono, color: T.blue }}>4PLANET MARKET_ · FIRST CREATOR PROOF</div>
          <h1 style={{ ...display, margin: "18px 0 0", fontSize: "clamp(62px,10vw,148px)", lineHeight: .8, maxWidth: "8ch" }}>Made by people who care.</h1>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.15fr) minmax(260px,.65fr)", gap: "clamp(30px,7vw,100px)", alignItems: "end", marginTop: "clamp(42px,7vw,88px)" }}>
            <img src={WORKS[0].image} alt={WORKS[0].alt} decoding="async" style={{ width: "100%", display: "block", aspectRatio: "4 / 3", objectFit: "cover" }} />
            <div>
              <div style={{ ...mono, color: T.dim }}>FIRST CREATOR</div>
              <h2 style={{ ...display, margin: "12px 0 0", fontSize: "clamp(34px,4.5vw,60px)", lineHeight: .92 }}>Odin Oddekalv</h2>
              <p style={{ margin: "18px 0 0", color: T.dim, fontSize: 17, lineHeight: 1.62 }}>Photography from the edge of land, weather and living systems. The first bounded creator proof for 4PLANET MARKET.</p>
              <Link to="/cre4tor/odin" style={{ ...mono, display: "inline-flex", marginTop: 26, color: T.ink, textDecoration: "none", borderBottom: `1px solid ${T.ink}`, paddingBottom: 5 }}>VIEW CREATOR →</Link>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}

export default MarketHome;
