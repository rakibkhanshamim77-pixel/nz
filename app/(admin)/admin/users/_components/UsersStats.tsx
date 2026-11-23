interface Props {
  total: number;
  staff: number;
  active: number;
  pending: number;
}

interface StatCard {
  label: string;
  value: number;
  sub: string;
  icon: React.ReactNode;
}

export default function UsersStats({ total, staff, active, pending }: Props) {
  const customers = Math.max(0, total - staff);

  const cards: StatCard[] = [
    {
      label: "Total users",
      value: total,
      sub: `${staff} staff · ${customers} customer${customers === 1 ? "" : "s"}`,
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <circle cx={9} cy={8} r="3.5" />
          <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6" />
        </svg>
      ),
    },
    {
      label: "Staff accounts",
      value: staff,
      sub: "Can sign in to admin",
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M12 3 5 6v6c0 4.2 2.8 7.4 7 9 4.2-1.6 7-4.8 7-9V6z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
    },
    {
      label: "Active",
      value: active,
      sub: "Verified and enabled",
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="m5 12 5 5L20 7" />
        </svg>
      ),
    },
    {
      label: "Pending",
      value: pending,
      sub: "Phone not verified yet",
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <circle cx={12} cy={12} r={9} />
          <path d="M12 7v5l3 2" />
        </svg>
      ),
    },
  ];

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5" aria-label="User summary">
      {cards.map((card) => (
        <div key={card.label} className="card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs sm:text-sm text-[var(--mute)] font-medium">{card.label}</span>
            <span className="w-9 h-9 rounded-xl bg-[var(--soft)] grid place-items-center">{card.icon}</span>
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
