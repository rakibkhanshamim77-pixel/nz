import Link from "next/link";
import Image from "next/image";

export interface LowStockProduct {
  id: string;
  slug: string;
  name: string;
  image?: string;
  stock: number;
  price: number;
}

interface Props {
  products: LowStockProduct[];
}

export default function DashboardLowStock({ products }: Props) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display font-bold text-lg">Low Stock</h2>
        <Link
          href="/admin/products/low-stock"
          className="text-xs font-semibold text-[var(--mute)] hover:text-[var(--ink)] underline underline-offset-4"
        >
          Manage
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-[var(--mute)]">All products well-stocked.</p>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <li key={p.id} className="flex items-center gap-3">
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
                    className="w-6 h-6 text-[var(--mute)]"
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
                  href={`/admin/products/edit/${p.id}`}
                  className="font-semibold text-sm truncate block hover:underline"
                >
                  {p.name}
                </Link>
                <span className="text-xs text-[var(--mute)]">
                  BDT {p.price.toLocaleString("en-US")}
                </span>
              </div>

              <span
                className={`badge ${p.stock === 0 ? "solid" : "dash"} flex-shrink-0`}
              >
                {p.stock === 0 ? "Out" : `${p.stock} left`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
