/**
 * Gate 1 vertical-slice acceptance — journey integrity through VISIBLE CONTROLS.
 *
 * After the initial ATLAS entry, every transition is performed by clicking a real
 * on-screen control. page.goto is NOT used to simulate any journey step, and no
 * return token is hand-stitched. retries=0 (config), so a flake is a failure.
 *
 *   ATLAS bundled Orca occurrence
 *     → [real pan + wheel zoom: the user changes the map]
 *     → click "Open Orca in SPECIES"
 *     → click "Continue to Living Systems"
 *     → click the visible "WH4LES_ MISSION" handoff
 *     → click the visible WH4LES_ Follow/Join control
 *     → click the visible "Back to observation in ATLAS" control on Join
 *     → ATLAS is reconstructed to the POST-INTERACTION camera + record + entity.
 *
 * The return is asserted to reconstruct the map state created AFTER the user's
 * interaction, not the pre-interaction snapshot.
 */
import { mkdirSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";

const OUT = "artifacts/vertical-slice";
mkdirSync(OUT, { recursive: true });

async function mapReady(page: Page) {
  await page.waitForFunction(
    () => Boolean((window as any).__4planet_map && (window as any).__4planet_map.isStyleLoaded()),
    undefined,
    { timeout: 25_000 },
  );
}
async function mapState(page: Page) {
  return page.evaluate(() => {
    const m = (window as any).__4planet_map;
    const c = m.getCenter();
    return { lng: +c.lng.toFixed(2), lat: +c.lat.toFixed(2), zoom: +m.getZoom().toFixed(2) };
  });
}
/** Parse the ATLAS query (record/entity/camera) out of a URL for equality checks. */
function atlasParams(url: string) {
  const q = new URLSearchParams(url.split("?")[1] || "");
  return {
    record: q.get("record"), entity: q.get("entity"), journey: q.get("journey"),
    m: q.get("m"), l: q.get("l"), lens: q.get("lens"), t: q.get("t"), p: q.get("p"),
    z: q.get("z"), c: q.get("c"),
  };
}

test("Gate 1 vertical slice completes through visible controls and restores the post-interaction ATLAS state", async ({ page }, testInfo) => {
  const shot = (n: string) => page.screenshot({ path: `${OUT}/${testInfo.project.name}-${n}.png` });
  const isMobile = (page.viewportSize()?.width ?? 1440) < 760;

  // ── 1. ATLAS opens the deterministic bundled Orca occurrence ──
  await page.goto("/atlas?record=orca-bundled", { waitUntil: "load" });
  await mapReady(page);
  await page.getByText("BUNDLED SOURCE SNAPSHOT", { exact: false }).waitFor({ state: "visible", timeout: 20_000 });
  await expect(page.getByText("OBSERVATION RECORD", { exact: false })).toBeVisible();
  // Truth: the bundled record must NOT show a LIVE badge.
  await expect(page.locator(".stat.live")).toHaveCount(0);
  await expect(page.getByText("BUNDLED · NOT LIVE", { exact: false })).toBeVisible();
  await shot("01-atlas-observation");

  // ── real user map interaction ──
  // Desktop: pointer drag + wheel zoom. Mobile: GENUINE touch — dispatched
  // touchstart/move/end for a one-finger pan and a two-finger pinch, so this is
  // real touch/pinch proof, not page.mouse emulation (audit override B).
  const before = await mapState(page);
  const box = page.viewportSize()!;
  if (isMobile) {
    const cx = box.width * 0.5;
    const cy = box.height * 0.16; // above the bottom sheet, over the live map
    const canvas = page.locator("canvas.maplibregl-canvas").first();
    // One-finger pan via real touch events.
    const touchDrag = (fromX: number, fromY: number, toX: number, toY: number) =>
      page.evaluate(({ fromX, fromY, toX, toY }) => {
        const el = document.querySelector("canvas.maplibregl-canvas") as HTMLElement;
        const r = el.getBoundingClientRect();
        const mk = (x: number, y: number) => {
          const t = new Touch({ identifier: 1, target: el, clientX: r.left + x, clientY: r.top + y });
          return { t, x: r.left + x, y: r.top + y };
        };
        const fire = (type: string, x: number, y: number) => {
          const { t } = mk(x, y);
          el.dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: true, touches: type === "touchend" ? [] : [t], targetTouches: type === "touchend" ? [] : [t], changedTouches: [t] }));
        };
        fire("touchstart", fromX, fromY);
        const steps = 10;
        for (let i = 1; i <= steps; i++) fire("touchmove", fromX + ((toX - fromX) * i) / steps, fromY + ((toY - fromY) * i) / steps);
        fire("touchend", toX, toY);
      }, { fromX, fromY, toX, toY });
    await canvas.waitFor({ state: "visible", timeout: 10_000 });
    await touchDrag(cx, cy, cx - 120, cy + 70);
    await page.waitForTimeout(700);
    // Two-finger pinch-zoom via real touch events.
    await page.evaluate(({ cx, cy }) => {
      const el = document.querySelector("canvas.maplibregl-canvas") as HTMLElement;
      const r = el.getBoundingClientRect();
      const T = (id: number, x: number, y: number) => new Touch({ identifier: id, target: el, clientX: r.left + x, clientY: r.top + y });
      const fire = (type: string, ts: Touch[]) => el.dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: true, touches: type === "touchend" ? [] : ts, targetTouches: type === "touchend" ? [] : ts, changedTouches: ts }));
      let a = 20, b = 20;
      fire("touchstart", [T(1, cx - a, cy), T(2, cx + b, cy)]);
      for (let i = 1; i <= 10; i++) { a = 20 + i * 6; b = 20 + i * 6; fire("touchmove", [T(1, cx - a, cy), T(2, cx + b, cy)]); }
      fire("touchend", [T(1, cx - a, cy), T(2, cx + b, cy)]);
    }, { cx, cy });
  } else {
    const px = box.width * 0.4, py = box.height * 0.5;
    await page.mouse.move(px, py);
    await page.mouse.down();
    await page.mouse.move(px - 90, py + 60, { steps: 12 });
    await page.mouse.move(px - 150, py + 90, { steps: 12 });
    await page.mouse.up();
    await page.waitForTimeout(900);
    await page.mouse.move(px, py);
    for (let i = 0; i < 4; i++) { await page.mouse.wheel(0, -500); await page.waitForTimeout(220); }
  }
  // Let the wheel/inertial/pinch zoom fully settle so the captured camera is the
  // final one (MapLibre keeps easing after the last input).
  await page.waitForFunction(() => {
    const m = (window as any).__4planet_map;
    return m && !m.isMoving() && !m.isZooming() && !m.isEasing();
  }, undefined, { timeout: 8_000 }).catch(() => {});
  await page.waitForTimeout(600);
  const after = await mapState(page);
  expect(after.zoom !== before.zoom || after.lng !== before.lng || after.lat !== before.lat).toBeTruthy();
  // The URL now reflects the POST-INTERACTION camera (moveend + idle wrote it).
  const atlasAfter = atlasParams(page.url());
  expect(atlasAfter.record).toBe("orca-bundled");
  expect(atlasAfter.z).not.toBeNull();
  expect(atlasAfter.c).not.toBeNull();
  // Truth of the camera is the settled live map; assert the URL matches it so we
  // know reconstruction from the URL will be exact.
  const postZoom = after.zoom;
  expect(Math.abs(Number(atlasAfter.z) - postZoom)).toBeLessThanOrEqual(0.2);
  await shot("02-atlas-post-interaction");

  // ── 2. → SPECIES via the visible "Open Orca in SPECIES" control ──
  const toSpecies = page.getByRole("link", { name: /Open Orca in SPECIES/i }).first();
  await toSpecies.scrollIntoViewIfNeeded();
  await toSpecies.click();
  await page.waitForURL(/\/species\/orca/, { timeout: 15_000 });
  expect(page.url()).toContain("returnTo=");
  await expect(page.locator("[data-testid='return-to-atlas']").first()).toBeVisible();
  await shot("03-species");

  // ── 3. → Living Systems via the visible "Continue to Living Systems" control ──
  const toLS = page.locator("[data-testid='species-to-ls']").first();
  await toLS.scrollIntoViewIfNeeded();
  await toLS.click();
  await page.waitForURL(/\/living-systems/, { timeout: 15_000 });
  expect(page.url()).toContain("returnTo=");
  await expect(page.getByText("The Orca, followed honestly", { exact: false })).toBeVisible();
  await shot("04-living-systems");

  // ── 4. → WH4LES_ via the visible LS handoff control (NOT page.goto) ──
  const toWh4les = page.locator("[data-testid='ls-handoff-wh4les-mission']").first();
  await toWh4les.scrollIntoViewIfNeeded();
  await toWh4les.click();
  await page.waitForURL(/\/missions\/wh4les/, { timeout: 15_000 });
  expect(page.url()).toContain("returnTo=");
  await shot("05-wh4les");

  // ── 5. → Join via the visible WH4LES_ Follow/Join control (NOT page.goto) ──
  const toJoin = page.locator("[data-testid='mission-to-join']").first();
  await toJoin.scrollIntoViewIfNeeded();
  await toJoin.click();
  await page.waitForURL(/\/join/, { timeout: 15_000 });
  expect(page.url()).toContain("returnTo=");
  // Join shows the contextual return because we arrived from the journey.
  const joinReturn = page.locator("[data-testid='return-to-atlas']").first();
  await expect(joinReturn).toBeVisible();
  await shot("06-join");

  // ── 6. → return to ATLAS via the visible Join control (NOT a stitched token) ──
  await joinReturn.click();
  await page.waitForURL(/\/atlas/, { timeout: 15_000 });
  await mapReady(page);
  await page.getByText("BUNDLED SOURCE SNAPSHOT", { exact: false }).waitFor({ state: "visible", timeout: 20_000 });

  // Reconstruction asserted against the POST-INTERACTION ATLAS state.
  const restored = atlasParams(page.url());
  expect(restored.record).toBe("orca-bundled");                 // record restored
  expect(restored.m).toBe(atlasAfter.m);                        // map mode
  expect(restored.lens).toBe(atlasAfter.lens);                  // lens
  expect(restored.t).toBe(atlasAfter.t);                        // theme
  expect(restored.p).toBe(atlasAfter.p);                        // projection
  expect(restored.l).toBe(atlasAfter.l);                        // layers
  // Camera restored to the post-interaction zoom within tolerance (not the pre-
  // interaction snapshot). Assert against the settled live map on return.
  const restoredLive = await mapState(page);
  expect(Math.abs(restoredLive.zoom - postZoom)).toBeLessThanOrEqual(0.25);
  expect(Math.abs(restoredLive.zoom - before.zoom)).toBeGreaterThan(0.1);
  const restoredZoom = Number(restored.z);
  expect(Math.abs(restoredZoom - postZoom)).toBeLessThanOrEqual(0.25);
  await expect(page.locator(".stat.live")).toHaveCount(0);      // still no LIVE on bundled
  await shot("07-return-restored");
});

