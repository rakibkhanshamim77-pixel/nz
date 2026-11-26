interface Props {
  total: number;
  active: number;
  inactive: number;
  totalUsed: number;
}

function StatCard({
  label,
  value,
  sub,
  href,
}: {
  label: string;
  value: string | number;
  sub?: string;
  href?: string;
}) {
  const inner = (
    <div className="card p-5 h-full">
      <p className="text-xs font-semibold tracking-[.18em] uppercase text-[var(--mute)] mb-2">
        {label}
      </p>
      <p className="font-display font-extrabold text-3xl leading-none">{value}</p>
      {sub && (
        <p className="text-xs text-[var(--mute)] mt-1.5">{sub}</p>
      )}
    </div>
  );
  if (href) {
    return (
      <a href={href} className="block hover:opacity-80 transition-opacity">
        {inner}
      </a>
    );
  }
  return inner;
}

export default function CouponsStats({
  total,
  active,
  inactive,
  totalUsed,
}: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <StatCard label="Total coupons" value={total} />
      <StatCard
        label="Active"
        value={active}
        sub="Enabled coupons"
        href="/admin/coupons?tab=active"
      />
      <StatCard
        label="Inactive"
        value={inactive}
        sub="Disabled coupons"
        href="/admin/coupons?tab=inactive"
      />
      <StatCard label="Total uses" value={totalUsed} sub="Across all coupons" />
    </div>
  );
}
