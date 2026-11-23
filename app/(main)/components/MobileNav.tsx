import { mobileMenu } from "@/app/data/mobile-menu";
import Link from "next/link";

export default function MobileNav() {
  // const active = isActive
  //   ? "w-20 py-1.5 flex flex-col items-center text-xs font-semibold"
  //   : "w-20 py-1.5 flex flex-col items-center text-xs text-mute";
  return (
    <nav
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 lg:hidden bg-surface/95 backdrop-blur border border-line rounded-2xl shadow-xl px-3 py-2 flex gap-1"
      style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {mobileMenu.length > 0 &&
        mobileMenu.map((mm) => (
          <Link
            key={mm?.id}
            href={mm?.target}
            className="w-20 py-1.5 flex flex-col items-center text-xs text-mute"
          >
            <span className="w-10 h-10 grid place-items-center text-lg mb-0.5">
              {mm?.icon}
            </span>
            {mm?.title}
          </Link>
        ))}
    </nav>
  );
}
