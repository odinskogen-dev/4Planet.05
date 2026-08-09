import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { T } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section, Label, Button, StatusLabel } from "@/components/ui";

const LEADS_ENDPOINT = "/api/leads";

const ROLES: [string, string, string][] = [
  ["FOLLOW 4PLANET", "Free updates and early public access.", "Follow the work as products, stories and participation pathways open."],
  ["TEST THE PRODUCT", "Help improve the public release candidate.", "Register interest in testing ATLAS, SPECIES, Living Systems or IMPACT without creating an account."],
  ["CONTRIBUTE EXPERTISE", "Science, data, field knowledge, design or technology.", "Tell us where your expertise may strengthen a source, place, species, mission or product pathway."],
  ["CREATIVE PARTICIPATION", "Film, photography, writing, art, music and culture.", "Contribute to the cultural layer that helps environmental knowledge reach people."],
  ["PARTNER OR FUND", "Organisation, mission, data or founding support.", "Start with a non-binding expression of interest. No partnership, funding or delivery status is created by this form."],
  ["FUTURE MEMBERSHIP", "A membership model is being prepared, not sold here.", "Payment and paid membership remain closed until the operating, legal and payment pathway is ready."],
];

type SubmitState = "idle" | "sending" | "delivered" | "pending" | "error";

