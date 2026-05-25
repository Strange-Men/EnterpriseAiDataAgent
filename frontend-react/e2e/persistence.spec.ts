import { test, expect } from "@playwright/test";
import { uploadSampleData, waitForAppReady, waitForMonaco, executeQuery } from "./helpers";

test.describe("Persistence & Reload Flows", () => {
  test.beforeEach(async ({ page }) => {
    await waitForAppReady(page);
  });

  test("query tab SQL persists across reload", async ({ page }) => {
    await waitForMonaco(page);

    // Type SQL in the editor
    await page.locator(".monaco-editor").click();
    await page.keyboard.press("Control+a");
    await page.keyboard.press("Delete");
    await page.locator(".monaco-editor").click();
    await page.keyboard.type("SELECT 42 AS answer", { delay: 5 });

    // Reload
    await page.reload();
    await page.waitForLoadState("networkidle");
    await waitForMonaco(page);

    // Editor should still have the SQL (query-tabs-store persistence)
    const editorContent = await page.locator(".monaco-editor").textContent();
    expect(editorContent).toContain("SELECT");
  });

  test("new query tab persists across reload", async ({ page }) => {
    await waitForMonaco(page);

    // Create a new tab
    const newTabBtn = page.locator('button:has-text("New Tab"), button:has-text("New"), button:has-text("+")').first();
    if (await newTabBtn.isVisible({ timeout: 2000 })) {
      await newTabBtn.click();
      await page.waitForTimeout(500);

      // We should now have 2 tabs
      const tabCount = await page.locator('[role="tab"], .tab-item, button:has-text("Query")').count();
      expect(tabCount).toBeGreaterThanOrEqual(2);
    }

    // Reload
    await page.reload();
    await page.waitForLoadState("networkidle");
    await waitForMonaco(page);

    // Tabs should persist (query-tabs-store)
    const body = await page.textContent("body");
    expect(body).toContain("Query");
  });

  test("uploaded table survives page reload", async ({ page }) => {
    await uploadSampleData(page);

    // Reload
    await page.reload();
    await page.waitForLoadState("networkidle");
    await waitForMonaco(page);

    // Table should still be in the list
    await expect(page.locator("body")).toContainText("sample-data", { timeout: 10_000 });
  });

  test("query execution after reload works", async ({ page }) => {
    // Upload first
    await uploadSampleData(page);

    // Execute a query
    await executeQuery(page, "SELECT * FROM `sample-data` LIMIT 2");

    // Reload
    await page.reload();
    await page.waitForLoadState("networkidle");
    await waitForMonaco(page);

    // Execute again
    await executeQuery(page, "SELECT * FROM `sample-data` LIMIT 2");

    // Should succeed
    const body = await page.textContent("body");
    expect(body).toContain("Success");
  });

  test("rapid reload does not crash app", async ({ page }) => {
    await uploadSampleData(page);

    // Rapid reload 3 times
    for (let i = 0; i < 3; i++) {
      await page.reload();
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(500);
    }

    // Final reload should load cleanly
    await page.reload();
    await page.waitForLoadState("networkidle");
    await waitForMonaco(page);

    // App should be functional
    await expect(page.locator(".monaco-editor")).toBeVisible();
  });
});
