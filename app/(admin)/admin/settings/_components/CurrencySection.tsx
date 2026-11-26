"use client";

import { useState } from "react";
import { updateCurrency, updateCurrencyCustom } from "@/db/actions/admin/currency.action";
import { SUPPORTED_CURRENCIES, formatPrice, type CurrencySettings } from "@/db/settings";

interface Props {
  initial: CurrencySettings;
}

export default function CurrencySection({ initial }: Props) {
  const [current, setCurrent] = useState<CurrencySettings>(initial);
  const [customMode, setCustomMode] = useState(
    !SUPPORTED_CURRENCIES.some((c) => c.code === initial.code),
  );
  const [custom, setCustom] = useState<CurrencySettings>(
    customMode ? initial : {
      code: "",
      symbol: "",
      symbolPosition: "before",
      decimalPlaces: 2,
    },
  );
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handlePreset(code: string) {
    setError("");
    setSaved(false);
    setBusy(true);
    const res = await updateCurrency(code);
    setBusy(false);
    if (!res.ok) { setError(res.error); return; }
    setCurrent(res.currency);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleCustomSave() {
    setError("");
    setSaved(false);
    setBusy(true);
    const res = await updateCurrencyCustom(custom);
    setBusy(false);
    if (!res.ok) { setError(res.error); return; }
    setCurrent(res.currency);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const preview = formatPrice(1234.5, current);

  return (
    <section className="card p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display font-bold text-xl flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[var(--soft)] grid place-items-center text-base font-mono">
              {current.symbol}
            </span>
            Currency
          </h2>
          <p className="text-sm text-[var(--mute)] mt-0.5">
            Controls how prices are shown across the store and admin panel.
          </p>
        </div>

        {/* Live preview */}
        <div className="shrink-0 text-right">
          <p className="text-xs text-[var(--mute)] mb-0.5">Preview</p>
          <p className="font-display font-extrabold text-2xl leading-none">{preview}</p>
          <p className="text-xs text-[var(--mute)] mt-1 font-mono">{current.code}</p>
        </div>
      </div>

      {/* Preset grid */}
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--mute)] mb-3">
        Select currency
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
        {SUPPORTED_CURRENCIES.map((c) => {
          const isActive = !customMode && current.code === c.code;
          return (
            <button
              key={c.code}
              type="button"
              disabled={busy}
              onClick={() => {
                setCustomMode(false);
                handlePreset(c.code);
              }}
              className={`flex flex-col items-center gap-1 px-3 py-3 rounded-2xl border text-sm font-medium transition-all disabled:opacity-50 ${
                isActive
                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)] shadow-sm"
                  : "border-[var(--line)] hover:border-[var(--ink)] text-[var(--ink)]"
              }`}
            >
              <span className="text-lg font-mono leading-none">{c.symbol}</span>
              <span className="text-xs font-bold tracking-wide">{c.code}</span>
              <span className={`text-[10px] leading-tight text-center ${isActive ? "text-[var(--bg)]/70" : "text-[var(--mute)]"}`}>
                {c.name}
              </span>
            </button>
          );
        })}

        {/* Custom option */}
        <button
          type="button"
          disabled={busy}
          onClick={() => setCustomMode(true)}
          className={`flex flex-col items-center gap-1 px-3 py-3 rounded-2xl border text-sm font-medium transition-all disabled:opacity-50 ${
            customMode
              ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)] shadow-sm"
              : "border-dashed border-[var(--line)] hover:border-[var(--ink)] text-[var(--mute)]"
          }`}
        >
          <span className="text-lg leading-none">✎</span>
          <span className="text-xs font-bold tracking-wide">Custom</span>
          <span className={`text-[10px] leading-tight ${customMode ? "text-[var(--bg)]/70" : "text-[var(--mute)]"}`}>
            Any currency
          </span>
        </button>
      </div>

      {/* Custom fields */}
      {customMode && (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--soft)] p-4 mb-4 space-y-4">
          <p className="text-xs font-semibold text-[var(--mute)] uppercase tracking-widest">Custom currency</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="field block">
              <span className="lbl">Currency code</span>
              <input
                className="inp"
                value={custom.code}
                onChange={(e) => setCustom((p) => ({ ...p, code: e.target.value.toUpperCase().slice(0, 10) }))}
                placeholder="USD"
                maxLength={10}
              />
            </label>
            <label className="field block">
              <span className="lbl">Symbol</span>
              <input
                className="inp"
                value={custom.symbol}
                onChange={(e) => setCustom((p) => ({ ...p, symbol: e.target.value.slice(0, 10) }))}
                placeholder="$"
                maxLength={10}
              />
            </label>
            <label className="field block">
              <span className="lbl">Symbol position</span>
              <div className="sel-wrap block">
                <select
                  className="inp"
                  value={custom.symbolPosition}
                  onChange={(e) =>
                    setCustom((p) => ({
                      ...p,
                      symbolPosition: e.target.value as "before" | "after",
                    }))
                  }
                >
                  <option value="before">Before amount ($100)</option>
                  <option value="after">After amount (100 $)</option>
                </select>
              </div>
            </label>
            <label className="field block">
              <span className="lbl">Decimal places</span>
              <div className="sel-wrap block">
                <select
                  className="inp"
                  value={custom.decimalPlaces}
                  onChange={(e) =>
                    setCustom((p) => ({ ...p, decimalPlaces: Number(e.target.value) }))
                  }
                >
                  <option value={0}>0 — whole numbers only</option>
                  <option value={2}>2 — standard (1,234.50)</option>
                  <option value={3}>3 — high precision</option>
                </select>
              </div>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1 text-sm text-[var(--mute)]">
              Preview:{" "}
              <span className="font-bold text-[var(--ink)]">{formatPrice(1234.5, custom)}</span>
            </div>
            <button
              type="button"
              onClick={handleCustomSave}
              disabled={busy || !custom.code || !custom.symbol}
              className="btn-solid disabled:opacity-40"
            >
              {busy ? "Saving…" : "Apply custom"}
            </button>
          </div>
        </div>
      )}

      {/* Error / success */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 font-medium p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 mb-3">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx={12} cy={12} r={10} /><path d="M12 8v4M12 16h.01" />
          </svg>
          {error}
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path d="m5 12 5 5L20 7" />
          </svg>
          Currency updated — prices across the store now use <strong>{current.code}</strong>.
        </div>
      )}
    </section>
  );
}
