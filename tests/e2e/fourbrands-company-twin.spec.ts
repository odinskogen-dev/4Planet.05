import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";

const OUT = "artifacts/4brands-proof";
const PUBLIC_MODEL = {
  analysis: {
    company: { name: "TOMRA", legalName: "TOMRA Systems ASA", ticker: "TOM", sector: "Resource technology", geography: "Norway / global", description: "Public company model used only to judge the 4BRANDS product flow." },
    generatedAt: "2026-09-16T12:00:00.000Z",
    analysisStatus: "SEEDED_PROOF",
    statusNote: "Public evidence only.",
    economicBaseline: [
      { label: "Revenue", value: "PUBLIC SOURCE", period: "Latest", truthClass: "FACT", sourceIds: ["S1"] },
      { label: "Gross margin", value: "UNKNOWN", period: "Latest", truthClass: "UNKNOWN", sourceIds: ["S1"] },
      { label: "Cash", value: "UNKNOWN", period: "Latest", truthClass: "UNKNOWN", sourceIds: ["S1"] },
      { label: "Customers", value: "UNKNOWN", period: "Latest", truthClass: "UNKNOWN", sourceIds: ["S1"] }
    ],
    opportunities: [
      { rank: 1, title: "Complete the economic baseline", economicLogic: "Private operating data is required before value can be ranked defensibly.", estimatedValue: "UNKNOWN", truthClass: "UNKNOWN", confidence: "HIGH", sourceIds: ["S1"] }
    ],
    evidence: [{ id: "S1", title: "TOMRA public source", publisher: "TOMRA", url: "https://www.tomra.com", checkedAt: "2026-09-16", note: "Public source" }],
    assumptions: [], unknowns: ["Private finance", "Payment truth", "Contribution economics"]
  }
};

async function shot(page: import("@playwright/test").Page, name: string, project: string) {
  mkdirSync(OUT, { recursive: true });
  await page.waitForTimeout(260);
  await page.screenshot({ path: `${OUT}/${project}-${name}.png`, fullPage: false });
}

async function nav(page: import("@playwright/test").Page, label: string) {
  const mobile = (page.viewportSize()?.width || 1000) <= 760;
  const root = mobile ? page.locator(".fb-mobile-nav") : page.locator(".fb-nav");
  await root.getByRole("button", { name: label, exact: true }).click();
}

test("4BRANDS public model → economic twin → value → decision", async ({ page }, testInfo) => {
  await page.route("**/api/brand-analysis", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(PUBLIC_MODEL) }));
  await page.goto("/sandbox/4brands-company-twin", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "MAKE YOUR COMPANY BETTER" })).toBeVisible();
  await expect(page.getByLabel("Enter company name or website")).toBeVisible();
  await shot(page, "01-front-door", testInfo.project.name);

  await page.getByRole("button", { name: "Try TOMRA public model" }).click();
  await expect(page.getByRole("heading", { name: "TOMRA" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Build your Company Twin." })).toBeVisible();
  await shot(page, "02-public-model", testInfo.project.name);

  await page.getByRole("button", { name: "Explore with synthetic demo finance" }).click();
  await expect(page.getByRole("heading", { name: "What matters now." })).toBeVisible();
  const mobile = (page.viewportSize()?.width || 1000) <= 760;
  const truthStatus = mobile ? page.locator(".fb-mobile-session") : page.locator(".fb-session");
  await expect(truthStatus).toHaveText("SYNTHETIC DEMO FINANCE · SESSION ONLY");
  await expect(truthStatus).toBeVisible();
  await shot(page, "03-overview", testInfo.project.name);

  await nav(page, "Money");
  await expect(page.getByRole("heading", { name: "Know the economic state." })).toBeVisible();
  await expect(page.getByText("ECONOMIC TWIN", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Driver Tree" }).click();
  await expect(page.getByText("REVENUE DRIVER TREE", { exact: true })).toBeVisible();
  await shot(page, "04-money-drivers", testInfo.project.name);

  await nav(page, "Value");
  await expect(page.getByRole("heading", { name: "Where is value leaking?" })).toBeVisible();
  const firstOpportunity = page.locator(".fb-opportunity-list > button").first();
  await expect(firstOpportunity).toBeVisible();
  await shot(page, "05-value-finder", testInfo.project.name);

  await page.getByRole("button", { name: "Take to decision" }).click();
  await expect(page.getByRole("heading", { name: "Make the choice explicit." })).toBeVisible();
  await page.getByRole("button", { name: "Lock baseline" }).click();
  await expect(page.getByText("LOCKED BASELINE", { exact: true })).toBeVisible();
  await shot(page, "06-decision-ledger", testInfo.project.name);

  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(horizontalOverflow).toBeLessThanOrEqual(2);
});
