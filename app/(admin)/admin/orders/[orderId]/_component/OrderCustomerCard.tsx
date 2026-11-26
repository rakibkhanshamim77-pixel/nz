interface Props {
  name: string;
  phone: string;
  email?: string;
  customerType?: string;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function OrderCustomerCard({ name, phone, email, customerType }: Props) {
  const waPhone = phone.replace(/\D/g, "").replace(/^88/, "");
  const waLink = `https://wa.me/88${waPhone}?text=${encodeURIComponent(`Regarding your order`)}`;

  return (
    <section className="card p-5">
      <h2 className="font-display font-bold text-lg mb-4">Customer</h2>

      {/* Avatar + name */}
      <div className="flex items-center gap-3 mb-4">
        <span className="w-12 h-12 rounded-full bg-[var(--ink)] text-[var(--bg)] grid place-items-center font-display font-bold text-sm shrink-0">
          {initials(name)}
        </span>
        <div className="min-w-0">
          <b className="block truncate">{name}</b>
          <span className="text-xs text-[var(--mute)]">
            {customerType === "guest" ? "Guest" : "Registered"}
          </span>
        </div>
      </div>

      {/* Call + WhatsApp buttons */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <a
          href={`tel:${phone}`}
          className="flex items-center justify-center gap-2 h-10 rounded-2xl border border-[var(--line)] text-sm font-semibold hover:border-[var(--ink)] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
          </svg>
          Call
        </a>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 h-10 rounded-2xl border border-[var(--line)] text-sm font-semibold hover:border-[var(--ink)] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
          </svg>
          WhatsApp
        </a>
      </div>

      {/* KV rows */}
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-4 py-2 border-b border-[var(--line)]">
          <dt className="text-[var(--mute)]">Phone</dt>
          <dd className="font-semibold font-mono text-xs">{phone}</dd>
        </div>
        {email && (
          <div className="flex justify-between gap-4 py-2 border-b border-[var(--line)]">
            <dt className="text-[var(--mute)]">Email</dt>
            <dd className="truncate max-w-[180px]">{email}</dd>
          </div>
        )}
      </dl>
    </section>
  );
}
