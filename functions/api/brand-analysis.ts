type TruthClass = "FACT" | "CALCULATION" | "ESTIMATE" | "ASSUMPTION" | "INTERPRETATION" | "UNKNOWN";

type Env = {
  FOURBRAND_OPENAI_API_KEY?: string;
  OPENAI_API_KEY?: string;
  FOURBRAND_OPENAI_MODEL?: string;
  OPENAI_MODEL?: string;
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  },
});

const clean = (value: unknown, max = 120) => typeof value === "string" ? value.trim().slice(0, max) : "";

const TOMRA_2025 = "https://www.tomra.com/investor-relations/reports/key-figures";
const TOMRA_Q2 = "https://www.tomra.com/-/media/project/tomra/tomra/investor-relations/quarterly-results-files/2026/2q/2026-q2_press-release_tomra.pdf";
const TOMRA_Q2_REPORT = "https://www.tomra.com/-/media/project/tomra/tomra/investor-relations/quarterly-results-files/2026/2q/2026-q2_quarterly-report_tomra.pdf";

function tomraProof() {
  const opportunities = [
    {
      rank: 1,
      title: "Recover Collection margin through deployment and product-mix optimisation",
      economicLogic: "Q2 Collection revenue grew 45% to €246m, while a high share of RVM equipment sales and lower product margin in Poland reduced Collection gross margin to 38.6%. That creates a direct value lever in design-to-cost, sourcing, installation, service attach and mix.",
      estimatedValue: "CALCULATION: +100 bps margin on H1 2026 Collection revenue of approximately €454m equals about €4.5m on that six-month revenue base. This is a sensitivity calculation, not a forecast.",
      planetaryLogic: "Lower material, logistics and service intensity per deployed RVM can improve unit economics while reducing lifecycle resource use, if return-system performance is preserved or improved.",
      planetaryDelta: "ESTIMATE: kg material, freight, service travel and lifecycle emissions per installed machine; requires internal product and operations data.",
      truthClass: "CALCULATION" as TruthClass,
      confidence: "HIGH",
      sourceIds: ["TOMRA-Q2-2026"],
    },
    {
      rank: 2,
      title: "Increase recurring service and digital value from the installed RVM base",
      economicLogic: "Rapid RVM deployment expands the installed base from which uptime, preventive maintenance, remote monitoring, software and lifecycle services may generate recurring value.",
      estimatedValue: "ESTIMATE: potentially material recurring revenue and lower cost-to-serve; public reporting does not isolate the addressable service/software pool.",
      planetaryLogic: "Higher uptime and longer equipment life can reduce premature replacement, unnecessary service travel and system downtime.",
      planetaryDelta: "ESTIMATE: equipment lifetime, uptime, avoided replacement, service kilometres and energy per accepted container; requires fleet baseline.",
      truthClass: "ESTIMATE" as TruthClass,
      confidence: "MEDIUM",
      sourceIds: ["TOMRA-Q2-2026", "TOMRA-2025"],
    },
    {
      rank: 3,
      title: "Reduce material and energy intensity per machine delivered",
      economicLogic: "High-volume roll-outs make design-to-value, modularity, supplier optimisation and remanufacturing economically more important because small unit savings scale across deployments.",
      estimatedValue: "ESTIMATE: exact euro value requires bill-of-materials, manufacturing energy, freight and installation data that are not public.",
      planetaryLogic: "Less virgin material and energy per machine can reduce both production cost and lifecycle pressure.",
      planetaryDelta: "ESTIMATE: kg virgin material, kWh and kgCO2e per machine; must be measured from product and manufacturing data.",
      truthClass: "ESTIMATE" as TruthClass,
      confidence: "MEDIUM",
      sourceIds: ["TOMRA-Q2-2026"],
    },
    {
      rank: 4,
      title: "Convert Recycling order recovery into revenue and cash faster",
      economicLogic: "Q2 Recycling order intake rose 40% to €58m while quarterly revenue fell 11% to €51m. Delivery throughput, backlog conversion, standardisation and service attach are therefore high-value operating questions.",
      estimatedValue: "INTERPRETATION: directionally supported by current order/revenue divergence; a defensible euro range requires backlog, lead-time and contribution-margin data.",
      planetaryLogic: "More effective sorting capacity can increase recovery of secondary materials where customer operations actually convert sorting into higher recovery and purity.",
      planetaryDelta: "UNKNOWN until tonnes processed, recovery yield, purity and counterfactual disposal are measured.",
      truthClass: "INTERPRETATION" as TruthClass,
      confidence: "MEDIUM",
      sourceIds: ["TOMRA-Q2-2026"],
    },
    {
      rank: 5,
      title: "Improve Food pipeline conversion and high-value product mix",
      economicLogic: "Food revenue rose 5% to €99m in Q2, while order intake fell 22% to €83m because large-project conversion was lower. Product mix, pipeline conversion, service and ROI evidence are potential levers.",
      estimatedValue: "ESTIMATE: no public basis for a defensible euro range without pipeline, win-rate and gross-margin data.",
      planetaryLogic: "Sorting technology can reduce food loss and improve usable yield when it measurably displaces waste in customer processes.",
      planetaryDelta: "ESTIMATE: tonnes of usable product recovered and waste avoided per installation; requires customer process data.",
      truthClass: "ESTIMATE" as TruthClass,
      confidence: "MEDIUM",
      sourceIds: ["TOMRA-Q2-2026"],
    },
    {
      rank: 6,
      title: "Release working capital as new-market roll-outs normalise",
      economicLogic: "TOMRA disclosed that 2025 operating cash flow fell partly because inventory was built ahead of new deposit markets. As installations mature, inventory planning, receivables and supplier terms become a direct cash lever.",
      estimatedValue: "ASSUMPTION: material cash potential is plausible at TOMRA's scale, but inventory, receivables and payable detail must be modelled before assigning value.",
      planetaryLogic: "Planet alignment only exists if lower inventory also reduces obsolescence, scrap or expedited logistics rather than merely shifting payment timing.",
      planetaryDelta: "UNKNOWN until inventory waste and logistics effects are measured.",
      truthClass: "ASSUMPTION" as TruthClass,
      confidence: "MEDIUM",
      sourceIds: ["TOMRA-2025", "TOMRA-Q2-REPORT"],
    },
    {
      rank: 7,
      title: "Optimise leverage and capital allocation after acquisition-led expansion",
      economicLogic: "Higher leverage increases the value of cash conversion and disciplined capital allocation while preserving investment in high-return growth markets.",
      estimatedValue: "INTERPRETATION: financing value depends on debt structure, rates, covenant headroom and repayment path; not quantified here.",
      planetaryLogic: "Neutral by default. It becomes aligned only if capital is preferentially allocated to interventions with superior financial return and verified circular or resource outcomes.",
      planetaryDelta: "UNKNOWN until specific capital-allocation decisions are defined.",
      truthClass: "INTERPRETATION" as TruthClass,
      confidence: "MEDIUM",
      sourceIds: ["TOMRA-Q2-REPORT"],
    },
    {
      rank: 8,
      title: "Build an energy-abatement curve that only selects positive-value interventions",
      economicLogic: "Site energy efficiency, electrification and procurement can lower operating exposure where savings exceed capex and financing cost.",
      estimatedValue: "ESTIMATE: requires site-level energy use, tariffs, capex and payback data.",
      planetaryLogic: "This is a direct incentive overlap when lower energy/fuel cost also lowers operational emissions.",
      planetaryDelta: "FACT BASELINE: TOMRA reports 30,152 tCO2e location-based Scope 1+2 for 2025; intervention delta is not yet measured.",
      truthClass: "ESTIMATE" as TruthClass,
      confidence: "MEDIUM",
      sourceIds: ["TOMRA-2025"],
    },
    {
      rank: 9,
      title: "Create system-intelligence revenue from operational data",
      economicLogic: "Collection and sorting networks generate operational data that may support maintenance, compliance, logistics and system-optimisation products for customers and scheme operators.",
      estimatedValue: "ASSUMPTION: potential recurring-revenue pool; data rights, privacy, customer demand and willingness-to-pay are unresolved.",
      planetaryLogic: "Better operational intelligence can reduce contamination, downtime and unnecessary logistics if the information changes real decisions.",
      planetaryDelta: "UNKNOWN until a specific data product, decision and measured operational effect are defined.",
      truthClass: "ASSUMPTION" as TruthClass,
      confidence: "LOW",
      sourceIds: ["TOMRA-Q2-2026"],
    },
    {
      rank: 10,
      title: "Create a second margin pool through circular design and remanufacturing",
      economicLogic: "A large installed hardware base can create residual value in modules, parts and refurbished equipment rather than treating end-of-first-life equipment only as replacement cost.",
      estimatedValue: "ASSUMPTION: public evidence does not disclose retirement volumes, residual values or remanufacturing economics.",
      planetaryLogic: "Longer asset life, component reuse and avoided virgin-material demand are directly aligned if refurbishment substitutes for new production.",
      planetaryDelta: "ESTIMATE: avoided components, materials and embodied emissions per refurbished unit; requires lifecycle and return-flow data.",
      truthClass: "ASSUMPTION" as TruthClass,
      confidence: "LOW",
      sourceIds: ["TOMRA-2025"],
    },
  ];

  return {
    engine: "4BRAND ECONOMIC VALUE ENGINE 01",
    company: {
      name: "TOMRA",
      legalName: "TOMRA Systems ASA",
      ticker: "TOM",
      sector: "Collection, recycling and food sorting technology",
      geography: "Global / headquartered in Norway",
      description: "TOMRA builds collection and sensor-based sorting systems across reverse vending, recycling and food. This first 4BRAND proof tests where growth, margin, recurring service, capital efficiency and resource efficiency may reinforce one another.",
    },
    generatedAt: new Date().toISOString(),
    analysisStatus: "SEEDED_PROOF",
    statusNote: "Financial facts below use TOMRA primary sources. Opportunity values remain calculations, estimates, assumptions or interpretations until company-operating data and measured interventions exist.",
    economicBaseline: [
      { label: "Revenue", value: "€1,318m", period: "FY 2025", truthClass: "FACT", sourceIds: ["TOMRA-2025"] },
      { label: "Adjusted EBITA", value: "€171m / 13.0%", period: "FY 2025", truthClass: "FACT", sourceIds: ["TOMRA-2025"] },
      { label: "Operating cash flow", value: "€171m", period: "FY 2025", truthClass: "FACT", sourceIds: ["TOMRA-2025"] },
      { label: "Net profit", value: "€98m", period: "FY 2025", truthClass: "FACT", sourceIds: ["TOMRA-2025"] },
      { label: "H1 revenue", value: "€739m / +17%", period: "H1 2026 YoY", truthClass: "CALCULATION", sourceIds: ["TOMRA-Q2-2026"] },
      { label: "Q2 revenue", value: "€405m / +25%", period: "Q2 2026 YoY", truthClass: "FACT", sourceIds: ["TOMRA-Q2-2026"] },
      { label: "Q2 adjusted EBITA", value: "€57m / 14.1%", period: "Q2 2026", truthClass: "FACT", sourceIds: ["TOMRA-Q2-2026"] },
      { label: "Employees", value: "5,791", period: "FY 2025", truthClass: "FACT", sourceIds: ["TOMRA-2025"] },
    ],
    businessModel: [
      { title: "Collection", detail: "Reverse-vending and related collection systems monetise equipment, service and infrastructure demand around deposit-return systems.", truthClass: "FACT", confidence: "HIGH", sourceIds: ["TOMRA-Q2-2026"] },
      { title: "Recycling", detail: "Sensor-based sorting systems sell material-recovery and processing capability to recycling and resource operators.", truthClass: "FACT", confidence: "HIGH", sourceIds: ["TOMRA-Q2-2026"] },
      { title: "Food", detail: "Sorting, grading and processing technology sells yield, quality, automation and waste-reduction economics to food producers.", truthClass: "FACT", confidence: "HIGH", sourceIds: ["TOMRA-Q2-2026"] },
    ],
    valueDrivers: [
      { title: "Deposit-return regulation", detail: "New DRS markets can create step-changes in Collection demand; Poland drove material 2026 growth.", truthClass: "FACT", confidence: "HIGH", sourceIds: ["TOMRA-Q2-2026"] },
      { title: "Installed base + service", detail: "A larger equipment base increases the addressable base for uptime, service and lifecycle value.", truthClass: "INTERPRETATION", confidence: "HIGH", sourceIds: ["TOMRA-Q2-2026"] },
      { title: "Automation and sensor performance", detail: "Customer value rises when sorting increases recovery, yield or labour productivity; this supports equipment and service economics.", truthClass: "INTERPRETATION", confidence: "MEDIUM", sourceIds: ["TOMRA-Q2-2026"] },
      { title: "Circularity regulation", detail: "Packaging and producer-responsibility regulation can expand demand for collection and sorting infrastructure.", truthClass: "INTERPRETATION", confidence: "HIGH", sourceIds: ["TOMRA-2025"] },
    ],
    valueLeakage: [
      { title: "Collection mix pressure", detail: "Record equipment sales and lower product margin in Poland reduced Collection gross margin to 38.6% in Q2 2026.", truthClass: "FACT", confidence: "HIGH", sourceIds: ["TOMRA-Q2-2026"] },
      { title: "Recycling revenue softness", detail: "Q2 Recycling revenue fell 11% while order intake rose 40%, creating a conversion and execution question.", truthClass: "FACT", confidence: "HIGH", sourceIds: ["TOMRA-Q2-2026"] },
      { title: "Food large-project conversion", detail: "Food order intake fell 22% in Q2 2026, with TOMRA citing lower pipeline conversion of large projects.", truthClass: "FACT", confidence: "HIGH", sourceIds: ["TOMRA-Q2-2026"] },
      { title: "Working-capital build", detail: "TOMRA says 2025 operating cash flow was reduced by temporary inventory build-up ahead of new deposit markets.", truthClass: "FACT", confidence: "HIGH", sourceIds: ["TOMRA-2025"] },
    ],
    opportunities,
    alignedTop3: opportunities.slice(0, 3),
    solutions: [
      { title: "Design-to-value + circular hardware programme", detail: "Combine product engineering, procurement, lifecycle assessment and remanufacturing around cost and resource intensity per deployed machine.", truthClass: "INTERPRETATION", confidence: "MEDIUM", sourceIds: ["TOMRA-Q2-2026"] },
      { title: "Installed-base service intelligence", detail: "Use uptime, failure, route and service data to rank recurring-revenue and cost-to-serve opportunities before building new offers.", truthClass: "INTERPRETATION", confidence: "MEDIUM", sourceIds: ["TOMRA-Q2-2026"] },
      { title: "Energy + emissions abatement curve", detail: "Rank operational energy interventions by financial payback and tCO2e reduction so cost and planetary value are evaluated together.", truthClass: "INTERPRETATION", confidence: "MEDIUM", sourceIds: ["TOMRA-2025"] },
    ],
    nextExperiment: {
      title: "Collection margin × material-intensity diagnostic",
      hypothesis: "The current DRS deployment wave contains cost and material-efficiency opportunities that can improve contribution margin while reducing lifecycle resource intensity per installed machine.",
      method: "Select one high-volume RVM family and one new-market deployment. Build unit economics from bill of materials, manufacturing, freight, installation, service and failure data. Map each cost driver to material, energy and lifecycle pressure, then rank interventions by euro value, time-to-cash and planetary delta.",
      successMetric: "At least three validated interventions with positive expected contribution-margin effect and measurable material or energy reduction, each with owner, cost, payback and falsifier.",
      economicMeasurement: "Contribution margin per machine; installation cost; service cost; inventory days; payback.",
      planetaryMeasurement: "Virgin material per machine; embodied/operational kgCO2e; kWh; component reuse; lifetime extension.",
      truthClass: "ASSUMPTION",
    },
    evidence: [
      { id: "TOMRA-2025", title: "Key Figures / Annual financial baseline", publisher: "TOMRA", url: TOMRA_2025, checkedAt: "2026-09-15", note: "Primary-source revenue, profitability, cash flow, employees and Scope 1+2 baseline." },
      { id: "TOMRA-Q2-2026", title: "Second Quarter 2026 Results Announcement", publisher: "TOMRA", url: TOMRA_Q2, checkedAt: "2026-09-15", note: "Primary-source Q2 revenue, segment growth, margins, order intake and deposit-market roll-out context." },
      { id: "TOMRA-Q2-REPORT", title: "Second Quarter 2026 Report", publisher: "TOMRA", url: TOMRA_Q2_REPORT, checkedAt: "2026-09-15", note: "Primary-source H1 financial and balance-sheet context." },
    ],
    assumptions: [
      "Public disclosures can identify hypotheses but cannot validate internal operating interventions.",
      "Economic and planetary alignment must be tested at intervention level; a circular-economy business model does not make every action planet-positive.",
      "Sensitivity calculations are not forecasts or management targets.",
    ],
    unknowns: [
      "Unit-level RVM bill of materials, manufacturing cost and lifecycle footprint.",
      "Service/software recurring revenue and gross margin by installed-machine cohort.",
      "Site-level energy use, tariffs and abatement economics.",
      "Backlog conversion economics and delivery constraints in Recycling.",
      "Customer-level food waste/yield outcomes attributable to TOMRA systems.",
    ],
  };
}

