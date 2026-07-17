import { Link } from "react-router-dom";
import { T } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section, Label, Button } from "@/components/ui";

export function LivingSystems() {
  const LS = "https://4p-living-systems-v1-4-1.pages.dev/";
  const ATLAS = "https://4planet-atlas-mobile.pages.dev/";
  return (
    <PublicShell>
      <Section pad="clamp(48px,7vw,96px)">
        <Label color={T.blue} style={{ marginBottom: 16 }}>4PLANET_ LIVING SYSTEMS_</Label>
        <h1 style={{ fontWeight: 500, color: T.ink, fontSize: "clamp(32px,3.4vw,48px)", letterSpacing: "-.035em", lineHeight: 1.04, maxWidth: 820 }}>
          Making the relationships that make life possible visible.
        </h1>
        <p style={{ fontSize: "clamp(16px,2vw,18px)", color: T.ink, marginTop: 18, maxWidth: 660, lineHeight: 1.6 }}>
          4Planet Living Systems explains how species, ecosystems, ecological functions, ecosystem services, human systems, threats and solutions connect.
        </p>

        <div className="os-two" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", marginTop: 38, border: `1px solid ${T.line}` }}>
          <div style={{ padding: "clamp(24px,3vw,40px)" }}>
            <div className="mono meta-blue" style={{ fontSize: 11, letterSpacing: ".08em" }}>4PLANET LIVING SYSTEMS_</div>
            <p style={{ fontSize: 15.5, color: T.ink, marginTop: 12, lineHeight: 1.55, maxWidth: 420 }}>
              Making the relationships that make life possible visible.
            </p>
            <div style={{ marginTop: 20 }}><Button href={LS} newTab arrow>EXPLORE LIVING SYSTEMS ↗</Button></div>
          </div>
          <div style={{ padding: "clamp(24px,3vw,40px)", borderLeft: `1px solid ${T.line}` }}>
            <div className="mono meta-blue" style={{ fontSize: 11, letterSpacing: ".08em" }}>4PLANET ATLAS_</div>
            <p style={{ fontSize: 15.5, color: T.ink, marginTop: 12, lineHeight: 1.55, maxWidth: 420 }}>
              A spatial prototype for exploring ecological systems, places and pathways.
            </p>
            <div style={{ marginTop: 20 }}><Button href={ATLAS} newTab arrow>EXPLORE ATLAS — PROTOTYPE ↗</Button></div>
          </div>
        </div>
      </Section>
    </PublicShell>
  );
}
