import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * Announces a real cross-product context transfer. Direct loads with context do
 * not show a false “retained” message; the notice appears only when the user
 * moves between 4PLANET, ATLAS, SPECIES and IMPACT while context is present.
 */
const CONTEXT_KEYS = ["entity", "journey", "record"] as const;

function productOf(pathname: string) {
  if (pathname.startsWith("/atlas")) return "ATLAS";
  if (pathname.startsWith("/species")) return "SPECIES";
  if (pathname.startsWith("/impact")) return "IMPACT";
  return "4PLANET";
}

export function ContextRetained() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const previous = useRef<{ initialized: boolean; product: string }>({ initialized: false, product: "" });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hasContext = CONTEXT_KEYS.some((key) => Boolean(params.get(key)));
    const product = productOf(location.pathname);

    if (!previous.current.initialized) {
      previous.current = { initialized: true, product };
      return;
    }

    const crossedProductBoundary = product !== previous.current.product;
    previous.current.product = product;

    if (!hasContext || !crossedProductBoundary) {
      setVisible(false);
      return;
    }

    setVisible(true);
    const timeout = window.setTimeout(() => setVisible(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [location.pathname, location.search]);

  return (
    <div
      aria-live="polite"
      role="status"
      style={{
        position: "fixed",
        top: 72,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 55,
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transition: "opacity .2s ease",
      }}
    >
      {visible && (
        <span
          style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: 11,
            letterSpacing: ".1em",
            background: "rgba(8,8,8,.9)",
            color: "#fff",
            padding: "7px 14px",
          }}
        >
          Context retained
        </span>
      )}
    </div>
  );
}
