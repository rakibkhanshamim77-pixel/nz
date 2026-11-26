export default function CheckoutHeader() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6 sm:mb-8">
      <div>
        <a
          href="shop.html"
          className="inline-flex items-center gap-1.5 text-sm text-mute hover:text-ink mb-3"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M15 6 9 12l6 6" />
          </svg>
          শপিং চালিয়ে যান
        </a>
        <p className="text-xs font-semibold tracking-[.22em] uppercase text-ink mb-1 md:hidden">
          ধাপ ২ / ৩
        </p>
        <h1 className="font-display font-extrabold text-[2rem] sm:text-4xl lg:text-5xl tracking-tight leading-none">
          চেকআউট
        </h1>
        <p className="text-mute mt-2 text-[15px]">
          ডেলিভারি তথ্য দিয়ে অর্ডারটি কনফার্ম করুন।
        </p>
      </div>
    </div>
  );
}
