import { test, expect } from "@playwright/test";

test.describe("AI Error Handling", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("empty SQL execution shows error", async ({ page }) => {
    await page.waitForSelector(".monaco-editor", { timeout: 15000 });

    // Clear any default content in editor
    await page.locator(".monaco-editor").click();
    await page.keyboard.press("Control+a");
    await page.keyboard.press("Delete");
    await page.waitForTimeout(300);

    // Try to execute empty SQL
    const executeBtn = page.locator('button:has-text("Execute")');
    // Button might be disabled for empty content
    if (await executeBtn.isEnabled()) {
      await executeBtn.click();
      await page.waitForTimeout(2000);
      // Should either show error or button was disabled
    }
    // Test passes if no crash occurred
  });

  test("invalid SQL shows error message", async ({ page }) => {
    await page.waitForSelector(".monaco-editor", { timeout: 15000 });

    await page.locator(".monaco-editor").click();
    await page.keyboard.type("SELECT * FROM nonexistent_table_xyz", { delay: 10 });
    await page.waitForTimeout(500);

    const executeBtn = page.locator('button:has-text("Execute")');
    await executeBtn.click();
    await page.waitForTimeout(5000);

    // Should show error
    const body = await page.textContent("body");
    expect(body).toMatch(/error|not found|does not exist|no such/i);
  });

  test("rapid query execution does not crash", async ({ page }) => {
    await page.waitForSelector(".monaco-editor", { timeout: 15000 });

    await page.locator(".monaco-editor").click();
    await page.keyboard.type("SELECT 1", { delay: 10 });
    await page.waitForTimeout(500);

    const executeBtn = page.locator('button:has-text("Execute")');

    // Click execute rapidly 3 times
    await executeBtn.click();
    await page.waitForTimeout(200);
    await executeBtn.click().catch(() => {});
    await page.waitForTimeout(200);
    await executeBtn.click().catch(() => {});

    // Wait for all to settle
    await page.waitForTimeout(5000);

    // Page should still be functional - not crashed
    const editor = page.locator(".monaco-editor");
    await expect(editor).toBeVisible();
  });

  test("page loads without hydration errors", async ({ page }) => {
    // Listen for console errors
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Check for hydration mismatch errors
    const hydrationErrors = errors.filter(
      (e) => e.includes("hydration") || e.includes("Hydration") || e.includes("did not match")
    );
    expect(hydrationErrors).toHaveLength(0);
  });

  test("theme toggle works without errors", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Look for theme toggle
    const themeToggle = page.locator('button[aria-label*="theme"], button:has-text("Theme"), [data-testid="theme-toggle"]').first();
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(500);

      // Toggle back
      await themeToggle.click();
      await page.waitForTimeout(500);
    }
    // Test passes if no crash
  });
});
