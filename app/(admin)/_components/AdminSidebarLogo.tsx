import Link from "next/link";

export default function AdminSidebarLogo() {
  return (
    <div className="h-[72px] px-5 flex items-center justify-between border-b border-line shrink-0">
      <Link
        href="/admin"
        className="flex items-center gap-3 !h-auto !p-0 hover:!bg-transparent"
      >
        <span className="w-10 h-10 rounded-2xl bg-ink text-bg grid place-items-center font-display font-extrabold">
          NZ
        </span>
        <span className="leading-none">
          <b className="font-display text-base tracking-tight block text-ink">
            NEESHANZ
          </b>
          <span className="text-[10px] tracking-[.24em] text-mute">
            ADMIN PANEL
          </span>
        </span>
      </Link>
      <button
        id="closeMenu"
        type="button"
        className="lg:hidden w-9 h-9 rounded-full border border-line grid place-items-center"
        aria-label="Close menu"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          viewBox="0 0 24 24"
        >
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </div>
  );
}
