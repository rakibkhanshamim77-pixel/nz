"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveBranding } from "@/db/actions/admin/settings.admin.action";
import type { BrandingSettings } from "@/db/settings";

const PRESET_COLORS = [
  { label: "Wine Red",     value: "#9b2c4a" },
  { label: "Crimson",      value: "#c0392b" },
  { label: "Indigo",       value: "#4f46e5" },
  { label: "Ocean Blue",   value: "#0369a1" },
  { label: "Forest Green", value: "#15803d" },
  { label: "Amber",        value: "#b45309" },
  { label: "Violet",       value: "#7c3aed" },
  { label: "Slate",        value: "#334155" },
];

export default function BrandingSection({ initial }: { initial: BrandingSettings }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  function set(key: keyof BrandingSettings) {
    return (v: string) => {
      setForm((f) => ({ ...f, [key]: v }));
      setSaved(false);
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    startTransition(async () => {
      const res = await saveBranding(form);
      if (!res.ok) { setErr(res.error); return; }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <section className="card p-6">
      <div className="mb-5">
        <h2 className="font-display font-bold text-xl">Branding</h2>
        <p className="text-sm text-[var(--mute)] mt-0.5">
          Logo text and primary accent colour shown across the storefront.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo text fields */}
        <div className="grid sm:grid-cols-3 gap-4">
          <label className="field block">
            <span className="lbl">Short Name</span>
            <input
              type="text"
              className="inp"
              maxLength={4}
              value={form.shortName}
              onChange={(e) => set("shortName")(e.target.value)}
              placeholder="NZ"
            />
            <span className="text-[11px] text-[var(--mute)] mt-1 block">
              2–4 characters shown in the logo square
            </span>
          </label>

          <label className="field block">
            <span className="lbl">Brand Name</span>
            <input
              type="text"
              className="inp"
              maxLength={30}
              value={form.brandName}
              onChange={(e) => set("brandName")(e.target.value)}
              placeholder="NEESHANZ"
            />
          </label>

          <label className="field block">
            <span className="lbl">Tagline</span>
            <input
              type="text"
              className="inp"
              maxLength={40}
              value={form.tagline}
              onChange={(e) => set("tagline")(e.target.value)}
              placeholder="NEXT LEVEL TEES"
            />
            <span className="text-[11px] text-[var(--mute)] mt-1 block">
              Small text below the brand name
            </span>
          </label>
        </div>

        {/* Logo preview */}
        <div className="p-4 rounded-2xl bg-[var(--soft)] flex items-center gap-4">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--mute)] shrink-0">
            Preview
          </span>
          <div className="flex items-center gap-3">
            <span
              className="w-10 h-10 rounded-xl grid place-items-center font-display font-extrabold text-sm"
              style={{ background: form.primaryColor, color: "#fff" }}
            >
              {form.shortName || "NZ"}
            </span>
            <span className="leading-none">
              <b className="font-display text-lg tracking-tight block">
                {form.brandName || "NEESHANZ"}
              </b>
              <span className="text-[10px] tracking-[.28em] text-[var(--mute)]">
                {form.tagline || "NEXT LEVEL TEES"}
              </span>
            </span>
          </div>
        </div>

        {/* Primary color */}
        <div>
          <span className="lbl block mb-2">Primary Accent Colour</span>
          <div className="flex flex-wrap gap-2 mb-3">
            {PRESET_COLORS.map((p) => (
              <button
                key={p.value}
                type="button"
                title={p.label}
                onClick={() => { set("primaryColor")(p.value); setSaved(false); }}
                className="w-8 h-8 rounded-full border-2 transition-all"
                style={{
                  background: p.value,
                  borderColor: form.primaryColor === p.value ? "#000" : "transparent",
                  boxShadow: form.primaryColor === p.value ? "0 0 0 2px #fff, 0 0 0 4px #000" : "none",
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <span className="text-sm text-[var(--mute)]">Custom</span>
              <input
                type="color"
                className="w-10 h-10 rounded-lg cursor-pointer border border-[var(--line)] p-0.5"
                value={form.primaryColor}
                onChange={(e) => set("primaryColor")(e.target.value)}
              />
            </label>
            <input
              type="text"
              className="inp w-32 font-mono text-sm"
              value={form.primaryColor}
              onChange={(e) => set("primaryColor")(e.target.value)}
              placeholder="#9b2c4a"
              maxLength={7}
            />
            <span
              className="w-6 h-6 rounded-full border border-[var(--line)]"
              style={{ background: form.primaryColor }}
            />
          </div>
          <p className="text-[11px] text-[var(--mute)] mt-2">
            Affects buttons, links, badges and accent elements across the entire store.
          </p>
        </div>

        {err && <p className="text-sm text-red-600 font-medium">⚠ {err}</p>}
        {saved && <p className="text-sm text-green-600 font-medium">✓ Saved — storefront updated</p>}

        <div className="flex justify-end">
          <button type="submit" disabled={isPending} className="btn-solid disabled:opacity-40">
            {isPending ? "Saving…" : "Save Branding"}
          </button>
        </div>
      </form>
    </section>
  );
}
