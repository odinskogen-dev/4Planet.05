import { Link } from "react-router-dom";
import { CaptureExperience } from "@/capture/CaptureExperience";

const FOOD_TESTS = [
  { label: "APPLE", scientificName: "Malus domestica" },
  { label: "TOMATO", scientificName: "Solanum lycopersicum" },
  { label: "WHEAT", scientificName: "Triticum aestivum" },
  { label: "STRAWBERRY", scientificName: "Fragaria × ananassa" },
] as const;

export function FoodCapture() {
  return (
    <CaptureExperience
      productLabel="S4PIENS_ FOOD · CAPTURE PROOF"
      eyebrow="HUMAN SYSTEMS · FOOD_"
      title="Point at food. Trace the living system."
      description="The same capture engine used by LENS now runs inside FOOD. Capture is real; food recognition is deliberately not claimed yet. The next layer will resolve biological ingredients through the same SPECIES Engine and Taxon Registry."
      exitHref="/missions/food"
      exitLabel="FOOD_"
      accent="#ff4d22"
      footerLabel="FOOD / SHARED CAPTURE"
      footerText="One camera engine. Different product context. No duplicate camera stack."
      renderNext={(capture) => capture ? (
        <div>
          <div className="mono" style={{ fontSize: 9, letterSpacing: ".14em", color: "#ff8b73" }}>MANUAL PICK · ENGINE HANDOFF</div>
          <h2 style={{ marginTop: 10, fontFamily: "'Instrument Sans','DM Sans',sans-serif", fontSize: "clamp(28px,4vw,52px)", letterSpacing: "-.04em", fontWeight: 520 }}>What did you photograph?</h2>
          <p style={{ marginTop: 12, maxWidth: 720, color: "rgba(255,255,255,.62)", lineHeight: 1.55 }}>For this proof, choose a candidate manually. We do not pretend the camera recognised it. The next recognition pass will replace this manual step.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 1, marginTop: 24, background: "rgba(255,255,255,.16)", border: "1px solid rgba(255,255,255,.16)" }}>
            {FOOD_TESTS.map((item) => (
              <Link key={item.scientificName} to="/species/lab" style={{ padding: 20, background: "#080808", textDecoration: "none" }}>
                <div className="mono" style={{ fontSize: 9, letterSpacing: ".14em", color: "#ff8b73" }}>{item.label}</div>
                <div style={{ marginTop: 8, fontSize: 16, fontStyle: "italic" }}>{item.scientificName}</div>
                <div className="mono" style={{ marginTop: 18, fontSize: 9, color: "rgba(255,255,255,.45)" }}>OPEN SPECIES ENGINE →</div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    />
  );
}

export default FoodCapture;
