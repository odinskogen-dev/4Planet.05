import { useEffect, useRef, useState } from "react";
import { addCurrentAtlasView, readAtlasSavedViews, removeAtlasView, writeAtlasSavedViews } from "@/planet/atlasViews";
import { getFollows, replaceFollows } from "@/planet/follow";
import type { Follow } from "@/planet/types";
import { getIdentityClient, identityAccountUrl, identityLoginUrl, type FourPlanetSession } from "@/identity/identityClient";
import { readAtlasAccountState, writeAtlasAccountState } from "./atlasAccountState";
import AtlasTimeControls from "./AtlasTimeControls";
import AtlasZoomStack from "./AtlasZoomStack";
import { installAtlasLeadingExtensions } from "./atlasLeadingExtensions";
import "./atlas-leading.css";

// Install selectively recovered donor layers before the lazy World runtime reads
// the shared registry. One canonical ATLAS engine remains authoritative.
installAtlasLeadingExtensions();

function mergeFollows(local: Follow[], remote: Follow[]) {
  const rows = new Map<string, Follow>();
  for (const item of [...remote, ...local]) {
    if (!item?.id) continue;
    const current = rows.get(item.id);
    const currentAt = current?.addedAt ? Date.parse(current.addedAt) : 0;
    const nextAt = item.addedAt ? Date.parse(item.addedAt) : 0;
    if (!current || nextAt >= currentAt) rows.set(item.id, item);
  }
  return [...rows.values()]
    .sort((a, b) => Date.parse(b.addedAt || "1970-01-01") - Date.parse(a.addedAt || "1970-01-01"))
    .slice(0, 200);
}

function mergeViews(local: ReturnType<typeof readAtlasSavedViews>["views"], remote: ReturnType<typeof readAtlasSavedViews>["views"]) {
  const rows = new Map<string, (typeof local)[number]>();
  for (const item of [...remote, ...local]) {
    if (!item?.href) continue;
    const current = rows.get(item.href);
    const currentAt = current?.savedAt ? Date.parse(current.savedAt) : 0;
    const nextAt = item.savedAt ? Date.parse(item.savedAt) : 0;
    if (!current || nextAt >= currentAt) rows.set(item.href, item);
  }
  return [...rows.values()]
    .sort((a, b) => Date.parse(b.savedAt || "1970-01-01") - Date.parse(a.savedAt || "1970-01-01"))
    .slice(0, 30);
}

