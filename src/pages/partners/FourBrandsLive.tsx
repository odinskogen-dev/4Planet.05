import { useEffect, useState } from "react";
import FourBrand from "@/pages/partners/FourBrand";

type DecisionState =
  | "OPPORTUNITY"
  | "REVIEWED"
  | "CHOSEN"
  | "BASELINE LOCKED"
  | "INTERVENTION STARTED"
  | "MEASURED"
  | "VALUE ATTRIBUTION REVIEWED"
  | "REALISED"
  | "NOT REALISED"
  | "LEARNING";

type TwinState = {
  company: string;
  objective: string;
  revenue: string;
  margin: string;
  cash: string;
  growth: string;
  constraint: string;
  planetIntersection: string;
  opportunity: string;
  notes: string;
  decisionState: DecisionState;
};

const INITIAL: TwinState = {
  company: "",
  objective: "",
  revenue: "",
  margin: "",
  cash: "",
  growth: "",
  constraint: "",
  planetIntersection: "",
  opportunity: "",
  notes: "",
  decisionState: "OPPORTUNITY",
};

const DECISION_STATES: DecisionState[] = [
  "OPPORTUNITY",
  "REVIEWED",
  "CHOSEN",
  "BASELINE LOCKED",
  "INTERVENTION STARTED",
  "MEASURED",
  "VALUE ATTRIBUTION REVIEWED",
  "REALISED",
  "NOT REALISED",
  "LEARNING",
];

const STORAGE_KEY = "4brands:company-twin:local-beta-01";

