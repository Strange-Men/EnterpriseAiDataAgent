import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center p-6">
      <div className="text-center space-y-3">
        <p className="text-xs uppercase tracking-wider text-[var(--accent)]">404</p>
        <h1 className="text-xl font-semibold">Page not found</h1>
        <Link
          href="/"
          className="inline-flex px-3 py-1.5 text-xs rounded-md bg-[var(--accent)] text-[var(--bg-primary)]"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}
