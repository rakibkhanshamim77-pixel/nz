import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Props {
  items: BreadcrumbItem[];
}

export default function AdminBreadcrumb({ items }: Props) {
  if (!items.length) return null;

  return (
    <nav
      className="text-sm text-[var(--mute)] mb-2 flex items-center gap-2 flex-wrap"
      aria-label="Breadcrumb"
    >
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span aria-hidden="true">/</span>}
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-[var(--ink)] transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[var(--ink)] font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