function Field({ label, value, placeholder, onChange, wide = false }: { label: string; value: string; placeholder: string; onChange: (value: string) => void; wide?: boolean }) {
  return (
    <label className={`fbl-field${wide ? " fbl-field--wide" : ""}`}>
      <span>{label}</span>
      <input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Board({ code, title, children }: { code: string; title: string; children: React.ReactNode }) {
  return (
    <article className="fbl-board">
      <span>{code}</span>
      <h3>{title}</h3>
      <div>{children}</div>
    </article>
  );
}

function show(value: string, fallback = "UNKNOWN — add company data") {
  return value.trim() || fallback;
}

export default function FourBrandsLive() {
  const [twin, setTwin] = useState<TwinState>(INITIAL);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setTwin({ ...INITIAL, ...JSON.parse(raw) });
    } catch {
      setTwin(INITIAL);
    }
  }, []);

  function patch(field: keyof TwinState, value: string) {
    setTwin((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  function save() {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(twin));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <>
      <FourBrand />

      <a className="fbl-jump" href="#company-twin">BUILD YOUR TWIN</a>

      <section className="fbl-shell" id="company-twin" aria-label="4BRANDS Company Operating Twin">
        <style>{`
          .fbl-shell{background:#f4f4ef;color:#0a0a0a;padding:clamp(74px,9vw,140px) clamp(22px,6vw,96px);border-top:1px solid #0a0a0a;font-family:"Instrument Sans",system-ui,sans-serif}
          .fbl-jump{position:fixed;right:18px;bottom:18px;z-index:120;text-decoration:none;background:#0a0a0a;color:#fff;border:1px solid #fff;padding:12px 15px;font:9px/1 "Fragment Mono",ui-monospace,monospace;letter-spacing:.07em}
          .fbl-kicker{font:9px/1.2 "Fragment Mono",ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;color:#656565;margin:0 0 16px}
          .fbl-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,520px);gap:36px clamp(48px,8vw,130px);align-items:end;margin-bottom:50px}
          .fbl-head h2{font-size:clamp(46px,7vw,96px);line-height:.92;letter-spacing:-.06em;font-weight:500;margin:0;max-width:1000px}
          .fbl-head__copy>p:not(.fbl-kicker){font-size:16px;line-height:1.55;color:#484848;margin:0 0 18px}
          .fbl-badges{display:flex;gap:8px;flex-wrap:wrap}.fbl-badges span{border:1px solid #c7c7c0;background:#fff;padding:7px 8px;font:8px/1 "Fragment Mono",ui-monospace,monospace;letter-spacing:.06em;text-transform:uppercase;color:#606060}
          .fbl-law{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid #cfcfc8;border-bottom:0;background:#fff}.fbl-law div{padding:16px;border-right:1px solid #cfcfc8}.fbl-law div:last-child{border-right:0}.fbl-law span{display:block;font:8px/1.2 "Fragment Mono",ui-monospace,monospace;color:#777;letter-spacing:.06em;margin-bottom:8px}.fbl-law strong{font-size:13px;font-weight:500}
          .fbl-form{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-left:1px solid #cfcfc8;border-top:1px solid #0a0a0a;background:#fff}.fbl-field{min-height:118px;padding:18px;border-right:1px solid #cfcfc8;border-bottom:1px solid #cfcfc8}.fbl-field--wide{grid-column:span 2}.fbl-field span{display:block;font:9px/1.2 "Fragment Mono",ui-monospace,monospace;letter-spacing:.06em;text-transform:uppercase;color:#696969;margin-bottom:13px}.fbl-field input{width:100%;box-sizing:border-box;border:0;border-bottom:1px solid #aaa;background:transparent;padding:8px 0 10px;outline:none;font:500 18px/1.25 "Instrument Sans",system-ui,sans-serif;color:#0a0a0a}.fbl-field input:focus{border-color:#2e2eff}
          .fbl-notes{grid-column:1/-1;padding:18px;border-right:1px solid #cfcfc8;border-bottom:1px solid #cfcfc8}.fbl-notes span{display:block;font:9px/1.2 "Fragment Mono",ui-monospace,monospace;letter-spacing:.06em;text-transform:uppercase;color:#696969;margin-bottom:13px}.fbl-notes textarea{width:100%;box-sizing:border-box;border:0;border-bottom:1px solid #aaa;background:transparent;padding:8px 0 10px;outline:none;resize:vertical;font:500 18px/1.35 "Instrument Sans",system-ui,sans-serif}
          .fbl-actions{display:flex;justify-content:space-between;gap:24px;align-items:center;margin:17px 0 64px}.fbl-actions p{margin:0;font:9px/1.45 "Fragment Mono",ui-monospace,monospace;letter-spacing:.04em;text-transform:uppercase;color:#666}.fbl-actions button{border:1px solid #0a0a0a;background:#0a0a0a;color:white;padding:13px 18px;font:9px/1 "Fragment Mono",ui-monospace,monospace;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}.fbl-actions button:hover{background:#2e2eff;border-color:#2e2eff}
          .fbl-boards{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));border-left:1px solid #cfcfc8;border-top:1px solid #0a0a0a;background:#fff}.fbl-board{padding:20px;min-height:280px;border-right:1px solid #cfcfc8;border-bottom:1px solid #cfcfc8}.fbl-board>span{font:8px/1 "Fragment Mono",ui-monospace,monospace;letter-spacing:.07em;color:#777}.fbl-board h3{font-size:23px;line-height:1.05;letter-spacing:-.035em;font-weight:500;margin:16px 0 24px}.fbl-board p{border-top:1px solid #deded8;margin:0;padding:10px 0;font-size:12px;line-height:1.45;color:#444}.fbl-board p strong{display:block;font-size:13px;font-weight:500;color:#111;margin-bottom:3px}
          .fbl-ledger{margin-top:70px;background:#fff;border-top:1px solid #0a0a0a;padding:0 22px 22px}.fbl-ledger__head{display:grid;grid-template-columns:1fr minmax(280px,520px);gap:36px;padding:30px 0}.fbl-ledger h3{font-size:clamp(34px,4vw,58px);line-height:1;letter-spacing:-.05em;font-weight:500;margin:0}.fbl-ledger__head p{font-size:13px;line-height:1.55;color:#555;margin:0}.fbl-ledger__row{display:grid;grid-template-columns:minmax(0,1fr) minmax(220px,310px);gap:20px;align-items:center;border-top:1px solid #d8d8d2;padding:20px 0}.fbl-ledger__row strong{display:block;font-size:17px;font-weight:500;margin-bottom:5px}.fbl-ledger__row span{font:9px/1.4 "Fragment Mono",ui-monospace,monospace;color:#777;text-transform:uppercase}.fbl-ledger select{width:100%;border:1px solid #bdbdb7;background:#fff;padding:11px;font:9px/1.2 "Fragment Mono",ui-monospace,monospace;color:#111}
          .fbl-studio{margin-top:70px;display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:50px;border-top:1px solid #0a0a0a;padding-top:34px}.fbl-studio h3{font-size:clamp(36px,5vw,68px);line-height:.96;letter-spacing:-.055em;font-weight:500;margin:8px 0 22px}.fbl-studio__copy>p:not(.fbl-kicker){font-size:14px;line-height:1.55;color:#555;max-width:540px}.fbl-preview{background:#0a0a0a;color:#fff;min-height:390px;padding:clamp(28px,5vw,62px);display:flex;flex-direction:column;justify-content:space-between}.fbl-preview>span{font:8px/1 "Fragment Mono",ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;color:#aaa}.fbl-preview h4{font-size:clamp(42px,5vw,76px);line-height:.92;letter-spacing:-.06em;font-weight:500;margin:0 0 18px}.fbl-preview p{font-size:15px;line-height:1.5;color:#d3d3d3;max-width:680px;margin:0}.fbl-preview footer{border-top:1px solid #393939;padding-top:16px;font:9px/1.4 "Fragment Mono",ui-monospace,monospace;color:#aaa;text-transform:uppercase;letter-spacing:.05em}
          @media(max-width:1100px){.fbl-head{grid-template-columns:1fr}.fbl-form{grid-template-columns:repeat(2,1fr)}.fbl-field--wide{grid-column:span 2}.fbl-boards{grid-template-columns:repeat(2,1fr)}.fbl-law{grid-template-columns:repeat(2,1fr)}.fbl-law div:nth-child(2){border-right:0}.fbl-studio{grid-template-columns:1fr}}
          @media(max-width:720px){.fbl-shell{padding-left:18px;padding-right:18px}.fbl-form,.fbl-boards,.fbl-law,.fbl-ledger__head{grid-template-columns:1fr}.fbl-field--wide{grid-column:auto}.fbl-law div{border-right:0;border-bottom:1px solid #cfcfc8}.fbl-board{min-height:auto}.fbl-actions{align-items:flex-start;flex-direction:column}.fbl-ledger__row{grid-template-columns:1fr}.fbl-preview{min-height:340px}.fbl-jump{right:12px;bottom:12px}}
        `}</style>

        <div className="fbl-head">
          <div>
            <p className="fbl-kicker">4BRANDS / COMPANY OPERATING TWIN / BETA</p>
            <h2>One living model of the company.</h2>
          </div>
          <div className="fbl-head__copy">
            <p>The public Company Value Map above is the outside view. Add the minimum internal baseline here to start a working company twin: what the company is trying to achieve, the economic spine, the constraint, the opportunity and the decision state.</p>
            <div className="fbl-badges"><span>LOCAL PROTOTYPE</span><span>THIS DEVICE ONLY</span><span>NO SERVER WRITE</span><span>NOT ASSURANCE</span></div>
          </div>
        </div>

        <div className="fbl-law" aria-label="Twin truth boundary">
          <div><span>01 / PUBLIC EVIDENCE</span><strong>Source-grounded outside view</strong></div>
          <div><span>02 / INTERNAL INPUT</span><strong>Company-provided working state</strong></div>
          <div><span>03 / DECISION</span><strong>Chosen action stays explicit</strong></div>
          <div><span>04 / RESULT</span><strong>Realised value requires measurement</strong></div>
        </div>

        <div className="fbl-form">
          <Field label="Company" value={twin.company} placeholder="Company name" onChange={(value) => patch("company", value)} />
          <Field label="Primary objective" value={twin.objective} placeholder="What must improve?" onChange={(value) => patch("objective", value)} wide />
          <Field label="Annual revenue" value={twin.revenue} placeholder="Internal baseline" onChange={(value) => patch("revenue", value)} />
          <Field label="Gross / contribution margin" value={twin.margin} placeholder="Internal baseline" onChange={(value) => patch("margin", value)} />
          <Field label="Operating cash / conversion" value={twin.cash} placeholder="Internal baseline" onChange={(value) => patch("cash", value)} />
          <Field label="Customer / revenue growth" value={twin.growth} placeholder="Internal baseline" onChange={(value) => patch("growth", value)} />
          <Field label="Primary operating constraint" value={twin.constraint} placeholder="Where is value leaking?" onChange={(value) => patch("constraint", value)} wide />
          <Field label="Planet intersection" value={twin.planetIntersection} placeholder="Only where a real mechanism exists" onChange={(value) => patch("planetIntersection", value)} />
          <Field label="Priority opportunity" value={twin.opportunity} placeholder="What should be tested next?" onChange={(value) => patch("opportunity", value)} wide />
          <label className="fbl-notes"><span>Internal context / unknowns</span><textarea rows={2} value={twin.notes} placeholder="What can public data not know?" onChange={(event) => patch("notes", event.target.value)} /></label>
        </div>

        <div className="fbl-actions">
          <p>Private local working state. Inputs are not published and are not treated as verified public facts.</p>
          <button type="button" onClick={save}>{saved ? "SAVED LOCALLY" : "SAVE TWIN STATE"}</button>
        </div>

        <div className="fbl-boards" aria-label="Company Operating Twin boards">
          <Board code="01 / FINANCE" title="Economic spine">
            <p><strong>Revenue</strong>{show(twin.revenue)}</p>
            <p><strong>Margin</strong>{show(twin.margin)}</p>
            <p><strong>Cash</strong>{show(twin.cash)}</p>
          </Board>
          <Board code="02 / GROWTH" title="Value drivers">
            <p><strong>Objective</strong>{show(twin.objective)}</p>
            <p><strong>Growth</strong>{show(twin.growth)}</p>
          </Board>
          <Board code="03 / COMMERCE" title="Value leakage">
            <p><strong>Primary constraint</strong>{show(twin.constraint)}</p>
            <p><strong>Truth status</strong>LOCAL INPUT — not public fact</p>
          </Board>
          <Board code="04 / PLANET" title="Intersection">
            <p><strong>Mechanism</strong>{show(twin.planetIntersection, "UNKNOWN — no planetary claim")}</p>
            <p><strong>Impact status</strong>UNMEASURED until evidence exists</p>
          </Board>
          <Board code="05 / OPPORTUNITIES" title="Next value">
            <p><strong>Priority</strong>{show(twin.opportunity)}</p>
            <p><strong>State</strong>{twin.decisionState}</p>
          </Board>
        </div>

        <div className="fbl-ledger">
          <div className="fbl-ledger__head">
            <h3>Decision + Value Ledger</h3>
            <p>Estimated value, approved action, measured result and realised value remain separate. The state changes only when a human changes it.</p>
          </div>
          <div className="fbl-ledger__row">
            <div><strong>{show(twin.opportunity, "No opportunity selected")}</strong><span>LOCAL WORKING OBJECT · VALUE NOT YET REALISED</span></div>
            <select value={twin.decisionState} aria-label="Decision state" onChange={(event) => setTwin((current) => ({ ...current, decisionState: event.target.value as DecisionState }))}>
              {DECISION_STATES.map((state) => <option value={state} key={state}>{state}</option>)}
            </select>
          </div>
        </div>

        <div className="fbl-studio">
          <div className="fbl-studio__copy">
            <p className="fbl-kicker">WEBSITE STUDIO / PREVIEW</p>
            <h3>Twin → public projection.</h3>
            <p>A future company site can become a controlled projection of approved Twin truth rather than a competing truth store. Nothing in this beta publishes automatically.</p>
          </div>
          <div className="fbl-preview">
            <span>PREVIEW ONLY · NOT PUBLISHED</span>
            <div>
              <h4>{show(twin.company, "Your company")}</h4>
              <p>{show(twin.objective, "Company objective will appear here after it is supplied and approved.")}</p>
            </div>
            <footer>{show(twin.opportunity, "No approved public opportunity")}</footer>
          </div>
        </div>
      </section>
    </>
  );
}
