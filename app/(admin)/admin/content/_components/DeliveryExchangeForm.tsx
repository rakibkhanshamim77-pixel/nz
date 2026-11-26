"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveContent } from "../_actions/contentAdminActions";
import type { DeliveryExchangeContent } from "@/db/content";

export default function DeliveryExchangeForm({
  initial,
}: {
  initial: DeliveryExchangeContent;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    startTransition(async () => {
      const res = await saveContent("delivery-exchange", form);
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className="card p-6 max-w-2xl">
      <div className="mb-6">
        <h2 className="font-display font-bold text-xl">Delivery & Exchange</h2>
        <p className="text-sm text-[var(--mute)] mt-0.5">
          Shown in the "Delivery & Exchange" accordion on each product page.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="field block">
          <span className="lbl">First paragraph (Delivery)</span>
          <textarea
            rows={3}
            className="inp"
            style={{ height: "auto", paddingTop: 12, paddingBottom: 12 }}
            value={form.paragraph1}
            onChange={(e) => {
              setForm((f) => ({ ...f, paragraph1: e.target.value }));
              setSaved(false);
            }}
            placeholder="Inside Dhaka $60…"
            required
          />
        </label>

        <label className="field block">
          <span className="lbl">Second paragraph (Exchange)</span>
          <textarea
            rows={3}
            className="inp"
            style={{ height: "auto", paddingTop: 12, paddingBottom: 12 }}
            value={form.paragraph2}
            onChange={(e) => {
              setForm((f) => ({ ...f, paragraph2: e.target.value }));
              setSaved(false);
            }}
            placeholder="If size doesn't fit, exchange within 7 days…"
          />
        </label>

        {/* Preview */}
        <div className="p-4 rounded-2xl bg-[var(--soft)] space-y-2 text-sm text-[var(--mute)]">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--mute)] mb-2">
            Preview — Delivery & Exchange
          </p>
          {form.paragraph1 && <p>{form.paragraph1}</p>}
          {form.paragraph2 && <p>{form.paragraph2}</p>}
        </div>

        {err && <p className="text-sm text-red-600 font-medium">⚠ {err}</p>}
        {saved && (
          <p className="text-sm text-green-600 font-medium">
            ✓ Saved
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="btn-solid disabled:opacity-40"
          >
            {isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
