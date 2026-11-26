"use client";

export default function ProductFeaturedToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <section className="card sec">
      <label className="flex items-start justify-between gap-4 cursor-pointer">
        <span>
          <b className="font-display font-bold text-lg block">Featured Product</b>
          <span className="text-sm text-[var(--mute)]">Show in the home page hero slider and featured lists.</span>
        </span>
        <span className="switch mt-1">
          <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-label="Featured product" />
          <span />
        </span>
      </label>
    </section>
  );
}
