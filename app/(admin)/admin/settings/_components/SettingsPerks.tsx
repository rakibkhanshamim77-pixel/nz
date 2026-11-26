import type { PerkItem } from "@/db/settings";
import type { SettingsFieldErrors } from "@/db/validation/settings.validation";

const PERK_ICONS = [
  // Delivery truck
  <svg key="delivery" className="w-5 h-5 shrink-0 text-[var(--mute)]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />
    <circle cx={7} cy={18} r="1.6" />
    <circle cx={18} cy={18} r="1.6" />
  </svg>,
  // Exchange arrows
  <svg key="exchange" className="w-5 h-5 shrink-0 text-[var(--mute)]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" />
    <path d="M18 3v4h-4M6 21v-4h4" />
  </svg>,
  // Credit card
  <svg key="payment" className="w-5 h-5 shrink-0 text-[var(--mute)]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
    <rect x={3} y={6} width={18} height={12} rx={2} />
    <path d="M3 10h18" />
  </svg>,
];

const PERK_LABELS = ["Perk 1 (Delivery)", "Perk 2 (Exchange)", "Perk 3 (Payment)"];

interface Props {
  value: PerkItem[];
  errors: SettingsFieldErrors;
  onChange: (index: number, patch: Partial<PerkItem>) => void;
}

export default function SettingsPerks({ value, errors, onChange }: Props) {
  return (
    <section id="sec-perks" className="card p-5 sm:p-6 space-y-5">
      <div>
        <h2 className="font-display font-bold text-lg">Product Page Perks</h2>
        <p className="text-sm text-[var(--mute)] mt-0.5">
          The three trust tiles shown on every product detail page.
        </p>
      </div>

      <div className="space-y-4">
        {([0, 1, 2] as const).map((i) => {
          const perk = value[i] ?? { title: "", subtitle: "" };
          const titleKey = `perk${i}Title` as keyof typeof errors;
          const subKey = `perk${i}Sub` as keyof typeof errors;

          return (
            <div key={i} className="rounded-2xl border border-[var(--line)] p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                {PERK_ICONS[i]}
                <span className="text-sm font-semibold text-[var(--mute)]">{PERK_LABELS[i]}</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--mute)]" htmlFor={`perk-${i}-title`}>
                    Title
                  </label>
                  <input
                    id={`perk-${i}-title`}
                    type="text"
                    value={perk.title}
                    maxLength={40}
                    placeholder="e.g. Fast Delivery"
                    onChange={(e) => onChange(i, { title: e.target.value })}
                    className={`input w-full${errors[titleKey] ? " border-red-400" : ""}`}
                  />
                  {errors[titleKey] && (
                    <p className="text-xs text-red-600">{errors[titleKey]}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--mute)]" htmlFor={`perk-${i}-sub`}>
                    Subtitle
                  </label>
                  <input
                    id={`perk-${i}-sub`}
                    type="text"
                    value={perk.subtitle}
                    maxLength={60}
                    placeholder="e.g. Worldwide shipping"
                    onChange={(e) => onChange(i, { subtitle: e.target.value })}
                    className={`input w-full${errors[subKey] ? " border-red-400" : ""}`}
                  />
                  {errors[subKey] && (
                    <p className="text-xs text-red-600">{errors[subKey]}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}
