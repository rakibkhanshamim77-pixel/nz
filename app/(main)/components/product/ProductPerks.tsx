import { getStoreSettings } from "@/db/settings.server";
import { DEFAULT_PERKS } from "@/db/settings";

const ICONS = [
  <svg key="delivery" className="w-5 h-5 mx-auto mb-1.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />
    <circle cx={7} cy={18} r="1.6" />
    <circle cx={18} cy={18} r="1.6" />
  </svg>,
  <svg key="exchange" className="w-5 h-5 mx-auto mb-1.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" />
    <path d="M18 3v4h-4M6 21v-4h4" />
  </svg>,
  <svg key="payment" className="w-5 h-5 mx-auto mb-1.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
    <rect x={3} y={6} width={18} height={12} rx={2} />
    <path d="M3 10h18" />
  </svg>,
];

export default async function ProductPerks() {
  const settings = await getStoreSettings();
  const perks = settings.perks ?? DEFAULT_PERKS;

  return (
    <div className="grid grid-cols-3 gap-2 mt-6 text-center text-xs sm:text-sm">
      {perks.map((perk, i) => (
        <div key={i} className="rounded-2xl bg-soft p-3 sm:p-4">
          {ICONS[i]}
          <b className="block">{perk.title}</b>
          <span className="text-mute">{perk.subtitle}</span>
        </div>
      ))}
    </div>
  );
}
