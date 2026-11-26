import Image from "next/image";
import Link from "next/link";
import { getCurrencySettings } from "@/db/settings.server";
import { formatPrice } from "@/db/settings";

interface OrderItem {
  name: string;
  slug?: string;
  sku?: string;
  image?: string;
  size?: string;
  color?: string;
  quantity: number;
  totalPrice: number;
  unitPrice?: number;
}

interface Props {
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  totalAmount: number;
}

export default async function OrderItems({
  items,
  subtotal,
  deliveryCharge,
  discount,
  totalAmount,
}: Props) {
  const currency = await getCurrencySettings();
  const fmt = (n: number) => formatPrice(n, currency);
  const totalPcs = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <section className="card p-5 sm:p-7">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-lg">Order Items</h2>
        <span className="text-sm text-[var(--mute)]">
          {items.length} item{items.length !== 1 ? "s" : ""} · {totalPcs} pcs
        </span>
      </div>

      <div className="divide-y divide-[var(--line)]">
        {items.map((item, i) => (
          <div key={i} className="flex gap-4 py-4 first:pt-0 last:pb-0">
            <div className="w-[60px] h-[70px] rounded-xl bg-[var(--soft)] overflow-hidden shrink-0 relative">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="60px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--mute)]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path d="M8 4 3 7l2 5 3-1v9h8v-9l3 1 2-5-5-3c-.7 2-2 3-4 3S8.7 6 8 4Z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              {item.slug ? (
                <Link
                  href={`/product/${item.slug}`}
                  className="font-semibold hover:underline line-clamp-1 block"
                  target="_blank"
                >
                  {item.name}
                </Link>
              ) : (
                <p className="font-semibold line-clamp-1">{item.name}</p>
              )}
              <p className="text-xs text-[var(--mute)] mt-0.5 font-mono">
                {item.sku ?? "—"}
                {item.color && ` · ${item.color}`}
                {item.size && ` · Size ${item.size}`}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-[var(--mute)]">
                  {fmt(item.unitPrice ?? item.totalPrice / item.quantity)} × {item.quantity}
                </span>
                <span className="font-display font-bold text-lg">{fmt(item.totalPrice)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <dl className="mt-4 pt-4 border-t border-[var(--line)] space-y-2 text-sm">
        <div className="flex justify-between py-1">
          <dt className="text-[var(--mute)]">Subtotal</dt>
          <dd className="font-medium">{fmt(subtotal)}</dd>
        </div>
        <div className="flex justify-between py-1">
          <dt className="text-[var(--mute)]">Delivery charge</dt>
          <dd className="font-medium">{deliveryCharge === 0 ? "Free" : fmt(deliveryCharge)}</dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between py-1">
            <dt className="text-[var(--mute)]">Discount</dt>
            <dd className="font-medium text-green-700">−{fmt(discount)}</dd>
          </div>
        )}
        <div className="flex justify-between pt-3 border-t border-[var(--line)]">
          <dt className="font-bold text-base">Total</dt>
          <dd className="font-display font-extrabold text-2xl">{fmt(totalAmount)}</dd>
        </div>
      </dl>
    </section>
  );
}
