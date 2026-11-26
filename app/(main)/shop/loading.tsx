import ShopGridSkeleton from "./_component/ShopGridSkeleton";

function Sk({ className }: { className: string }) {
  return <div className={`bg-soft rounded animate-pulse ${className}`} />;
}

export default function ShopLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Sk className="h-3.5 w-16" />
        <Sk className="h-3.5 w-2" />
        <Sk className="h-3.5 w-20" />
      </div>

      {/* Hero */}
      <Sk className="h-28 sm:h-36 rounded-3xl mb-8" />

      <div className="flex gap-6 items-start">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block w-56 shrink-0 space-y-5">
          <Sk className="h-5 w-24 mb-4" />
          {[80, 60, 70, 55, 65].map((w, i) => (
            <Sk key={i} className={`h-4 w-${w === 80 ? "full" : `[${w}%]`}`} />
          ))}
          <div className="pt-2 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Sk key={i} className="h-4 w-3/4" />
            ))}
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <Sk className="h-4 w-32" />
            <Sk className="h-9 w-36 rounded-xl" />
          </div>
          <ShopGridSkeleton />
        </div>
      </div>
    </div>
  );
}
