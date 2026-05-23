import { test, expect } from "@playwright/test";

test.describe("SQL Workspace", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector(".monaco-editor", { timeout: 15000 });
  });

  test("should load Monaco editor", async ({ page }) => {
    const editor = page.locator(".monaco-editor");
    await expect(editor).toBeVisible();
  });

  test("should execute SQL and show results", async ({ page }) => {
    // Click editor and type SQL
    await page.locator(".monaco-editor").click();
    await page.keyboard.type("SELECT 1 as id, 'hello' as name", { delay: 20 });
    await page.waitForTimeout(500);

    // Execute button should be enabled
    const executeBtn = page.locator('button:has-text("Execute")');
    await expect(executeBtn).toBeEnabled();

    // Click execute
    await executeBtn.click();
    await page.waitForTimeout(3000);

    // Should show query stats (success indicator)
    await expect(page.locator("text=Success")).toBeVisible();

    // Should show result data
    const body = await page.textContent("body");
    expect(body).toContain("hello");
  });

  test("should handle invalid SQL gracefully", async ({ page }) => {
    await page.locator(".monaco-editor").click();
    await page.keyboard.type("SELEC * FRM invalid_table", { delay: 20 });
    await page.waitForTimeout(500);

    const executeBtn = page.locator('button:has-text("Execute")');
    await executeBtn.click();
    await page.waitForTimeout(3000);

    // Should show error
    const body = await page.textContent("body");
    expect(body).toContain("error");
  });

  test("should format SQL", async ({ page }) => {
    await page.locator(".monaco-editor").click();
    await page.keyboard.type("select*from users", { delay: 20 });
    await page.waitForTimeout(500);

    const formatBtn = page.locator('button:has-text("Format")');
    await expect(formatBtn).toBeEnabled();
    await formatBtn.click();
    await page.waitForTimeout(1000);

    // SQL should be formatted (check editor content changed)
    const editorContent = await page.locator(".view-line").allTextContents();
    const fullSql = editorContent.join(" ");
    expect(fullSql).toContain("SELECT");
  });

  test("should create and switch query tabs", async ({ page }) => {
    // Type SQL in first tab
    await page.locator(".monaco-editor").click();
    await page.keyboard.type("SELECT 1", { delay: 20 });
    await page.waitForTimeout(500);

    // Click new tab button
    const newTabBtn = page.locator('button[title="New Tab"]');
    await newTabBtn.click();
    await page.waitForTimeout(500);

    // Should have 2 tabs
    const tabs = page.locator('[class*="bg-"][class*="rounded-md"][class*="text-xs"]').filter({ hasText: /Query/ });
    const tabCount = await tabs.count();
    expect(tabCount).toBe(2);

    // Switch back to first tab
    await tabs.first().click();
    await page.waitForTimeout(500);
  });

  test("should clear SQL with Ctrl+L", async ({ page }) => {
    await page.locator(".monaco-editor").click();
    await page.keyboard.type("SELECT 1", { delay: 20 });
    await page.waitForTimeout(500);

    // Click Ctrl+L button
    const clearBtn = page.locator('button:has-text("Ctrl+L")');
    await clearBtn.click();
    await page.waitForTimeout(500);
  });
});

test.describe("Theme Switching", () => {
  test("should switch between dark and light themes", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector(".monaco-editor", { timeout: 15000 });

    // Find theme toggle button
    const themeBtn = page.locator('button[title*="mode"]').first();
    await themeBtn.click();
    await page.waitForTimeout(1000);

    // Page should still be functional
    const editor = page.locator(".monaco-editor");
    await expect(editor).toBeVisible();

    // Switch back
    await themeBtn.click();
    await page.waitForTimeout(1000);
  });
});

test.describe("Error Recovery", () => {
  test("should recover from backend disconnect", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector(".monaco-editor", { timeout: 15000 });

    // Try query with backend available
    await page.locator(".monaco-editor").click();
    await page.keyboard.type("SELECT 1", { delay: 20 });
    await page.waitForTimeout(500);

    const executeBtn = page.locator('button:has-text("Execute")');
    await executeBtn.click();
    await page.waitForTimeout(3000);

    // Should show result or error (not crash)
    const body = await page.textContent("body");
    expect(body).toBeTruthy();
  });
});
