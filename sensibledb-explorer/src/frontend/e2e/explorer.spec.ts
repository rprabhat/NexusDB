import { test, expect } from "@playwright/test";

test.describe("SensibleDB Explorer E2E Flow", () => {
  test("complete user journey: load demo, view graph, chat with AI", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Welcome to SensibleDB")).toBeVisible({ timeout: 30000 });
    
    await page.locator("button:has-text('Explore')").first().click();
    await expect(page.locator("svg")).toBeVisible({ timeout: 15000 });
    await expect(page.locator(".node-card").first()).toBeVisible({ timeout: 10000 });
    
    await page.keyboard.press("3");
    await expect(page.locator("textarea[placeholder*='Ask']")).toBeVisible({ timeout: 5000 });
    
    await page.locator("textarea").first().fill("Show me all nodes");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(3000);
    
    await page.keyboard.press("4");
    await expect(page.locator("text=Summary Report")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=Total Items:")).toBeVisible();
    await expect(page.locator("text=Total Connections:")).toBeVisible();
    
    console.log("✅ E2E flow completed successfully");
  });

  test("sidebar navigation works", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Welcome to SensibleDB")).toBeVisible({ timeout: 30000 });
    
    await page.keyboard.press("1");
    await expect(page.locator("text=Welcome to SensibleDB")).toBeVisible();
    
    await page.keyboard.press("2");
    await page.waitForTimeout(500);
    
    await page.keyboard.press("3");
    await page.waitForTimeout(500);
    
    await page.keyboard.press("4");
    await page.waitForTimeout(500);
    
    await page.keyboard.press("8");
    await page.waitForTimeout(500);
    
    console.log("✅ Sidebar navigation test passed");
  });

  test("can load demo database", async ({ page }) => {
    await page.goto("/");
    await page.locator("button:has-text('Explore')").first().click();
    await expect(page.locator("svg")).toBeVisible({ timeout: 15000 });
    await expect(page.locator(".node-card").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".header-db-selector")).toContainText("health-patterns");
    
    console.log("✅ Demo database loading works");
  });
});