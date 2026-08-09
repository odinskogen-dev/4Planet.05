import { PublicShell } from "@/components/layout/PublicShell";
import { DataStatePanel } from "@/components/phase04/DataStatePanel";
import { ProvenanceBar } from "@/components/phase04/ProvenanceBar";

export default function Phase04StateLab() {
  return (
    <PublicShell>
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(80px,10vw,150px) clamp(20px,5vw,72px)" }}>
        <div className="mono" style={{ fontSize: 10.5, letterSpacing: ".1em", color: "#2E2EFF" }}>PHASE 04 / STATE GRAMMAR / INTERNAL INSPECTION ROUTE</div>
        <h1 style={{ margin: "28px 0 0", fontFamily: "'Instrument Sans','DM Sans',sans-serif", fontWeight: 500, fontSize: "clamp(54px,8vw,112px)", letterSpacing: "-.055em", lineHeight: .9 }}>Unavailable<br />does not mean zero.</h1>
        <p style={{ maxWidth: 780, fontSize: "clamp(19px,2vw,27px)", lineHeight: 1.3, margin: "28px 0 0" }}>The interface must distinguish waiting, no returned records, source failure, prototype material and genuinely unimplemented capability.</p>
      </section>
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px,5vw,72px) clamp(80px,10vw,150px)" }}>
        <DataStatePanel state="LOADING" title="Checking the source…" detail="The system has asked a source and is waiting. Nothing about the world is inferred while the request is unresolved." />
        <DataStatePanel state="NO RECORDS" title="The source returned no records for this query." detail="No returned records is not evidence that the organism, event or pressure does not exist here." />
        <DataStatePanel state="SOURCE UNAVAILABLE" title="This source could not be reached." detail="Keep the failure visible. Do not convert a timeout, rate limit or connector failure into an empty ecological result." />
        <DataStatePanel state="CACHED DATA" title="Showing a stored result." detail="The interface must expose when the data was checked and when the source record itself occurred or was published." />
        <DataStatePanel state="PROTOTYPE DATA" title="4PLANET-authored prototype context." detail="Useful for testing structure and comprehension, but not an external source record or verified scientific claim." />
        <DataStatePanel state="DEMO FIXTURE" title="Interface example only." detail="Fixtures can demonstrate action/proof states but must be impossible to mistake for a real partner, animal position or ecological outcome." />
        <DataStatePanel state="NOT YET IMPLEMENTED" title="This capability is intentionally absent." detail="Visible incompleteness is preferable to simulated maturity." />
        <div style={{ marginTop: 38 }}><ProvenanceBar value={{ state: "4PLANET CONTEXT", actor: "4PLANET", method: "Phase 04 state grammar", time: "Internal candidate", limitation: "This route exists for product QA and validation stimuli. It is not a claim that every source adapter already exposes every state." }} /></div>
      </section>
    </PublicShell>
  );
}
