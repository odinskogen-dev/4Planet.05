import { mkdirSync } from "node:fs";
import { test, expect } from "@playwright/test";

const OUT = "artifacts/jaguar-xr";
mkdirSync(OUT, { recursive: true });

test("Jaguar XR loads the declarative Nature Renderer in flat browser mode", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/xr/jaguar/", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".brand")).toHaveAttribute("href", "/species/jaguar");
  await expect(page.locator(".eyebrow")).toContainText(/JAGUAR · PANTHERA ONCA/i);
  await expect(page.locator(".boundary")).toContainText(/NOT A LIVE HABITAT/i);

  const scene = page.locator("#nature-scene");
  await expect(scene).toHaveAttribute("data-entity-id", "taxon:gbif:5219426", { timeout: 20_000 });
  await expect(scene).toHaveAttribute("data-manifest-version", "v0.2");
  await expect(page.locator('[data-node-id="jaguar-identity"]')).toHaveCount(1);

  const pressure = page.locator('[data-node-id="jaguar-habitat-loss-fragmentation"]');
  await expect(pressure).toHaveAttribute("data-relation-class", "PRESSURE");
  await expect(pressure).toHaveAttribute("data-hotspot-ready", "true");
  await expect(page.locator('[data-node-id="jaguar-solutions-transition"]')).toHaveAttribute("data-relation-class", "RESPONSE");
  await expect(page.locator("#panel-title")).toHaveAttribute("value", "SELECT A NODE");

  await pressure.evaluate((node) => node.dispatchEvent(new Event("click")));
  await expect(page.locator("#panel-title")).toHaveAttribute("value", "PRESSURE → CAUSE");
  await expect(page.locator("#panel-source")).toHaveAttribute("value", /KNOWN · SOURCE · PANTHERA — JAGUAR/);
  await expect(page.locator("#panel-boundary")).toHaveAttribute("value", /place-specific evidence/i);

  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-jaguar-xr-flat.png`, fullPage: true });
  expect(errors, `page errors: ${errors.join(" | ")}`).toEqual([]);
});