export function AtlasSavedViews() {
  const [state, setState] = useState(readAtlasSavedViews);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [session, setSession] = useState<FourPlanetSession | null>(null);
  const [syncState, setSyncState] = useState<"LOCAL" | "SYNCING" | "SYNCED" | "OFFLINE">("LOCAL");
  const sessionRef = useRef<FourPlanetSession | null>(null);
  const hydrating = useRef(false);
  const syncTimer = useRef<number | null>(null);

  useEffect(() => {
    let alive = true;
    let unsubscribe = () => {};
    (async () => {
      try {
        const client = await getIdentityClient();
        const current = await client.auth.getSession();
        if (!alive) return;
        sessionRef.current = current.data.session;
        setSession(current.data.session);
        const listener = client.auth.onAuthStateChange((_event, next) => {
          if (!alive) return;
          sessionRef.current = next;
          setSession(next);
          setSyncState(next ? "SYNCING" : "LOCAL");
        });
        unsubscribe = () => listener.data.subscription.unsubscribe();
      } catch {
        if (alive) setSyncState("OFFLINE");
      }
    })();
    return () => {
      alive = false;
      unsubscribe();
      if (syncTimer.current) window.clearTimeout(syncTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    hydrating.current = true;
    setSyncState("SYNCING");
    (async () => {
      try {
        const remote = await readAtlasAccountState(session);
        if (cancelled) return;
        const mergedFollows = mergeFollows(getFollows(), remote?.follows || []);
        const mergedViews = mergeViews(readAtlasSavedViews().views, remote?.savedViews || []);
        replaceFollows(mergedFollows);
        writeAtlasSavedViews({ version: 1, views: mergedViews });
        setState({ version: 1, views: mergedViews });
        await writeAtlasAccountState(session, { follows: mergedFollows, savedViews: mergedViews });
        if (!cancelled) setSyncState("SYNCED");
      } catch {
        if (!cancelled) setSyncState("OFFLINE");
      } finally {
        hydrating.current = false;
      }
    })();
    return () => { cancelled = true; };
  }, [session?.user.id]);

  useEffect(() => {
    const scheduleSync = () => {
      setState(readAtlasSavedViews());
      const active = sessionRef.current;
      if (!active || hydrating.current) return;
      if (syncTimer.current) window.clearTimeout(syncTimer.current);
      setSyncState("SYNCING");
      syncTimer.current = window.setTimeout(async () => {
        try {
          await writeAtlasAccountState(active, {
            follows: getFollows(),
            savedViews: readAtlasSavedViews().views,
          });
          setSyncState("SYNCED");
        } catch {
          setSyncState("OFFLINE");
        }
      }, 700);
    };
    window.addEventListener("4p:follows", scheduleSync);
    window.addEventListener("4p:atlas-views", scheduleSync);
    window.addEventListener("storage", scheduleSync);
    return () => {
      window.removeEventListener("4p:follows", scheduleSync);
      window.removeEventListener("4p:atlas-views", scheduleSync);
      window.removeEventListener("storage", scheduleSync);
    };
  }, []);

  const save = () => setState((current) => addCurrentAtlasView(current));
  const remove = (id: string) => setState((current) => removeAtlasView(current, id));

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: "4PLANET ATLAS", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error: any) {
      if (error?.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      } catch { /* sharing is optional; never block ATLAS */ }
    }
  };

  return (
    <>
      <aside className={`atlas-saved-views ${open ? "open" : ""}`} aria-label="My Atlas saved views">
        <button type="button" className="atlas-saved-toggle" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
          MY ATLAS{state.views.length ? ` · ${state.views.length}` : ""}{open ? " −" : " +"}
        </button>

        {open && (
          <div className="atlas-saved-body">
            <div className="atlas-saved-head">
              <div>
                <div className="atlas-saved-kicker">{session ? "SAVED WITH 4PLANET ID" : "SAVED ON THIS DEVICE"}</div>
                <div className="atlas-saved-sync">
                  {session
                    ? `${syncState === "SYNCED" ? "SYNCED" : syncState === "SYNCING" ? "SYNCING…" : "LOCAL COPY · SYNC RETRY"} · ${session.user.email || "4PLANET ID"}`
                    : "SIGN IN TO KEEP PLACES, FOLLOWS AND VIEWS ACROSS DEVICES"}
                </div>
              </div>
              <button type="button" className="atlas-saved-close" onClick={() => setOpen(false)} aria-label="Close My Atlas">×</button>
            </div>

            <div className="atlas-saved-actions">
              <button type="button" onClick={share} className="atlas-action atlas-action-blue">
                {copied ? "LINK COPIED" : "SHARE VIEW"}
              </button>
              <button type="button" onClick={save} className="atlas-action atlas-action-green">
                SAVE VIEW +
              </button>
            </div>

            <button
              type="button"
              className="atlas-account-action"
              onClick={() => window.location.assign(session ? identityAccountUrl(window.location.href) : identityLoginUrl(window.location.href))}
            >
              {session ? "4PLANET ID · ACCOUNT" : "SIGN IN · 4PLANET ID"}
            </button>

            {state.views.length === 0 ? (
              <p className="atlas-saved-empty">
                Save useful map views here. Places and species you follow remain in Watch. Signed-in users keep both across supported 4PLANET surfaces.
              </p>
            ) : (
              <div className="atlas-saved-list">
                {state.views.map((view) => (
                  <div key={view.id} className="atlas-saved-row">
                    <button type="button" onClick={() => window.location.assign(view.href)} title={view.href} className="atlas-saved-open">
                      <span>{view.label}</span>
                      <small>{view.savedAt ? new Date(view.savedAt).toLocaleString() : "SAVED"}</small>
                    </button>
                    <button type="button" aria-label={`Delete ${view.label}`} onClick={() => remove(view.id)} className="atlas-saved-delete">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </aside>

      <AtlasTimeControls />
      <AtlasZoomStack />
    </>
  );
}
