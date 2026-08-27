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
  await expect(page.getByRole("heading", { name: "ORCA", exact: true })).toBeVisible();
  await expect(page.locator(".lume-room__subject-image")).toBeVisible();
  await expect(page.locator(".lume-room__node")).toHaveCount(4);
  await expect(page.locator(".lume-room__detail")).toContainText(/One species\. Many different lives\./);

  await page.getByRole("button", { name: /03 FOOD WEB/ }).click();
  await expect(room).toHaveAttribute("data-active-node", "food");
  await expect(page.locator(".lume-room__detail")).toContainText(/Diet depends on population/);

  await page.getByRole("button", { name: /HEAR ROOM PULSE/ }).click();
  await expect(room).toHaveAttribute("data-sound-active", "true");
  await expect(page.locator(".lume-room__sound")).toContainText(/NOT FIELD AUDIO/);

  const viewport = page.viewportSize();
  const box = await room.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(-1);
  expect(box!.width).toBeLessThanOrEqual(viewport!.width + 1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);

  const resources = await page.evaluate(() => performance.getEntriesByType("resource").map((entry) => entry.name));
  expect(resources.some((resource) => /\/xr\/orca\/|orca-lume-/i.test(resource))).toBe(false);
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-lume-room-01.png`, fullPage: true });
  expect(errors).toEqual([]);
});

test("megamenu survives pointer travel and keeps one geometry", async ({ page }) => {
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
