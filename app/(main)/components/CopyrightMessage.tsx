import Link from "next/link";

export default function CopyrightMessage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 border-t border-line flex flex-wrap items-center justify-between gap-3 text-sm text-mute pb-28 lg:pb-6">
      <span>
        <b className="text-ink">Neeshanz</b> © 2026 All rights reserved.
      </span>
      <span className="flex items-center gap-5">
        <Link href="/privacy-policy" className="hover:text-ink">
          Privacy Policy
        </Link>
        <Link href="/terms-and-conditions" className="hover:text-ink">
          Terms &amp; Conditions
        </Link>
        <a
          href="#"
          className="px-3 py-1.5 rounded-full border border-line hover:text-ink"
        >
          ↑ Back to top
        </a>
      </span>
    </div>
  );
}
