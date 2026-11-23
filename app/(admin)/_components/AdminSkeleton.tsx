const Bar = ({ className = "" }: { className?: string }) => (
  <span className={`block rounded-lg bg-[var(--soft)] animate-pulse ${className}`} />
);

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="h-[70px] border-b border-[var(--line)] bg-[var(--bg)] px-4 sm:px-6 lg:px-8 flex items-center">
        <Bar className="h-5 w-40" />
      </div>
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1400px]">
        <Bar className="h-4 w-48 mb-4" />
        {children}
      </main>
    </div>
  );
}

/** Stats row + filter card + table rows. */
export function ListSkeleton({ stats = true }: { stats?: boolean }) {
  return (
    <Shell>
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="card p-5">
              <Bar className="h-3.5 w-24 mb-4" />
              <Bar className="h-8 w-16" />
            </div>
          ))}
        </div>
      )}
      <div className="card p-5 mb-5">
        <Bar className="h-11 w-full" />
      </div>
      <div className="card p-5 space-y-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Bar className="h-14 w-12 !rounded-xl" />
            <Bar className="h-4 flex-1" />
            <Bar className="h-4 w-20 hidden sm:block" />
            <Bar className="h-8 w-24 hidden md:block" />
          </div>
        ))}
      </div>
    </Shell>
  );
}

/** Two-column product form. */
export function FormSkeleton() {
  return (
    <Shell>
      <Bar className="h-9 w-64 mb-2" />
      <Bar className="h-4 w-80 max-w-full mb-6" />
      <div className="grid xl:grid-cols-[minmax(0,1fr)_360px] gap-5 sm:gap-6">
        <div className="space-y-5">
          {[260, 160, 300].map((h, i) => (
            <div key={i} className="card p-7">
              <div className="flex gap-3 mb-6">
                <Bar className="h-10 w-10 !rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Bar className="h-4 w-40" />
                  <Bar className="h-3 w-56" />
                </div>
              </div>
              <span className="block animate-pulse rounded-2xl bg-[var(--soft)]" style={{ height: h - 90 }} />
            </div>
          ))}
        </div>
        <div className="space-y-5">
          {[220, 120, 300].map((h, i) => (
            <div key={i} className="card p-7">
              <span className="block animate-pulse rounded-2xl bg-[var(--soft)]" style={{ height: h - 56 }} />
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
