import Link from "next/link";
import { getBrandingSettings } from "@/db/settings.server";

export default async function Logo() {
  const b = await getBrandingSettings();

  return (
    <Link href="/" className="flex items-center gap-3 shrink-0">
      <span className="w-10 h-10 rounded-xl bg-soft grid place-items-center font-display font-extrabold">
        {b.shortName}
      </span>
      <span className="leading-none">
        <b className="font-display text-lg tracking-tight block">{b.brandName}</b>
        <span className="text-[10px] tracking-[.28em] text-mute">
          {b.tagline}
        </span>
      </span>
    </Link>
  );
}
