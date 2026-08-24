import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import type { StripeProductKey } from "@/payments/stripe";

interface LabProduct {
  key: StripeProductKey;
  label: string;
  detail: string;
  referenceKey?: string;
}

const IMPACT: LabProduct[] = [
  { key: "impact_tree", label: "PLANT TREES", detail: "IMPACT · one-time · TEST unit" },
  { key: "impact_plastic", label: "CLEAN PLASTIC", detail: "IMPACT · one-time · TEST unit" },
  { key: "impact_coral", label: "RESTORE CORAL", detail: "IMPACT · one-time · TEST unit" },
  { key: "impact_rewild", label: "REWILD NATURE", detail: "IMPACT · one-time · TEST unit" },
];

const CORE: LabProduct[] = [
  { key: "support_4planet", label: "SUPPORT 4PLANET", detail: "Support · one-time · no tax-deductible claim" },
  { key: "founding_patron", label: "BECOME A FOUNDING PATRON", detail: "Patron support · one-time · TEST" },
  { key: "membership_supporter", label: "4PLANET MEMBERSHIP", detail: "Membership · monthly subscription · TEST" },
  { key: "sponsor_package", label: "SPONSOR PACKAGE", detail: "Sponsor · one-time · TEST" },
  { key: "mission_sponsor", label: "MISSION SPONSOR", detail: "Sponsor · WH4LES_ reference for TEST", referenceKey: "wh4les" },
  { key: "project_sponsor", label: "PROJECT SPONSOR", detail: "Sponsor · test-project reference", referenceKey: "test-project" },
];

const MISSIONS: LabProduct[] = [
  ["mission_supporter_cle4n", "CLE4N_"],
  ["mission_supporter_wh4les", "WH4LES_"],
  ["mission_supporter_cor4l", "COR4L_"],
  ["mission_supporter_rewild_marine", "RE:WILD_ Marine"],
  ["mission_supporter_clim4te", "CLIM4TE_"],
  ["mission_supporter_am4zonia", "AM4ZONIA_"],
  ["mission_supporter_species", "SPECIES_"],
  ["mission_supporter_rewild_land", "RE:WILD_ Land"],
  ["mission_supporter_food", "FOOD_"],
  ["mission_supporter_en4rgy", "EN4RGY_"],
  ["mission_supporter_circular_city", "CIRCULAR CITY_"],
  ["mission_supporter_f4shion", "F4SHION_"],
  ["mission_supporter_m4gazine", "M4GAZINE_"],
  ["mission_supporter_4rt", "4RT_"],
  ["mission_supporter_4film", "4FILM_"],
  ["mission_supporter_4play", "4PLAY_"],
].map(([key, label]) => ({ key: key as StripeProductKey, label: `SUPPORT ${label}`, detail: "Mission Supporter · monthly subscription · TEST" }));

function ProductRow({ item }: { item: LabProduct }) {
  const href = `/checkout/review/${encodeURIComponent(item.key)}${item.referenceKey ? `?reference=${encodeURIComponent(item.referenceKey)}` : ""}`;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 18, alignItems: "center", padding: "17px 0", borderTop: "1px solid rgba(255,255,255,.13)" }}>
      <div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>{item.label}</div>
        <div style={{ marginTop: 4, fontSize: 12, opacity: .55 }}>{item.detail}</div>
      </div>
      <Link to={href} style={{ minWidth: 124, border: "1px solid rgba(255,255,255,.7)", background: "transparent", color: "#fff", padding: "10px 13px", textDecoration: "none", fontSize: 12, textAlign: "center" }}>REVIEW TEST</Link>
    </div>
  );
}

function Group({ title, items }: { title: string; items: LabProduct[] }) {
  return (
    <section style={{ marginTop: 54 }}>
      <h2 style={{ margin: "0 0 14px", fontSize: 13, letterSpacing: ".12em", fontWeight: 500 }}>{title}</h2>
      {items.map((item) => <ProductRow key={item.key} item={item} />)}
    </section>
  );
}

export default function CommerceStripeLab() {
  useEffect(() => { document.title = "Stripe Commerce Lab — 4PLANET"; }, []);
  const host = useMemo(() => typeof window === "undefined" ? "" : window.location.hostname, []);
  return (
    <main style={{ minHeight: "100vh", background: "#070707", color: "#fff", fontFamily: "DM Sans, Arial, sans-serif", padding: "28px 20px 90px" }}>
      <div style={{ width: "min(980px,100%)", margin: "0 auto" }}>
        <header style={{ borderTop: "1px solid rgba(255,255,255,.75)", paddingTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 18, fontSize: 12, letterSpacing: ".08em" }}>
            <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>4PLANET_</Link>
            <span style={{ opacity: .6 }}>TEST KING · STRIPE LAB</span>
          </div>
          <h1 style={{ margin: "74px 0 18px", maxWidth: 760, fontSize: "clamp(46px, 8vw, 88px)", lineHeight: .92, letterSpacing: "-.06em", fontWeight: 500 }}>One payment engine. Different truths.</h1>
          <p style={{ maxWidth: 700, fontSize: 18, lineHeight: 1.55, opacity: .72 }}>Engineering-only Stripe sandbox. All current catalogue prices are synthetic NOK 10 test values. Every checkout now passes through the consumer review layer before Stripe opens. No partner delivery, sponsorship rights, tax deduction, membership entitlement or ecological outcome is created outside the explicit financial TEST state.</p>
          <div style={{ marginTop: 26, display: "inline-block", border: "1px solid rgba(255,255,255,.25)", padding: "8px 10px", fontSize: 11, opacity: .7 }}>HOST · {host || "LOCAL"}</div>
        </header>

        <Group title="01 · IMPACT" items={IMPACT} />
        <Group title="02 · CORE REVENUE / SUPPORT" items={CORE} />
        <Group title="03 · 16 MISSION SUPPORTERS" items={MISSIONS} />

        <section style={{ marginTop: 54, borderTop: "1px solid rgba(255,255,255,.13)", paddingTop: 18 }}>
          <h2 style={{ margin: 0, fontSize: 13, letterSpacing: ".12em", fontWeight: 500 }}>04 · B2B / PILOT FUNDER</h2>
          <p style={{ maxWidth: 670, marginTop: 14, lineHeight: 1.55, opacity: .66 }}>Large B2B and negotiated pilot funding does not use a public buy button. The server-side Stripe Invoicing path creates a draft tied to an approved funding object and requires internal authentication plus human review before sending.</p>
        </section>
      </div>
    </main>
  );
}
