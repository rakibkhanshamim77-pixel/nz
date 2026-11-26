export default function ShopGridSkeleton() {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-line bg-surface overflow-hidden animate-pulse"
        >
          <div className="aspect-[4/5] bg-soft" />
          <div className="p-4 space-y-3">
            <div className="h-3 w-24 bg-soft rounded" />
            <div className="h-4 w-full bg-soft rounded" />
            <div className="h-3 w-32 bg-soft rounded" />
            <div className="h-5 w-20 bg-soft rounded" />
            <div className="h-10 w-full bg-soft rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
