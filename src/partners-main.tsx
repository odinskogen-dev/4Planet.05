import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import PartnersHub from "@/pages/partners/PartnersHub";
import {
  consumeBridgeFromLocation,
  getIdentityClient,
  identityAccountUrl,
  identityLoginUrl,
} from "@/identity/identityClient";
import "@/styles/global.css";

function PartnersIdentityEntry() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    let alive = true;
    let unsubscribe = () => {};
    getIdentityClient().then((client) => {
      client.auth.getSession().then(({ data }) => { if (alive) setSignedIn(Boolean(data.session)); });
      const listener = client.auth.onAuthStateChange((_event, session) => { if (alive) setSignedIn(Boolean(session)); });
      unsubscribe = () => listener.data.subscription.unsubscribe();
    }).catch(() => undefined);
    return () => { alive = false; unsubscribe(); };
  }, []);
  const href = signedIn ? identityAccountUrl(window.location.href) : identityLoginUrl(window.location.href);
  return (
    <a
      href={href}
      aria-label={signedIn ? "Open 4PLANET ID account" : "Log in with 4PLANET ID"}
      style={{
        position:"fixed",top:"calc(12px + env(safe-area-inset-top,0px))",right:16,zIndex:2147483000,
        padding:"9px 12px",border:"1px solid rgba(8,8,8,.18)",borderRadius:999,
        background:"rgba(255,255,255,.94)",color:"#080808",textDecoration:"none",
        font:"650 10px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace",letterSpacing:".12em",
        boxShadow:"0 4px 18px rgba(0,0,0,.08)",backdropFilter:"blur(14px)"
      }}
    >
      {signedIn ? "4PLANET ID" : "LOG IN"}
    </a>
  );
}

function IdentityCallback() {
  const [message, setMessage] = useState("Completing secure sign-in…");
  useEffect(() => {
    consumeBridgeFromLocation()
      .then((result) => {
        if (!result) throw new Error("missing");
        window.location.replace(result.returnTo);
      })
      .catch(() => {
        setMessage("This sign-in link is invalid or expired.");
        setTimeout(() => window.location.replace(identityLoginUrl(window.location.origin + "/")), 900);
      });
  }, []);
  return (
    <main style={{minHeight:"100dvh",display:"grid",placeItems:"center",padding:24,fontFamily:"system-ui,sans-serif"}}>
      <section><h1 style={{fontSize:34,letterSpacing:"-.04em",margin:"0 0 12px"}}>4PLANET ID</h1><p>{message}</p></section>
    </main>
  );
}

const callback = window.location.pathname.replace(/\/+$/,"") === "/auth/4planet/callback";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {callback ? <IdentityCallback /> : <><PartnersHub /><PartnersIdentityEntry /></>}
  </React.StrictMode>,
);
