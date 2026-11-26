"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveContent } from "../_actions/contentAdminActions";
import type { WhyUsContent } from "@/db/content";

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <label className="field block">
      <span className="lbl">{label}</span>
      {multiline ? (
        <textarea
          rows={3}
          className="inp"
          style={{ height: "auto", paddingTop: 12, paddingBottom: 12 }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          type="text"
          className="inp"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </label>
  );
}

function CardSection({
  num,
  title,
  children,
}: {
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line p-5 space-y-4">
      <div className="flex items-center gap-3 mb-1">
        <span className="font-display font-extrabold text-2xl text-ink/20">{num}</span>
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function WhyUsForm({ initial }: { initial: WhyUsContent }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  function set(key: keyof WhyUsContent) {
    return (v: string) => {
      setForm((f) => ({ ...f, [key]: v }));
      setSaved(false);
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    startTransition(async () => {
      const res = await saveContent("why-us", form);
      if (!res.ok) { setErr(res.error); return; }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className="card p-6 max-w-3xl">
      <div className="mb-6">
        <h2 className="font-display font-bold text-xl">Why Choose Us</h2>
        <p className="text-sm text-[var(--mute)] mt-0.5">
          Shown on the homepage in the "Why Choose Us" section.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section heading */}
        <div className="rounded-2xl border border-line p-5 space-y-4">
          <h3 className="font-semibold text-sm">Section Heading</h3>
          <Field label="Tagline (small label)" value={form.tagline} onChange={set("tagline")} placeholder="Why Choose Us" />
          <Field label="Heading" value={form.heading} onChange={set("heading")} placeholder="What makes our clothing different from the rest" />
          <Field label="Subheading" value={form.subheading} onChange={set("subheading")} placeholder="Quality fabric…" multiline />
        </div>

        {/* Card 1 */}
        <CardSection num="01" title="Card 1 — Fabric">
          <Field label="Title" value={form.card1Title} onChange={set("card1Title")} placeholder="100% Cotton, 220 GSM" />
          <Field label="Body text" value={form.card1Body} onChange={set("card1Body")} multiline />
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Stat label" value={form.card1StatLabel} onChange={set("card1StatLabel")} placeholder="Premium Fabric" />
            <Field label="Stat value" value={form.card1StatValue} onChange={set("card1StatValue")} placeholder="220 GSM" />
          </div>
        </CardSection>

        {/* Card 2 */}
        <CardSection num="02" title="Card 2 — Highlighted (centre)">
          <Field label="Badge text" value={form.card2Badge} onChange={set("card2Badge")} placeholder="Our Specialty" />
          <Field label="Title" value={form.card2Title} onChange={set("card2Title")} placeholder="Perfect Fit, with Size Chart" />
          <Field label="Body text" value={form.card2Body} onChange={set("card2Body")} multiline />
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Stat label" value={form.card2StatLabel} onChange={set("card2StatLabel")} placeholder="Measurements on every product" />
            <Field label="Stat value" value={form.card2StatValue} onChange={set("card2StatValue")} placeholder="Chest · Length · Shoulder" />
          </div>
        </CardSection>

        {/* Card 3 */}
        <CardSection num="03" title="Card 3 — Exchange">
          <Field label="Title" value={form.card3Title} onChange={set("card3Title")} placeholder="Free Exchange within 7 Days" />
          <Field label="Body text" value={form.card3Body} onChange={set("card3Body")} multiline />
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Stat label" value={form.card3StatLabel} onChange={set("card3StatLabel")} placeholder="Exchange Charge" />
            <Field label="Stat value" value={form.card3StatValue} onChange={set("card3StatValue")} placeholder="Free" />
          </div>
        </CardSection>

        {/* Live preview */}
        <div className="p-4 rounded-2xl bg-[var(--soft)] text-sm text-[var(--mute)] space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3">Preview</p>
          <p className="text-xs uppercase tracking-widest font-semibold">{form.tagline}</p>
          <p className="font-display font-extrabold text-lg text-[var(--ink)]">{form.heading}</p>
          <p>{form.subheading}</p>
          <div className="grid grid-cols-3 gap-3 mt-3">
            {[
              { title: form.card1Title, stat: `${form.card1StatLabel} · ${form.card1StatValue}` },
              { title: form.card2Title, stat: `${form.card2StatLabel} · ${form.card2StatValue}`, badge: form.card2Badge },
              { title: form.card3Title, stat: `${form.card3StatLabel} · ${form.card3StatValue}` },
            ].map((card, i) => (
              <div key={i} className="rounded-xl border border-line bg-[var(--surface)] p-3">
                {card.badge && <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--mute)]">{card.badge}</span>}
                <p className="font-semibold text-xs text-[var(--ink)] mt-1">{card.title}</p>
                <p className="text-[10px] text-[var(--mute)] mt-1">{card.stat}</p>
              </div>
            ))}
          </div>
        </div>

        {err && <p className="text-sm text-red-600 font-medium">⚠ {err}</p>}
        {saved && <p className="text-sm text-green-600 font-medium">✓ Saved — homepage updated</p>}

        <div className="flex justify-end">
          <button type="submit" disabled={isPending} className="btn-solid disabled:opacity-40">
            {isPending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
