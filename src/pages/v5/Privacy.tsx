import { Link } from "react-router-dom";
import { T } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section } from "@/components/ui";
import { Reveal } from "@/components/Cinematic";

const display: React.CSSProperties = { fontFamily: T.display, fontWeight: 500, letterSpacing: "-.025em" };
const h: React.CSSProperties = { fontFamily: T.mono, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase", color: T.blue };

const CONTACT = "odin.skogen@gmail.com";
const LEGAL_NAME = "SKOG COMMUNICATIONS AS";
const ORG_NO = "923 003 789";
const ADDRESS = "Sandakerveien 52, 0477 Oslo, Norway";

const SECTIONS: [string, React.ReactNode][] = [
  ["Who is responsible", <>{LEGAL_NAME}, organisation no. {ORG_NO}, is the current legal operator of the 4Planet public release candidate. Registered address: {ADDRESS}. 4Planet is not presented here as a foundation or non-profit organisation.</>],
  ["What we collect", "When you register interest through Join 4Planet or a 4People, 4Brands, 4Partners or 4Funders form, we collect only the details you enter — such as your name, email, organisation, role, selected interest and message. We do not collect payment details and no account is created."],
  ["Why we collect it", "The purpose is to process the specific enquiry or registration you submit and to contact you about that stated interest. The form requires an active consent choice. Your information is not intended to be reused for unrelated advertising."],
  ["How submissions are handled", "Forms post to a server-side 4Planet endpoint. Persistent capture is enabled only when an approved destination is configured. If no approved destination is configured, the interface reports that nothing was stored or sent. Before public data capture is enabled, the production destination and any processor must be recorded in this notice and the operational privacy register."],
  ["Retention", "4Planet will keep identifiable registration information only for as long as it is needed for the stated contact or relationship purpose. A production retention period and deletion routine must be approved before persistent public capture is enabled; until that control is closed, data capture remains a release dependency rather than an assumed capability."],
  ["Cookies and local device storage", "The current public candidate does not intentionally use advertising or behavioural-tracking cookies. Some prototype functions can store local-only state on your device — for example follows or test-only Impact records. If analytics, marketing tags or other non-essential tracking are introduced, they must remain disabled until the required information and consent controls are in place."],
  ["Your choices and rights", <>You can withdraw consent or ask for access, correction, deletion or restriction of information held about you. Use the privacy contact below. A withdrawal applies to future processing based on that consent.</>],
  ["Privacy contact", <>Until a canonical 4planet.org mailbox is activated and verified, privacy requests are handled through the temporary pre-release contact <a href={`mailto:${CONTACT}`} className="link" style={{ color: T.blue }}>{CONTACT}</a>. The public release must replace this with the approved domain address once mail infrastructure is live.</>],
];

export default function Privacy() {
  return (
    <PublicShell>
      <Section pad="clamp(56px,8vw,110px)">
        <Reveal>
          <div style={{ ...h, marginBottom: 20 }}>PRIVACY · PUBLIC RELEASE CANDIDATE</div>
          <h1 style={{ ...display, color: T.ink, fontSize: "clamp(30px,4.4vw,56px)", lineHeight: 1.02, maxWidth: 760 }}>How 4Planet handles information you choose to send.</h1>
          <p style={{ fontSize: "clamp(16px,1.3vw,19px)", color: T.ink, opacity: .7, marginTop: 20, maxWidth: 680, lineHeight: 1.6 }}>Plain-language release information for the current register-interest flow. Payment, user accounts and production Impact delivery are not active.</p>
        </Reveal>
        <div style={{ marginTop: "clamp(40px,6vw,72px)", display: "grid", gap: "clamp(28px,4vw,44px)", maxWidth: 820 }}>
          {SECTIONS.map(([title, body]) => (
            <Reveal key={title}>
              <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 18 }}>
                <div style={h}>{title}</div>
                <div style={{ fontSize: "clamp(15px,1.2vw,17px)", color: T.ink, marginTop: 12, lineHeight: 1.65 }}>{body}</div>
              </div>
            </Reveal>
          ))}
        </div>
        <div style={{ marginTop: "clamp(40px,5vw,64px)", display: "flex", gap: 18, flexWrap: "wrap" }}>
          <Link to="/join" className="link" style={{ fontSize: 14, color: T.blue }}>← Join 4Planet</Link>
          <Link to="/about" className="link" style={{ fontSize: 14, color: T.blue }}>About 4Planet →</Link>
        </div>
      </Section>
    </PublicShell>
  );
}
