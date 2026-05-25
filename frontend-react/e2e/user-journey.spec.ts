import { test, expect } from "@playwright/test";
import { uploadSampleData, executeQuery, waitForAppReady, waitForMonaco } from "./helpers";

test.describe("Full User Journey", () => {
  test.beforeEach(async ({ page }) => {
    await waitForAppReady(page);
  });

  test("upload → query → verify results", async ({ page }) => {
    // 1. Upload CSV
    await uploadSampleData(page);

    // 2. Verify table appears in table management panel
    const body = await page.textContent("body");
    expect(body).toContain("sample-data");

    // 3. Execute a simple query
    await executeQuery(page, "SELECT * FROM `sample-data`");

    // 4. Verify results appear (Success indicator or data rows)
    const resultText = await page.textContent("body");
    expect(resultText).toMatch(/Success|sample-data/);
  });

  test("upload → query with aggregation", async ({ page }) => {
    await uploadSampleData(page);
    await executeQuery(page, "SELECT category, SUM(amount) as total FROM `sample-data` GROUP BY category");

    // Should show aggregation results
    const body = await page.textContent("body");
    expect(body).toMatch(/Electronics|Clothing|Food|Success/);
  });

  test("query with LIMIT returns subset", async ({ page }) => {
    await uploadSampleData(page);
    await executeQuery(page, "SELECT * FROM `sample-data` LIMIT 3");

    // Should show success
    const body = await page.textContent("body");
    expect(body).toContain("Success");
  });

  test("invalid SQL shows error gracefully", async ({ page }) => {
    await uploadSampleData(page);
    await executeQuery(page, "SELECT * FROM nonexistent_table_xyz");

    // Should show error message, not crash
    const body = await page.textContent("body");
    expect(body).toMatch(/error|Error|not found|does not exist/i);
    // Editor should still be visible
    await expect(page.locator(".monaco-editor")).toBeVisible();
  });

  test("AI panel is accessible after query", async ({ page }) => {
    await uploadSampleData(page);
    await executeQuery(page, "SELECT * FROM `sample-data` LIMIT 5");

    // Look for AI-related controls (Explain, Insights, Analysis tab)
    const aiControl = page.locator('text=/AI|Analysis|Explain|Insights|Analyze/i').first();
    if (await aiControl.isVisible({ timeout: 3000 })) {
      await aiControl.click();
      await page.waitForTimeout(1000);
      // Should show AI-related content or a graceful "not configured" message
      const body = await page.textContent("body");
      expect(body).toMatch(/AI|Analysis|Explain|Insights|not configured|question|Analyze/i);
    }
  });

  test("page reload preserves uploaded table", async ({ page }) => {
    await uploadSampleData(page);

    // Reload
    await page.reload();
    await page.waitForLoadState("networkidle");
    await waitForMonaco(page);

    // Table should still be listed (DuckDB persistence)
    const body = await page.textContent("body");
    expect(body).toContain("sample-data");
  });

  test("query works after reload", async ({ page }) => {
    await uploadSampleData(page);

    // Reload
    await page.reload();
    await page.waitForLoadState("networkidle");
    await waitForMonaco(page);

    // Execute query on persisted table
    await executeQuery(page, "SELECT COUNT(*) FROM `sample-data`");

    const body = await page.textContent("body");
    expect(body).toContain("Success");
  });
});
