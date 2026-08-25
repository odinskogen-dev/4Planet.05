import { mkdirSync } from "node:fs";
import { test, expect } from "@playwright/test";

const OUT = "artifacts/living-planet-cell";
mkdirSync(OUT, { recursive: true });

const noHorizontalOverflow = async (page: any) => {
  const widths = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client + 2);
};

test("BERGEN_ DNA Cell — core questions and contextual actions render without overflow", async ({ page }, testInfo) => {
  await page.goto("/places/bergen", { waitUntil: "load" });
  await expect(page.getByRole("heading", { level: 1, name: /Understand a place/i })).toBeVisible();
  for (const question of ["WHAT’S HAPPENING?", "WHAT DOES SCIENCE SAY?", "WHO IS INVOLVED?", "WHAT IS BEING DECIDED?", "WHAT ARE OUR CHOICES?", "WHAT CAN I DO?"]) {
    await expect(page.getByRole("heading", { name: question, exact: true })).toBeVisible();
  }
  await expect(page.getByText("CONSULTATION OPEN", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("06 OCT 2026", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /OPEN BERGEN IN ATLAS/i })).toBeVisible();
  await noHorizontalOverflow(page);
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-bergen.png`, fullPage: true });
});

test("Global Research Intelligence Gold — published PFAS paper exposes finding, limits, authorship and funding", async ({ page }, testInfo) => {
  await page.goto("/research/res-bgo-flesland-pfas-01", { waitUntil: "load" });
  await expect(page.getByRole("heading", { level: 1, name: /PFAS in marine sediments near Bergen Airport Flesland/i })).toBeVisible();
  for (const question of ["What did they find?", "Why does it matter?", "How sure are we?", "What didn’t they prove?", "Who did the research?", "Who funded it?", "Where does it matter?", "What could change because of it?"]) {
    await expect(page.getByRole("heading", { name: question, exact: true })).toBeVisible();
  }
  await expect(page.getByText(/P17-A296/)).toBeVisible();
  await expect(page.getByText(/FEARLESS/)).toBeVisible();
  await noHorizontalOverflow(page);
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-research.png`, fullPage: true });
});

test("GET INVOLVED — real open actions and explicit locked actions coexist", async ({ page }, testInfo) => {
  await page.goto("/get-involved", { waitUntil: "load" });
  await expect(page.getByRole("heading", { level: 1, name: /more than one way to help a living planet/i })).toBeVisible();
  await expect(page.getByText("Participate in KPA 2027", { exact: true })).toBeVisible();
  await expect(page.getByText("Fund a survey", { exact: true })).toBeVisible();
  await expect(page.getByText("LOCKED", { exact: true }).first()).toBeVisible();
  await noHorizontalOverflow(page);
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-get-involved.png`, fullPage: true });
});

test("FOLLOW BERGEN and Better Choices remain bounded rather than pretending full personalisation", async ({ page }, testInfo) => {
  await page.goto("/follow/bergen", { waitUntil: "load" });
  await expect(page.getByRole("heading", { level: 1, name: /Follow what matters to a place/i })).toBeVisible();
  await expect(page.getByText(/What sediments near Flesland reveal/i)).toBeVisible();
  await expect(page.getByText(/Push notifications, user accounts and subscriptions are not claimed live yet/i)).toBeVisible();
  await noHorizontalOverflow(page);
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-follow.png`, fullPage: true });

  await page.goto("/choices/bergen-mobility", { waitUntil: "load" });
  await expect(page.getByRole("heading", { level: 1, name: /Which option best fits this trip/i })).toBeVisible();
  await expect(page.getByText("NO GUILT. NO FAKE PRECISION.", { exact: true })).toBeVisible();
  for (const option of ["Walk", "Bike", "Public transport", "Car"]) await expect(page.getByText(option, { exact: true }).first()).toBeVisible();
  await noHorizontalOverflow(page);
  await page.screenshot({ path: `${OUT}/${testInfo.project.name}-choice.png`, fullPage: true });
});
