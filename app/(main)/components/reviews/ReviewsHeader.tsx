export default function ReviewsHeader({ totalRev }: { totalRev: number }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <h2 className="font-display font-extrabold text-3xl lg:text-4xl tracking-tight">
        ক্রেতারা যা বলছেন
      </h2>
      <div className="flex items-center gap-2">
        <span className="text-yellow-400 tracking-widest">★★★★★</span>
        <b>4.8</b>
        <span className="text-mute text-sm">({totalRev} রিভিউ)</span>
      </div>
    </div>
  );
}
