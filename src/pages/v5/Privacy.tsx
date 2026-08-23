import { Link } from "react-router-dom";
import { T } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { Seo } from "@/components/Seo";
import { resetAnalyticsConsent } from "@/analytics/Analytics";
import { Section } from "@/components/ui";
import { Reveal } from "@/components/Cinematic";

const display: React.CSSProperties = { fontFamily: T.display, fontWeight: 500, letterSpacing: "-.025em" };
const h: React.CSSProperties = { fontFamily: T.mono, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase", color: T.blue };

const CONTACT = "odin.skogen@gmail.com";

const SECTIONS: [string, React.ReactNode][] = [
  ["What we collect", "When you register interest through a 4People, 4Brands, 4Partners or 4Funders form, we collect the details you enter — such as your name, email, organisation, role and the interest or message you provide. We do not collect payment details through those interest forms, and there is no account to create."],
  ["Optional usage analytics", <>Where analytics is enabled on a live 4PLANET domain, Google Analytics 4 is loaded only after you choose <strong>ALLOW</strong>. We use it to understand page visits, navigation between product areas and selected product interactions. The 4PLANET implementation disables Google Signals and advertising-personalisation signals. We do not intentionally send names, email addresses or free-text enquiry contents through the analytics event layer.</>],
  ["Cross-domain measurement", "The same analytics property may be used across 4PLANET-controlled domains so a consented visit can be understood as one journey rather than several unrelated sessions. The active domain list is configuration-controlled. Analytics is not loaded when the measurement configuration is absent or when you decline."],
  ["Why we collect it", "Interest-registration information is used to process your enquiry and contact you about the part of 4Planet you registered interest in. Optional usage analytics is used to understand and improve the public product experience."],
  ["How it is processed", "Interest submissions are handled server-side and, once configured, forwarded to selected service providers used to operate registration and communication. Optional usage analytics is processed through Google Analytics when consent is granted. We do not sell your information or use the 4PLANET analytics layer for advertising personalisation."],
  ["Your analytics choice", <><button type="button" onClick={resetAnalyticsConsent} style={{ border: `1px solid ${T.ink}`, background: "transparent", color: T.ink, padding: "9px 12px", cursor: "pointer", font: "inherit" }}>RESET ANALYTICS CHOICE</button><span style={{ display: "block", marginTop: 10, opacity: .7 }}>This removes the local 4PLANET analytics-consent choice and reloads the page so you can decide again.</span></>],
  ["How to request deletion", <>You can ask us to remove personal details you submitted at any time. Email <a href={`mailto:${CONTACT}`} className="link" style={{ color: T.blue }}>{CONTACT}</a> and we will remove the information we hold about that enquiry where applicable.</>],
  ["Contact", <>Questions about privacy can be sent to <a href={`mailto:${CONTACT}`} className="link" style={{ color: T.blue }}>{CONTACT}</a>. 4Planet is currently operated by Skog Communications AS.</>],
];

export default function Privacy() {
  return (
    <PublicShell>
      <Seo title="Privacy | 4PLANET" description="How 4PLANET handles interest-registration data and optional usage analytics." path="/privacy" />
      <Section pad="clamp(56px,8vw,110px)">
        <Reveal>
          <div style={{ ...h, marginBottom: 20 }}>PRIVACY NOTE</div>
          <h1 style={{ ...display, color: T.ink, fontSize: "clamp(30px,4.4vw,56px)", lineHeight: 1.02, maxWidth: 720 }}>How 4Planet handles your information.</h1>
          <p style={{ fontSize: "clamp(16px,1.3vw,19px)", color: T.ink, opacity: .7, marginTop: 20, maxWidth: 640, lineHeight: 1.6 }}>A plain-language note covering current interest registration and the optional usage-analytics layer.</p>
        </Reveal>
        <div style={{ marginTop: "clamp(40px,6vw,72px)", display: "grid", gap: "clamp(28px,4vw,44px)", maxWidth: 760 }}>
          {SECTIONS.map(([title, body]) => (
            <Reveal key={title}>
              <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 18 }}>
                <div style={h}>{title}</div>
                <div style={{ fontSize: "clamp(15px,1.2vw,17px)", color: T.ink, marginTop: 12, lineHeight: 1.65 }}>{body}</div>
              </div>
            </Reveal>
          ))}
        </div>
        <div style={{ marginTop: "clamp(40px,5vw,64px)" }}>
          <Link to="/join" className="link" style={{ fontSize: 14, color: T.blue }}>← Back to participation</Link>
        </div>
      </Section>
    </PublicShell>
  );
}
