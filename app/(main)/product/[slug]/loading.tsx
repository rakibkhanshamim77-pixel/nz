function Sk({ className, style }: { className: string; style?: React.CSSProperties }) {
  return <div className={`bg-soft rounded animate-pulse ${className}`} style={style} />;
}

export default function ProductLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-0 sm:pt-10 pb-20">
      {/* Breadcrumb — desktop only */}
      <div className="hidden sm:flex items-center gap-2 mb-6">
        <Sk className="h-3.5 w-16" />
        <Sk className="h-3.5 w-2" />
        <Sk className="h-3.5 w-20" />
        <Sk className="h-3.5 w-2" />
        <Sk className="h-3.5 w-32" />
      </div>

      <div className="grid lg:grid-cols-[1fr_480px] gap-0 lg:gap-12 items-start">
        {/* Mobile: full-width gallery skeleton */}
        <Sk className="lg:hidden -mx-4 sm:-mx-6 rounded-none" style={{ aspectRatio: "4/5" }} />
        {/* Desktop: card gallery */}
        <div className="hidden lg:block space-y-3">
          <Sk className="aspect-square rounded-3xl" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Sk key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        </div>

        {/* Product details */}
        <div className="-mt-6 lg:mt-0 relative z-10 rounded-t-3xl lg:rounded-none bg-bg lg:bg-transparent pt-5 lg:pt-0 space-y-5 lg:sticky lg:top-24 px-0 lg:px-0">
          {/* Drag handle */}
          <div className="lg:hidden flex justify-center mb-2">
            <span className="w-10 h-1 rounded-full bg-line" />
          </div>
          <Sk className="h-4 w-24" />
          <Sk className="h-7 w-3/4" />
          <div className="flex items-center gap-3">
            <Sk className="h-7 w-28" />
            <Sk className="h-5 w-20" />
          </div>
          <div className="space-y-3">
            <Sk className="h-4 w-20" />
            <div className="flex gap-2">
              {["S", "M", "L", "XL", "XXL"].map((s) => (
                <Sk key={s} className="h-10 w-12 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="hidden sm:block space-y-3">
            <div className="flex items-center gap-3 pt-2">
              <Sk className="h-12 w-28 rounded-2xl" />
              <Sk className="h-12 flex-1 rounded-2xl" />
            </div>
            <Sk className="h-12 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
