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
const NOTICE_VERSION = "2026-08-10-v1";

const SECTIONS: [string, React.ReactNode][] = [
  ["Who is responsible", <>{LEGAL_NAME}, organisation no. {ORG_NO}, is the current legal operator of the 4Planet public release candidate. Registered address: {ADDRESS}. 4Planet is not presented here as a foundation, non-profit organisation or separate incorporated entity.</>],
  ["What the Join form stores", "The first-party data model is deliberately narrow: a normalised email address, name, optional organisation, selected interest, optional message, source route/channel, limited campaign parameters when they are already present in the URL, the privacy-notice version and timestamps. It also records the lifecycle state needed to handle the enquiry and any deletion request."],
  ["What the Join form does not store", "The application data model does not intentionally persist a raw IP address, user-agent string, precise location, date of birth, phone number, payment details, sensitive-category answers or a user password. Hosting and security providers can still process network metadata in their operational logs; those provider controls must be verified for the production environment."],
  ["Why we process an enquiry", "The working release classification for the required Join flow is user-requested contact: you ask 4Planet to process the registration and respond to that stated interest. The required privacy acknowledgement is not treated as newsletter consent. This legal-basis classification is an operational working position and should receive professional legal review before production release."],
  ["Optional updates", "The optional 'Email me occasional 4Planet updates' choice is separate. It is recorded as marketing-updates consent only when you actively select it. Not selecting the option does not create marketing consent and does not prevent 4Planet from responding to the specific enquiry you submitted."],
  ["Storage and processors", "The implementation is designed around a server-side 4Planet endpoint and first-party Actor, Enquiry and Consent tables in Supabase-hosted Postgres. The web release may use a hosting/CDN provider for request routing. The exact production project, region, processor configuration and contractual records must be verified before persistent public capture is activated."],
  ["Retention", "Working release controls are: close and delete or anonymise inactive enquiries after no more than 12 months unless there is a documented ongoing relationship or another defensible need; review active relationship data after 24 months without meaningful activity; and remove data requested for deletion when the request is verified and no overriding requirement applies. These periods are internal release controls, not a claim that every situation has the same legal retention rule, and require professional review before production activation."],
  ["Deletion and withdrawal", <>Ask for access, correction, restriction or deletion through the privacy contact below. Optional marketing consent can be withdrawn through the same route until a verified mailing system with its own unsubscribe mechanism is active. The internal actor record contains deletion-request state so a request is not handled only as an inbox message.</>],
  ["Cookies and local device storage", "The current public candidate does not intentionally use advertising or behavioural-tracking cookies. Some prototype functions can store local-only state on your device. Non-essential analytics, marketing tags or similar tracking must remain disabled until the required information and consent controls are in place."],
  ["Privacy contact", <>Until a canonical 4planet.org outbound mailbox is activated and verified, privacy requests are handled through the temporary pre-release contact <a href={`mailto:${CONTACT}`} className="link" style={{ color: T.blue }}>{CONTACT}</a>. This must be replaced by the approved domain address once mail infrastructure is proven.</>],
];

export default function Privacy() {
  return (
    <PublicShell>
      <Section pad="clamp(56px,8vw,110px)">
        <Reveal>
          <div style={{ ...h, marginBottom: 20 }}>PRIVACY · NOTICE {NOTICE_VERSION}</div>
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
          <Link to="/trust" className="link" style={{ fontSize: 14, color: T.blue }}>Trust & policies →</Link>
        </div>
      </Section>
    </PublicShell>
  );
}
