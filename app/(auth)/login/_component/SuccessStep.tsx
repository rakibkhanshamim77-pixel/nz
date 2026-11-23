export default function SuccessStep() {
  return (
    <div id="okStep" className="step text-center py-4">
      <div
        className="w-16 h-16 rounded-full text-bg grid place-items-center mx-auto mb-5"
        style={{ background: "var(--ink)" }}
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          viewBox="0 0 24 24"
        >
          <path d="m5 12 5 5L20 7" />
        </svg>
      </div>
      <h1 className="font-display font-extrabold text-2xl sm:text-3xl mb-2">
        লগইন সফল হয়েছে
      </h1>
      <p className="text-mute">হোম পেজে নিয়ে যাওয়া হচ্ছে…</p>
    </div>
  );
}
