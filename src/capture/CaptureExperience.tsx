import { ChangeEvent, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./capture.css";

type CameraState = "idle" | "requesting" | "live" | "denied" | "unsupported" | "error";
type LocationState = "idle" | "requesting" | "ready" | "denied" | "error";
export type CaptureSource = "camera" | "upload";

export interface CaptureLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  capturedAt: string;
}

export interface CapturePayload {
  blob: Blob;
  source: CaptureSource;
  capturedAt: string;
  mimeType: string;
  size: number;
}

export interface CaptureExperienceProps {
  productLabel: string;
  eyebrow: string;
  title: string;
  description: string;
  exitHref: string;
  exitLabel: string;
  accent?: string;
  footerLabel: string;
  footerText: string;
  renderNext?: (capture: CapturePayload | null, location: CaptureLocation | null) => ReactNode;
}

function readableBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readableTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "medium" }).format(new Date(value));
}

export function CaptureExperience({
  productLabel,
  eyebrow,
  title,
  description,
  exitHref,
  exitLabel,
  accent = "#2e2eff",
  footerLabel,
  footerText,
  renderNext,
}: CaptureExperienceProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [cameraMessage, setCameraMessage] = useState("Camera access has not been requested.");
  const [locationState, setLocationState] = useState<LocationState>("idle");
  const [location, setLocation] = useState<CaptureLocation | null>(null);
  const [locationMessage, setLocationMessage] = useState("Location is optional and remains local in this proof.");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [capture, setCapture] = useState<CapturePayload | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraState((state) => (state === "live" ? "idle" : state));
  }, []);

  const clearPreview = useCallback(() => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setPreviewUrl(null);
    setCapture(null);
  }, []);

  const setBlobPreview = useCallback((blob: Blob, source: CaptureSource) => {
    clearPreview();
    const url = URL.createObjectURL(blob);
    previewUrlRef.current = url;
    setPreviewUrl(url);
    setCapture({ blob, source, capturedAt: new Date().toISOString(), mimeType: blob.type || "image/jpeg", size: blob.size });
  }, [clearPreview]);

  const startCamera = useCallback(async () => {
    clearPreview();
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("unsupported");
      setCameraMessage("Live camera is unavailable in this browser. Use Take / choose photo instead.");
      return;
    }
    setCameraState("requesting");
    setCameraMessage("Waiting for camera permission…");
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraState("live");
      setCameraMessage("Rear camera requested. Nothing is uploaded.");
    } catch (error) {
      const name = error instanceof DOMException ? error.name : "";
      setCameraState(name === "NotAllowedError" || name === "SecurityError" ? "denied" : "error");
      setCameraMessage("Camera could not be started. Take / choose photo remains available.");
    }
  }, [clearPreview, stopCamera]);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraMessage("Camera image is not ready yet.");
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      setBlobPreview(blob, "camera");
      stopCamera();
      setCameraMessage("Frame captured locally. No upload has occurred.");
    }, "image/jpeg", 0.9);
  }, [setBlobPreview, stopCamera]);

  const handleFile = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setCameraMessage("Choose an image file.");
      event.target.value = "";
      return;
    }
    stopCamera();
    setBlobPreview(file, "upload");
    setCameraState("idle");
    setCameraMessage("Photo loaded locally. No upload has occurred.");
    event.target.value = "";
  }, [setBlobPreview, stopCamera]);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationState("error");
      setLocationMessage("Location is unavailable in this browser.");
      return;
    }
    setLocationState("requesting");
    setLocationMessage("Waiting for location permission…");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          capturedAt: new Date(position.timestamp).toISOString(),
        });
        setLocationState("ready");
        setLocationMessage("Location captured locally.");
      },
      (error) => {
        setLocationState(error.code === error.PERMISSION_DENIED ? "denied" : "error");
        setLocationMessage("Location was not added. Capture can continue without it.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }, []);

  const reset = useCallback(() => {
    stopCamera();
    clearPreview();
    setCameraState("idle");
    setCameraMessage("Camera access has not been requested.");
  }, [clearPreview, stopCamera]);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  const hasCapture = Boolean(previewUrl && capture);

  return (
    <main className="capture-page" style={{ "--capture-accent": accent } as React.CSSProperties}>
      <header className="capture-topbar">
        <Link to="/" className="capture-brand">4PLANET_</Link>
        <div className="capture-topbar-meta mono">{productLabel}</div>
        <Link to={exitHref} className="capture-exit">{exitLabel} ↗</Link>
      </header>

      <section className="capture-shell">
        <div className="capture-intro">
          <p className="capture-kicker mono">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="capture-lede">{description}</p>
        </div>

        <div className="capture-stage">
          <div className={`capture-viewfinder ${cameraState === "live" ? "is-live" : ""}`}>
            {hasCapture ? (
              <img src={previewUrl ?? undefined} alt="Local capture preview" className="capture-preview" />
            ) : (
              <video ref={videoRef} className="capture-video" playsInline muted aria-label="Live camera preview" />
            )}
            {!hasCapture && cameraState !== "live" && (
              <div className="capture-empty"><span className="capture-reticle" /><p className="mono">CAMERA OFF</p><span>Start the camera or choose a photo.</span></div>
            )}
            {cameraState === "live" && <div className="capture-badge mono">LIVE CAMERA · LOCAL ONLY</div>}
            {hasCapture && <div className="capture-badge is-captured mono">CAPTURED · NOT UPLOADED</div>}
          </div>

          <canvas ref={canvasRef} hidden />
          <input ref={fileInputRef} className="capture-file-input" type="file" accept="image/*" capture="environment" onChange={handleFile} aria-label="Take or choose a photo" />

          <div className="capture-actions">
            {!hasCapture && cameraState !== "live" && <button type="button" className="capture-action is-primary" onClick={startCamera} disabled={cameraState === "requesting"}>{cameraState === "requesting" ? "Requesting camera…" : "Start camera"}</button>}
            {!hasCapture && cameraState === "live" && <button type="button" className="capture-shutter" onClick={captureFrame} aria-label="Capture photo"><span /></button>}
            {!hasCapture && <button type="button" className="capture-action" onClick={() => fileInputRef.current?.click()}>Take / choose photo</button>}
            {hasCapture && <><button type="button" className="capture-action is-primary" onClick={reset}>Retake</button><button type="button" className="capture-action" onClick={clearPreview}>Clear</button></>}
          </div>
          <p className={`capture-state is-${cameraState}`} aria-live="polite">{cameraMessage}</p>
        </div>

        <section className="capture-context">
          <div className="capture-context-head">
            <div><p className="capture-kicker mono">CAPTURE CONTEXT</p><h2>Location + evidence</h2></div>
            {locationState !== "ready" && <button type="button" className="capture-action" onClick={requestLocation} disabled={locationState === "requesting"}>{locationState === "requesting" ? "Locating…" : "Add location"}</button>}
          </div>
          <div className="capture-evidence-grid">
            <div className="capture-evidence"><span className="mono">MEDIA</span><strong>{capture ? (capture.source === "camera" ? "Camera frame" : "Photo selected") : "Not captured"}</strong><small>{capture ? `${readableBytes(capture.size)} · ${capture.mimeType}` : "No media leaves this device."}</small></div>
            <div className="capture-evidence"><span className="mono">TIME</span><strong>{capture ? readableTime(capture.capturedAt) : "Pending"}</strong><small>Capture timestamp is evidence, not species identity.</small></div>
            <div className="capture-evidence"><span className="mono">LOCATION</span><strong>{location ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` : "Optional"}</strong><small>{location ? `±${Math.round(location.accuracy)} m device-reported accuracy` : locationMessage}</small></div>
            <div className="capture-evidence"><span className="mono">TRUTH STATE</span><strong>{capture ? "MEDIA ATTACHED" : "NOT REPORTED"}</strong><small>No automatic species, food or verification claim is created by capture alone.</small></div>
          </div>
        </section>

        {renderNext && <section className="capture-next">{renderNext(capture, location)}</section>}

        <footer className="capture-foot"><p className="mono">{footerLabel}</p><p>{footerText}</p></footer>
      </section>
    </main>
  );
}

export default CaptureExperience;