export default function Join() {
  const [state, setState] = useState<SubmitState>("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      type: "4people",
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      interest: String(fd.get("interest") || ""),
      message: String(fd.get("message") || ""),
      consent: fd.get("consent") === "on",
      company_hp: String(fd.get("company_hp") || ""),
      sourceRoute: "/join",
    };

    setState("sending");
    try {
      const res = await fetch(LEADS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.delivered === true) {
        setState("delivered");
        form.reset();
      } else if (res.ok && body.delivered === false) {
        setState("pending");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }

  const field: React.CSSProperties = {
    width: "100%",
    border: `1px solid ${T.lineStrong}`,
    background: "#fff",
    color: T.ink,
    padding: "13px 14px",
    fontFamily: T.sans,
    fontSize: 15,
    borderRadius: 0,
    boxSizing: "border-box",
  };

  return (
    <PublicShell>
      <Section pad="clamp(72px,9vw,112px)">
        <Label color={T.blue} style={{ marginBottom: 16 }}>JOIN 4PLANET</Label>
        <h1 style={{ fontWeight: 500, color: T.ink, fontSize: "clamp(38px,6vw,76px)", letterSpacing: "-.045em", lineHeight: .96, maxWidth: 900 }}>
          Find your way into a living planet.
        </h1>
        <p style={{ fontSize: "clamp(17px,2vw,21px)", color: T.ink, marginTop: 22, maxWidth: 690, lineHeight: 1.55 }}>
          Follow the work, test the product, contribute expertise or explore a future partnership. Registration creates no account, takes no payment and makes no membership or partner claim.
        </p>

        <div className="tw" style={{ marginTop: 40, border: `1px solid ${T.line}` }}>
          {ROLES.map(([title, role, desc], i) => (
            <div key={title} style={{ padding: "clamp(22px,3vw,34px)", borderLeft: i % 2 ? `1px solid ${T.line}` : "none", borderTop: i >= 2 ? `1px solid ${T.line}` : "none" }}>
              <span className="mono" style={{ fontSize: 10.5, color: T.blue, letterSpacing: ".08em" }}>{title}</span>
              <div style={{ fontWeight: 500, fontSize: 17, marginTop: 12 }}>{role}</div>
              <p style={{ fontSize: 14, color: T.dim, marginTop: 10, lineHeight: 1.55 }}>{desc}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "clamp(48px,7vw,80px)", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "clamp(28px,5vw,72px)", alignItems: "start" }} className="join-grid">
          <div>
            <Label style={{ marginBottom: 14 }}>REGISTER INTEREST</Label>
            <h2 style={{ fontFamily: T.display, fontWeight: 500, fontSize: "clamp(28px,4vw,44px)", letterSpacing: "-.035em", lineHeight: 1.02 }}>
              One real path. No dead CTA.
            </h2>
            <p style={{ color: T.dim, fontSize: 15, lineHeight: 1.6, marginTop: 16, maxWidth: 520 }}>
              The form is wired to 4Planet's server-side lead endpoint. If the release environment has no approved data destination configured, the interface will say so and nothing will be stored or sent.
            </p>
          </div>

          {state === "delivered" ? (
            <div style={{ border: `1px solid ${T.lineStrong}`, padding: "clamp(22px,3vw,34px)" }}>
              <StatusLabel>INTEREST RECEIVED</StatusLabel>
              <p style={{ marginTop: 14, fontSize: 16, lineHeight: 1.6 }}>Your registration was delivered to the configured 4Planet interest system.</p>
            </div>
          ) : state === "pending" ? (
            <div style={{ border: `1px solid ${T.lineStrong}`, padding: "clamp(22px,3vw,34px)" }}>
              <StatusLabel>DATA CAPTURE NOT ACTIVE</StatusLabel>
              <p style={{ marginTop: 14, fontSize: 16, lineHeight: 1.6 }}>The public form is ready, but this environment has no approved persistent destination configured. Nothing was stored or sent.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} style={{ border: `1px solid ${T.lineStrong}`, padding: "clamp(22px,3vw,34px)", display: "grid", gap: 14 }}>
              {state === "error" && <p className="mono" style={{ fontSize: 12, color: T.red }}>The registration could not be delivered. No success state has been recorded.</p>}
              <input type="text" name="company_hp" tabIndex={-1} autoComplete="off" aria-hidden style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />
              <div>
                <Label style={{ marginBottom: 8 }}>Name</Label>
                <input name="name" required autoComplete="name" style={field} />
              </div>
              <div>
                <Label style={{ marginBottom: 8 }}>Email</Label>
                <input name="email" required type="email" autoComplete="email" style={field} />
              </div>
              <div>
                <Label style={{ marginBottom: 8 }}>What are you interested in?</Label>
                <select name="interest" required style={field} defaultValue="">
                  <option value="" disabled>Select one</option>
                  <option>Follow 4Planet</option>
                  <option>Test the product</option>
                  <option>Contribute expertise or data</option>
                  <option>Creative participation</option>
                  <option>Partnership</option>
                  <option>Funding / founding support</option>
                  <option>Future membership</option>
                </select>
              </div>
              <div>
                <Label style={{ marginBottom: 8 }}>Optional note</Label>
                <textarea name="message" rows={4} style={{ ...field, resize: "vertical" }} />
              </div>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, color: T.dim, fontSize: 13, lineHeight: 1.5 }}>
                <input required type="checkbox" name="consent" style={{ marginTop: 3 }} />
                <span>I agree that 4Planet may use these details to process my registration and contact me about this interest. No account or payment is created.</span>
              </label>
              <button type="submit" disabled={state === "sending"} style={{ height: 46, padding: "0 20px", border: `1px solid ${T.blue}`, background: T.blue, color: "#fff", fontFamily: T.sans, fontSize: 13.5, fontWeight: 500, cursor: state === "sending" ? "default" : "pointer", opacity: state === "sending" ? .65 : 1 }}>
                {state === "sending" ? "SENDING…" : "REGISTER INTEREST →"}
              </button>
              <p style={{ fontSize: 11.5, color: T.faint, lineHeight: 1.55 }}>
                See the <Link to="/privacy" className="link" style={{ color: T.blue }}>privacy note</Link> for what is collected and how deletion requests work.
              </p>
            </form>
          )}
        </div>

        <div style={{ marginTop: 34, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button to="/atlas" arrow>OPEN ATLAS</Button>
          <Button to="/species">MEET SPECIES</Button>
          <Button to="/impact">EXPLORE IMPACT</Button>
        </div>
        <style>{`@media(max-width:760px){.join-grid{grid-template-columns:1fr!important}}`}</style>
      </Section>
    </PublicShell>
  );
}
