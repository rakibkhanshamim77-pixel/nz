export default function PageHeader() {
  return (
    <div className="mb-6 sm:mb-8">
      <a
        href="checkout.html"
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
        চেকআউটে ফিরে যান
      </a>
      <p className="text-xs font-semibold tracking-[.22em] uppercase text-mute mb-1 md:hidden">
        ধাপ ৩ / ৩
      </p>
      <h1 className="font-display font-extrabold text-[2rem] sm:text-4xl lg:text-5xl tracking-tight leading-none">
        পেমেন্ট
      </h1>
      <p className="text-mute mt-2 text-[15px]">
        মোবাইল ব্যাংকিং-এ টাকা পাঠিয়ে ট্রানজেকশন আইডি দিন।
      </p>
    </div>
  );
}
