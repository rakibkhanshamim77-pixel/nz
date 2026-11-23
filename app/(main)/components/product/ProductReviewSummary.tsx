import { starParts } from "./product.utils";
import type { ReviewSummaryData } from "./product.types";

interface ProductReviewSummaryProps {
  summary: ReviewSummaryData;
}

const STARS = [5, 4, 3, 2, 1] as const;

export default function ProductReviewSummary({ summary }: ProductReviewSummaryProps) {
  const { average, total, distribution } = summary;
  const { filled, empty } = starParts(average);

  return (
    <aside className="card p-5 sm:p-6 lg:sticky lg:top-24" aria-label="রিভিউ সারাংশ">
      <div className="flex items-center gap-4">
        <b className="font-display font-extrabold text-6xl leading-none tracking-tight">{average.toFixed(1)}</b>
        <div>
          <span className="text-lg tracking-wider" role="img" aria-label={`৫-এর মধ্যে ${average.toFixed(1)}`}>
            <span className="text-yellow-400">{filled}</span>
            <span className="text-line">{empty}</span>
          </span>
          <p className="text-sm text-mute mt-1">{total.toLocaleString("bn-BD")}টি রিভিউ</p>
        </div>
      </div>

      <ul className="mt-5 space-y-1">
        {STARS.map((star) => {
          const count = distribution[star] ?? 0;
          const percent = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <li key={star} className="flex items-center gap-3 text-sm py-1">
              <span className="w-8 shrink-0 font-semibold">
                {star}
                <span className="text-yellow-400" aria-hidden="true">
                  {" "}
                  ★
                </span>
              </span>
              <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-soft" aria-hidden="true">
                <span className="absolute inset-y-0 left-0 rounded-full bg-ink" style={{ width: `${percent}%` }} />
              </span>
              <span className="w-10 shrink-0 text-right text-mute">
                {count.toLocaleString("bn-BD")}
                <span className="sr-only"> টি {star} স্টার রিভিউ</span>
              </span>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
