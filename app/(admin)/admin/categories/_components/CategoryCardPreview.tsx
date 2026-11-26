import { HEX_COLOR } from "@/db/validation/category.validation";
import { useCurrency } from "@/app/context/CurrencyProvider";

interface Props {
  name: string;
  label: string;
  startingPrice: number;
  bgColor: string;
  accentColor: string;
  compact?: boolean;
}

/** Mirrors the home page category card so admins see the real result. */
export default function CategoryCardPreview({ name, label, startingPrice, bgColor, accentColor, compact }: Props) {
  const { fmt } = useCurrency();
  const bg = HEX_COLOR.test(bgColor) ? bgColor : "#1f2937";
  const accent = HEX_COLOR.test(accentColor) ? accentColor : "#cbd5e1";

  if (compact) {
    return (
      <span
        className="relative isolate overflow-hidden rounded-xl w-[46px] h-[56px] shrink-0 block border border-[var(--line)]"
        style={{ background: bg }}
        aria-hidden="true"
      >
        <span className="absolute -right-3 -top-3 h-8 w-8 rounded-full opacity-40" style={{ background: accent }} />
        <span className="absolute left-2 bottom-2 h-0.5 w-4 rounded-full" style={{ background: accent }} />
      </span>
    );
  }

  return (
    <div
      className="relative isolate overflow-hidden rounded-2xl aspect-[4/5] p-5 flex flex-col justify-between text-white"
      style={{ background: bg }}
    >
      <span aria-hidden="true" className="absolute -right-12 -top-12 -z-10 h-44 w-44 rounded-full opacity-15" style={{ backgroundColor: accent }} />
      <span aria-hidden="true" className="absolute -left-14 -bottom-20 -z-10 h-52 w-52 rounded-full border border-white/10" />
      <div className="flex items-start justify-between gap-2">
        <span className="font-display font-extrabold text-5xl leading-none text-white/15">০১</span>
        {label && (
          <span className="rounded-full bg-white/10 backdrop-blur px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase" style={{ color: accent }}>
            {label}
          </span>
        )}
      </div>
      <div>
        <span aria-hidden="true" className="block h-0.5 w-8 rounded-full mb-3" style={{ backgroundColor: accent }} />
        <b className="block font-display text-xl leading-tight break-words">{name || "Category name"}</b>
        {startingPrice > 0 && (
          <span className="block mt-1 text-sm opacity-75">From {fmt(startingPrice)}</span>
        )}
        <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold">
          কালেকশন দেখুন
          <span aria-hidden="true" className="grid place-items-center h-7 w-7 rounded-full bg-white text-gray-900">→</span>
        </span>
      </div>
    </div>
  );
}
