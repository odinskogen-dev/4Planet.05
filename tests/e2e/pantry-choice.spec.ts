import { test, expect } from "@playwright/test";

test("4SAPIEN pantry fixture: editable first visit, honest unknowns and explicit no-persistence boundary", async ({ page }) => {
  await page.goto("/4sapien");
  const section = page.getByRole("region", { name: "What can I make with what I have?" });
  await expect(section).toBeVisible();
  await expect(section.getByText("Add ingredients or load the example to compare three test recipes.")).toBeVisible();
  await section.getByRole("button", { name: "Load example pantry" }).click();
  await expect(section.getByText("Porridge — example")).toBeVisible();
  await expect(section.getByText("Tomato pasta — example")).toBeVisible();
  await expect(section.getByText("Chickpea tomato bowl — example")).toBeVisible();
  const pasta = section.getByRole("article").filter({ hasText: "Tomato pasta — example" });
  await expect(pasta.getByText(/Missing: Pasta 30 g/)).toBeVisible();
  await expect(pasta.getByText(/Additional purchase: UNKNOWN/)).toBeVisible();
  await section.getByRole("spinbutton", { name: "Additional shopping budget in NOK" }).fill("50");
  await expect(pasta.getByText(/UNKNOWN COST/)).toBeVisible();
  await section.getByRole("spinbutton", { name: "Quantity 3" }).fill("100");
  await expect(pasta.getByText("No additional ingredients indicated by reported amounts.")).toBeVisible();
  await expect(pasta.getByText(/Additional purchase: 0 NOK/)).toBeVisible();
  await page.reload();
  await expect(section.getByText("Add ingredients or load the example to compare three test recipes.")).toBeVisible();
  await expect(section.getByText(/account persistence and second-visit learning are NOT implemented here/)).toBeVisible();
});
