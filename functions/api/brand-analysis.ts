type TruthClass = "FACT" | "CALCULATION" | "ESTIMATE" | "ASSUMPTION" | "INTERPRETATION" | "UNKNOWN";

type Env = {
  OPENAI_API_KEY?: string;
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

const SOURCE_2025 = "https://www.tomra.com/investor-relations/reports/key-figures";
const SOURCE_Q2_RELEASE = "https://www.tomra.com/-/media/project/tomra/tomra/investor-relations/quarterly-results-files/2026/2q/2026-q2_press-release_tomra.pdf";
const SOURCE_Q2_REPORT = "https://www.tomra.com/-/media/project/tomra/tomra/investor-relations/quarterly-results-files/2026/2q/2026-q2_quarterly-report_tomra.pdf";

function tomraProof() {
  const generatedAt = new Date().toISOString();
  const opportunities = [
    {
      rank: 1,
      title: "Recover Collection margin after DRS ramp-up",
      economicLogic: "Collection revenue is expanding rapidly while the mix of high-volume machine sales in new deposit-return markets is compressing gross margin. A focused installation, sourcing, service-attach and mix programme can target margin normalisation without slowing deployment.",
      estimatedValue: "CALCULATION: +100 bps EBITA margin on H1 2026 Collection revenue (€454m) is approximately €4.5m on that six-month revenue base; not a forecast.",
      planetaryLogic: "Faster, lower-cost and better-serviced deposit-return infrastructure can increase the capacity for high-quality container collection and closed-loop recycling.",
      planetaryDelta: "ESTIMATE: directional increase in collection-system efficiency; requires measured container return, material quality, energy and lifecycle data.",
      truthClass: "CALCULATION" as TruthClass,
      confidence: "HIGH",
      sourceIds: ["TOMRA-Q2-2026"],
    },
    {
      rank: 2,
      title: "Increase recurring service and digital value from the installed RVM base",
      economicLogic: "A large installed base creates an opportunity to increase software, remote monitoring, uptime, preventive service and lifecycle revenue per machine while reducing field-service friction.",
      estimatedValue: "ESTIMATE: material recurring-revenue opportunity; public disclosures reviewed here do not isolate the addressable service/software pool.",
      planetaryLogic: "Higher uptime and longer equipment life can improve return-system availability while reducing premature equipment replacement and service travel.",
      planetaryDelta: "ESTIMATE: lower lifecycle material and service intensity per accepted container; requires fleet-level baseline.",
      truthClass: "ESTIMATE" as TruthClass,
      confidence: "MEDIUM",
      sourceIds: ["TOMRA-Q2-2026", "TOMRA-2025"],
    },
    {
      rank: 3,
      title: "Reduce manufacturing material and energy intensity per RVM delivered",
      economicLogic: "Rapid deployment in new DRS markets increases the economic value of design-to-cost, supplier optimisation, modularity, remanufacturing and lower material intensity across high-volume hardware.",
      estimatedValue: "ESTIMATE: value scales directly with unit volume; exact bill-of-materials and manufacturing energy data are not public.",
      planetaryLogic: "Less virgin material, lower embodied energy and higher component reuse can reduce lifecycle pressure while supporting lower unit cost.",
      planetaryDelta: "ESTIMATE: kg material, kgCO2e and kWh reduced per machine; must be verified from product LCAs and manufacturing data.",
      truthClass: "ESTIMATE" as TruthClass,
      confidence: "MEDIUM",
      sourceIds: ["TOMRA-Q2-2026"],
    },
    {
      rank: 4,
      title: "Convert Recycling order intake into higher-margin revenue",
      economicLogic: "Q2 Recycling order intake grew while quarterly revenue declined. Improving conversion speed, standardisation, delivery throughput and service attach can turn demand into revenue and cash more efficiently.",
      estimatedValue: "INTERPRETATION: opportunity is supported by the divergence between Q2 order intake and revenue; exact backlog economics are not public in the proof dataset.",
      planetaryLogic: "More sorting capacity can increase recovery of valuable secondary materials and reduce residual waste when deployed into effective recycling systems.",
      planetaryDelta: "UNKNOWN until tonnes processed, recovery rates, purity and counterfactual disposal are measured.",
      truthClass: "INTERPRETATION" as TruthClass,
      confidence: "MEDIUM",
      sourceIds: ["TOMRA-Q2-2026"],
    },
    {
      rank: 5,
      title: "Recover Food growth through higher-value product mix and service",
      economicLogic: "Food revenue grew modestly while Q2 order intake declined. Product mix, AI-enabled sorting, aftermarket service and customer ROI proof are potential levers to protect growth and margin.",
      estimatedValue: "ESTIMATE: no public basis in the proof dataset for a defensible euro range.",
      planetaryLogic: "More precise food sorting can reduce food loss and improve usable yield where deployment actually displaces waste.",
      planetaryDelta: "ESTIMATE: tonnes of edible product recovered and waste avoided per installation; requires customer process data.",
      truthClass: "ESTIMATE" as TruthClass,
      confidence: "MEDIUM",
      sourceIds: ["TOMRA-Q2-2026"],
    },
    {
      rank: 6,
      title: "Lower group working-capital intensity during growth",
      economicLogic: "Fast deployment, acquisitions and equipment-heavy operations create a recurring need to manage receivables, inventory, milestone billing and supplier terms without weakening customer delivery.",
      estimatedValue: "ASSUMPTION: a one-day working-capital improvement can be valuable at TOMRA's scale, but the necessary operating detail is not resolved in this first proof.",
      planetaryLogic: "Primarily financial. Secondary planetary alignment exists if inventory and component obsolescence fall.",
      planetaryDelta: "UNKNOWN; only count a planetary benefit if obsolete inventory, scrap or expedited logistics measurably decline.",
      truthClass: "ASSUMPTION" as TruthClass,
      confidence: "LOW",
      sourceIds: ["TOMRA-Q2-REPORT"],
    },
    {
      rank: 7,
      title: "Optimise post-acquisition leverage and capital allocation",
      economicLogic: "Net debt/EBITDA increased after the Clynk acquisition, minority purchases and lower EBITDA. Higher cash conversion and disciplined capital allocation can reduce financing pressure while preserving high-return growth investment.",
      estimatedValue: "FACT + INTERPRETATION: leverage movement is disclosed; savings depend on debt structure, rates and repayment path not modelled here.",
      planetaryLogic: "Neutral by default. Alignment exists only where capital is shifted toward higher-return circular infrastructure rather than merely reducing debt.",
      planetaryDelta: "UNKNOWN until capital-allocation choices are specified.",
      truthClass: "INTERPRETATION" as TruthClass,
      confidence: "MEDIUM",
      sourceIds: ["TOMRA-Q2-REPORT"],
    },
    {
      rank: 8,
      title: "Reduce operational Scope 1+2 emissions where it also cuts energy cost",
      economicLogic: "Energy efficiency, electrification and procurement can lower energy exposure when project economics are positive.",
      estimatedValue: "ESTIMATE: requires site-level energy use, tariffs, capex and payback data.",
      planetaryLogic: "Direct overlap: energy and fuel savings can reduce both operating cost and operational emissions.",
      planetaryDelta: "FACT baseline: 30,152 tCO2e location-based Scope 1+2 reported for 2025; intervention delta not yet measured.",
      truthClass: "ESTIMATE" as TruthClass,
      confidence: "MEDIUM",
      sourceIds: ["TOMRA-2025"],
    },
    {
      rank: 9,
      title: "Monetise system-level data without weakening trust",
      economicLogic: "RVM, sorting and service networks generate operational data that may support analytics, compliance, maintenance and system optimisation products for customers and scheme operators.",
      estimatedValue: "ASSUMPTION: potential new recurring revenue; data ownership, privacy, contracts and willingness-to-pay are unresolved.",
      planetaryLogic: "Better system intelligence can reduce contamination, downtime and logistics inefficiency if decision rights and incentives are aligned.",
      planetaryDelta: "UNKNOWN until a concrete data product and measurable operational outcome are defined.",
      truthClass: "ASSUMPTION" as TruthClass,
      confidence: "LOW",
      sourceIds: ["TOMRA-Q2-2026"],
    },
    {
      rank: 10,
      title: "Use circular design and remanufacturing to create a second margin pool",
      economicLogic: "A large installed hardware base creates a potential second-life market for modules, parts and refurbished equipment, converting replacement cost and retired assets into retained value.",
      estimatedValue: "ASSUMPTION: public proof does not disclose retirement volumes, residual values or remanufacturing economics.",
      planetaryLogic: "Direct overlap: longer asset life, component reuse and avoided virgin-material demand can reduce lifecycle pressure.",
      planetaryDelta: "ESTIMATE: avoided new components and embodied emissions per refurbished unit; requires lifecycle and return-flow data.",
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
      ticker: "TOM.OL",
      sector: "Collection, recycling and food sorting technology",
      geography: "Global / headquartered in Norway",
      description: "TOMRA builds collection and sensor-based sorting systems across reverse vending, recycling and food. The first 4BRAND proof focuses on where deployment economics, recurring service, resource efficiency and circular-system outcomes may reinforce each other.",
    },
    generatedAt,
    analysisStatus: "SEEDED_PROOF",
    statusNote: "This is the first founder-reviewable proof of the 4BRAND Value Map. Financial facts use TOMRA primary sources. Opportunity values are explicitly calculations, estimates or assumptions until company-operating data and measured interventions exist.",
    economicBaseline: [
      { label: "Revenue", value: "€1,318m", period: "FY 2025", truthClass: "FACT", sourceIds: ["TOMRA-2025"] },
      { label: "Adjusted EBITA", value: "€171m / 13.0%", period: "FY 2025", truthClass: "FACT", sourceIds: ["TOMRA-2025"] },
      { label: "Operating cash flow", value: "€171m", period: "FY 2025", truthClass: "FACT", sourceIds: ["TOMRA-2025"] },
      { label: "Net profit", value: "€98m", period: "FY 2025", truthClass: "FACT", sourceIds: ["TOMRA-2025"] },
      { label: "H1 revenue", value: "€739m / +17%", period: "H1 2026 YoY", truthClass: "FACT", sourceIds: ["TOMRA-Q2-REPORT"] },
      { label: "Q2 revenue", value: "€405m / +25%", period: "Q2 2026 YoY", truthClass: "FACT", sourceIds: ["TOMRA-Q2-2026"] },
      { label: "Q2 adjusted EBITA", value: "€57m / 14.1%", period: "Q2 2026", truthClass: "FACT", sourceIds: ["TOMRA-Q2-2026"] },
      { label: "Employees", value: "5,791", period: "FY 2025", truthClass: "FACT", sourceIds: ["TOMRA-2025"] },
    ],
    businessModel: [
      { title: "Collection", detail: "Reverse-vending and related collection systems generate machine, service and system revenue, with regulatory DRS expansion acting as a major demand catalyst.", truthClass: "FACT", confidence: "HIGH", sourceIds: ["TOMRA-Q2-2026"] },
      { title: "Recycling", detail: "Sensor-based sorting equipment and services sell productivity and material-recovery capability to waste and recycling operators.", truthClass: "FACT", confidence: "HIGH", sourceIds: ["TOMRA-Q2-2026"] },
      { title: "Food", detail: "Sorting, grading and processing technology sells yield, quality, labour and waste-reduction economics to food producers.", truthClass: "FACT", confidence: "HIGH", sourceIds: ["TOMRA-Q2-2026"] },
    ],
    valueDrivers: [
      { title: "Deposit-return regulation", detail: "New DRS markets can create step-changes in demand for Collection hardware and services.", truthClass: "FACT", confidence: "HIGH", sourceIds: ["TOMRA-Q2-2026"] },
      { title: "Installed base + service", detail: "More installed equipment expands the base for service, uptime, software and lifecycle economics.", truthClass: "INTERPRETATION", confidence: "HIGH", sourceIds: ["TOMRA-Q2-2026"] },
      { title: "Automation and sensor performance", detail: "Customer economics improve when sorting recovers more value, reduces labour or avoids waste; this supports equipment and service pricing power.", truthClass: "INTERPRETATION", confidence: "MEDIUM", sourceIds: ["TOMRA-Q2-2026"] },
      { title: "Regulatory circularity tailwinds", detail: "Packaging, EPR and circularity rules can expand demand for collection and sorting infrastructure.", truthClass: "INTERPRETATION", confidence: "HIGH", sourceIds: ["TOMRA-Q2-2026"] },
    ],
    valueLeakage: [
      { title: "Collection mix pressure", detail: "High RVM sales into new markets supported growth but compressed Collection gross margin in Q2 2026.", truthClass: "FACT", confidence: "HIGH", sourceIds: ["TOMRA-Q2-2026"] },
      { title: "Recycling revenue softness", detail: "Q2 Recycling revenue declined while order intake increased, creating a conversion and execution question worth analysing.", truthClass: "FACT", confidence: "HIGH", sourceIds: ["TOMRA-Q2-2026"] },
      { title: "Food order intake decline", detail: "Q2 Food order intake fell year over year, increasing the value of product-mix, conversion and demand analysis.", truthClass: "FACT", confidence: "HIGH", sourceIds: ["TOMRA-Q2-2026"] },
      { title: "Higher leverage", detail: "Net debt/EBITDA rose to 2.5x in H1 2026, partly linked to Clynk acquisition and minority purchases.", truthClass: "FACT", confidence: "HIGH", sourceIds: ["TOMRA-Q2-REPORT"] },
    ],
    opportunities,
    alignedTop3: [opportunities[0], opportunities[1], opportunities[2]],
    solutions: [
      { title: "Design-to-value + circular hardware programme", detail: "Cross-functional product engineering, procurement, lifecycle assessment and remanufacturing analysis focused on cost per deployed machine and lifecycle material intensity.", truthClass: "INTERPRETATION", confidence: "MEDIUM", sourceIds: ["TOMRA-Q2-2026"] },
      { title: "Installed-base service intelligence", detail: "Use fleet uptime, failure, route and service data to identify recurring-revenue and cost-to-serve opportunities before building a new product layer.", truthClass: "INTERPRETATION", confidence: "MEDIUM", sourceIds: ["TOMRA-Q2-2026"] },
      { title: "Energy + emissions abatement curve", detail: "Rank sites and interventions by financial payback and tCO2e reduction rather than treating emissions reduction as a separate programme.", truthClass: "INTERPRETATION", confidence: "MEDIUM", sourceIds: ["TOMRA-2025"] },
    ],
    nextExperiment: {
      title: "Collection margin × material-intensity diagnostic",
      hypothesis: "The current DRS deployment wave contains cost and material-efficiency opportunities that can improve contribution margin while reducing lifecycle resource intensity per installed machine.",
      method: "Select one high-volume RVM family and one new-market deployment. Build unit economics from bill of materials, manufacturing, freight, install, service and failure data. Map each cost driver to material, energy and lifecycle pressure, then rank interventions by € value, time-to-cash and planetary delta.",
      successMetric: "At least three validated interventions with positive expected contribution-margin effect and measurable material/energy reduction, each with owner, cost, payback and falsifier.",
      economicMeasurement: "€ contribution margin per machine; installation cost; service cost; inventory days; payback.",
      planetaryMeasurement: "kg virgin material per machine; kgCO2e embodied/operational; kWh; component reuse; lifetime extension.",
      truthClass: "ASSUMPTION",
    },
    evidence: [
      { id: "TOMRA-2025", title: "Key Figures", publisher: "TOMRA", url: SOURCE_2025, checkedAt: "2026-09-15", note: "Primary-source 2025 revenue, profitability, cash flow, assets, employees and Scope 1+2 baseline." },
      { id: "TOMRA-Q2-2026", title: "Q2 2026 press release", publisher: "TOMRA", url: SOURCE_Q2_RELEASE, checkedAt: "2026-09-15", note: "Primary-source quarterly revenue, segment growth, margins, order intake and Poland DRS deployment context." },
      { id: "TOMRA-Q2-REPORT", title: "Q2 2026 quarterly report", publisher: "TOMRA", url: SOURCE_Q2_REPORT, checkedAt: "2026-09-15", note: "Primary-source H1 financials, balance-sheet context, leverage and segment detail." },
    ],
    assumptions: [
      "Public disclosures are sufficient to identify hypotheses, not to validate operating interventions.",
      "Economic and planetary alignment must be tested at intervention level; a circular-economy business model does not make every action planet-positive.",
      "Scenario calculations are not forecasts and do not imply management targets.",
    ],
    unknowns: [
      "Unit-level RVM bill of materials, manufacturing cost and lifecycle footprint.",
      "Service/software recurring revenue and gross margin by installed machine cohort.",
      "Site-level energy use, tariffs and abatement economics.",
      "Backlog conversion economics and delivery constraints in Recycling.",
      "Customer-level food waste/yield outcomes attributable to TOMRA systems.",
    ],
  };
}

const SYSTEM_PROMPT = `You are the 4BRAND Economic Value Engine inside 4PLANET's Universal Actor Value Engine.
Your job is to analyse a real company using current public evidence, starting with economics and only then finding where company value and planetary value may align.

NON-NEGOTIABLE TRUTH RULES
- Separate FACT, CALCULATION, ESTIMATE, ASSUMPTION, INTERPRETATION and UNKNOWN.
- Never describe estimated value as realised value.
- Never describe intended or directional planetary benefit as realised impact.
- Prefer current primary sources: annual reports, quarterly reports, exchange filings, investor relations, regulators and official datasets.
- For material current claims, use current sources and state periods.
- If evidence is insufficient, write UNKNOWN instead of inventing precision.
- Provide at least 10 distinct economic value opportunities.
- Every opportunity must explain economic logic, estimated value or why it cannot yet be estimated, planet intersection, planetary delta status, truth class, confidence and source IDs.
- Return only valid JSON. No markdown.

OUTPUT SHAPE
{
  "engine":"4BRAND ECONOMIC VALUE ENGINE 01",
  "company":{"name":"","legalName":"","ticker":"","sector":"","geography":"","description":""},
  "generatedAt":"ISO-8601",
  "analysisStatus":"LIVE_RESEARCH",
  "statusNote":"",
  "economicBaseline":[{"label":"","value":"","period":"","truthClass":"FACT","sourceIds":[""]}],
  "businessModel":[{"title":"","detail":"","truthClass":"FACT","confidence":"HIGH","sourceIds":[""]}],
  "valueDrivers":[],
  "valueLeakage":[],
  "opportunities":[{"rank":1,"title":"","economicLogic":"","estimatedValue":"","planetaryLogic":"","planetaryDelta":"","truthClass":"ESTIMATE","confidence":"MEDIUM","sourceIds":[""]}],
  "alignedTop3":[],
  "solutions":[],
  "nextExperiment":{"title":"","hypothesis":"","method":"","successMetric":"","economicMeasurement":"","planetaryMeasurement":"","truthClass":"ASSUMPTION"},
  "evidence":[{"id":"SRC-01","title":"","publisher":"","url":"https://...","checkedAt":"YYYY-MM-DD","note":""}],
  "assumptions":[""],
  "unknowns":[""]
}
Use only the enum values shown for truthClass and HIGH/MEDIUM/LOW for confidence.`;

function getOutputText(payload: Record<string, unknown>): string {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) return payload.output_text;
  const output = Array.isArray(payload.output) ? payload.output : [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = Array.isArray((item as { content?: unknown }).content) ? (item as { content: unknown[] }).content : [];
    for (const part of content) {
      if (part && typeof part === "object" && (part as { type?: unknown }).type === "output_text" && typeof (part as { text?: unknown }).text === "string") {
        return (part as { text: string }).text;
      }
    }
  }
  return "";
}

