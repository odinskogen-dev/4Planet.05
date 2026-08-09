/* ═══════════════════════════════════════════════════════════════════════════
   4PLANET_ — EARTH — ERROR BOUNDARY
   ───────────────────────────────────────────────────────────────────────────
   Brief §29 / V36's AtlasBoundary principle: the interface degrades HONESTLY.
   A raster that 404s says UNAVAILABLE; it does not fake ON. By the same rule, a
   runtime throw must not blank the screen. A white screen tells the user nothing
   and tells the developer nothing. This tells both.

   This exists because a single `.map` on an undefined value once took the whole
   world down to white. That specific bug is fixed — but the class of bug should
   never again be able to hide.
   ═══════════════════════════════════════════════════════════════════════════ */

import React from "react";

interface State {
  error: Error | null;
}

export class WorldBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Full detail to the console for whoever opens dev tools.
     
    console.error("[4PLANET_ WORLD] runtime error:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#080808",
          color: "#fff",
          fontFamily: "'Fragment Mono', ui-monospace, monospace",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 520, borderLeft: "2px solid #FF4D22", paddingLeft: 18 }}>
          <div style={{ fontSize: 10, letterSpacing: ".2em", color: "#FF4D22" }}>
            4PLANET_ · THE WORLD FAILED TO RENDER
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.6, margin: "14px 0", opacity: 0.9 }}>
            Something in the interface threw at runtime. Rather than show you a
            blank screen, 4PLANET is telling you that plainly. The detail is in the
            browser console.
          </div>
          <div
            style={{
              fontSize: 11,
              lineHeight: 1.5,
              opacity: 0.6,
              wordBreak: "break-word",
              borderTop: "1px solid rgba(255,255,255,.12)",
              paddingTop: 12,
            }}
          >
            {String(this.state.error?.message || this.state.error)}
          </div>
          <button
            onClick={() => {
              window.location.href = window.location.pathname;
            }}
            style={{
              marginTop: 18,
              background: "transparent",
              border: "1px solid #fff",
              color: "#fff",
              fontFamily: "inherit",
              fontSize: 10,
              letterSpacing: ".16em",
              padding: "9px 16px",
              cursor: "pointer",
            }}
          >
            RELOAD CLEAN
          </button>
        </div>
      </div>
    );
  }
}
