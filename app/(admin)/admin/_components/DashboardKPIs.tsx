interface KPI {
  title: string;
  value: string;
  change: number;
  range: number;
  icon: React.ReactNode;
  accent: string;
}

function KpiCard({ title, value, change, range, icon, accent }: KPI) {
  const up = change >= 0;
  const neutral = change === 0;
  return (
    <div className="card p-4 sm:p-5 relative overflow-hidden">
      {/* Accent bar */}
      <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl" style={{ background: accent }} />
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs sm:text-sm text-[var(--mute)] font-medium pl-2">
          {title}
        </span>
        <span className="w-9 h-9 rounded-xl grid place-items-center" style={{ background: accent + "1a", color: accent }}>
          {icon}
        </span>
      </div>
      <b className="font-display font-extrabold text-2xl sm:text-[1.9rem] tracking-tight leading-none block pl-2">
        {value}
      </b>
      <p className="text-xs mt-2.5 pl-2 flex items-center gap-1.5">
        <span
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full font-bold text-[10px]"
          style={{
            background: neutral ? "var(--soft)" : up ? "#16a34a1a" : "#dc26261a",
            color: neutral ? "var(--mute)" : up ? "#16a34a" : "#dc2626",
          }}
        >
          {up ? "↑" : "↓"} {Math.abs(change).toFixed(1)}%
        </span>
        <span className="text-[var(--mute)]">vs prev {range}d</span>
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
  return "BDT " + Math.round(n).toLocaleString("en-US");
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
      accent: "#6366f1",
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
      accent: "#f59e0b",
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
      accent: "#10b981",
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
      accent: "#ec4899",
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
