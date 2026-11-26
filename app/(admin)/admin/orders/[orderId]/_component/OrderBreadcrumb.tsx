import Link from "next/link";

interface Props {
  orderNumber: string;
}

export default function OrderBreadcrumb({ orderNumber }: Props) {
  return (
    <nav
      className="flex items-center gap-2 text-sm text-[var(--mute)] mb-4"
      aria-label="Breadcrumb"
    >
      <Link href="/admin/orders" className="hover:text-[var(--ink)] transition-colors">
        Orders
      </Link>
      <span aria-hidden="true">/</span>
      <span className="text-[var(--ink)] font-semibold">{orderNumber}</span>
    </nav>
  );
}
