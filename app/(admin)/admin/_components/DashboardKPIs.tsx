interface KPI {
  title: string;
  value: string;
  change: number;
  range: number;
  icon: React.ReactNode;
}

function KpiCard({ title, value, change, range, icon }: KPI) {
  const up = change >= 0;
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs sm:text-sm text-[var(--mute)] font-medium">
          {title}
        </span>
        <span className="w-9 h-9 rounded-xl bg-[var(--soft)] grid place-items-center text-[var(--mute)]">
          {icon}
        </span>
      </div>
      <b className="font-display font-extrabold text-2xl sm:text-[2rem] tracking-tight leading-none block">
        {value}
      </b>
      <p className="text-xs mt-2.5">
        <span className="font-bold">
          {up ? "↑" : "↓"} {Math.abs(change).toFixed(1)}%
        </span>{" "}
        <span className="text-[var(--mute)]">vs previous {range} days</span>
      </p>
    </div>
  );
}

interface Props {
  revenue: number;
  prevRevenue: number;
  orderCount: number;
  prevOrderCount: number;
  avgOrderValue: number;
  prevAvgOrderValue: number;
  newCustomers: number;
  prevNewCustomers: number;
  range: number;
}

function pct(cur: number, prev: number) {
  if (!prev) return 0;
  return ((cur - prev) / prev) * 100;
}

function fmt(n: number) {
  return "৳" + Math.round(n).toLocaleString("en-US");
}

export default function DashboardKPIs({
  revenue,
  prevRevenue,
  orderCount,
  prevOrderCount,
  avgOrderValue,
  prevAvgOrderValue,
  newCustomers,
  prevNewCustomers,
  range,
}: Props) {
  const kpis: KPI[] = [
    {
      title: "Total sales",
      value: fmt(revenue),
      change: pct(revenue, prevRevenue),
      range,
      icon: (
        <svg
          className="w-[18px] h-[18px]"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          viewBox="0 0 24 24"
        >
          <path d="M4 19V5M4 19h16M8 15l3-4 3 2 5-6" />
        </svg>
      ),
    },
    {
      title: "Orders",
      value: orderCount.toLocaleString("en-US"),
      change: pct(orderCount, prevOrderCount),
      range,
      icon: (
        <svg
          className="w-[18px] h-[18px]"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          viewBox="0 0 24 24"
        >
          <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" />
          <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
        </svg>
      ),
    },
    {
      title: "Avg. order value",
      value: fmt(avgOrderValue),
      change: pct(avgOrderValue, prevAvgOrderValue),
      range,
      icon: (
        <svg
          className="w-[18px] h-[18px]"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          viewBox="0 0 24 24"
        >
          <rect x={3} y={6} width={18} height={12} rx={2} />
          <circle cx={12} cy={12} r={2.5} />
        </svg>
      ),
    },
    {
      title: "New customers",
      value: newCustomers.toLocaleString("en-US"),
      change: pct(newCustomers, prevNewCustomers),
      range,
      icon: (
        <svg
          className="w-[18px] h-[18px]"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          viewBox="0 0 24 24"
        >
          <circle cx={12} cy={8} r={4} />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      ),
    },
  ];

  return (
    <section
      className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6"
      aria-label="Key metrics"
    >
      {kpis.map((k) => (
        <KpiCard key={k.title} {...k} />
      ))}
    </section>
  );
}
