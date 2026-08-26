import { Link } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { COMPANY_PROOF_PROJECTIONS, companyProofSource } from "@/content/companyProof";
import "@/styles/company-proof.css";

function State({ value }: { value: string }) {
  return <span className="company-proof-state">{value.replaceAll("_", " ")}</span>;
}

export function CompanyProof() {
  return (
    <main className="company-proof">
      <Seo
        title="Company Intelligence Proof 01 — S4PIENS | 4PLANET"
        description="A truth-constrained proof linking products, companies, value-chain evidence, actions and explicit unknowns."
        path="/domains/s4piens/company-proof"
        robots="noindex,follow"
      />
      <nav className="company-proof-nav"><Link to="/">4PLANET_</Link><div><Link to="/domains/s4piens">S4PIENS_</Link><Link to="/4sapien/food">4SAPIEN FOOD_</Link><Link to="/actors">ACTORS</Link></div></nav>
      <header className="company-proof-hero">
        <p>AI-PREMIUM PROOF 01 · S4PIENS_</p>
        <h1>Company intelligence<br />without invented certainty.</h1>
        <span>Five real companies. One shared evidence grammar. Company remains an Actor; unresolved canonical identity stays unresolved. First-party reporting is labelled as such and never silently becomes verified impact.</span>
      </header>

      <section className="company-proof-loop" aria-label="Closed loop contract">
        {['SOURCE / EVIDENCE','PRODUCT / COMPANY','CHOICE','DEMAND SIGNAL','MARKET INCENTIVE','ACTION','OUTCOME','LEARNING'].map((item, index) => <div key={item}><span>{String(index + 1).padStart(2,'0')}</span><strong>{item}</strong></div>)}
        <p>Only the first three links can currently be observed in the TINE consumer proof. Demand is a bounded internal signal; market incentive is a hypothesis; company action must be independently sourced; outcome remains UNKNOWN until evidence exists.</p>
      </section>

      <section className="company-proof-grid">
        {COMPANY_PROOF_PROJECTIONS.map((company) => (
          <article key={company.slug} id={company.slug} className="company-proof-card">
            <header><div><p>{company.proofDomain}</p><h2>{company.name}</h2><span>{company.role}</span></div><State value={company.actorState} /></header>
            {company.productGtins.length > 0 && <div className="company-proof-product"><b>CONNECTED PRODUCT</b>{company.productGtins.map((gtin) => <span key={gtin}>GTIN {gtin}</span>)}</div>}

            <div className="company-proof-columns">
              <div><p className="company-proof-label">SOURCE-BACKED / REPORTED CLAIMS</p>{company.claims.map((claim) => <section key={claim.id}><State value={claim.state} /><strong>{claim.statement}</strong><small>{claim.limitation}</small></section>)}</div>
              <div><p className="company-proof-label">KNOWN UNKNOWNS</p>{company.unknowns.map((unknown) => <section key={unknown} className="unknown"><State value="UNKNOWN" /><strong>{unknown}</strong></section>)}</div>
            </div>

            <div className="company-proof-leverage"><p className="company-proof-label">VALUE-CHAIN LEVERAGE POINTS</p><div>{company.leveragePoints.map((point) => <span key={point}>{point}</span>)}</div></div>

            {company.action && <section className="company-proof-action"><div><p className="company-proof-label">OBSERVED COMPANY ACTION</p><State value={company.action.state} /></div><strong>{company.action.statement}</strong><p>{company.action.outcome}</p><small>{company.action.causalityNote}</small><State value={`OUTCOME_${company.action.outcomeState}`} /></section>}

            <section className="company-proof-incentive"><p className="company-proof-label">CHOICE → MARKET</p><strong>{company.choiceSignalRule}</strong><State value={company.marketIncentiveState} /></section>

            <footer><p className="company-proof-label">SOURCES</p>{company.sourceIds.map((sourceId) => { const source = companyProofSource(sourceId); return source ? <a key={sourceId} href={source.url} target="_blank" rel="noreferrer"><span>{source.provider}</span>{source.label}<b>↗</b></a> : null; })}</footer>
          </article>
        ))}
      </section>

      <section className="company-proof-method">
        <p>TRUTH BY DESIGN</p>
        <h2>Better disclosure can improve evidence eligibility. It cannot buy a better answer.</h2>
        <span>A company with more current, comparable and independently supported evidence can reduce UNKNOWN and raise confidence. Payment, partnership, advertising or sponsorship cannot change evidence state, ranking or recommendation eligibility.</span>
        <Link to="/4sapien/food">TEST THE PRODUCT-SIDE PROOF →</Link>
      </section>
    </main>
  );
}
