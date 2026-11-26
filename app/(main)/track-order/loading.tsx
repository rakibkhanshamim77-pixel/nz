function Sk({ className }: { className: string }) {
  return <div className={`bg-soft rounded animate-pulse ${className}`} />;
}

export default function TrackOrderLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-20 space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <Sk className="h-4 w-48" />
        <Sk className="h-9 w-full max-w-72" />
        <Sk className="h-4 w-56" />
      </div>

      {/* Search form card */}
      <div className="card p-4 sm:p-7">
        <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-end max-w-xl">
          <div className="space-y-2">
            <Sk className="h-3.5 w-28" />
            <Sk className="h-[52px] w-full rounded-2xl" />
          </div>
          <Sk className="h-[52px] w-full sm:w-32 rounded-2xl" />
        </div>
      </div>

      {/* Help cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card p-5 space-y-3">
            <Sk className="w-10 h-10 rounded-2xl" />
            <Sk className="h-5 w-32" />
            <Sk className="h-3.5 w-full" />
            <Sk className="h-3.5 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
