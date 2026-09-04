import { describe, expect, it } from "vitest";
import { buildAiCapacitySnapshot } from "./aiCapacitySnapshot";

describe("buildAiCapacitySnapshot", () => {
  const base = {
    utcDay: "2026-09-04",
    utcMonth: "2026-09",
    requestedCalls: 2,
    dayReserved: 0,
    monthReserved: 4,
    dayCap: 6,
    monthCap: 60,
  };

  it("reports available capacity without consuming it", () => {
    const snapshot = buildAiCapacitySnapshot(base);
    expect(snapshot).toMatchObject({
      allowed: true,
      decision: "AVAILABLE",
      dayRemaining: 6,
      monthRemaining: 56,
      readOnly: true,
    });
  });

  it("fails closed when the daily persisted reservation would exceed the cap", () => {
    const snapshot = buildAiCapacitySnapshot({ ...base, dayReserved: 5 });
    expect(snapshot.allowed).toBe(false);
    expect(snapshot.decision).toBe("DAILY_CAP");
  });

  it("fails closed when the monthly persisted reservation would exceed the cap", () => {
    const snapshot = buildAiCapacitySnapshot({ ...base, monthReserved: 59 });
    expect(snapshot.allowed).toBe(false);
    expect(snapshot.decision).toBe("MONTHLY_CAP");
  });

  it("does not infer reset from historical rows: caller must supply the current UTC key", () => {
    const snapshot = buildAiCapacitySnapshot({ ...base, utcDay: "2026-09-04", dayReserved: 0 });
    expect(snapshot.allowed).toBe(true);
    expect(snapshot.utcDay).toBe("2026-09-04");
  });

  it("fails closed on malformed usage or request values", () => {
    expect(buildAiCapacitySnapshot({ ...base, requestedCalls: 0 }).decision).toBe("INVALID");
    expect(buildAiCapacitySnapshot({ ...base, dayReserved: -1 }).decision).toBe("INVALID");
  });
});
