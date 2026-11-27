import ScrollReveal from "../ScrollReveal";

export default function WhyUs() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-24">
      {/* Heading */}
      <ScrollReveal variant="fadeUp">
      <div className="grid lg:grid-cols-2 gap-4 lg:gap-12 items-end mb-10">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-mute mb-3">
            <span className="h-px w-8 bg-teal" aria-hidden="true" />
            Why Choose Us
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.1]">
            কেন আমাদের পোশাক
            <br className="hidden sm:block" /> সবার থেকে আলাদা
          </h2>
        </div>
        <p className="text-mute leading-relaxed max-w-md lg:justify-self-end">
          মানসম্মত কাপড়, নিখুঁত ফিট আর ঝামেলাহীন এক্সচেঞ্জ — প্রতিটি অর্ডারে
          আমরা এই তিনটি প্রতিশ্রুতি রাখি।
        </p>
      </div>
      </ScrollReveal>

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-4 lg:gap-5">
        {/* 01 — Fabric */}
        <ScrollReveal variant="fadeUp" delay={0}>
        <article className="group relative isolate overflow-hidden rounded-3xl border border-line bg-soft p-7 lg:p-8 flex flex-col transition duration-300 hover:-translate-y-1 hover:shadow-xl">
          <span
            aria-hidden="true"
            className="absolute -right-16 -top-16 -z-10 h-48 w-48 rounded-full bg-teal/10 transition-transform duration-500 group-hover:scale-125"
          />

          <div className="flex items-start justify-between mb-8">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-bg transition-transform duration-300 group-hover:rotate-6">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 3c3 3.5 6 6.4 6 10a6 6 0 0 1-12 0c0-3.6 3-6.5 6-10Z" />
                <path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5" />
              </svg>
            </span>
            <span className="font-display font-extrabold text-4xl leading-none text-ink/10">
              ০১
            </span>
          </div>

          <b className="font-display text-xl lg:text-2xl block mb-3 leading-snug">
            ১০০% কটন, ২২০ GSM
          </b>
          <p className="text-mute leading-relaxed mb-8">
            ঘামে আরাম, ধোয়ার পরও আকার ঠিক থাকে। প্রতিটি কাপড় পাঠানোর আগে
            পরীক্ষা করা হয়।
          </p>

          <div className="mt-auto flex items-center justify-between border-t border-line pt-5">
            <span className="text-sm text-mute">প্রিমিয়াম ফ্যাব্রিক</span>
            <b className="font-display text-lg">২২০ GSM</b>
          </div>
        </article>
        </ScrollReveal>

        {/* 02 — Fit (highlighted) */}
        <ScrollReveal variant="fadeUp" delay={0.1}>
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
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <rect x="2.5" y="8" width="19" height="8" rx="1.5" />
                <path d="M6.5 8v3M10 8v2M13.5 8v3M17 8v2" />
              </svg>
            </span>
            <span className="rounded-full bg-bg/10 px-3 py-1 text-[11px] font-semibold tracking-wider uppercase">
              আমাদের বিশেষত্ব
            </span>
          </div>

          <b className="font-display text-xl lg:text-2xl block mb-3 leading-snug">
            সঠিক ফিট, সাইজ চার্ট সহ
          </b>
          <p className="text-bg/70 leading-relaxed mb-8">
            প্রতিটি পণ্যে বুক, দৈর্ঘ্য ও কাঁধের মাপ দেওয়া আছে, তাই কেনার আগেই
            ফিট বুঝে নিতে পারবেন।
          </p>

          <div className="mt-auto flex items-center justify-between border-t border-bg/15 pt-5">
            <span className="text-sm text-bg/70">প্রতিটি পণ্যে মাপ</span>
            <b className="font-display text-lg">বুক · দৈর্ঘ্য · কাঁধ</b>
          </div>
        </article>
        </ScrollReveal>

        {/* 03 — Exchange */}
        <ScrollReveal variant="fadeUp" delay={0.2}>
        <article className="group relative isolate overflow-hidden rounded-3xl border border-line bg-soft p-7 lg:p-8 flex flex-col transition duration-300 hover:-translate-y-1 hover:shadow-xl">
          <span
            aria-hidden="true"
            className="absolute -right-16 -top-16 -z-10 h-48 w-48 rounded-full bg-teal/10 transition-transform duration-500 group-hover:scale-125"
          />

          <div className="flex items-start justify-between mb-8">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-bg transition-transform duration-300 group-hover:rotate-6">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M4 9h13l-3.5-3.5M20 15H7l3.5 3.5" />
              </svg>
            </span>
            <span className="font-display font-extrabold text-4xl leading-none text-ink/10">
              ০৩
            </span>
          </div>

          <b className="font-display text-xl lg:text-2xl block mb-3 leading-snug">
            ৭ দিনে ফ্রি এক্সচেঞ্জ
          </b>
          <p className="text-mute leading-relaxed mb-8">
            সাইজ না মিললে ৭ দিনের মধ্যে জানান। আমরা বদলে দেব, কোনো বাড়তি চার্জ
            ছাড়াই।
          </p>

          <div className="mt-auto flex items-center justify-between border-t border-line pt-5">
            <span className="text-sm text-mute">এক্সচেঞ্জ চার্জ</span>
            <b className="font-display text-lg">BDT 0</b>
          </div>
        </article>
        </ScrollReveal>
      </div>
    </section>
  );
}
