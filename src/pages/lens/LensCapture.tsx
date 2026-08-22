import { Link } from "react-router-dom";
import { CaptureExperience } from "@/capture/CaptureExperience";

export function LensCapture() {
  return (
    <CaptureExperience
      productLabel="LENS 01 · SHARED CAPTURE"
      eyebrow="FIELD INPUT · LIFE"
      title="See it. Capture it."
      description="Capture one image and optional location. This shared engine will feed taxon recognition, human confirmation and Observation creation without turning capture itself into a biological claim."
      exitHref="/species/lab"
      exitLabel="SPECIES ENGINE"
      footerLabel="LENS / CAPTURE"
      footerText="Next gate: bounded tree + Bombus recognition through the shared Taxon Registry."
      renderNext={(capture) => capture ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div className="mono" style={{ fontSize: 9, letterSpacing: ".14em", color: "rgba(255,255,255,.5)" }}>NEXT · TAXON RESOLUTION</div>
            <p style={{ marginTop: 8, maxWidth: 680, color: "rgba(255,255,255,.72)" }}>Recognition is not active yet. Use the live Species Engine to test the same target set without fabricating an AI identification.</p>
          </div>
          <Link to="/species/lab" className="capture-action is-primary">OPEN SPECIES ENGINE →</Link>
        </div>
      ) : null}
    />
  );
}

export default LensCapture;
