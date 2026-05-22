import type { Metadata } from "next";
import "@/i18n";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Enterprise AI Data Agent",
  description: "Multi-Agent Data Analysis Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-secondary)] antialiased">
        {children}
      </body>
    </html>
  );
}
