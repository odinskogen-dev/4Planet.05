import { test, expect, type Page } from "@playwright/test";

test("4SAPIEN pantry: editable anonymous visit, honest unknowns and explicit authenticated persistence boundary", async ({ page }) => {
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
  await expect(section.getByText(/Anonymous use stays in this browser tab/i)).toBeVisible();
  await expect(section.getByRole("button", { name: "Sign in to remember this" })).toBeVisible();
});

const AUTH_SDK = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.115.0/dist/umd/supabase.min.js";
const OLD_MEMORY = [{
  id: "memory-1",
  created_at: "2026-01-01T00:00:00.000Z",
  value: {
    namespace: "food_pantry_v1",
    pantry: [{ name: "old saved food", amount: 2, unit: "g" }],
    budgetNok: 100,
  },
}];

async function openDelayedRestore(page: Page) {
  await page.route(AUTH_SDK, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: `window.supabase={createClient(){return{auth:{getSession:()=>Promise.resolve({data:{session:{access_token:"tok",refresh_token:"ref",user:{id:"user-race"}}},error:null}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})}}}}`,
    });
  });
  let releaseMemory = () => {};
  const memoryHeld = new Promise<void>((resolve) => {
    releaseMemory = resolve;
  });
  await page.route("**/rest/v1/four_sapien_embla_memories**", async (route) => {
    await memoryHeld;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(OLD_MEMORY),
    });
  });
  await page.route("**/rest/v1/four_sapien_embla_events**", async (route) => {
    await route.fulfill({ status: 201, body: "" });
  });
  await page.goto("/4sapien");
  const section = page.getByRole("region", { name: "What can I make with what I have?" });
  await expect(section.getByText("Checking private 4SAPIEN memory…")).toBeVisible();
  await expect(section.getByRole("button", { name: "Remember this pantry" })).toBeVisible();
  return {
    section,
    async release() {
      const memoryDone = page.waitForResponse((response) => response.url().includes("four_sapien_embla_memories"));
      releaseMemory();
      await memoryDone;
      await page.waitForTimeout(300);
    },
  };
}

test("untouched delayed restore still returns the saved pantry", async ({ page }) => {
  const restore = await openDelayedRestore(page);
  await restore.release();
  await expect(restore.section.getByText("Welcome back. Restored 1 user-confirmed pantry items from your private 4SAPIEN memory.")).toBeVisible();
  await expect(restore.section.getByLabel("Ingredient 1")).toHaveValue("old saved food");
  await expect(restore.section.getByLabel("Quantity 1")).toHaveValue("2");
  await expect(restore.section.getByLabel("Additional shopping budget in NOK")).toHaveValue("100");
});

test("Clear during a delayed pantry restore keeps the newer empty pantry", async ({ page }) => {
  const restore = await openDelayedRestore(page);
  await restore.section.getByRole("button", { name: "Clear" }).click();
  await expect(restore.section.getByText("Automatic restore will not replace this edit.")).toBeVisible();
  await restore.release();
  await expect(restore.section.getByText("Welcome back")).toHaveCount(0);
  await expect(restore.section.getByLabel("Ingredient 1")).toHaveCount(0);
  await expect(restore.section.getByLabel("Additional shopping budget in NOK")).toHaveValue("");
  await expect(restore.section.getByText("Automatic restore will not replace this edit.")).toBeVisible();
});

test("example load during a delayed pantry restore keeps the example pantry", async ({ page }) => {
  const restore = await openDelayedRestore(page);
  await restore.section.getByRole("button", { name: "Load example pantry" }).click();
  await expect(restore.section.getByText("Automatic restore will not replace this edit.")).toBeVisible();
  await expect(restore.section.getByLabel("Ingredient 1")).toHaveValue("Oats");
  await restore.release();
  await expect(restore.section.getByText("Welcome back")).toHaveCount(0);
  await expect(restore.section.getByLabel("Ingredient 1")).toHaveValue("Oats");
  await expect(restore.section.getByLabel("Ingredient 2")).toHaveValue("Milk");
  await expect(restore.section.getByLabel("Additional shopping budget in NOK")).toHaveValue("");
});

test("ingredient add during a delayed pantry restore keeps the new ingredient", async ({ page }) => {
  const restore = await openDelayedRestore(page);
  await restore.section.getByLabel("New ingredient").fill("Pasta");
  await restore.section.getByLabel("New quantity").fill("80");
  await restore.section.getByRole("button", { name: "Add ingredient" }).click();
  await expect(restore.section.getByText("Automatic restore will not replace this edit.")).toBeVisible();
  await expect(restore.section.getByLabel("Ingredient 1")).toHaveValue("Pasta");
  await restore.release();
  await expect(restore.section.getByText("Welcome back")).toHaveCount(0);
  await expect(restore.section.getByLabel("Ingredient 1")).toHaveValue("Pasta");
  await expect(restore.section.getByLabel("Quantity 1")).toHaveValue("80");
  await expect(restore.section.getByLabel("Ingredient 2")).toHaveCount(0);
});

test("budget edit during a delayed pantry restore keeps the newer budget", async ({ page }) => {
  const restore = await openDelayedRestore(page);
  await restore.section.getByLabel("Additional shopping budget in NOK").fill("25");
  await expect(restore.section.getByText("Automatic restore will not replace this edit.")).toBeVisible();
  await restore.release();
  await expect(restore.section.getByText("Welcome back")).toHaveCount(0);
  await expect(restore.section.getByLabel("Ingredient 1")).toHaveCount(0);
  await expect(restore.section.getByLabel("Additional shopping budget in NOK")).toHaveValue("25");
});

test("Clear before the session returns skips identity side effects and the old pantry", async ({ page }) => {
  await page.route(AUTH_SDK, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: `window.supabase={createClient(){let release;const pending=new Promise((resolve)=>{release=resolve});window.__releaseFoodSession=()=>release({data:{session:{access_token:"tok",refresh_token:"ref",user:{id:"user-race"}}},error:null});return{auth:{getSession:()=>pending,onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})}}}}`,
    });
  });
  await page.route("**/rest/v1/four_sapien_embla_memories**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(OLD_MEMORY),
    });
  });
  await page.route("**/rest/v1/four_sapien_embla_events**", async (route) => {
    await route.fulfill({ status: 201, body: "" });
  });

  await page.goto("/4sapien");
  const section = page.getByRole("region", { name: "What can I make with what I have?" });
  await expect(section.getByText("Checking private 4SAPIEN memory…")).toBeVisible();
  await expect(section.getByRole("button", { name: "Sign in to remember this" })).toBeVisible();
  await section.getByRole("button", { name: "Clear" }).click();
  await expect(section.getByText("Automatic restore will not replace this edit.")).toBeVisible();
  const sawMemory = page.waitForRequest((request) => request.url().includes("four_sapien_embla_memories"), { timeout: 1000 })
    .then(() => "requested", () => "quiet");
  await page.evaluate(() => {
    const release = (window as Window & { __releaseFoodSession?: () => void }).__releaseFoodSession;
    if (!release) throw new Error("session release missing");
    release();
  });
  expect(await sawMemory).toBe("quiet");
  await expect(section.getByText("Welcome back")).toHaveCount(0);
  await expect(section.getByLabel("Ingredient 1")).toHaveCount(0);
  await expect(section.getByRole("button", { name: "Sign in to remember this" })).toBeVisible();
  await expect(section.getByText("Automatic restore will not replace this edit.")).toBeVisible();
});
