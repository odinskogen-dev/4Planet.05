import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./lens.css";

type CameraState = "idle" | "requesting" | "live" | "denied" | "unsupported" | "error";
type LocationState = "idle" | "requesting" | "ready" | "denied" | "error";
type CaptureSource = "camera" | "upload";

type LensLocation = {
  latitude: number;
  longitude: number;
  accuracy: number;
  capturedAt: string;
};

type LensCaptureMeta = {
  source: CaptureSource;
  capturedAt: string;
  mimeType: string;
  size: number;
};

function readableBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readableTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(value));
}

export function LensCapture() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [cameraMessage, setCameraMessage] = useState("Camera access has not been requested.");
  const [locationState, setLocationState] = useState<LocationState>("idle");
  const [location, setLocation] = useState<LensLocation | null>(null);
  const [locationMessage, setLocationMessage] = useState("Location is optional and stays local in this proof.");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [captureMeta, setCaptureMeta] = useState<LensCaptureMeta | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraState((current) => (current === "live" ? "idle" : current));
  }, []);

  const clearPreview = useCallback(() => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setPreviewUrl(null);
    setCaptureMeta(null);
  }, []);

  const setBlobPreview = useCallback(
    (blob: Blob, source: CaptureSource) => {
      clearPreview();
      const url = URL.createObjectURL(blob);
      previewUrlRef.current = url;
      setPreviewUrl(url);
      setCaptureMeta({
        source,
        capturedAt: new Date().toISOString(),
        mimeType: blob.type || "image/jpeg",
        size: blob.size,
      });
    },
    [clearPreview],
  );

  const startCamera = useCallback(async () => {
    clearPreview();
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("unsupported");
      setCameraMessage("Live camera is not available in this browser. Use Take / choose photo instead.");
      return;
    }

    setCameraState("requesting");
    setCameraMessage("Waiting for camera permission…");

    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraState("live");
      setCameraMessage("Rear camera requested. Nothing is uploaded in this proof.");
    } catch (error) {
      const name = error instanceof DOMException ? error.name : "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setCameraState("denied");
        setCameraMessage("Camera permission was not granted. You can still use Take / choose photo.");
      } else {
        setCameraState("error");
        setCameraMessage("The live camera could not be started. Use Take / choose photo as fallback.");
      }
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
    if (!context) {
      setCameraMessage("This browser could not create the image preview.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraMessage("The frame could not be captured.");
          return;
        }
        setBlobPreview(blob, "camera");
        stopCamera();
        setCameraMessage("Frame captured locally. No upload has occurred.");
      },
      "image/jpeg",
      0.9,
    );
  }, [setBlobPreview, stopCamera]);

  const handleFile = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
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
    },
    [setBlobPreview, stopCamera],
  );

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationState("error");
      setLocationMessage("Location is not available in this browser.");
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
        setLocationMessage("Location captured locally for this observation proof.");
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationState("denied");
          setLocationMessage("Location permission was not granted. The capture can continue without it.");
        } else {
          setLocationState("error");
          setLocationMessage("Location could not be resolved. The capture can continue without it.");
        }
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

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const hasCapture = Boolean(previewUrl && captureMeta);

  return (
    <main className="lens-page">
      <header className="lens-topbar">
        <Link to="/" className="lens-brand" aria-label="4PLANET home">
          4PLANET_
        </Link>
        <div className="lens-topbar-meta mono">LENS 01 · CAPTURE PROOF</div>
        <Link to="/species/orca" className="lens-exit">ORCA ↗</Link>
      </header>

      <section className="lens-shell" aria-labelledby="lens-title">
        <div className="lens-intro">
          <p className="lens-kicker mono">FIELD INPUT · OCE4N_</p>
          <h1 id="lens-title" className="display">See it. Capture it.</h1>
          <p className="lens-lede">
            First technical proof for 4PLANET LENS. Capture one image and optional location on your phone.
            Species recognition and observation upload are deliberately not active yet.
          </p>
        </div>

        <div className="lens-stage">
          <div className={`lens-viewfinder ${cameraState === "live" ? "is-live" : ""}`}>
            {hasCapture ? (
              <img src={previewUrl ?? undefined} alt="Local capture preview" className="lens-preview" />
            ) : (
              <video ref={videoRef} className="lens-video" playsInline muted aria-label="Live camera preview" />
            )}

            {!hasCapture && cameraState !== "live" && (
              <div className="lens-empty" aria-live="polite">
                <span className="lens-reticle" aria-hidden="true" />
                <p className="mono">CAMERA OFF</p>
                <span>Start the camera or choose a photo.</span>
              </div>
            )}

            {cameraState === "live" && (
              <div className="lens-live-badge mono" aria-live="polite">LIVE CAMERA · LOCAL ONLY</div>
            )}

            {hasCapture && <div className="lens-capture-badge mono">CAPTURED · NOT UPLOADED</div>}
          </div>

          <canvas ref={canvasRef} hidden />
          <input
            ref={fileInputRef}
            className="lens-file-input"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFile}
            aria-label="Take or choose a photo"
          />

          <div className="lens-actions" aria-label="Capture controls">
            {!hasCapture && cameraState !== "live" && (
              <button type="button" className="lens-action lens-action-primary" onClick={startCamera} disabled={cameraState === "requesting"}>
                {cameraState === "requesting" ? "Requesting camera…" : "Start camera"}
              </button>
            )}
            {!hasCapture && cameraState === "live" && (
              <button type="button" className="lens-shutter" onClick={captureFrame} aria-label="Capture photo">
                <span />
              </button>
            )}
            {!hasCapture && (
              <button type="button" className="lens-action" onClick={() => fileInputRef.current?.click()}>
                Take / choose photo
              </button>
            )}
            {hasCapture && (
              <>
                <button type="button" className="lens-action lens-action-primary" onClick={reset}>Retake</button>
                <button type="button" className="lens-action" onClick={clearPreview}>Clear</button>
              </>
            )}
          </div>

          <p className={`lens-state lens-state-${cameraState}`} aria-live="polite">{cameraMessage}</p>
        </div>

        <section className="lens-context" aria-labelledby="lens-context-title">
          <div className="lens-context-head">
            <div>
              <p className="lens-kicker mono">OBSERVATION CONTEXT</p>
              <h2 id="lens-context-title" className="display">Location + capture evidence</h2>
            </div>
            {locationState !== "ready" && (
              <button type="button" className="lens-action lens-location-action" onClick={requestLocation} disabled={locationState === "requesting"}>
                {locationState === "requesting" ? "Locating…" : "Add location"}
              </button>
            )}
          </div>

          <div className="lens-evidence-grid">
            <div className="lens-evidence">
              <span className="mono">MEDIA</span>
              <strong>{captureMeta ? (captureMeta.source === "camera" ? "Camera frame" : "Photo selected") : "Not captured"}</strong>
              <small>{captureMeta ? `${readableBytes(captureMeta.size)} · ${captureMeta.mimeType}` : "No media leaves this device."}</small>
            </div>
            <div className="lens-evidence">
              <span className="mono">TIME</span>
              <strong>{captureMeta ? readableTime(captureMeta.capturedAt) : "Pending"}</strong>
              <small>Capture timestamp will later be stored separately from observation time when needed.</small>
            </div>
            <div className="lens-evidence">
              <span className="mono">LOCATION</span>
              <strong>{location ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` : "Optional"}</strong>
              <small>{location ? `±${Math.round(location.accuracy)} m device-reported accuracy` : locationMessage}</small>
            </div>
            <div className="lens-evidence">
              <span className="mono">TRUTH STATE</span>
              <strong>{captureMeta ? "MEDIA ATTACHED" : "NOT REPORTED"}</strong>
              <small>No species ID, verification or research-grade status is created in Pass 01.</small>
            </div>
          </div>
        </section>

        <footer className="lens-foot">
          <p className="mono">PASS 01 / LOCAL CAPTURE ONLY</p>
          <p>Next technical gate: bounded cetacean recognition with an explicit UNKNOWN path.</p>
        </footer>
      </section>
    </main>
  );
}

export default LensCapture;