const SYSTEM = `You are 4BRAND Economic Value Engine 01, the company vertical of 4PLANET's existing Universal Actor Value Engine. Analyse one real company from current public evidence. Start with economics. Then identify where economic value and planetary value may align.

Hard rules:
1. Research before concluding. Prefer current primary sources: annual reports, quarterly reports, exchange filings, regulator filings, official company pages and authoritative public datasets.
2. Separate every material statement into FACT, CALCULATION, ESTIMATE, ASSUMPTION, INTERPRETATION or UNKNOWN.
3. Never present estimated economic value as realised value. Never present possible planetary benefit as realised impact.
4. If evidence is insufficient, say UNKNOWN rather than invent precision.
5. Return at least 10 distinct economic opportunities and rank them.
6. Each opportunity must include economic logic, estimated value or an explicit reason it cannot yet be quantified, planet intersection, planetary-delta status, truth class, confidence and source IDs.
7. alignedTop3 must contain the three strongest opportunities from opportunities.
8. Evidence must contain real source URLs and checked dates. Do not invent URLs.
9. Output only one valid JSON object with the exact top-level keys requested. No markdown.

Required JSON shape:
{"engine":"4BRAND ECONOMIC VALUE ENGINE 01","company":{"name":"","legalName":"","ticker":"","sector":"","geography":"","description":""},"generatedAt":"ISO-8601","analysisStatus":"LIVE_RESEARCH","statusNote":"","economicBaseline":[{"label":"","value":"","period":"","truthClass":"FACT","sourceIds":["SRC-01"]}],"businessModel":[{"title":"","detail":"","truthClass":"FACT","confidence":"HIGH","sourceIds":["SRC-01"]}],"valueDrivers":[],"valueLeakage":[],"opportunities":[{"rank":1,"title":"","economicLogic":"","estimatedValue":"","planetaryLogic":"","planetaryDelta":"","truthClass":"ESTIMATE","confidence":"MEDIUM","sourceIds":["SRC-01"]}],"alignedTop3":[],"solutions":[],"nextExperiment":{"title":"","hypothesis":"","method":"","successMetric":"","economicMeasurement":"","planetaryMeasurement":"","truthClass":"ASSUMPTION"},"evidence":[{"id":"SRC-01","title":"","publisher":"","url":"https://...","checkedAt":"YYYY-MM-DD","note":""}],"assumptions":[""],"unknowns":[""]}`;

