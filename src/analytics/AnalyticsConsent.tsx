import { useState } from "react";
import {
  disableAnalytics,
  enableAnalytics,
  getAnalyticsConsent,
  isGa4Configured,
} from "./analytics";
import "./analytics.css";

export function AnalyticsConsent() {
  const [consent, setConsent] = useState(() => getAnalyticsConsent());

  if (!isGa4Configured() || consent !== null) return null;

  const allow = () => {
    setConsent("granted");
    void enableAnalytics();
  };

  const decline = () => {
    disableAnalytics();
    setConsent("denied");
  };

  return (
    <aside className="analytics-consent" aria-label="Analytics preferences">
      <div className="analytics-consent__copy">
        <strong>Optional analytics</strong>
        <span>
          We use optional Google Analytics to understand how 4PLANET is used. It stays off unless you allow it.
        </span>
      </div>
      <div className="analytics-consent__actions">
        <button type="button" className="analytics-consent__secondary" onClick={decline}>
          No thanks
        </button>
        <button type="button" className="analytics-consent__primary" onClick={allow}>
          Allow analytics
        </button>
      </div>
    </aside>
  );
}
