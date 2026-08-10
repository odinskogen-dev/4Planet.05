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
  ["Registration data", "When public registration capture is enabled, a Join 4Planet or role-specific form may store the details you actively submit — such as name, email, organisation, role, selected interest and optional message — together with the form route, time of consent and a limited attribution record when campaign parameters are present. No payment details are collected and no account is created."],
  ["Registration purpose and permission", "Registration data is used to process the specific enquiry or interest you submit and to contact you about that stated interest. The registration checkbox does not create separate permission for unrelated marketing. Any later marketing permission must be requested separately and explicitly."],
  ["Product measurement", "4Planet has prepared a bounded first-party event system for product learning. If it is activated after the required privacy review, it is designed to record only approved product events, a short-lived session identifier, route/entity context and limited campaign attribution. The application database is designed not to store IP addresses, full referrer URLs, browser fingerprints or User-Agent strings as product analytics fields."],
  ["How submissions are handled", "Public forms post to a server-side 4Planet endpoint. Persistent capture is enabled only when an approved database destination and release controls are configured. If capture is disabled or unavailable, the interface reports that no registration was stored rather than showing a false success state."],
  ["Retention", "The pre-production data model currently uses 180 days as a conservative technical review deadline for unqualified registration records. This period is not a final legal policy. Before persistent public capture is activated, 4Planet must approve the production retention schedule, deletion routine and any longer retention that is genuinely required for an active relationship."],
  ["Cookies and local device storage", "The current public candidate does not intentionally use advertising cookies. Some prototype functions can store local-only state on your device — for example follows, test-only Impact records or a temporary measurement-session identifier. Non-essential tracking must remain disabled until the required legal basis, information and consent controls are resolved."],
  ["Access, correction, withdrawal and deletion", <>You can ask for access, correction, export or deletion of personal information held about you, or withdraw a consent you previously gave. Requests require identity verification before information is disclosed or deleted. Use the privacy contact below while the self-service privacy-request path remains in pre-production.</>],
  ["Privacy contact", <>Until a canonical 4planet.org mailbox is activated and verified, privacy requests are handled through the temporary pre-release contact <a href={`mailto:${CONTACT}`} className="link" style={{ color: T.blue }}>{CONTACT}</a>. The public release must replace this with the approved domain address once mail infrastructure is live.</>],
];

export default function Privacy() {
  return (
    <PublicShell>
      <Section pad="clamp(56px,8vw,110px)">
        <Reveal>
          <div style={{ ...h, marginBottom: 20 }}>PRIVACY · PUBLIC RELEASE CANDIDATE</div>
          <h1 style={{ ...display, color: T.ink, fontSize: "clamp(30px,4.4vw,56px)", lineHeight: 1.02, maxWidth: 760 }}>How 4Planet handles information you choose to send.</h1>
          <p style={{ fontSize: "clamp(16px,1.3vw,19px)", color: T.ink, opacity: .7, marginTop: 20, maxWidth: 680, lineHeight: 1.6 }}>Plain-language pre-production information for registration and bounded product learning. Payment, user accounts and production Impact delivery are not active.</p>
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
