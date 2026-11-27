"use client";

import { PRODUCT_LIMITS } from "@/db/validation/product.validation";
import FormSection, { FieldError, PlusIcon, XIcon } from "./FormSection";
import { uid, type ChartRow } from "./formTypes";

interface Props {
  rows: ChartRow[];
  sizes: string[];
  error?: string;
  onChange: (rows: ChartRow[]) => void;
}

const MEASURES = [
  { key: "chest", label: "Chest (in)" },
  { key: "length", label: "Length (in)" },
  { key: "sleeve", label: "Sleeve (in)" },
] as const;

const measureInput = (v: string) => v.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1").slice(0, 6);

export default function ProductSizeChart({ rows, sizes, error, onChange }: Props) {
  const set = (id: string, patch: Partial<ChartRow>) =>
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const matchSizes = () => {
    const byName = new Map(rows.map((r) => [r.size, r]));
    onChange(sizes.map((s) => byName.get(s) ?? { id: uid("row"), size: s, chest: "", length: "", sleeve: "" }));
  };

  const full = rows.length >= PRODUCT_LIMITS.chartRowsMax;

  return (
    <FormSection
      id="sec-chart"
      title="Size Chart"
      description="Optional · measurements in inches, shown on the product page"
      icon={<><path d="M3 8h18v8H3z" /><path d="M7 8v3M11 8v4M15 8v3M19 8v4" /></>}
      action={
        <button type="button" className="btn-ghost !h-9 !px-3 text-xs" disabled={!sizes.length} onClick={matchSizes}>
          Match sizes
        </button>
      }
    >
      {rows.length > 0 && (
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="chart-t">
            <thead>
              <tr>
                <th>Size</th>
                {MEASURES.map((m) => <th key={m.key}>{m.label}</th>)}
                <th className="w-12"><span className="sr-only">Remove</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id}>
                  <td>
                    <input
                      className="inp"
                      value={r.size}
                      placeholder="Size"
                      maxLength={6}
                      aria-label={`Row ${i + 1} size`}
                      onChange={(e) => set(r.id, { size: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })}
                    />
                  </td>
                  {MEASURES.map((m) => (
                    <td key={m.key}>
                      <input
                        className="inp"
                        inputMode="decimal"
                        value={r[m.key]}
                        placeholder="—"
                        aria-label={`Row ${i + 1} ${m.key}`}
                        onChange={(e) => set(r.id, { [m.key]: measureInput(e.target.value) })}
                      />
                    </td>
                  ))}
                  <td>
                    <button type="button" className="icon-btn" aria-label={`Remove row ${i + 1}`} onClick={() => onChange(rows.filter((x) => x.id !== r.id))}>
                      <XIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button
        type="button"
        className="add-row mt-3"
        disabled={full}
        onClick={() => onChange([...rows, { id: uid("row"), size: "", chest: "", length: "", sleeve: "" }])}
      >
        <PlusIcon className="w-4 h-4" />
        {full ? `Maximum ${PRODUCT_LIMITS.chartRowsMax} rows` : "Add Row"}
      </button>
      <p className="hint">
        <FieldError id="sizeChart-err" message={error} />
      </p>
    </FormSection>
  );
}
