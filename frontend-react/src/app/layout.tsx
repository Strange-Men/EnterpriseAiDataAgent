import type { Metadata } from "next";
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
      <body className="min-h-screen bg-[#0E1117] text-[#C9D1D9] antialiased">
        {children}
      </body>
    </html>
  );
}
