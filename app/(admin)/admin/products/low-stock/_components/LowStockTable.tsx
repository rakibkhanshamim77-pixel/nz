import Image from "next/image";
import Link from "next/link";
import { STATUS_LABEL } from "../../_components/types";
import StockEditor from "./StockEditor";
import { LEVEL_LABEL, type LowStockRow } from "./types";

interface Props {
  rows: LowStockRow[];
  threshold: number;
}

function Thumb({ row, big }: { row: LowStockRow; big?: boolean }) {
  return (
    <span className={`thumb flex-shrink-0 ${big ? "!w-[64px] !h-[74px]" : ""}`}>
      {row.image ? (
        <Image src={row.image} alt={row.name} width={big ? 64 : 52} height={big ? 74 : 60} className="w-full h-full object-contain" />
      ) : (
        <svg className="w-6 h-6 text-[var(--mute)]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
          <rect x={3} y={5} width={18} height={14} rx={2} />
          <circle cx={9} cy={10} r={1.5} />
          <path d="m21 16-5-5-8 8" />
        </svg>
      )}
    </span>
  );
}

function LevelBadge({ level }: { level: LowStockRow["level"] }) {
  return <span className={`badge ${level === "out" ? "solid" : level === "critical" ? "" : "dash"}`}>{LEVEL_LABEL[level]}</span>;
}

function StockMeter({ stock, threshold }: { stock: number; threshold: number }) {
  const pct = Math.min(100, Math.round((stock / Math.max(1, threshold)) * 100));
  return (
    <div className="min-w-[110px]">
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <b className="font-display text-lg leading-none">{stock}</b>
        <span className="text-[11px] text-[var(--mute)]">of {threshold}</span>
      </div>
      <div className="mini" role="meter" aria-valuenow={stock} aria-valuemin={0} aria-valuemax={threshold} aria-label="Stock against alert threshold">
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const EditLink = ({ row }: { row: LowStockRow }) => (
  <Link href={`/admin/products/edit/${row.id}`} className="icon-btn tip-wrap" data-tip="Edit" aria-label={`Edit ${row.name}`}>
    <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M4 20h4L19 9l-4-4L4 16z" />
      <path d="m13 7 4 4" />
    </svg>
  </Link>
);

export default function LowStockTable({ rows, threshold }: Props) {
  return (
    <>
      <section className="card hidden md:block overflow-hidden mb-5">
        <div className="overflow-x-auto">
          <table className="ptbl">
            <thead>
              <tr>
                <th className="w-[72px]">Image</th>
                <th>Product</th>
                <th>Category</th>
                <th>Status</th>
                <th>Stock</th>
                <th>Level</th>
                <th className="text-right">Restock</th>
                <th className="text-right"><span className="sr-only">Edit</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="row-in">
                  <td><Thumb row={r} /></td>
                  <td>
                    <Link href={`/admin/products/edit/${r.id}`} className="font-semibold hover:underline underline-offset-4 max-w-[240px] truncate block">
                      {r.name}
                    </Link>
                    <span className="mono text-[12px] text-[var(--mute)]">{r.sku}</span>
                  </td>
                  <td className="text-sm">{r.category}</td>
                  <td>
                    <span className={`st ${r.status}`}><i />{STATUS_LABEL[r.status]}</span>
                  </td>
                  <td><StockMeter stock={r.stock} threshold={threshold} /></td>
                  <td><LevelBadge level={r.level} /></td>
                  <td><StockEditor productId={r.id} productName={r.name} stock={r.stock} /></td>
                  <td><div className="flex justify-end"><EditLink row={r} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="md:hidden grid gap-3 mb-5">
        {rows.map((r) => (
          <article key={r.id} className="card p-4">
            <div className="flex gap-3.5">
              <Thumb row={r} big />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/admin/products/edit/${r.id}`} className="font-semibold leading-snug hover:underline">
                    {r.name}
                  </Link>
                  <LevelBadge level={r.level} />
                </div>
                <p className="text-xs text-[var(--mute)] mt-0.5">
                  <span className="mono">{r.sku}</span> · {r.category} · {STATUS_LABEL[r.status]}
                </p>
                <div className="mt-2.5"><StockMeter stock={r.stock} threshold={threshold} /></div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 mt-3.5 pt-3.5 border-t border-[var(--line)]">
              <EditLink row={r} />
              <StockEditor productId={r.id} productName={r.name} stock={r.stock} />
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
