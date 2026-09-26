import { useEffect, useRef, useState } from "react";
import { normalizeGtin } from "./core.js";

interface BarcodeDetectorResult { rawValue: string; }
interface BarcodeDetectorInstance { detect(source: HTMLVideoElement): Promise<BarcodeDetectorResult[]>; }
interface BarcodeDetectorConstructor { new (options: { formats: string[] }): BarcodeDetectorInstance; }

export default function PickScanner({ onDetected }: { onDetected: (gtin: string) => void }) {
  const [cameraState, setCameraState] = useState<"closed" | "opening" | "active" | "unsupported" | "error">("closed");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);

  const stop = () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraState("closed");
  };

  useEffect(() => () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const start = async () => {
    const Detector = (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
    if (!Detector || !navigator.mediaDevices?.getUserMedia) { setCameraState("unsupported"); return; }
    setCameraState("opening");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error("Camera surface missing");
      video.srcObject = stream;
      await video.play();
      const detector = new Detector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e"] });
      setCameraState("active");
      const scan = async () => {
        try {
          const matches = await detector.detect(video);
          const match = matches.find((item) => normalizeGtin(item.rawValue).ok);
          if (match) {
            const parsed = normalizeGtin(match.rawValue);
            stop();
            onDetected(parsed.normalized);
            return;
          }
        } catch {
          // Transient detector failure: retain camera and continue scanning.
        }
        frameRef.current = requestAnimationFrame(() => void scan());
      };
      frameRef.current = requestAnimationFrame(() => void scan());
    } catch {
      stop();
      setCameraState("error");
    }
  };

  return (
    <div className="pick-native-scan">
      {cameraState === "active" || cameraState === "opening" ? (
        <div className="pick-camera-stage">
          <video ref={videoRef} playsInline muted aria-label="Barcode camera" />
          <div className="pick-camera-target" aria-hidden="true" />
          <button type="button" onClick={stop}>CLOSE CAMERA</button>
        </div>
      ) : (
        <button className="pick-camera-primary" type="button" onClick={() => void start()}>SCAN BARCODE</button>
      )}
      {cameraState === "opening" && <small>Opening camera…</small>}
      {cameraState === "unsupported" && <small>Camera barcode detection is not supported in this browser. Enter the GTIN manually.</small>}
      {cameraState === "error" && <small>Camera could not be opened. Check browser permission or enter the GTIN manually.</small>}
    </div>
  );
}
