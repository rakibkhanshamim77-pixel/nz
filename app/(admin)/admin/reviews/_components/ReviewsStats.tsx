import Link from "next/link";

interface Props {
  total: number;
  pending: number;
  published: number;
  featured: number;
  avgRating: number;
}

function StatCard({
  label,
  value,
  sub,
  icon,
  href,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  href?: string;
}) {
  const inner = (
    <>
      <div className="w-11 h-11 rounded-2xl bg-[var(--soft)] flex items-center justify-center shrink-0 text-[var(--mute)]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-[var(--mute)] font-semibold uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="font-display font-extrabold text-2xl leading-tight">
          {value}
        </p>
        {sub && <p className="text-xs text-[var(--mute)] mt-0.5">{sub}</p>}
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="card p-4 sm:p-5 flex items-start gap-4 hover:border-[var(--ink)] transition-colors"
      >
        {inner}
      </Link>
    );
  }
  return <div className="card p-4 sm:p-5 flex items-start gap-4">{inner}</div>;
}

export default function ReviewsStats({ total, pending, published, featured, avgRating }: Props) {
  const ratingDisplay = avgRating > 0 ? avgRating.toFixed(1) : "—";

  return (
    <section
      className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-5"
      aria-label="Reviews summary"
    >
      <StatCard
        label="Total reviews"
        value={total}
        sub="All time"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path d="m12 3 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.4l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z" />
          </svg>
        }
      />
      <StatCard
        label="Pending approval"
        value={pending}
        sub={pending > 0 ? "Needs review →" : "All clear"}
        href={pending > 0 ? "/admin/reviews?tab=pending" : undefined}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <circle cx={12} cy={12} r={9} />
            <path d="M12 7v5l3 3" />
          </svg>
        }
      />
      <StatCard
        label="Published"
        value={published}
        sub="Live on site"
        href={published > 0 ? "/admin/reviews?tab=published" : undefined}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
            <path d="m8 12 3 3 5-5" />
          </svg>
        }
      />
      <StatCard
        label="Featured"
        value={featured}
        sub="Pinned on home"
        href={featured > 0 ? "/admin/reviews?tab=featured" : undefined}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" />
          </svg>
        }
      />
      <StatCard
        label="Avg rating"
        value={ratingDisplay}
        sub={total > 0 ? `out of 5 · ${total} reviews` : "No reviews yet"}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" />
          </svg>
        }
      />
    </section>
  );
}
