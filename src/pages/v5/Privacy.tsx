import { Link } from "react-router-dom";
import { T } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { Seo } from "@/components/Seo";
import { resetAnalyticsConsent } from "@/analytics/Analytics";
import { Section } from "@/components/ui";
import { Reveal } from "@/components/Cinematic";

const display: React.CSSProperties = { fontFamily: T.display, fontWeight: 500, letterSpacing: "-.025em" };
const h: React.CSSProperties = { fontFamily: T.mono, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase", color: T.blue };

const CONTACT = "privacy@4planet.org";

const SECTIONS: [string, React.ReactNode][] = [
  ["What we collect", "When you register interest through a 4People, 4Brands, 4Partners or 4Funders form, we collect the details you enter — such as your name, email, organisation, role and the interest or message you provide. We do not collect payment details through those interest forms, and there is no account to create."],
  ["Privacy-first site measurement", "Where enabled on a 4PLANET-controlled domain, Cloudflare Web Analytics provides aggregate page-view and real-user performance measurement. Cloudflare documents this product as cookie-free and as not collecting or using visitors’ personal data. It is used as a baseline for understanding site traffic and performance, not for advertising or cross-site user profiles."],
  ["Optional product analytics", <>Where configured, Google Analytics 4 is loaded only after you choose <strong>ALLOW</strong>. We use it to understand navigation between product areas and selected product interactions such as reading depth or deeper exploration. The 4PLANET implementation disables Google Signals and advertising-personalisation signals. We do not intentionally send names, email addresses or free-text enquiry contents through the analytics event layer.</>],
  ["Cross-domain measurement", "The same optional analytics property may be used across 4PLANET-controlled domains so a consented visit can be understood as one product journey rather than several unrelated sessions. The active domain list is configuration-controlled. GA4 is not loaded when its measurement configuration is absent or when you decline."],
  ["Why we collect it", "Interest-registration information is used to process your enquiry and contact you about the part of 4Planet you registered interest in. Aggregate site measurement and optional product analytics are used to understand and improve the public product experience."],
  ["How it is processed", "Interest submissions are handled server-side and, once configured, forwarded to selected service providers used to operate registration and communication. Aggregate Web Analytics is processed through Cloudflare where enabled. Optional product analytics is processed through Google Analytics only when consent is granted. We do not sell your information or use the 4PLANET analytics layer for advertising personalisation."],
  ["Your optional analytics choice", <><button type="button" onClick={resetAnalyticsConsent} style={{ border: `1px solid ${T.ink}`, background: "transparent", color: T.ink, padding: "9px 12px", cursor: "pointer", font: "inherit" }}>RESET ANALYTICS CHOICE</button><span style={{ display: "block", marginTop: 10, opacity: .7 }}>This removes the local 4PLANET GA4-consent choice and reloads the page so you can decide again. It does not control Cloudflare’s cookie-free aggregate Web Analytics where that service is enabled.</span></>],
  ["How to request deletion", <>You can ask us to remove personal details you submitted at any time. Email <a href={`mailto:${CONTACT}`} className="link" style={{ color: T.blue }}>{CONTACT}</a> and we will remove the information we hold about that enquiry where applicable.</>],
  ["Contact", <>Questions about privacy can be sent to <a href={`mailto:${CONTACT}`} className="link" style={{ color: T.blue }}>{CONTACT}</a>. 4Planet is currently operated by Skog Communications AS.</>],
];

export default function Privacy() {
  return (
    <PublicShell>
      <Seo title="Privacy | 4PLANET" description="How 4PLANET handles interest-registration data, aggregate site measurement and optional product analytics." path="/privacy" />
      <Section pad="clamp(56px,8vw,110px)">
        <Reveal>
          <div style={{ ...h, marginBottom: 20 }}>PRIVACY NOTE</div>
          <h1 style={{ ...display, color: T.ink, fontSize: "clamp(30px,4.4vw,56px)", lineHeight: 1.02, maxWidth: 720 }}>How 4Planet handles your information.</h1>
          <p style={{ fontSize: "clamp(16px,1.3vw,19px)", color: T.ink, opacity: .7, marginTop: 20, maxWidth: 640, lineHeight: 1.6 }}>A plain-language note covering current interest registration and public-product measurement.</p>
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
