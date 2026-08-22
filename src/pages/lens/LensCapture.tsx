import { CaptureExperience } from "@/capture/CaptureExperience";
import { LensRecognitionPanel } from "@/pages/lens/LensRecognitionPanel";

export function LensCapture() {
  return (
    <CaptureExperience
      productLabel="LENS 01 · SHARED CAPTURE"
      eyebrow="FIELD INPUT · LIFE"
      title="See it. Capture it."
      description="Capture one image and optional location. The same shared engine now hands the media to a truth-bounded species-recognition provider, while human confirmation and Observation creation remain separate steps."
      exitHref="/species/lab"
      exitLabel="SPECIES ENGINE"
      footerLabel="LENS / CAPTURE → RECOGNITION"
      footerText="Recognition candidates are AI suggestions only. Human confirmation remains distinct, and no Observation is written in this pass."
      renderNext={(capture, location) => capture ? <LensRecognitionPanel capture={capture} location={location} /> : null}
    />
  );
}

export default LensCapture;