test("browser back/forward and reload do not corrupt or fabricate ATLAS state", async ({ page }) => {
  await page.goto("/atlas?record=orca-bundled", { waitUntil: "load" });
  await mapReady(page);
  await page.getByText("BUNDLED SOURCE SNAPSHOT", { exact: false }).waitFor({ state: "visible", timeout: 20_000 });
  const open = page.getByRole("link", { name: /Open Orca in SPECIES/i }).first();
  await open.scrollIntoViewIfNeeded();
  await open.click();
  await page.waitForURL(/\/species\/orca/, { timeout: 15_000 });
  // Back → ATLAS record restored, no fabricated LIVE.
  await page.goBack();
  await page.waitForURL(/\/atlas/, { timeout: 15_000 });
  await mapReady(page);
  await expect(page.getByText("BUNDLED SOURCE SNAPSHOT", { exact: false })).toBeVisible();
  await expect(page.locator(".stat.live")).toHaveCount(0);
  // Forward → SPECIES again.
  await page.goForward();
  await page.waitForURL(/\/species\/orca/, { timeout: 15_000 });
  await expect(page.locator("[data-testid='return-to-atlas']").first()).toBeVisible();
  // Reload → SPECIES still coherent, returnTo intact.
  await page.reload();
  await expect(page.locator("[data-testid='return-to-atlas']").first()).toBeVisible();
});

test("unsafe or external returnTo values are rejected; unknown keys dropped", async ({ page }) => {
  // External absolute URL as returnTo → no return control is shown.
  await page.goto("/join?returnTo=" + Buffer.from("https://evil.example.com/atlas", "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""), { waitUntil: "load" });
  await expect(page.locator("[data-testid='return-to-atlas']")).toHaveCount(0);
  // Non-/atlas path as returnTo → rejected.
  await page.goto("/join?returnTo=" + Buffer.from("/evil", "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""), { waitUntil: "load" });
  await expect(page.locator("[data-testid='return-to-atlas']")).toHaveCount(0);
  // Direct Join (no returnTo) → no contextual return, ordinary Join is unaffected.
  await page.goto("/join", { waitUntil: "load" });
  await expect(page.locator("[data-testid='return-to-atlas']")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: /Everyone has a role/i })).toBeVisible();
});
