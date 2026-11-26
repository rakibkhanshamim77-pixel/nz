import { getCategories } from "@/db/actions/categories.action";

export default async function Categories() {
  const categories = await getCategories(4);

  if (categories.length === 0) return null;

  return (
    <section id="cats" className="max-w-7xl mx-auto px-4 sm:px-6 mt-20">
      <div className="flex items-end justify-between gap-4 mb-7">
        <div>
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-mute mb-2">
            Collections
          </span>
          <h2 className="font-display font-extrabold text-3xl lg:text-4xl tracking-tight">
            ক্যাটাগরি অনুযায়ী কিনুন
          </h2>
        </div>
        <a
          href="#shop"
          className="group inline-flex items-center gap-1.5 shrink-0 text-sm font-medium text-mute hover:text-ink transition-colors"
        >
          সব দেখুন
          <span
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {categories.map((cat, index) => (
          <a
            key={cat.id}
            href="#shop"
            data-filter={cat.filter}
            aria-label={`${cat.name} — BDT ${cat.startingPrice.toLocaleString("en-US")} থেকে`}
            className="group relative isolate overflow-hidden rounded-2xl aspect-[4/5] p-5 sm:p-6 flex flex-col justify-between text-white transition duration-300 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            style={{ background: cat.bgColor }}
          >
            <span
              aria-hidden="true"
              className="absolute -right-12 -top-12 -z-10 h-44 w-44 rounded-full opacity-15 transition-transform duration-500 group-hover:scale-125"
              style={{ backgroundColor: cat.accentColor }}
            />
            <span
              aria-hidden="true"
              className="absolute -left-14 -bottom-20 -z-10 h-52 w-52 rounded-full border border-white/10 transition-transform duration-500 group-hover:scale-110"
            />

            <div className="flex items-start justify-between gap-2">
              <span className="font-display font-extrabold text-5xl lg:text-6xl leading-none text-white/15">
                {(index + 1).toLocaleString("bn-BD", {
                  minimumIntegerDigits: 2,
                })}
              </span>
              {cat.label && (
                <span
                  className="rounded-full bg-white/10 backdrop-blur px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase"
                  style={{ color: cat.accentColor }}
                >
                  {cat.label}
                </span>
              )}
            </div>

            <div>
              <span
                aria-hidden="true"
                className="block h-0.5 w-8 rounded-full mb-3 transition-all duration-300 group-hover:w-14"
                style={{ backgroundColor: cat.accentColor }}
              />
              <b className="block font-display text-lg sm:text-xl lg:text-2xl leading-tight">
                {cat.name}
              </b>
              {cat.startingPrice > 0 && (
                <span className="block mt-1 text-sm opacity-75">
                  BDT {cat.startingPrice.toLocaleString("en-US")} থেকে
                </span>
              )}
              <span className="mt-4 inline-flex items-center gap-2 text-xs sm:text-sm font-semibold">
                কালেকশন দেখুন
                <span
                  aria-hidden="true"
                  className="grid place-items-center h-7 w-7 rounded-full bg-white text-gray-900 transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
