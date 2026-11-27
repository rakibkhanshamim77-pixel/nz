import { getContent } from "@/db/content.server";
import SaleBannerCountdown from "./SaleBannerCountdown";
import ScrollReveal from "../ScrollReveal";

export default async function SaleBanner() {
  const data = await getContent("sale-banner");

  if (!data.isEnabled) return null;

  const hasDeadline = !!data.deadline;

  return (
    <section id="sale" className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 sm:mt-24">
      <ScrollReveal variant="zoom">
      <div
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-14 text-white"
        style={{
          background: `linear-gradient(120deg, ${data.bgFrom}, ${data.bgTo})`,
        }}
      >
        <div className="relative z-10 grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          {/* Content */}
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-xs sm:text-sm mb-3 sm:mb-4">
              {data.badge}
            </span>

            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-tight mb-3 sm:mb-4">
              {data.title}
            </h2>

            <p className="text-white/80 text-sm sm:text-base mb-5 sm:mb-6 max-w-md">
              {data.subtitle}
            </p>

            {/* Countdown */}
            {hasDeadline && <SaleBannerCountdown deadline={data.deadline} />}

            <a
              href={data.link || "/shop"}
              className="inline-flex h-11 sm:h-12 items-center px-6 sm:px-7 rounded-xl bg-white text-black text-sm sm:text-base font-semibold hover:bg-white/90 transition"
            >
              {data.buttonText}
            </a>
          </div>

          {/* Decorative T-Shirts */}
          <div className="hidden sm:block relative h-56 lg:h-72 pointer-events-none">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="absolute left-[4%] top-4 w-40 lg:w-60 -rotate-12 text-rose-200 drop-shadow-xl"
              aria-hidden="true"
            >
              <path d="M16.5 3.5 21 6l-2.5 4-2.5-1.5V21H8V8.5L5.5 10 3 6l4.5-2.5L10 2h4l2.5 1.5Z" />
            </svg>
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="absolute right-[6%] top-10 w-40 lg:w-60 rotate-12 text-black/70 drop-shadow-xl"
              aria-hidden="true"
            >
              <path d="M16.5 3.5 21 6l-2.5 4-2.5-1.5V21H8V8.5L5.5 10 3 6l4.5-2.5L10 2h4l2.5 1.5Z" />
            </svg>
          </div>
        </div>

        {/* Mobile decorative */}
        <div className="sm:hidden pointer-events-none" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="absolute -right-4 -bottom-4 w-36 opacity-10 rotate-12 text-white"
          >
            <path d="M16.5 3.5 21 6l-2.5 4-2.5-1.5V21H8V8.5L5.5 10 3 6l4.5-2.5L10 2h4l2.5 1.5Z" />
          </svg>
        </div>
      </div>
      </ScrollReveal>
    </section>
  );
}
