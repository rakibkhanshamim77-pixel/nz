import Link from "next/link";

export default function ProductNav() {
  return (
    <nav
      className="text-sm text-mute mb-5 sm:mb-7 flex items-center gap-2 flex-wrap"
      aria-label="Breadcrumb"
    >
      <Link href="/" className="hover:text-ink">
        হোম
      </Link>
      <span aria-hidden="true">/</span>
      <Link href="/shop" className="hover:text-ink">
        টি-শার্ট
      </Link>
      <span aria-hidden="true">/</span>
      <span className="text-ink font-medium" aria-current="page">
        Midnight Oversized Tee
      </span>
    </nav>
  );
}
