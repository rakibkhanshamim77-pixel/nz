import Link from "next/link";
import Image from "next/image";

export interface TopProduct {
  slug: string;
  name: string;
  image?: string;
  revenue: number;
  sold: number;
}

interface Props {
  products: TopProduct[];
  range: number;
}

const bn = (n: number) => "BDT " + Math.round(n).toLocaleString("en-US");

export default function DashboardTopProducts({ products, range }: Props) {
  const maxSold = Math.max(...products.map((p) => p.sold), 1);

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display font-bold text-lg">Top Products</h2>
          <p className="text-xs text-[var(--mute)] mt-0.5">
            By units sold · last {range} days
          </p>
        </div>
        <Link
          href="/admin/products"
          className="text-xs font-semibold text-[var(--mute)] hover:text-[var(--ink)] underline underline-offset-4"
        >
          All products
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-[var(--mute)]">No sales in this period.</p>
      ) : (
        <ol className="space-y-4">
          {products.map((p, i) => (
            <li key={p.slug} className="flex items-center gap-3">
              <span className="text-sm font-bold font-display w-5 flex-shrink-0 text-[var(--mute)]">
                {i + 1}
              </span>

              <div className="thumb sm flex-shrink-0 overflow-hidden">
                {p.image ? (
                  <Image
                    src={p.image}
                    alt={p.name}
                    width={38}
                    height={44}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <svg
                    className="w-5 h-5 text-[var(--mute)]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 7H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1z" />
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                  </svg>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/admin/products/${p.slug}`}
                  className="font-semibold text-sm truncate block hover:underline"
                >
                  {p.name}
                </Link>
                <div className="mt-1.5 mini">
                  <span
                    style={{ width: `${(p.sold / maxSold) * 100}%` }}
                  />
                </div>
              </div>

              <div className="text-right flex-shrink-0 ml-1">
                <p className="font-bold text-sm font-display">{p.sold}</p>
                <p className="text-xs text-[var(--mute)]">{bn(p.revenue)}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
