import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { startStripeCheckout, type StripeProductKey } from "@/payments/stripe";

interface LabProduct { key: StripeProductKey; label: string; detail: string; }

const IMPACT: LabProduct[] = [
  { key: "impact_tree", label: "PLANT TREES", detail: "IMPACT architecture · TEST only · no physical delivery" },
  { key: "impact_plastic", label: "CLEAN PLASTIC", detail: "IMPACT architecture · TEST only · no physical delivery" },
  { key: "impact_coral", label: "RESTORE CORAL", detail: "IMPACT architecture · TEST only · no physical delivery" },
  { key: "impact_rewild", label: "REWILD NATURE", detail: "IMPACT architecture · TEST only · no physical delivery" },
];
const CORE: LabProduct[] = [{ key: "support_4planet", label: "SUPPORT 4PLANET", detail: "NOK 50/month · recurring · approved public model" }];
const MISSIONS: LabProduct[] = [
  ["mission_supporter_cle4n", "CLE4N_"], ["mission_supporter_wh4les", "WH4LES_"], ["mission_supporter_cor4l", "COR4L_"], ["mission_supporter_rewild_marine", "RE:WILD_ Marine"],
  ["mission_supporter_clim4te", "CLIM4TE_"], ["mission_supporter_am4zonia", "AM4ZONIA_"], ["mission_supporter_species", "SPECIES_"], ["mission_supporter_rewild_land", "RE:WILD_ Land"],
  ["mission_supporter_food", "FOOD_"], ["mission_supporter_en4rgy", "EN4RGY_"], ["mission_supporter_circular_city", "CIRCULAR CITY_"], ["mission_supporter_f4shion", "F4SHION_"],
  ["mission_supporter_m4gazine", "M4GAZINE_"], ["mission_supporter_4rt", "4RT_"], ["mission_supporter_4film", "4FILM_"], ["mission_supporter_4play", "4PLAY_"],
].map(([key, label]) => ({ key: key as StripeProductKey, label: `SUPPORT ${label}`, detail: "Mission Supporter · recurring · approved public model" }));

function ProductRow({ item }: { item: LabProduct }) {
  const [state, setState] = useState<"idle" | "opening" | "error">("idle");
  const run = async () => { setState("opening"); try { await startStripeCheckout({ productKey: item.key, quantity: 1 }); } catch { setState("error"); } };
  return <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 18, alignItems: "center", padding: "17px 0", borderTop: "1px solid rgba(255,255,255,.13)" }}><div><div style={{ fontSize: 16, fontWeight: 600 }}>{item.label}</div><div style={{ marginTop: 4, fontSize: 12, opacity: .55 }}>{item.detail}</div></div><button type="button" onClick={run} disabled={state === "opening"} style={{ minWidth: 124, border: "1px solid rgba(255,255,255,.7)", background: "transparent", color: "#fff", padding: "10px 13px", cursor: "pointer", font: "inherit", fontSize: 12 }}>{state === "opening" ? "OPENING…" : state === "error" ? "UNAVAILABLE" : "TEST CHECKOUT"}</button></div>;
}
function Group({ title, items }: { title: string; items: LabProduct[] }) { return <section style={{ marginTop: 54 }}><h2 style={{ margin: "0 0 14px", fontSize: 13, letterSpacing: ".12em", fontWeight: 500 }}>{title}</h2>{items.map((item) => <ProductRow key={item.key} item={item} />)}</section>; }

export default function CommerceStripeLab() {
  useEffect(() => { document.title = "Stripe Commerce Lab — 4PLANET"; }, []);
  const host = useMemo(() => typeof window === "undefined" ? "" : window.location.hostname, []);
  return <main style={{ minHeight: "100vh", background: "#070707", color: "#fff", fontFamily: "DM Sans, Arial, sans-serif", padding: "28px 20px 90px" }}><div style={{ width: "min(980px,100%)", margin: "0 auto" }}>
    <header style={{ borderTop: "1px solid rgba(255,255,255,.75)", paddingTop: 18 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 18, fontSize: 12, letterSpacing: ".08em" }}><Link to="/" style={{ color: "inherit", textDecoration: "none" }}>4PLANET_</Link><span style={{ opacity: .6 }}>TEST KING · STRIPE LAB</span></div><h1 style={{ margin: "74px 0 18px", maxWidth: 760, fontSize: "clamp(46px, 8vw, 88px)", lineHeight: .92, letterSpacing: "-.06em", fontWeight: 500 }}>One payment engine. Different truths.</h1><p style={{ maxWidth: 720, fontSize: 18, lineHeight: 1.55, opacity: .72 }}>TEST validates payment plumbing. SUPPORT is monthly NOK 50 in parity with LIVE; Mission Supporters remain recurring TEST objects. IMPACT stays TEST-only and never represents physical delivery.</p><div style={{ marginTop: 26, display: "inline-block", border: "1px solid rgba(255,255,255,.25)", padding: "8px 10px", fontSize: 11, opacity: .7 }}>HOST · {host || "LOCAL"}</div></header>
    <Group title="01 · APPROVED RECURRING SUPPORT" items={CORE} />
    <Group title="02 · 16 MISSION SUPPORTERS" items={MISSIONS} />
    <Group title="03 · IMPACT TEST ARCHITECTURE" items={IMPACT} />
    <section style={{ marginTop: 54, borderTop: "1px solid rgba(255,255,255,.13)", paddingTop: 18 }}><h2 style={{ margin: 0, fontSize: 13, letterSpacing: ".12em", fontWeight: 500 }}>04 · NEGOTIATED SUPPORT</h2><p style={{ maxWidth: 720, marginTop: 14, lineHeight: 1.55, opacity: .66 }}>Project Sponsor, Mission Sponsor and Founding Patron never use public Checkout. Public sliders record intended amounts only. A reviewed agreement can later generate a draft Stripe Invoice. Generic Paid Pilot and separate paid Membership are retired from the public launch model.</p></section>
  </div></main>;
}
