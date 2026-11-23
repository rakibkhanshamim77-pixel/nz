import Link from "next/link";

interface Props {
  crumb: string;
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
}

export default function ProductFormHeader({ crumb, title, subtitle, badge, action }: Props) {
  return (
    <>
      <nav className="text-sm text-[var(--mute)] mb-2 flex items-center gap-2" aria-label="Breadcrumb">
        <Link href="/admin" className="hover:text-[var(--ink)]">Dashboard</Link>
        <span aria-hidden="true">/</span>
        <Link href="/admin/products" className="hover:text-[var(--ink)]">Products</Link>
        <span aria-hidden="true">/</span>
        <span className="text-[var(--ink)] font-medium">{crumb}</span>
      </nav>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="font-display font-extrabold text-[1.9rem] sm:text-4xl tracking-tight leading-tight flex flex-wrap items-center gap-3">
            <span className="truncate">{title}</span>
            {badge}
          </h1>
          <p className="text-sm text-[var(--mute)] mt-1">{subtitle}</p>
        </div>
        {action}
      </div>
    </>
  );
}
