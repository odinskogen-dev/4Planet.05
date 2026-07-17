import { Link } from "react-router-dom";
import { T } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section } from "@/components/ui";
import { Reveal } from "@/components/Cinematic";

const display: React.CSSProperties = { fontFamily: T.display, fontWeight: 500, letterSpacing: "-.025em" };
const h: React.CSSProperties = { fontFamily: T.mono, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase", color: T.blue };

const CONTACT = "odin.skogen@gmail.com";

const SECTIONS: [string, React.ReactNode][] = [
  ["What we collect", "When you register interest through a 4People, 4Brands, 4Partners or 4Funders form, we collect the details you enter — such as your name, email, organisation, role and the interest or message you provide. We do not collect payment details, and there is no account to create."],
  ["Why we collect it", "We use your information only to process your enquiry and to contact you about the part of 4Planet you registered interest in, as it opens."],
  ["How it is processed", "Submissions are handled server-side and, once configured, forwarded to carefully selected service providers used to operate interest registration and communication. We do not sell your information or use it for unrelated advertising. Where a webhook is not yet configured, the form tells you clearly that it is not collecting information yet."],
  ["How to request deletion", <>You can ask us to remove your details at any time. Email <a href={`mailto:${CONTACT}`} className="link" style={{ color: T.blue }}>{CONTACT}</a> and we will delete the information we hold about you.</>],
  ["Contact", <>Questions about privacy can be sent to <a href={`mailto:${CONTACT}`} className="link" style={{ color: T.blue }}>{CONTACT}</a>. 4Planet is operated by Skog Communications AS.</>],
];

export default function Privacy() {
  return (
    <PublicShell>
      <Section pad="clamp(56px,8vw,110px)">
        <Reveal>
          <div style={{ ...h, marginBottom: 20 }}>PRIVACY NOTE</div>
          <h1 style={{ ...display, color: T.ink, fontSize: "clamp(30px,4.4vw,56px)", lineHeight: 1.02, maxWidth: 720 }}>How 4Planet handles your information.</h1>
          <p style={{ fontSize: "clamp(16px,1.3vw,19px)", color: T.ink, opacity: .7, marginTop: 20, maxWidth: 640, lineHeight: 1.6 }}>A short, plain-language note. It covers only interest registration — the one place 4Planet collects any personal information today.</p>
        </Reveal>
        <div style={{ marginTop: "clamp(40px,6vw,72px)", display: "grid", gap: "clamp(28px,4vw,44px)", maxWidth: 760 }}>
          {SECTIONS.map(([title, body]) => (
            <Reveal key={title}>
              <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 18 }}>
                <div style={h}>{title}</div>
                <p style={{ fontSize: "clamp(15px,1.2vw,17px)", color: T.ink, marginTop: 12, lineHeight: 1.65 }}>{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div style={{ marginTop: "clamp(40px,5vw,64px)" }}>
          <Link to="/people" className="link" style={{ fontSize: 14, color: T.blue }}>← Back to participation</Link>
        </div>
      </Section>
    </PublicShell>
  );
}
