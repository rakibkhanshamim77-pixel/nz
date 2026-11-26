export default function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      {/* Spinner */}
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-[var(--line)]" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--ink)] animate-spin" />
      </div>
      <p className="text-sm font-medium" style={{ color: "var(--mute)" }}>Loading…</p>
    </div>
  );
}
