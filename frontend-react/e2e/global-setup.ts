import { type FullConfig } from "@playwright/test";

/** Check that the backend is reachable before running tests. */
async function globalSetup(_config: FullConfig) {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

  try {
    const res = await fetch(`${backendUrl}/api/health`);
    if (!res.ok) {
      console.warn(`[global-setup] Backend health check returned ${res.status} — tests may fail`);
    } else {
      console.log("[global-setup] Backend is healthy");
    }
  } catch {
    console.warn(
      `[global-setup] Backend not reachable at ${backendUrl} — tests that require backend will fail`
    );
  }
}

export default globalSetup;
