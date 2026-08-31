import { useState } from "react";
import { addCurrentAtlasView, readAtlasSavedViews, removeAtlasView } from "@/planet/atlasViews";
import AtlasTimeControls from "./AtlasTimeControls";
import { installAtlasLeadingExtensions } from "./atlasLeadingExtensions";
import "./atlas-leading.css";

// Install the selectively recovered donor layers before the lazy World runtime
// reads the shared registry. This extends the one canonical ATLAS engine; it
// does not create or mount a second map implementation.
installAtlasLeadingExtensions();

const mono: React.CSSProperties = { fontFamily: "'Fragment Mono', ui-monospace, monospace", fontSize: 9.5, letterSpacing: ".1em" };

export function AtlasSavedViews() {
  const [state, setState] = useState(readAtlasSavedViews);
  const [open, setOpen] = useState(false);

  const save = () => setState((current) => addCurrentAtlasView(current));
  const remove = (id: string) => setState((current) => removeAtlasView(current, id));

  return (
    <>
      <aside className="atlas-saved-views" style={{ position: "fixed", right: 12, top: 112, zIndex: 38, width: open ? "min(330px,calc(100vw - 24px))" : "auto", pointerEvents: "auto" }} aria-label="My Atlas saved views">
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}
          style={{ ...mono, float: "right", minHeight: 42, border: "1px solid rgba(255,255,255,.34)", background: "rgba(8,8,8,.88)", color: "#fff", padding: "0 12px", cursor: "pointer", backdropFilter: "blur(10px)" }}>
          MY ATLAS{state.views.length ? ` · ${state.views.length}` : ""}{open ? " −" : " +"}
        </button>
        {open && (
          <div style={{ clear: "both", background: "rgba(8,8,8,.94)", color: "#fff", border: "1px solid rgba(255,255,255,.2)", padding: 12, maxHeight: "min(60vh,520px)", overflowY: "auto", backdropFilter: "blur(14px)" }}>
            <div style={{ ...mono, color: "rgba(255,255,255,.58)", lineHeight: 1.55 }}>LOCAL DEVICE · SAVED MAP VIEWS</div>
            <button type="button" onClick={save}
              style={{ width: "100%", marginTop: 10, minHeight: 44, border: "1px solid #3AE86F", background: "transparent", color: "#3AE86F", ...mono, cursor: "pointer" }}>
              SAVE THIS VIEW +
            </button>
            {state.views.length === 0 ? (
              <p style={{ margin: "14px 2px 4px", fontSize: 12.5, lineHeight: 1.55, color: "rgba(255,255,255,.62)" }}>Save a layer/camera context and reopen it later. Species and places remain in the shared Follow / Watch system rather than being duplicated here.</p>
            ) : (
              <div style={{ marginTop: 10 }}>
                {state.views.map((view) => (
                  <div key={view.id} style={{ borderTop: "1px solid rgba(255,255,255,.18)", padding: "10px 0", display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "center" }}>
                    <button type="button" onClick={() => window.location.assign(view.href)} title={view.href}
                      style={{ border: 0, background: "transparent", color: "#fff", textAlign: "left", cursor: "pointer", padding: 0 }}>
                      <span style={{ display: "block", fontSize: 12.5, fontWeight: 600 }}>{view.label}</span>
                      <span style={{ ...mono, display: "block", marginTop: 4, color: "rgba(255,255,255,.48)" }}>{view.savedAt ? new Date(view.savedAt).toLocaleString() : "SAVED"}</span>
                    </button>
                    <button type="button" aria-label={`Delete ${view.label}`} onClick={() => remove(view.id)}
                      style={{ border: 0, background: "transparent", color: "rgba(255,255,255,.58)", cursor: "pointer", ...mono, minWidth: 34, minHeight: 34 }}>×</button>
                  </div>
                ))}
              </div>
            )}
            <p style={{ margin: "12px 2px 0", ...mono, color: "rgba(255,255,255,.42)", lineHeight: 1.55 }}>RECOVERED FROM ATLAS V37CX · VERSIONED LOCAL STORAGE · MALFORMED STATE FAILS CLOSED</p>
          </div>
        )}
      </aside>
      <AtlasTimeControls />
    </>
  );
}
