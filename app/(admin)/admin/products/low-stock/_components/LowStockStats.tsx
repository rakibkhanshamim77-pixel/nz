interface Props {
  out: number;
  critical: number;
  low: number;
  threshold: number;
  criticalMax: number;
}

export default function LowStockStats({ out, critical, low, threshold, criticalMax }: Props) {
  const cards = [
    { label: "Out of stock", value: out, sub: "Can't be ordered", icon: <path d="M4 4l16 16M12 3l8 4.5v9L12 21l-8-4.5v-9z" /> },
    { label: "Critical", value: critical, sub: `1–${criticalMax} units left`, icon: <path d="M12 8v5M12 16.5v.5M10.3 3.9 2.5 17.5A2 2 0 0 0 4.2 20.5h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /> },
    { label: "Low", value: low, sub: criticalMax < threshold ? `${criticalMax + 1}–${threshold} units left` : "—", icon: <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" /> },
    { label: "Alert threshold", value: threshold, sub: "Units or fewer", icon: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></> },
  ];

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5" aria-label="Low stock summary">
      {cards.map((c) => (
        <div key={c.label} className="card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs sm:text-sm text-[var(--mute)] font-medium">{c.label}</span>
            <span className="w-9 h-9 rounded-xl bg-[var(--soft)] grid place-items-center">
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                {c.icon}
              </svg>
            </span>
          </div>
          <b className="font-display font-extrabold text-2xl sm:text-[2rem] tracking-tight leading-none">{c.value}</b>
          <p className="text-xs text-[var(--mute)] mt-2">{c.sub}</p>
        </div>
      ))}
    </section>
  );
}
