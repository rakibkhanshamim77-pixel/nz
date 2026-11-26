function Sk({ className }: { className: string }) {
  return <div className={`bg-soft rounded animate-pulse ${className}`} />;
}

export default function MyAccountLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-20">
      {/* Account header */}
      <div className="flex items-center gap-4 mb-6 sm:mb-8">
        <Sk className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl shrink-0" />
        <div className="space-y-2">
          <Sk className="h-3.5 w-20" />
          <Sk className="h-7 w-44" />
          <Sk className="h-3.5 w-32" />
        </div>
      </div>

      <div className="grid lg:grid-cols-[250px_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
        {/* Sidebar */}
        <div className="card p-2 space-y-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <Sk key={i} className="h-12 rounded-2xl" />
          ))}
        </div>

        {/* Main content */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-4 sm:p-5 space-y-3">
                <Sk className="h-3.5 w-20" />
                <Sk className="h-8 w-16" />
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-5 flex items-center gap-3">
                <Sk className="w-10 h-10 rounded-2xl shrink-0" />
                <Sk className="h-5 w-28" />
              </div>
            ))}
          </div>

          {/* Orders section */}
          <div className="card p-5 sm:p-7 space-y-4">
            <div className="flex justify-between items-center mb-5">
              <Sk className="h-6 w-32" />
              <Sk className="h-4 w-24" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-line p-4 sm:p-5 space-y-4">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <Sk className="h-5 w-32" />
                    <Sk className="h-3.5 w-44" />
                  </div>
                  <Sk className="h-6 w-24 rounded-full" />
                </div>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 2 }).map((_, j) => (
                    <Sk key={j} className="w-12 h-14 rounded-xl shrink-0" />
                  ))}
                  <div className="ml-auto space-y-1 text-right">
                    <Sk className="h-3 w-16 ml-auto" />
                    <Sk className="h-6 w-20 ml-auto" />
                  </div>
                </div>
                <Sk className="h-10 w-36 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
