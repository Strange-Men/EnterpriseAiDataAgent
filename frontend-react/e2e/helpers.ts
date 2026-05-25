import { type Page, expect } from "@playwright/test";
import path from "path";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

/** Upload the sample CSV and wait for the table to appear in the left panel. */
export async function uploadSampleData(page: Page) {
  const fileInput = page.locator('input[type="file"]');
  const csvPath = path.join(FIXTURES_DIR, "sample-data.csv");
  await fileInput.setInputFiles(csvPath);
  // Wait for table name to appear in the body
  await expect(page.locator("body")).toContainText("sample-data", { timeout: 10_000 });
}

/** Wait for Monaco editor to be ready. */
export async function waitForMonaco(page: Page) {
  await page.waitForSelector(".monaco-editor", { timeout: 10_000 });
}

/** Type SQL into the Monaco editor and click Execute. */
export async function executeQuery(page: Page, sql: string) {
  await waitForMonaco(page);
  // Clear existing content
  await page.locator(".monaco-editor").click();
  await page.keyboard.press("Control+a");
  await page.keyboard.press("Delete");
  // Type the query
  await page.locator(".monaco-editor").click();
  await page.keyboard.type(sql, { delay: 5 });
  // Click Execute
  const executeBtn = page.locator('button:has-text("Execute")');
  await executeBtn.click();
  // Wait for result to appear (success or error)
  await page.waitForTimeout(3000);
}

/** Wait for the page to finish loading. */
export async function waitForAppReady(page: Page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await waitForMonaco(page);
}
