import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useFourPlanetIdentity } from "@/auth/FourPlanetIdentity";

export default function FourBrandsClaimBridge() {
  const { ready, user, openAuth } = useFourPlanetIdentity();
  const [target, setTarget] = useState<Element | null>(null);

  useEffect(() => {
    const resolve = () => setTarget(document.querySelector(".fb-build-card"));
    resolve();
    const observer = new MutationObserver(resolve);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  if (!target || !ready) return null;

  return createPortal(
    <>
      <style>{`
        .fb-claim-bridge{margin-top:22px;padding-top:20px;border-top:1px solid rgba(255,255,255,.18);display:grid;gap:14px}
        .fb-claim-bridge>div{display:grid;gap:6px}
        .fb-claim-bridge span{font-size:9px;letter-spacing:.14em;font-weight:700;color:#bdbdb7}
        .fb-claim-bridge strong{font-size:17px;line-height:1.25;font-weight:560;color:#fff}
        .fb-claim-bridge small{font-size:12px;line-height:1.5;color:#bdbdb7}
        .fb-claim-bridge button{min-height:46px;border:0;border-radius:999px;background:#fff;color:#111;font:inherit;font-weight:680;cursor:pointer;padding:0 18px}
        .fb-claim-bridge button:disabled{background:#2c2c2a;color:#9c9c96;cursor:not-allowed}
      `}</style>
      <div className="fb-claim-bridge" aria-label="Company Twin identity">
        {!user ? (
          <>
            <div>
              <span>PRIVATE COMPANY TWIN</span>
              <strong>Save the company behind your 4PLANET ID.</strong>
              <small>Public research stays open. Sign in only when you want a private Company Twin.</small>
            </div>
            <button type="button" onClick={() => openAuth("signup")}>Create / claim with 4PLANET ID</button>
          </>
        ) : (
          <>
            <div>
              <span>4PLANET ID CONNECTED</span>
              <strong>{user.email || "Signed in"}</strong>
              <small>Identity is ready. Secure Company State remains disabled until the staging database is reachable and RLS is certified.</small>
            </div>
            <button type="button" disabled>Secure save pending</button>
          </>
        )}
      </div>
    </>,
    target,
  );
}
