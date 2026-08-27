import { mkdirSync } from "node:fs";
import { test, expect } from "@playwright/test";

const OUT = "artifacts/lume-room-clean";
mkdirSync(OUT, { recursive: true });

test("clean LUME room is immediate, interactive and viewport-safe", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/species/orca/lume", { waitUntil: "domcontentloaded" });

  const room = page.locator(".lume-room");
  await expect(room).toBeVisible();
  await expect(room).toHaveAttribute("data-room-version", "03");
  await expect(room).toHaveAttribute("data-subject-motion", "2.5D");
  await expect(page.getByRole("heading", { name: "ORCA", exact: true })).toBeVisible();
  await expect(page.locator(".lume-room__subject-image")).toBeVisible();
  await expect(page.locator(".lume-room__volume-grid")).toBeVisible();
  await expect(page.locator(".lume-room__node")).toHaveCount(4);
  await expect(page.locator(".lume-room__node-label")).toHaveCount(4);
  await expect(page.locator(".lume-room__detail")).toContainText(/One species\. Many different lives\./);
  await expect(room).toHaveAttribute("data-audio-state", "off");
  await expect(page.getByRole("button", { name: /HEAR ORCA ECHOLOCATION/ })).toBeVisible();

  await page.getByRole("button", { name: /03 PLACE/ }).click();
  await expect(room).toHaveAttribute("data-active-node", "place");
  await expect(page.locator(".lume-room__detail")).toContainText(/One species across every ocean/);
  await expect(page.locator(".lume-room__map")).toBeVisible();
  await expect(page.locator(".lume-room__map")).toContainText(/NOT A LIVE TRACK/);

  const subjectControl = page.locator(".lume-room__subject");
  const subjectBox = await subjectControl.boundingBox();
  expect(subjectBox).not.toBeNull();
  await page.mouse.move(subjectBox!.x + subjectBox!.width / 2, subjectBox!.y + subjectBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(subjectBox!.x + subjectBox!.width / 2 + 18, subjectBox!.y + subjectBox!.height / 2 - 10);
  await page.mouse.up();
  expect(await subjectControl.evaluate((element) => getComputedStyle(element).getPropertyValue("--subject-x").trim())).not.toBe("0px");

  await page.getByRole("button", { name: /HEAR ORCA ECHOLOCATION/ }).click();
  await expect(room).toHaveAttribute("data-audio-state", "playing");
  await expect(page.locator(".lume-room__sound")).toContainText(/GLACIER BAY, ALASKA/);
  await expect(page.locator(".lume-room__sound")).toContainText(/NPS \/ C\. GABRIELE/);
  await page.getByRole("button", { name: /MUTE ORCA AUDIO/ }).click();
  await expect(room).toHaveAttribute("data-audio-state", "muted");
  await page.getByRole("button", { name: /SEND ROOM ECHO/ }).click();
  await expect(room).toHaveAttribute("data-sound-active", "true");

  const viewport = page.viewportSize();
  const box = await room.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(-1);
  expect(box!.width).toBeLessThanOrEqual(viewport!.width + 1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  if (viewport!.width <= 760) {
    const subject = await page.locator(".lume-room__subject").boundingBox();
    expect(subject).not.toBeNull();
    expect(subject!.x).toBeGreaterThanOrEqual(0);
    expect(subject!.x + subject!.width).toBeLessThanOrEqual(viewport!.width + 1);
    expect(await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight + 1)).toBe(true);
  }

  const resources = await page.evaluate(() => performance.getEntriesByType("resource").map((entry) => entry.name));
  expect(resources.some((resource) => /\/xr\/orca\/|orca-lume-/i.test(resource))).toBe(false);
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-lume-room-03.png`, fullPage: true });
  expect(errors).toEqual([]);
});

test("megamenu survives pointer travel and keeps one geometry", async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 1440) <= 760, "Pointer-travel is a desktop navigation contract; compact navigation uses tap grammar.");
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const explore = page.getByRole("button", { name: "EXPLORE", exact: true });
  await explore.hover();
  const panel = page.locator(".nav-panel");
  await expect(panel).toBeVisible();
  const firstBox = await panel.boundingBox();
  await panel.hover({ position: { x: 300, y: 160 } });
  await page.waitForTimeout(600);
  await expect(panel).toBeVisible();

  await page.getByRole("button", { name: "TAKE PART", exact: true }).hover();
  await expect(panel).toContainText("4PEOPLE");
  const secondBox = await panel.boundingBox();
  expect(firstBox).not.toBeNull();
  expect(secondBox).not.toBeNull();
  expect(Math.abs(firstBox!.height - secondBox!.height)).toBeLessThanOrEqual(1);
  expect(Math.abs(firstBox!.width - secondBox!.width)).toBeLessThanOrEqual(1);
});
