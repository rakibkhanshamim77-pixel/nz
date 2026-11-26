import Link from "next/link";

export default function TermsBreadcrumb() {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-mute mb-6">
      <Link href="/" className="hover:text-ink transition-colors">হোম</Link>
      <svg className="w-3.5 h-3.5 text-line" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
        <path d="m9 18 6-6-6-6" />
      </svg>
      <span className="text-ink font-medium">শর্তাবলি</span>
    </nav>
  );
}
