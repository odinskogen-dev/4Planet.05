import type { LabProject } from "./labsFreshProjection";

export type WbsProjection = {
  source: string;
  now: string[];
  next: string[];
  waiting: string[];
  gate: string;
};

// Read-only projection of current Founder Control 12_WBS. This is deliberately
// not a second task database. When BRAIN and this snapshot disagree, BRAIN wins.
const byProjectId: Record<string, WbsProjection> = {
  "SYS-P00-STRAT": {
    source: "Founder Control 12_WBS · STRAT-1..11 · read 21 Aug 2026",
    now: [
      "Strategy & Goal Cascade v4.0 is locked current authority; preserve v3 only as superseded lineage.",
      "Project Portfolio / Project Packs carry SC1–SC7 and mandatory doctrine mappings; WBS/process propagation remains continuous QA.",
    ],
    next: ["Maintain fresh-AXE no-orphan readback as projects deepen; change strategy only from dated evidence or Founder authority."],
    waiting: [],
    gate: "No orphan active work: U0/N1 → capability → Project Home → WBS → evidence must remain recoverable.",
  },
  "SYS-P00-PRODUCT": {
    source: "Founder Control 12_WBS · PROD-1..4 · read 21 Aug 2026",
    now: [
      "PR #92 exact public candidate is Founder-visual-JUDGE ready; immutable Cloudflare preview is verified and production is unchanged.",
      "Technical/browser/mobile/security/source/rights exact-artifact gates are PASS on the current Founder-review candidate.",
      "Keep unresolved Orca photographs fail-closed and preserve observation/range/population/live-state distinctions.",
    ],
    next: ["Founder visually judges the exact immutable PR #92 artifact; ACCEPT promotes only the same artifact, EDIT creates a new candidate, HOLD leaves production unchanged."],
    waiting: ["Founder visual acceptance is the remaining release authority."],
    gate: "VERIFIED PREVIEW → FOUNDER JUDGE → SAME-ARTIFACT RELEASE OR BOUNDED CORRECTION.",
  },
  "SYS-P00-TRUTH": {
    source: "Founder Control 12_WBS · TRUTH-1..4 · read 21 Aug 2026",
    now: [
      "Science/evidence model is strong internally but still needs external challenge.",
      "Gold source-role correction is closed; exact runtime/source/rights binding remains the high-value source closure seam.",
      "Six scientific-review packets are prepared behind the accepted public-product gate.",
    ],
    next: ["Inventory/federate source registry fields and close the highest-value source/rights/runtime bindings before broad source expansion."],
    waiting: ["Independent expert challenge waits for the public-product gate and current packet/source fingerprint QA."],
    gate: "Evidence, uncertainty, rights, provenance and correction must remain visible without duplicate truth paths.",
  },
  "SYS-P00-PROOF": {
    source: "Founder Control 12_WBS · PROOF-1..4 · read 21 Aug 2026",
    now: [
      "Observed-user protocol is prepared for a bounded first cohort.",
      "Scientific Challenge Wave 1 packets and route-role QA are prepared.",
      "One organisational proof route is prepared; no completed current external proof is counted yet.",
    ],
    next: ["After accepted public proof, run bounded user + scientific-review cohorts and write corrections back into the owning Project/BRAIN chain."],
    waiting: ["External activation waits for the accepted public-product gate and current outbound authority."],
    gate: "Observed evidence must separate comprehension, decision/use, correction and downstream outcome.",
  },
  "SYS-P00-CAPITAL": {
    source: "Founder Control 12_WBS · CAP-1..5 · read 21 Aug 2026",
    now: [
      "Capital Engine v4 is active: Project Need → instrument/legal route → actor value → proof → ask → award/contract/cash → deployment/outcome.",
      "First Money transaction packages are prepared; final pricing/posture/release authorities remain distinct.",
      "Applications/public/research capital routes remain active in deadline/value order.",
    ],
    next: ["Advance the strongest existing routes toward award, contract or cash; do not expand inventory when conversion is the constraint."],
    waiting: ["Binding/high-risk/legal/equity/material-spend commitments remain Founder/professional gates."],
    gate: "Money counts only at the correct state: pipeline ≠ submitted ≠ awarded ≠ contracted ≠ cash.",
  },
  "SYS-P00-COMPANY": {
    source: "Founder Control 12_WBS · COMP-1..4 · read 21 Aug 2026",
    now: [
      "Official company truth is partial; ingest existing evidence before asking for more Founder-held material.",
      "Accounting / tax / VAT evidence remains partial/blocked and must stay source/professional-led.",
      "IP / rights / disclosure chain is partial; minimal data-room indexing can advance in parallel.",
    ],
    next: ["Close only the evidence/professional gaps that unlock public proof, capital and first transactions; do not overbuild administration."],
    waiting: ["Professional accounting/legal conclusions and genuinely missing Founder-held evidence are external gates."],
    gate: "Company/operator/signing/IP/finance truth must be evidence-backed before binding external use.",
  },
  "SYS-P00-REL": {
    source: "Founder Control 12_WBS · REL-1..4 · read 21 Aug 2026",
    now: [
      "Shared actor/relationship identity spine is strong internally while route meanings remain separate.",
      "Actor Value / Incentive Design is an active rule across capital, field, research, brand and people routes.",
      "Async conversion machinery is internally ready; response learning is ready once real external events occur.",
    ],
    next: ["Use the strongest current proof on qualified recipient-specific paths; measure conversion/learning rather than outreach volume."],
    waiting: ["External release remains controlled by current product/outbound authority and binding-risk gates."],
    gate: "One actor identity; separate relationship meanings; no false partnership or endorsement state.",
  },
  "SYS-P00-BRAND": {
    source: "Founder Control 12_WBS · BRAND-1..4 · read 21 Aug 2026",
    now: [
      "Current external identity work is converging through the public-product candidate rather than a separate redesign.",
      "Founder thesis assets exist as drafts; proof-to-story machinery is prepared.",
      "Brand measurement design is shifting from impressions toward understanding, participation, referrals and real relationships/resources.",
    ],
    next: ["Use accepted public proof as the trigger for story/culture assets and preserve rights/claim gates."],
    waiting: ["Founder visual/publication judgement remains the high-value external brand gate."],
    gate: "Proof before story; usefulness/trust/participation before vanity metrics.",
  },
  "OCE-WH4LES-01": {
    source: "Founder Control 12_WBS · WH-1..4 · read 21 Aug 2026",
    now: ["Close a source-complete, rights-safe Orca/whale Gold intelligence case using shared SPECIES/ATLAS/Living Systems machinery."],
    next: ["Run bounded marine scientific challenge and qualify one real protection/action pathway before any protection-delivery claim."],
    waiting: ["Story/film/capital amplification waits for intelligence + review + action-route proof."],
    gate: "Source/rights proof → expert challenge → credible operator/solution route.",
  },
  "OCE-COR4L-01": {
    source: "Founder Control 12_WBS · CORAL-1 · read 21 Aug 2026",
    now: ["Maintain current authoritative reef heat-stress/source intelligence without expanding into a generic restoration programme."],
    next: ["Activate only when one named reef/site + legitimate scientific/operator owner + baseline + monitoring + funding route exists."],
    waiting: ["MONITOR: no major spend or restoration claim before the site/operator activation gate."],
    gate: "Site authority + operator + baseline + method + monitoring + funding route.",
  },
  "OCE-PL4STIC-01": {
    source: "Founder Control 12_WBS · PLASTIC-1..3 · read 21 Aug 2026",
    now: ["Primary first-delivery diligence route is active internally: compare operator method, geography, custody, allocation/no-double-counting, reporting, rights and economics."],
    next: ["After the public-product gate, obtain comparable written operator evidence; only then model units/economics and select a bounded pilot route."],
    waiting: ["No supplier selection, contract, payment, partnership or delivery claim before mandatory operator evidence closes."],
    gate: "Qualified operator evidence → fundable unit/economics → capital/contract → delivery → report.",
  },
  "OCE-REWILD-M-01": {
    source: "Founder Control 12_WBS · REWM-1 · read 21 Aug 2026",
    now: ["Keep the marine restoration Project prepared but gated behind a real site/operator/permit/economics trigger."],
    next: ["Activate only on its own qualified site/operator/funder evidence rather than competing with PL4STIC for first delivery."],
    waiting: ["No field programme implied while geography/operator/permit chain is open."],
    gate: "Problem/site/operator/permit/budget/monitoring evidence.",
  },
  "EAR-CLIM4TE-01": {
    source: "Founder Control 12_WBS · CLIM-1 · read 21 Aug 2026",
    now: ["Keep CLIM4TE as bounded decision-intelligence capability, not a generic climate dashboard."],
    next: ["Identify one real company/public decision owner with a bounded decision, baseline/data and acceptance criteria before build expansion."],
    waiting: ["No product expansion or large spend before decision-owner fit."],
    gate: "Named decision owner + decision + evidence/data + acceptance criteria.",
  },
  "EAR-AM4ZONIA-01": {
    source: "Founder Control 12_WBS · AMAZ-1 · read 21 Aug 2026",
    now: ["Maintain public-intelligence journey only; do not materialise a remote field project."],
    next: ["Wait for a genuinely authorised Indigenous/local route, consent/rights protocol and bounded legitimate 4PLANET role."],
    waiting: ["HOLD: local authority/consent cannot be substituted by Founder or AI enthusiasm."],
    gate: "Consent + representation + rights + site + safeguard + role evidence.",
  },
  "EAR-SPECIES-01": {
    source: "Founder Control 12_WBS · SPEC-1..4 + current PR #79 readback · 21 Aug 2026",
    now: [
      "Use the accepted Jaguar shared-context baseline as the internal reference while the newer premium Jaguar + Orca transfer line remains draft.",
      "Preserve canonical identity, source/rights, observation semantics and reusable relationship intelligence across SPECIES/ATLAS.",
    ],
    next: ["Exact-head gate the newer PR #79 candidate, then inspect Jaguar + Orca + Solutions before extracting/expanding the reusable Species grammar."],
    waiting: ["Real user/expert proof waits for an accepted current product artifact; catalogue-scale replication is later."],
    gate: "Exact artifact acceptance → observed user/expert proof → transfer quality → only then catalogue scale.",
  },
  "EAR-REWILD-L-01": {
    source: "Founder Control 12_WBS · REWL-1 · read 21 Aug 2026",
    now: ["Keep terrestrial restoration hypotheses prepared without inventing a generic unit."],
    next: ["Requalify after first partner-led delivery or a strong site/operator/funder trigger."],
    waiting: ["HOLD until site tenure + operator + intervention + baseline + cost + monitoring are real."],
    gate: "Site/tenure/operator/method/cost/monitoring chain.",
  },
  "SAP-FOOD-01": {
    source: "Founder Control 12_WBS · FOOD-1..6 · read 21 Aug 2026",
    now: [
      "FOOD charter PERSON × FOOD × NORWAY is Founder-approved and frozen; build the bounded evidence/hotspot map and use existing Solution/Actor/Capital spines for selected hotspots.",
      "PICK v0.8 is materialised specialist implementation under FOOD/CHOICE, not a new Project Home; HEALTH / WALLET / PLANET remain separate.",
    ],
    next: ["Private product judgement → Gold QA → 6–10 observed users + 2–3 expert challenges → correction → one second bounded transfer case."],
    waiting: ["No public release, universal score or information→impact causal claim before evidence supports it."],
    gate: "Gold QA → observed behaviour/comprehension + expert correction → transfer test.",
  },
  "SAP-EN3RGY-01": {
    source: "Founder Control 12_WBS · ENERGY-1 · read 21 Aug 2026",
    now: ["Keep Energy in option/monitor state; do not build a generic platform."],
    next: ["Resolve EN3RGY/EN4RGY canonical identity when needed and require one real decision owner/data need before activation."],
    waiting: ["MONITOR: identity + user case are both open."],
    gate: "Canonical name + decision owner + data/policy/economic evidence.",
  },
  "SAP-CIRCULAR-01": {
    source: "Founder Control 12_WBS · CIRC-1 · read 21 Aug 2026",
    now: ["Maintain one candidate material-flow shortlist; no whole-city platform build."],
    next: ["Choose one real flow with legitimate data/decision owner, baseline, existing solutions and measurable bounded intervention."],
    waiting: ["No budget expansion before owner/flow/intervention definition."],
    gate: "Flow + owner + baseline + solution + measurement + funding route.",
  },
  "SAP-F4SHION-01": {
    source: "Founder Control 12_WBS · FASH-1 · read 21 Aug 2026",
    now: ["Hold active build while FOOD/CHOICE strengthens the shared evidence/decision method."],
    next: ["Activate one material/category only when real partner/data access and a bounded choice test exist."],
    waiting: ["No universal fashion score; no activation without method/partner trigger."],
    gate: "Category/material + supply-chain evidence + alternatives + partner/user test.",
  },
  "CUL-M4GAZINE-01": {
    source: "Founder Control 12_WBS · MAG-1 · read 21 Aug 2026",
    now: ["Maintain high-EV funding/editorial readiness and the premium current surface; keep publication downstream of real proof."],
    next: ["Close claim/rights/source packs and publish only when a genuine product/science/delivery story trigger exists."],
    waiting: ["Founder publication gate and proof/story trigger."],
    gate: "Funding/rights/claim/source package + finished asset + publication evidence.",
  },
  "CUL-4FILM-01": {
    source: "Founder Control 12_WBS · FILM-1 · read 21 Aug 2026",
    now: ["Maintain high-EV financing/application and rights/access preparation without unfunded production burden."],
    next: ["Greenlight only a film object with financing + producer/access/rights + realistic treatment/budget/distribution."],
    waiting: ["Production waits for financing and rights authority."],
    gate: "Award/contract + rights/access + producer + treatment + budget + distribution plan.",
  },
  "CUL-4RT-01": {
    source: "Founder Control 12_WBS · ART-1 · read 21 Aug 2026",
    now: ["Maintain art/funding readiness; do not market ecological result before a valid underlying Impact chain exists."],
    next: ["Close real art object + rights + transaction economics + underlying partner-owned delivery proof."],
    waiting: ["Environmental linkage waits for real Impact route and claims QA."],
    gate: "Finished object + rights + budget/tax + underlying delivery proof + claims QA.",
  },
  "CUL-4PLAY-01": {
    source: "Founder Control 12_WBS · PLAY-1 · read 21 Aug 2026",
    now: ["HOLD; monitor only unusually strong artist/partner/proof triggers."],
    next: ["Activate one bounded music/live-culture test only when proof, funding and relationship leverage justify production burden."],
    waiting: ["No active build or spend before a qualified trigger."],
    gate: "Artist/partner + rights + funding + activation design + meaningful participation metric.",
  },
  "SYS-P00-PMAP": {
    source: "Founder Control 12_WBS · PMAP-1..8 · read 21 Aug 2026",
    now: ["Permanent architecture rule is active: Planetary Map describes the world; Missions select action; Mission Engine determines how; IMPACT makes action easy."],
    next: ["Build bounded ontology/federation/problem/solution interface contracts only as dispatched, preserving source-native taxonomies and no second truth store."],
    waiting: ["Specialist science challenge is later where causal or taxonomy claims become material."],
    gate: "Source fidelity + no second truth store + fresh-session recovery PASS.",
  },
};

export function wbsProjectionFor(project: LabProject): WbsProjection | undefined {
  if (!project.projectId) return undefined;
  return byProjectId[project.projectId];
}
