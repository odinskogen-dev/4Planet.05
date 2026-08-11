import { expect, test } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "http://127.0.0.1:4173";

test("Brand OS release board freezes Orca copy and remains founder-gated", async ({ page }, testInfo) => {
  await page.goto(`${baseURL}/internal/brand-os`);

  await expect(page.getByRole("heading", { name: "Founder Release Board" })).toBeVisible();
  await expect(page.getByText("EXTERNAL PUBLISHING DISABLED")).toBeVisible();
  await expect(page.getByText("STORY-BOS-ORCA-001").first()).toBeVisible();
  await expect(page.getByText("MAN-BOS-ORCA-001", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "FAM-BOS-ORCA-001", exact: true })).toBeVisible();
  await expect(page.getByText("VAR-BOS-ORCA-IGFEED-001", { exact: true })).toBeVisible();
  await expect(page.getByText("Non-founder ready")).toBeVisible();
  await expect(page.getByText("YES", { exact: true })).toBeVisible();
  await expect(page.getByText(/Founder gate is OPEN/)).toBeVisible();
  await expect(page.getByText(/AST-0025 \/ RD-0019/)).toBeVisible();
  await expect(page.getByText(/One Orca record can tell us something real/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "One record. A wider living system." })).toBeVisible();
  await expect(page.getByText("5939349319", { exact: false }).first()).toBeVisible();
  await expect(page.getByText(/does not establish range, abundance, population trend/i).first()).toBeVisible();
  await expect(page.getByText(/APPROVE AS SECOND CONTROLLED TEST CANDIDATE/)).toBeVisible();

  await page.locator('section[aria-label="Selected Brand OS production object"]').screenshot({
    path: testInfo.outputPath("orca-production-desktop.png"),
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('section[aria-label="Selected Brand OS production object"]').screenshot({
    path: testInfo.outputPath("orca-production-mobile.png"),
  });

  await page.getByRole("button", { name: "APPROVE" }).click();
  await expect(page.getByText("APPROVED", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/Founder gate is OPEN/)).toBeVisible();

  await page.getByRole("button", { name: "SIMULATE PUBLISH / DRY RUN" }).click();
  await expect(page.getByText("DRY_RUN_CREATED")).toBeVisible();

  await page.getByRole("button", { name: "SIMULATE PUBLISH / DRY RUN" }).click();
  await expect(page.getByText("DUPLICATE_SUPPRESSED")).toBeVisible();

  const urls = await page.locator("a").evaluateAll((anchors) => anchors.map((anchor) => (anchor as HTMLAnchorElement).href));
  expect(urls.every((url) => !url.includes("instagram.com") && !url.includes("linkedin.com") && !url.includes("youtube.com"))).toBe(true);
});

test("Bee production object is founder-review ready with exact first-test family and learning contract", async ({ page }, testInfo) => {
  await page.goto(`${baseURL}/internal/brand-os`);
  await page.getByRole("button", { name: /What Depends on What\? Bee/ }).click();

  await expect(page.getByText("STORY-BOS-BEE-001").first()).toBeVisible();
  await expect(page.getByText("MAN-BOS-BEE-001", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "FAM-BOS-BEE-001", exact: true })).toBeVisible();
  await expect(page.getByText("VAR-BOS-BEE-IGFEED-001", { exact: true })).toBeVisible();
  await expect(page.getByText("LC-BOS-BEE-IG-001", { exact: true })).toBeVisible();
  await expect(page.getByText("AUTH_REQUIRED", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/APPROVE AS FIRST CONTROLLED TEST CANDIDATE/)).toBeVisible();
  await expect(page.getByText(/Founder gate is OPEN/)).toBeVisible();
  await expect(page.getByText(/AST-0020 \/ RD-0014/)).toBeVisible();
  await expect(page.getByText(/A bee is not the whole food system/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "What depends on what?", exact: true })).toBeVisible();
  await expect(page.getByText("4PLANET CONTEXT", { exact: true })).toBeVisible();
  await expect(page.getByText(/Bees are not all pollinators\. Apples are not all food/i)).toBeVisible();
  await expect(page.getByRole("list", { name: "Source-scoped relationship chain" })).toBeVisible();
  await expect(page.getByText(/No authentication, account binding, media hosting or external platform request has been performed/)).toBeVisible();

  await page.locator('section[aria-label="Selected Brand OS production object"]').screenshot({
    path: testInfo.outputPath("bee-production-desktop.png"),
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('section[aria-label="Selected Brand OS production object"]').screenshot({
    path: testInfo.outputPath("bee-production-mobile.png"),
  });
  await page.screenshot({ path: testInfo.outputPath("bee-founder-board-mobile.png"), fullPage: true });
});

test("Oslofjorden release is founder-review ready and preserves bounded evidence classes", async ({ page }, testInfo) => {
  await page.goto(`${baseURL}/internal/brand-os`);
  await page.getByRole("button", { name: /Oslofjorden: One Place, Many Systems/ }).click();

  await expect(page.getByText("STORY-BOS-OSLO-001").first()).toBeVisible();
  await expect(page.getByText("MAN-BOS-OSLO-001", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "FAM-BOS-OSLO-001", exact: true })).toBeVisible();
  await expect(page.getByText("VAR-BOS-OSLO-IGFEED-001", { exact: true })).toBeVisible();
  await expect(page.getByText(/APPROVE AS THIRD CONTROLLED TEST CANDIDATE/)).toBeVisible();
  await expect(page.getByText(/Founder gate is OPEN/)).toBeVisible();
  await expect(page.getByText(/AST-0022 \/ RD-0016/)).toBeVisible();
  await expect(page.getByText(/To understand Oslofjorden, we have to keep different kinds of evidence different/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Oslofjorden is not one condition." })).toBeVisible();
  await expect(page.getByText("MODELLED PRESSURE", { exact: true })).toBeVisible();
  await expect(page.getByText("MAPPED MARINE NATURE", { exact: true })).toBeVisible();
  await expect(page.getByText("MONITORING COVERAGE", { exact: true })).toBeVisible();
  await expect(page.getByRole("img", { name: /not a scientific boundary map/i })).toBeVisible();
  await expect(page.getByText(/Co-location is not causality/i)).toBeVisible();

  await page.locator('section[aria-label="Selected Brand OS production object"]').screenshot({
    path: testInfo.outputPath("oslo-production-desktop.png"),
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('section[aria-label="Selected Brand OS production object"]').screenshot({
    path: testInfo.outputPath("oslo-production-mobile.png"),
  });
});
