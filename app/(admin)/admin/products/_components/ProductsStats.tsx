interface Props {
  total: number;
  active: number;
  draft: number;
  scheduled: number;
  featured: number;
}

interface StatCard {
  label: string;
  value: number;
  sub: string;
  icon: React.ReactNode;
}

export default function ProductsStats({ total, active, draft, scheduled, featured }: Props) {
  const cards: StatCard[] = [
    {
      label: "Total products",
      value: total,
      sub: "In catalogue",
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" />
          <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
        </svg>
      ),
    },
    {
      label: "Active",
      value: active,
      sub: "Visible on store",
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="m5 12 5 5L20 7" />
        </svg>
      ),
    },
    {
      label: "Draft",
      value: draft,
      sub: scheduled ? `Hidden · ${scheduled} scheduled` : "Hidden from store",
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M4 20h4L19 9l-4-4L4 16z" />
          <path d="m13 7 4 4" />
        </svg>
      ),
    },
    {
      label: "Featured",
      value: featured,
      sub: "Shown on home page",
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="m12 3 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.4l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z" />
        </svg>
      ),
    },
  ];

  return (
    <section
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5"
      aria-label="Product summary"
    >
      {cards.map((card) => (
        <div key={card.label} className="card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs sm:text-sm text-[var(--mute)] font-medium">
              {card.label}
            </span>
            <span className="w-9 h-9 rounded-xl bg-[var(--soft)] grid place-items-center">
              {card.icon}
            </span>
          </div>
          <b className="font-display font-extrabold text-2xl sm:text-[2rem] tracking-tight leading-none">
            {card.value}
          </b>
          <p className="text-xs text-[var(--mute)] mt-2">{card.sub}</p>
        </div>
      ))}
    </section>
  );
}
