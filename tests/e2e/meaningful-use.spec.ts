import { test, expect } from "@playwright/test";

test("ORCA and Bay emit meaningful-use proof locally without polluting production analytics", async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as Window & {
      __muEvents?: Array<Record<string, unknown>>;
      __gtagCalls?: unknown[][];
      gtag?: (...args: unknown[]) => void;
    };
    w.__muEvents = [];
    w.__gtagCalls = [];
    w.gtag = (...args: unknown[]) => w.__gtagCalls!.push(args);
    w.addEventListener("4planet:meaningful-use", (event) => {
      w.__muEvents!.push((event as CustomEvent).detail as Record<string, unknown>);
    });
  });

  await page.goto("/journey/orca/", { waitUntil: "domcontentloaded" });
  await page.locator(".nature-entry__button").click();
  await expect.poll(async () => page.evaluate(() => (window as any).__muEvents?.some((e: any) => e.event_name === "journey_entry"))).toBe(true);

  await page.locator(".nature-journey-hud__evidence").click();
  await expect.poll(async () => page.evaluate(() => (window as any).__muEvents?.some((e: any) => e.event_name === "evidence_open"))).toBe(true);

  const lume = page.locator(".light-lens-toggle");
  await lume.click();
  await expect.poll(async () => page.evaluate(() => (window as any).__muEvents?.some((e: any) => e.event_name === "lume_toggle"))).toBe(true);
  expect(await page.evaluate(() => (window as any).__gtagCalls?.length)).toBe(0);

  await page.goto("/ecosystem/bay-of-biscay/", { waitUntil: "domcontentloaded" });
  const orcaHandoff = page.getByRole("link", { name: /ENTER ORCA JOURNEY/i });
  await expect(orcaHandoff).toBeVisible();
  await orcaHandoff.click();
  await expect(page).toHaveURL(/\/journey\/orca\//);

  const bayEvents = await page.evaluate(() => (window as any).__muEvents || []);
  expect(bayEvents.some((event: any) => event.event_name === "journey_handoff" && event.target === "orca_journey")).toBe(true);
  expect(await page.evaluate(() => (window as any).__gtagCalls?.length)).toBe(0);
});
