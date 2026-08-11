import { mkdirSync } from "node:fs";
import { expect, test } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "http://127.0.0.1:4173";
const visualEvidenceDir = "visual-qa-evidence";
mkdirSync(visualEvidenceDir, { recursive: true });

const evidencePath = (fileName: string) => `${visualEvidenceDir}/${fileName}`;

test("Brand OS release board freezes Orca copy and remains founder-gated", async ({ page }) => {
  await page.goto(`${baseURL}/internal/brand-os`);

  const frozen = page.getByRole("complementary");
  const production = page.getByRole("region", { name: "Selected Brand OS production object" });
  const family = page.getByRole("region", { name: "Exact release family" });

  await expect(page.getByRole("heading", { name: "Founder Release Board" })).toBeVisible();
  await expect(page.getByText("EXTERNAL PUBLISHING DISABLED")).toBeVisible();
  await expect(page.getByText("STORY-BOS-ORCA-001").first()).toBeVisible();
  await expect(frozen.getByText("MAN-BOS-ORCA-001", { exact: true })).toBeVisible();
  await expect(family.getByRole("heading", { name: "FAM-BOS-ORCA-001", exact: true })).toBeVisible();
  await expect(family.getByText("VAR-BOS-ORCA-IGFEED-001", { exact: true })).toBeVisible();
  await expect(frozen.getByText("Non-founder ready")).toBeVisible();
  await expect(frozen.getByText("YES", { exact: true })).toBeVisible();
  await expect(frozen.getByText(/Founder gate is OPEN/)).toBeVisible();
  await expect(frozen.getByText(/AST-0025 \/ RD-0019/)).toBeVisible();
  await expect(frozen.getByText(/One Orca record can tell us something real/)).toBeVisible();
  await expect(production.getByRole("heading", { name: "One record. A wider living system." })).toBeVisible();
  await expect(production.getByText("5939349319", { exact: false }).first()).toBeVisible();
  await expect(production.getByText(/does not establish range, abundance, population trend/i).first()).toBeVisible();
  await expect(page.getByText(/APPROVE AS SECOND CONTROLLED TEST CANDIDATE/)).toBeVisible();

  await production.screenshot({ path: evidencePath("orca-production-desktop.png") });
  await page.setViewportSize({ width: 390, height: 844 });
  await production.screenshot({ path: evidencePath("orca-production-mobile.png") });

  await frozen.getByRole("button", { name: "APPROVE" }).click();
  await expect(frozen.getByText("APPROVED", { exact: true }).first()).toBeVisible();
  await expect(frozen.getByText(/Founder gate is OPEN/)).toBeVisible();

  await frozen.getByRole("button", { name: "SIMULATE PUBLISH / DRY RUN" }).click();
  await expect(page.getByText("DRY_RUN_CREATED")).toBeVisible();

  await frozen.getByRole("button", { name: "SIMULATE PUBLISH / DRY RUN" }).click();
  await expect(page.getByText("DUPLICATE_SUPPRESSED")).toBeVisible();

  const urls = await page.locator("a").evaluateAll((anchors) => anchors.map((anchor) => (anchor as HTMLAnchorElement).href));
  expect(urls.every((url) => !url.includes("instagram.com") && !url.includes("linkedin.com") && !url.includes("youtube.com"))).toBe(true);
});

