import { getContent } from "@/db/content.server";

export default async function WhyUs() {
  const c = await getContent("why-us");

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-24">
      {/* Heading */}
      <div className="grid lg:grid-cols-2 gap-4 lg:gap-12 items-end mb-10">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-mute mb-3">
            <span className="h-px w-8 bg-teal" aria-hidden="true" />
            {c.tagline}
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.1]">
            {c.heading}
          </h2>
        </div>
        <p className="text-mute leading-relaxed max-w-md lg:justify-self-end">
          {c.subheading}
        </p>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-4 lg:gap-5">
        {/* 01 — Card 1 */}
        <article className="group relative isolate overflow-hidden rounded-3xl border border-line bg-soft p-7 lg:p-8 flex flex-col transition duration-300 hover:-translate-y-1 hover:shadow-xl">
          <span
            aria-hidden="true"
            className="absolute -right-16 -top-16 -z-10 h-48 w-48 rounded-full bg-teal/10 transition-transform duration-500 group-hover:scale-125"
          />

          <div className="flex items-start justify-between mb-8">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-bg transition-transform duration-300 group-hover:rotate-6">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3c3 3.5 6 6.4 6 10a6 6 0 0 1-12 0c0-3.6 3-6.5 6-10Z" />
                <path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5" />
              </svg>
            </span>
            <span className="font-display font-extrabold text-4xl leading-none text-ink/10">01</span>
          </div>

          <b className="font-display text-xl lg:text-2xl block mb-3 leading-snug">{c.card1Title}</b>
          <p className="text-mute leading-relaxed mb-8">{c.card1Body}</p>

          <div className="mt-auto flex items-center justify-between border-t border-line pt-5">
            <span className="text-sm text-mute">{c.card1StatLabel}</span>
            <b className="font-display text-lg">{c.card1StatValue}</b>
          </div>
        </article>

        {/* 02 — Card 2 (highlighted) */}
        <article className="group relative isolate overflow-hidden rounded-3xl bg-ink text-bg p-7 lg:p-8 flex flex-col shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl md:-translate-y-3 md:hover:-translate-y-4">
          <span
            aria-hidden="true"
            className="absolute -right-16 -top-16 -z-10 h-48 w-48 rounded-full bg-teal/25 blur-2xl transition-transform duration-500 group-hover:scale-125"
          />
          <span
            aria-hidden="true"
            className="absolute -left-20 -bottom-24 -z-10 h-56 w-56 rounded-full border border-bg/10"
          />

          <div className="flex items-start justify-between mb-8">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-bg text-ink transition-transform duration-300 group-hover:rotate-6">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24" aria-hidden="true">
                <rect x="2.5" y="8" width="19" height="8" rx="1.5" />
                <path d="M6.5 8v3M10 8v2M13.5 8v3M17 8v2" />
              </svg>
            </span>
            <span className="rounded-full bg-bg/10 px-3 py-1 text-[11px] font-semibold tracking-wider uppercase">
              {c.card2Badge}
            </span>
          </div>

          <b className="font-display text-xl lg:text-2xl block mb-3 leading-snug">{c.card2Title}</b>
          <p className="text-bg/70 leading-relaxed mb-8">{c.card2Body}</p>

          <div className="mt-auto flex items-center justify-between border-t border-bg/15 pt-5">
            <span className="text-sm text-bg/70">{c.card2StatLabel}</span>
            <b className="font-display text-lg">{c.card2StatValue}</b>
          </div>
        </article>

        {/* 03 — Card 3 */}
        <article className="group relative isolate overflow-hidden rounded-3xl border border-line bg-soft p-7 lg:p-8 flex flex-col transition duration-300 hover:-translate-y-1 hover:shadow-xl">
          <span
            aria-hidden="true"
            className="absolute -right-16 -top-16 -z-10 h-48 w-48 rounded-full bg-teal/10 transition-transform duration-500 group-hover:scale-125"
          />

          <div className="flex items-start justify-between mb-8">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-bg transition-transform duration-300 group-hover:rotate-6">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 9h13l-3.5-3.5M20 15H7l3.5 3.5" />
              </svg>
            </span>
            <span className="font-display font-extrabold text-4xl leading-none text-ink/10">03</span>
          </div>

          <b className="font-display text-xl lg:text-2xl block mb-3 leading-snug">{c.card3Title}</b>
          <p className="text-mute leading-relaxed mb-8">{c.card3Body}</p>

          <div className="mt-auto flex items-center justify-between border-t border-line pt-5">
            <span className="text-sm text-mute">{c.card3StatLabel}</span>
            <b className="font-display text-lg">{c.card3StatValue}</b>
          </div>
        </article>
      </div>
    </section>
  );
}