function validAnalysis(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.company === "object"
    && Array.isArray(v.economicBaseline)
    && Array.isArray(v.opportunities)
    && v.opportunities.length >= 10
    && Array.isArray(v.alignedTop3)
    && Array.isArray(v.evidence)
    && typeof v.nextExperiment === "object";
}

async function liveResearch(company: string, env: Env) {
  if (!env.OPENAI_API_KEY) {
    throw new Error("Live research runtime is not configured with a server-side model key.");
  }

  const today = new Date().toISOString().slice(0, 10);
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "authorization": `Bearer ${env.OPENAI_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL || "gpt-5.2",
      store: false,
      tools: [{ type: "web_search_preview", search_context_size: "high" }],
      input: [
        { role: "system", content: [{ type: "input_text", text: SYSTEM_PROMPT }] },
        { role: "user", content: [{ type: "input_text", text: `Analyse ${company}. Current date: ${today}. Research the company before concluding. Prefer primary financial and regulatory sources. Return the complete JSON object.` }] },
      ],
      text: { format: { type: "json_object" } },
      max_output_tokens: 12000,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    if (response.status === 429) throw new Error("Live company research is temporarily blocked by model API quota/credit. The product surface is working; arbitrary-company research is not yet available.");
    throw new Error(`Live company research failed (${response.status}). ${detail.slice(0, 180)}`);
  }

  const payload = await response.json() as Record<string, unknown>;
  const text = getOutputText(payload);
  if (!text) throw new Error("Research runtime returned no structured analysis.");

  let parsed: unknown;
  try { parsed = JSON.parse(text); } catch { throw new Error("Research runtime returned invalid structured analysis."); }
  if (!validAnalysis(parsed)) throw new Error("Research runtime returned an incomplete Value Map.");

  const result = parsed as Record<string, unknown>;
  result.engine = "4BRAND ECONOMIC VALUE ENGINE 01";
  result.analysisStatus = "LIVE_RESEARCH";
  result.generatedAt = new Date().toISOString();
  return result;
}

export const onRequestPost = async (ctx: { request: Request; env: Env }): Promise<Response> => {
  let body: Record<string, unknown>;
  try { body = await ctx.request.json(); } catch { return json({ ok: false, error: "invalid_json" }, 400); }

  const company = clean(body.company);
  if (company.length < 2) return json({ ok: false, error: "company_required" }, 400);

  const normalised = company.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (["tomra", "tomrasystems", "tomrasystemsasa"].includes(normalised)) {
    return json({ ok: true, analysis: tomraProof() });
  }

  try {
    const analysis = await liveResearch(company, ctx.env);
    return json({ ok: true, analysis });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Live company research unavailable.";
    return json({ ok: false, error: "analysis_engine_unavailable", detail }, 503);
  }
};

export const onRequest = async (ctx: { request: Request; env: Env }): Promise<Response> => {
  if (ctx.request.method === "POST") return onRequestPost(ctx);
  return json({ ok: false, error: "method_not_allowed" }, 405);
};