test("Bee production object is founder-review ready with exact first-test family and learning contract", async ({ page }) => {
  await page.goto(`${baseURL}/internal/brand-os`);
  await page.getByRole("button", { name: /What Depends on What\? Bee/ }).click();

  const frozen = page.getByRole("complementary");
  const production = page.getByRole("region", { name: "Selected Brand OS production object" });
  const family = page.getByRole("region", { name: "Exact release family" });
  const liveTest = page.getByRole("region", { name: "First live test readiness" });
  const learning = page.getByRole("region", { name: "Pre-registered learning contract" });

  await expect(page.getByText("STORY-BOS-BEE-001").first()).toBeVisible();
  await expect(frozen.getByText("MAN-BOS-BEE-001", { exact: true })).toBeVisible();
  await expect(family.getByRole("heading", { name: "FAM-BOS-BEE-001", exact: true })).toBeVisible();
  await expect(family.getByText("VAR-BOS-BEE-IGFEED-001", { exact: true })).toBeVisible();
  await expect(learning.getByText("LC-BOS-BEE-IG-001", { exact: true })).toBeVisible();
  await expect(liveTest.getByText("AUTH_REQUIRED", { exact: true })).toBeVisible();
  await expect(page.getByText(/APPROVE AS FIRST CONTROLLED TEST CANDIDATE/)).toBeVisible();
  await expect(frozen.getByText(/Founder gate is OPEN/)).toBeVisible();
  await expect(frozen.getByText(/AST-0020 \/ RD-0014/)).toBeVisible();
  await expect(frozen.getByText(/A bee is not the whole food system/)).toBeVisible();
  await expect(production.getByRole("heading", { name: "What depends on what?", exact: true })).toBeVisible();
  await expect(production.getByText("4PLANET CONTEXT", { exact: true })).toBeVisible();
  await expect(production.getByText(/Bees are not all pollinators\. Apples are not all food/i)).toBeVisible();
  await expect(production.getByRole("list", { name: "Source-scoped relationship chain" })).toBeVisible();
  await expect(liveTest.getByText(/No authentication, account binding, media hosting or external platform request has been performed/)).toBeVisible();

  await production.screenshot({ path: evidencePath("bee-production-desktop.png") });
  await page.setViewportSize({ width: 390, height: 844 });
  await production.screenshot({ path: evidencePath("bee-production-mobile.png") });
  await page.screenshot({ path: evidencePath("bee-founder-board-mobile.png"), fullPage: true });
});

test("Oslofjorden release is founder-review ready and preserves bounded evidence classes", async ({ page }) => {
  await page.goto(`${baseURL}/internal/brand-os`);
  await page.getByRole("button", { name: /Oslofjorden: One Place, Many Systems/ }).click();

  const frozen = page.getByRole("complementary");
  const production = page.getByRole("region", { name: "Selected Brand OS production object" });
  const family = page.getByRole("region", { name: "Exact release family" });

  await expect(page.getByText("STORY-BOS-OSLO-001").first()).toBeVisible();
  await expect(frozen.getByText("MAN-BOS-OSLO-001", { exact: true })).toBeVisible();
  await expect(family.getByRole("heading", { name: "FAM-BOS-OSLO-001", exact: true })).toBeVisible();
  await expect(family.getByText("VAR-BOS-OSLO-IGFEED-001", { exact: true })).toBeVisible();
  await expect(page.getByText(/APPROVE AS THIRD CONTROLLED TEST CANDIDATE/)).toBeVisible();
  await expect(frozen.getByText(/Founder gate is OPEN/)).toBeVisible();
  await expect(frozen.getByText(/AST-0022 \/ RD-0016/)).toBeVisible();
  await expect(frozen.getByText(/To understand Oslofjorden, we have to keep different kinds of evidence different/)).toBeVisible();
  await expect(production.getByRole("heading", { name: "Oslofjorden is not one condition." })).toBeVisible();
  await expect(production.getByText("MODELLED PRESSURE", { exact: true })).toBeVisible();
  await expect(production.getByText("MAPPED MARINE NATURE", { exact: true })).toBeVisible();
  await expect(production.getByText("MONITORING COVERAGE", { exact: true })).toBeVisible();
  await expect(production.getByRole("img", { name: /not a scientific boundary map/i })).toBeVisible();
  await expect(production.getByText(/Co-location is not causality/i)).toBeVisible();

  await production.screenshot({ path: evidencePath("oslo-production-desktop.png") });
  await page.setViewportSize({ width: 390, height: 844 });
  await production.screenshot({ path: evidencePath("oslo-production-mobile.png") });
});
