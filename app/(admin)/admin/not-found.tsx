import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center gap-6">
      {/* 404 display */}
      <div className="relative">
        <p className="font-display font-extrabold text-[7rem] leading-none select-none"
          style={{ color: "var(--line)" }}>
          404
        </p>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl grid place-items-center"
            style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
            <svg className="w-8 h-8" style={{ color: "var(--mute)" }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="max-w-sm">
        <h1 className="font-display font-bold text-xl mb-2">Page not found</h1>
        <p className="text-sm" style={{ color: "var(--mute)" }}>
          The page you&apos;re looking for has been moved, renamed, or never existed.
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          href="/admin"
          className="h-10 px-5 rounded-xl text-sm font-semibold grid place-items-center transition-opacity hover:opacity-80"
          style={{ background: "var(--ink)", color: "var(--bg)" }}>
          Go to Dashboard
        </Link>
        <Link
          href="/admin/orders"
          className="h-10 px-5 rounded-xl text-sm font-semibold border transition-colors hover:bg-[var(--soft)]"
          style={{ borderColor: "var(--line)" }}>
          View Orders
        </Link>
      </div>
    </div>
  );
}
