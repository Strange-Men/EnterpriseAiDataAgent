import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // API proxy to Python backend (future FastAPI)
  // Note: Next.js rewrite proxy has ~30s timeout for initial response.
  // Long-running AI endpoints use streaming (SSE) which bypasses this limit.
  // Client-side apiFetch() has 60s AbortSignal.timeout for non-streaming calls.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
