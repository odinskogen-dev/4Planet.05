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
    </div>,
    target,
  );
}