function extractOutputText(payload: any): string {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) return payload.output_text;
  for (const item of Array.isArray(payload?.output) ? payload.output : []) {
    for (const part of Array.isArray(item?.content) ? item.content : []) {
      if (part?.type === "output_text" && typeof part?.text === "string") return part.text;
    }
  }
  return "";
}

function validAnalysis(value: any): boolean {
  return Boolean(value && typeof value === "object" && value.company && Array.isArray(value.economicBaseline) && Array.isArray(value.opportunities) && value.opportunities.length >= 10 && Array.isArray(value.alignedTop3) && value.alignedTop3.length >= 3 && Array.isArray(value.evidence) && value.evidence.length > 0 && value.nextExperiment);
}

async function liveAnalysis(company: string, env: Env) {
  const key = env.FOURBRAND_OPENAI_API_KEY?.trim() || env.OPENAI_API_KEY?.trim();
  if (!key) throw new Error("Live research runtime is not configured with a server-side model key.");
  const model = env.FOURBRAND_OPENAI_MODEL?.trim() || env.OPENAI_MODEL?.trim() || "gpt-5.6-terra";
  const today = new Date().toISOString().slice(0, 10);

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      model,
      store: false,
      tools: [{ type: "web_search" }],
      input: [
        { role: "system", content: [{ type: "input_text", text: SYSTEM }] },
        { role: "user", content: [{ type: "input_text", text: `Analyse ${company}. Current date: ${today}. Resolve the exact legal company first, then research its latest public economics and planetary dependencies/pressures before producing the Value Map.` }] },
      ],
      text: { format: { type: "json_object" } },
      max_output_tokens: 14000,
    }),
  });

  if (!response.ok) {
    const providerText = await response.text().catch(() => "");
    if (response.status === 429) throw new Error("Live company research is temporarily unavailable because the model API quota or credit limit has been reached.");
    throw new Error(`Live company research failed (${response.status}). ${providerText.slice(0, 160)}`);
  }

  const payload = await response.json();
  const text = extractOutputText(payload);
  if (!text) throw new Error("Research runtime returned no structured analysis.");
  let parsed: any;
  try { parsed = JSON.parse(text); } catch { throw new Error("Research runtime returned invalid structured analysis."); }
  if (!validAnalysis(parsed)) throw new Error("Research runtime returned an incomplete Value Map.");
  parsed.engine = "4BRAND ECONOMIC VALUE ENGINE 01";
  parsed.analysisStatus = "LIVE_RESEARCH";
  parsed.generatedAt = new Date().toISOString();
  return parsed;
}

export const onRequestPost = async (ctx: { request: Request; env: Env }): Promise<Response> => {
  let body: Record<string, unknown>;
  try { body = await ctx.request.json(); } catch { return json({ ok: false, error: "INVALID_JSON" }, 400); }
  const company = clean(body.company);
  if (company.length < 2) return json({ ok: false, error: "COMPANY_REQUIRED" }, 400);

  const normalised = company.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (["tomra", "tomrasystems", "tomrasystemsasa"].includes(normalised)) return json({ ok: true, analysis: tomraProof() });

  try { return json({ ok: true, analysis: await liveAnalysis(company, ctx.env) }); }
  catch (error) {
    return json({ ok: false, error: "ANALYSIS_ENGINE_UNAVAILABLE", detail: error instanceof Error ? error.message : "Live company research unavailable." }, 503);
  }
};

export const onRequest = async (ctx: { request: Request; env: Env }): Promise<Response> => {
  if (ctx.request.method === "POST") return onRequestPost(ctx);
  return json({ ok: false, error: "METHOD_NOT_ALLOWED" }, 405);
};
