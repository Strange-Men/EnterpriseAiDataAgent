import { test, expect } from "@playwright/test";

test.describe("Performance", () => {
  test("should load page within 10 seconds", async ({ page }) => {
    const start = Date.now();
    await page.goto("/");
    await page.waitForSelector(".monaco-editor", { timeout: 30000 });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(10000);
  });

  test("should have reasonable DOM size", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector(".monaco-editor", { timeout: 15000 });

    const domSize = await page.evaluate(() => document.querySelectorAll("*").length);
    // Monaco adds many elements, but should be under 3000 on initial load
    expect(domSize).toBeLessThan(3000);
  });

  test("should execute query within 5 seconds", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector(".monaco-editor", { timeout: 15000 });

    await page.locator(".monaco-editor").click();
    await page.keyboard.type("SELECT * FROM generate_series(1, 100)", { delay: 20 });
    await page.waitForTimeout(500);

    const start = Date.now();
    const executeBtn = page.locator('button:has-text("Execute")');
    await executeBtn.click();

    // Wait for result
    await page.waitForSelector("text=rows", { timeout: 10000 });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000);
  });

  test("should not leak memory on tab operations", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector(".monaco-editor", { timeout: 15000 });

    const initialDomSize = await page.evaluate(() => document.querySelectorAll("*").length);

    // Create and remove tabs
    for (let i = 0; i < 5; i++) {
      const newTabBtn = page.locator('button[title="New Tab"]');
      await newTabBtn.click();
      await page.waitForTimeout(300);
    }

    const afterTabsDomSize = await page.evaluate(() => document.querySelectorAll("*").length);

    // DOM should not grow excessively
    expect(afterTabsDomSize - initialDomSize).toBeLessThan(500);
  });
});
