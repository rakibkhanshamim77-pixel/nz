/* Homepage skeleton */
function Sk({ className }: { className: string }) {
  return <div className={`bg-soft rounded animate-pulse ${className}`} />;
}

export default function HomeLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Hero */}
      <div className="mt-6 sm:mt-10 rounded-3xl overflow-hidden">
        <Sk className="h-[320px] sm:h-[420px] lg:h-[500px] rounded-3xl" />
      </div>

      {/* Section heading */}
      <div className="mt-14 mb-6 flex items-center justify-between">
        <Sk className="h-7 w-48" />
        <Sk className="h-5 w-24" />
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-line bg-surface overflow-hidden animate-pulse"
          >
            <Sk className="aspect-[4/5] rounded-none" />
            <div className="p-3 sm:p-4 space-y-2.5">
              <Sk className="h-3 w-20" />
              <Sk className="h-4 w-full" />
              <Sk className="h-5 w-24" />
              <Sk className="h-9 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      <div className="pb-20" />
    </div>
  );
}
