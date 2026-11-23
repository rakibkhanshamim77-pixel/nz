function Sk({ className }: { className: string }) {
  return <div className={`bg-soft rounded animate-pulse ${className}`} />;
}

export default function CartLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-20">
      {/* Heading */}
      <div className="flex items-center gap-3 mb-6">
        <Sk className="h-7 w-32" />
        <Sk className="h-6 w-8 rounded-full" />
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-6 lg:gap-8 items-start">
        {/* Cart items */}
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-4 sm:p-5 flex gap-4">
              <Sk className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl shrink-0" />
              <div className="flex-1 space-y-3">
                <Sk className="h-3.5 w-20" />
                <Sk className="h-5 w-3/4" />
                <div className="flex gap-2">
                  <Sk className="h-6 w-16 rounded-full" />
                  <Sk className="h-6 w-12 rounded-full" />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <Sk className="h-9 w-28 rounded-xl" />
                  <Sk className="h-6 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card p-5 sm:p-6 space-y-4 lg:sticky lg:top-24">
          <Sk className="h-6 w-32 mb-2" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <Sk className="h-4 w-28" />
              <Sk className="h-4 w-16" />
            </div>
          ))}
          <Sk className="h-px w-full" />
          <div className="flex justify-between">
            <Sk className="h-5 w-20" />
            <Sk className="h-5 w-24" />
          </div>
          <Sk className="h-12 w-full rounded-2xl mt-2" />
        </div>
      </div>
    </div>
  );
}
