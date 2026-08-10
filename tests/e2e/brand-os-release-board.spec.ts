import { expect, test } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "http://127.0.0.1:4173";

test("Brand OS release board preserves gates and only dry-runs publication", async ({ page }) => {
  await page.goto(`${baseURL}/internal/brand-os`);

  await expect(page.getByRole("heading", { name: "Founder Release Board" })).toBeVisible();
  await expect(page.getByText("EXTERNAL PUBLISHING DISABLED")).toBeVisible();
  await expect(page.getByText("STORY-BOS-ORCA-001").first()).toBeVisible();
  await expect(page.getByText("Public eligible")).toBeVisible();
  await expect(page.getByText("NO", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "One record. A wider living system." })).toBeVisible();
  await expect(page.getByText("5939349319", { exact: false }).first()).toBeVisible();
  await expect(page.getByText(/does not establish range, abundance, population trend/i).first()).toBeVisible();

  await page.getByRole("button", { name: "APPROVE" }).click();
  await expect(page.getByText("APPROVED", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("NO", { exact: true })).toBeVisible();
  await expect(page.getByText(/Rights gate is OPEN/)).toBeVisible();

  await page.getByRole("button", { name: "SIMULATE PUBLISH / DRY RUN" }).click();
  await expect(page.getByText("DRY_RUN_CREATED")).toBeVisible();

  await page.getByRole("button", { name: "SIMULATE PUBLISH / DRY RUN" }).click();
  await expect(page.getByText("DUPLICATE_SUPPRESSED")).toBeVisible();

  const urls = await page.locator("a").evaluateAll((anchors) => anchors.map((anchor) => (anchor as HTMLAnchorElement).href));
  expect(urls.every((url) => !url.includes("instagram.com") && !url.includes("linkedin.com") && !url.includes("youtube.com"))).toBe(true);
});

test("Bee production object preserves source scope, context state and accessibility", async ({ page }) => {
  await page.goto(`${baseURL}/internal/brand-os`);
  await page.getByRole("button", { name: /What Depends on What\? Bee/ }).click();

  await expect(page.getByText("STORY-BOS-BEE-001").first()).toBeVisible();
  await expect(page.getByText(/Rights gate is BLOCKED/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "What depends on what?" })).toBeVisible();
  await expect(page.getByText("4PLANET CONTEXT", { exact: true })).toBeVisible();
  await expect(page.getByText(/Bees are not all pollinators\. Apples are not all food/i)).toBeVisible();
  await expect(page.getByRole("list", { name: "Source-scoped relationship chain" })).toBeVisible();
});

test("Oslofjorden production object exposes three bounded layer classes and causal limits", async ({ page }) => {
  await page.goto(`${baseURL}/internal/brand-os`);
  await page.getByRole("button", { name: /Oslofjorden: One Place, Many Systems/ }).click();

  await expect(page.getByText("STORY-BOS-OSLO-001").first()).toBeVisible();
  await expect(page.getByText(/Rights gate is BLOCKED/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Oslofjorden is not one condition." })).toBeVisible();
  await expect(page.getByText("MODELLED PRESSURE", { exact: true })).toBeVisible();
  await expect(page.getByText("MAPPED MARINE NATURE", { exact: true })).toBeVisible();
  await expect(page.getByText("MONITORING COVERAGE", { exact: true })).toBeVisible();
  await expect(page.getByRole("img", { name: /not a scientific boundary map/i })).toBeVisible();
  await expect(page.getByText(/Co-location is not causality/i)).toBeVisible();
});
