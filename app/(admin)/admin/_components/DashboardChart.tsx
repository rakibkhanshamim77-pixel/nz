"use client";

import { useRef, useEffect, useState } from "react";
import { useCurrency } from "@/app/context/CurrencyProvider";

export interface ChartDay {
  date: string;
  sales: number;
  orders: number;
}

interface Props {
  data: ChartDay[];
  range: number;
}

const bnNum = (n: number) => Number(n).toLocaleString("en-US");

function shortDate(iso: string) {
  return new Date(iso + "T00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function weekday(iso: string) {
  return new Date(iso + "T00:00").toLocaleDateString("en-GB", {
    weekday: "short",
  });
}

function groupWeekly(data: ChartDay[]) {
  const weeks: (ChartDay & { date2?: string })[] = [];
  for (let i = 0; i < data.length; i += 7) {
    const g = data.slice(i, i + 7);
    weeks.push({
      date: g[0].date,
      date2: g[g.length - 1].date,
      sales: g.reduce((a, d) => a + d.sales, 0),
      orders: g.reduce((a, d) => a + d.orders, 0),
    });
  }
  return weeks;
}

export default function DashboardChart({ data, range }: Props) {
  const { fmt: bn, currency } = useCurrency();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [tip, setTip] = useState<{
    x: number;
    y: number;
    label: string;
    sales: number;
    orders: number;
  } | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const displayData =
    range === 90
      ? groupWeekly(data)
      : (data as (ChartDay & { date2?: string })[]);

  const total = displayData.reduce((a, d) => a + d.sales, 0);

  useEffect(() => {
    function build() {
      const box = wrapRef.current;
      if (!box) return;
      const W = Math.max(320, box.clientWidth || 700);
      const H = 260;
      const pad = { l: 56, r: 8, t: 12, b: 28 };
      const iw = W - pad.l - pad.r;
      const ih = H - pad.t - pad.b;
      const max = Math.max(...displayData.map((d) => d.sales), 1);
      const step = Math.pow(10, Math.floor(Math.log10(max))) / 2;
      const top = Math.ceil(max / step) * step;
      const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * top);
      const bw = iw / displayData.length;
      const gap = Math.max(2, bw * (range === 7 ? 0.45 : 0.28));
      const w = Math.max(3, bw - gap);
      const lblEvery = range === 7 ? 1 : range === 30 ? 5 : 2;
      const r = Math.min(4, w / 2);

      function barPath(x: number, y: number, bwid: number, h: number) {
        if (h <= 0) return "";
        return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + bwid - r}Q${x + bwid},${y} ${x + bwid},${y + r}V${y + h}Z`;
      }

      const fmtK = (v: number) =>
        v >= 1000 ? (v / 1000).toFixed(v % 1000 ? 1 : 0) + "k" : String(v);

      const lines = ticks
        .map((v) => {
          const y = pad.t + ih - (v / top) * ih;
          return `<line class="grid-line" x1="${pad.l}" x2="${W - pad.r}" y1="${y}" y2="${y}"/><text class="axis-t" x="${pad.l - 10}" y="${y + 4}" text-anchor="end">${currency.symbol}${fmtK(v)}</text>`;
        })
        .join("");

      const bars = displayData
        .map((d, i) => {
          const x = pad.l + i * bw + gap / 2;
          const h = top > 0 ? (d.sales / top) * ih : 0;
          const y = pad.t + ih - h;
          const lbl =
            range === 7
              ? weekday(d.date)
              : i % lblEvery === 0
                ? shortDate(d.date)
                : "";
          return `<path class="bar" data-i="${i}" d="${barPath(x, y, w, h)}"/>
          ${lbl ? `<text class="axis-t" x="${x + w / 2}" y="${H - 8}" text-anchor="middle">${lbl}</text>` : ""}
          <rect class="bar-hit" data-i="${i}" x="${pad.l + i * bw}" y="${pad.t}" width="${bw}" height="${ih}" rx="0"/>`;
        })
        .join("");

      setSvg(
        `<svg width="100%" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">${lines}${bars}</svg>`,
      );
    }
    build();
    const obs = new ResizeObserver(build);
    if (wrapRef.current) obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, [displayData, range]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const target = (e.target as Element).closest("[data-i]") as HTMLElement;
    if (!target || !wrapRef.current) return;
    const i = parseInt(target.dataset.i ?? "0");
    const d = displayData[i];
    const rect = wrapRef.current.getBoundingClientRect();
    setHoveredIdx(i);
    setTip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top - 60,
      label:
        d.date2
          ? `${shortDate(d.date)} – ${shortDate(d.date2)}`
          : (range === 7 ? weekday(d.date) + " · " + shortDate(d.date) : shortDate(d.date)),
      sales: d.sales,
      orders: d.orders,
    });
  }

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display font-bold text-lg">Daily Sales ({currency.symbol})</h2>
          <p className="text-sm text-[var(--mute)]">
            {bn(total)} total in the last {range} days
            {range === 90 ? " · weekly" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="text-sm font-semibold underline underline-offset-4 text-[var(--mute)] hover:text-[var(--ink)]"
        >
          {showTable ? "View chart" : "View table"}
        </button>
      </div>

      {!showTable ? (
        <div
          ref={wrapRef}
          className={`chart-wrap${hoveredIdx !== null ? " hovering" : ""}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {
            setTip(null);
            setHoveredIdx(null);
          }}
          dangerouslySetInnerHTML={{ __html: svg }}
          style={{ minHeight: 260 }}
        />
      ) : (
        <div className="max-h-72 overflow-y-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>Date</th>
                <th>Orders</th>
                <th>Sales</th>
              </tr>
            </thead>
            <tbody>
              {[...displayData].reverse().map((d) => (
                <tr key={d.date}>
                  <td>
                    {d.date2
                      ? `${shortDate(d.date)} – ${shortDate(d.date2)}`
                      : shortDate(d.date)}
                  </td>
                  <td>{bnNum(d.orders)}</td>
                  <td>{bn(d.sales)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tip && (
        <div
          className="tip card px-3 py-2 text-xs pointer-events-none show"
          style={{ left: tip.x, top: tip.y }}
        >
          <span className="text-[var(--mute)] block">{tip.label}</span>
          <b className="font-display text-sm">{bn(tip.sales)}</b>{" "}
          <span className="text-[var(--mute)]">· {bnNum(tip.orders)} orders</span>
        </div>
      )}
    </section>
  );
}
