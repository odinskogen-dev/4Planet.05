import { test, expect } from "@playwright/test";

const masters = [
  { path: "/labs/gold/discovery/orca", heading: "Orca", markers: ["WORLD CLASS GOLD / CONTROLLED TEST", "Observation is not location."] },
  { path: "/labs/gold/discovery/great-barrier-reef", heading: "Life at reef scale.", markers: ["WORLD CLASS GOLD / CONTROLLED TEST", "A reef system is not one number."] },
  { path: "/labs/gold/discovery/global-fires", heading: "Fire, seen from space.", markers: ["WORLD CLASS GOLD / CONTROLLED TEST", "Detected heat is not automatically a wildfire."] },
] as const;

for (const master of masters) {
  test(`${master.path} renders as human-first noindex Master Gold`, async ({ page }, testInfo) => {
    const fatal: string[] = [];
    page.on("pageerror", (error) => fatal.push(`pageerror:${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error" && !message.text().includes("Failed to load resource")) fatal.push(`console:${message.text()}`);
    });

    const response = await page.goto(master.path, { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1").first()).toContainText(master.heading);
    await expect(page.locator("meta[name='robots']")).toHaveAttribute("content", /noindex/);
    for (const marker of master.markers) await expect(page.getByText(marker, { exact: false }).first()).toBeVisible();

    const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
    expect(horizontalOverflow, "Master Gold must not horizontally overflow the viewport").toBe(false);

    const body = await page.locator("body").innerText();
    expect(body).not.toContain("undefined");
    expect(body).not.toMatch(/\bNaN\b/);

    await page.screenshot({
      path: `artifacts/product-proof/discovery-master-${master.path.split("/").pop()}-${testInfo.project.name}.png`,
      fullPage: true,
    });
    expect(fatal, fatal.join("\n")).toEqual([]);
  });
}
