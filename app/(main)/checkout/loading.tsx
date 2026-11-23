function Sk({ className }: { className: string }) {
  return <div className={`bg-soft rounded animate-pulse ${className}`} />;
}

export default function CheckoutLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Sk className="h-8 w-32" />
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-6 lg:gap-10 items-start">
        {/* Form */}
        <div className="space-y-6">
          {/* Delivery section */}
          <div className="card p-5 sm:p-7 space-y-5">
            <Sk className="h-6 w-36 mb-2" />
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`space-y-2 ${i === 4 ? "sm:col-span-2" : ""}`}>
                  <Sk className="h-3.5 w-24" />
                  <Sk className="h-[52px] w-full rounded-2xl" />
                </div>
              ))}
            </div>
          </div>

          {/* Payment section */}
          <div className="card p-5 sm:p-7 space-y-4">
            <Sk className="h-6 w-32 mb-2" />
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Sk key={i} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="card p-5 sm:p-6 space-y-4 lg:sticky lg:top-24">
          <Sk className="h-6 w-32 mb-2" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-center">
              <Sk className="w-16 h-20 rounded-2xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Sk className="h-4 w-full" />
                <Sk className="h-3.5 w-3/4" />
                <Sk className="h-5 w-20" />
              </div>
            </div>
          ))}
          <Sk className="h-px w-full" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <Sk className="h-4 w-28" />
              <Sk className="h-4 w-16" />
            </div>
          ))}
          <Sk className="h-12 w-full rounded-2xl mt-2" />
        </div>
      </div>
    </div>
  );
}
