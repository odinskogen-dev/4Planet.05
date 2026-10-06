import { test, expect } from "@playwright/test";

const topics=["/now","/wildfires","/earthquakes","/biodiversity","/orca","/oslofjord"];

for (const path of topics) {
  test(`discovery ${path} desktop`, async ({ page }) => {
    await page.goto(path,{waitUntil:"domcontentloaded"});
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator('iframe[src^="https://4planetatlas.com/"]').first()).toBeVisible();
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
  });
}

test("Earth Now mobile is readable and routes to permanent topics", async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto("/now",{waitUntil:"domcontentloaded"});
  await expect(page.getByRole("heading",{name:/what is happening on earth right now/i})).toBeVisible();
  await expect(page.getByRole("link",{name:/wildfires/i}).first()).toBeVisible();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);
});

test("Wildfires exposes sources and truth boundary", async ({ page }) => {
  await page.goto("/wildfires",{waitUntil:"domcontentloaded"});
  await expect(page.getByText("What the sources establish",{exact:true})).toBeVisible();
  await expect(page.getByText("What they do not establish",{exact:true})).toBeVisible();
  await expect(page.getByText("NASA FIRMS",{exact:true})).toBeVisible();
});
