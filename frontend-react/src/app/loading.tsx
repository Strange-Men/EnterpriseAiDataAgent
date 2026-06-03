export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center">
      <div className="h-6 w-6 rounded-full border-2 border-[var(--border-default)] border-t-[var(--accent)] animate-spin" />
    </div>
  );
}
