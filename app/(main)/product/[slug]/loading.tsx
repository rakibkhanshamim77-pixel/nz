function Sk({ className }: { className: string }) {
  return <div className={`bg-soft rounded animate-pulse ${className}`} />;
}

export default function ProductLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Sk className="h-3.5 w-16" />
        <Sk className="h-3.5 w-2" />
        <Sk className="h-3.5 w-20" />
        <Sk className="h-3.5 w-2" />
        <Sk className="h-3.5 w-32" />
      </div>

      <div className="grid lg:grid-cols-[1fr_480px] gap-8 lg:gap-12 items-start">
        {/* Image gallery */}
        <div className="space-y-3">
          <Sk className="aspect-[4/5] rounded-3xl" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Sk key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        </div>

        {/* Product details */}
        <div className="space-y-5 lg:sticky lg:top-24">
          <Sk className="h-4 w-24" />
          <Sk className="h-8 w-3/4" />
          <div className="flex items-center gap-3">
            <Sk className="h-7 w-28" />
            <Sk className="h-5 w-20" />
          </div>

          {/* Size picker */}
          <div className="space-y-3">
            <Sk className="h-4 w-20" />
            <div className="flex gap-2">
              {["S", "M", "L", "XL", "XXL"].map((s) => (
                <Sk key={s} className="h-10 w-12 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div className="space-y-3">
            <Sk className="h-4 w-16" />
            <div className="flex gap-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Sk key={i} className="w-9 h-9 rounded-full" />
              ))}
            </div>
          </div>

          {/* Quantity + buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Sk className="h-12 w-28 rounded-2xl" />
            <Sk className="h-12 flex-1 rounded-2xl" />
          </div>
          <Sk className="h-12 w-full rounded-2xl" />

          {/* Meta */}
          <div className="pt-4 space-y-2.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Sk key={i} className="h-3.5 w-3/4" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
