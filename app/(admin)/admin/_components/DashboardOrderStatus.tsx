interface StatusRow {
  status: string;
  count: number;
  label: string;
}

interface Props {
  rows: StatusRow[];
}

export default function DashboardOrderStatus({ rows }: Props) {
  const total = rows.reduce((a, r) => a + r.count, 0);

  const STATUS_STYLE: Record<string, string> = {
    pending: "ost payment_pending",
    confirmed: "ost confirmed",
    processing: "ost",
    shipped: "ost shipped",
    delivered: "ost delivered",
    cancelled: "ost cancelled",
  };

  return (
    <section className="card p-5 sm:p-6">
      <h2 className="font-display font-bold text-lg mb-5">Order Status</h2>
      <ul className="space-y-3">
        {rows.map((r) => {
          const pct = total > 0 ? Math.round((r.count / total) * 100) : 0;
          return (
            <li key={r.status}>
              <div className="flex items-center justify-between mb-1.5 text-sm">
                <span className={STATUS_STYLE[r.status] ?? "ost"}>
                  <i />
                  {r.label}
                </span>
                <span className="font-bold font-display">
                  {r.count.toLocaleString("en-US")}
                  <span className="ml-1.5 text-xs font-normal text-[var(--mute)]">
                    ({pct}%)
                  </span>
                </span>
              </div>
              <div className="mini">
                <span style={{ width: `${pct}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
