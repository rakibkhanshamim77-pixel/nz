"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveContent } from "../_actions/contentAdminActions";
import type { OrderEmailsContent } from "@/db/content";

const STATUSES = [
  { key: "placed",     label: "Order Placed",   desc: "Sent immediately when a customer places an order" },
  { key: "confirmed",  label: "Confirmed",       desc: "Payment verified, order accepted" },
  { key: "processing", label: "Packing",         desc: "Order is being packed" },
  { key: "shipped",    label: "Shipped",         desc: "Order handed to courier" },
  { key: "delivered",  label: "Delivered",       desc: "Order delivered to customer" },
  { key: "cancelled",  label: "Cancelled",       desc: "Order was cancelled" },
  { key: "returned",   label: "Returned",        desc: "Return process started" },
  { key: "refunded",   label: "Refunded",        desc: "Refund processed" },
] as const;

type StatusKey = typeof STATUSES[number]["key"];

function subjectField(k: StatusKey): keyof OrderEmailsContent {
  return `${k}Subject` as keyof OrderEmailsContent;
}
function bodyField(k: StatusKey): keyof OrderEmailsContent {
  return `${k}Body` as keyof OrderEmailsContent;
}

export default function OrderEmailsForm({ initial }: { initial: OrderEmailsContent }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");
  const [active, setActive] = useState<StatusKey>("placed");

  function set(key: keyof OrderEmailsContent) {
    return (v: string) => {
      setForm((f) => ({ ...f, [key]: v }));
      setSaved(false);
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    startTransition(async () => {
      const res = await saveContent("order-emails", form);
      if (!res.ok) { setErr(res.error); return; }
      setSaved(true);
      router.refresh();
    });
  }

  const current = STATUSES.find((s) => s.key === active)!;

  return (
    <div className="card p-6 max-w-3xl">
      <div className="mb-5">
        <h2 className="font-display font-bold text-xl">Order Email Messages</h2>
        <p className="text-sm text-[var(--mute)] mt-0.5">
          Customise the subject and body for each order status email.
          Use <code className="bg-[var(--soft)] px-1 rounded text-xs">{"{{name}}"}</code> and{" "}
          <code className="bg-[var(--soft)] px-1 rounded text-xs">{"{{orderNumber}}"}</code> as placeholders.
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {STATUSES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setActive(s.key)}
            className={`h-8 px-3.5 rounded-xl text-sm font-medium transition-colors border ${
              active === s.key
                ? "bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)]"
                : "bg-[var(--bg)] text-[var(--mute)] border-[var(--line)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Active status editor */}
        <div className="rounded-2xl border border-[var(--line)] p-5 space-y-4">
          <div>
            <p className="font-semibold text-sm">{current.label}</p>
            <p className="text-xs text-[var(--mute)] mt-0.5">{current.desc}</p>
          </div>

          <label className="field block">
            <span className="lbl">Subject line</span>
            <input
              type="text"
              className="inp"
              value={form[subjectField(active)] as string}
              onChange={(e) => set(subjectField(active))(e.target.value)}
              placeholder={`e.g. Your order {{orderNumber}} has been confirmed`}
            />
          </label>

          <label className="field block">
            <span className="lbl">Message body</span>
            <textarea
              rows={4}
              className="inp"
              style={{ height: "auto", paddingTop: 12, paddingBottom: 12 }}
              value={form[bodyField(active)] as string}
              onChange={(e) => set(bodyField(active))(e.target.value)}
              placeholder={`Write the email body. Use {{name}} and {{orderNumber}} as placeholders.`}
            />
          </label>

          {/* Live preview */}
          <div className="rounded-xl bg-[var(--soft)] p-4 text-sm space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--mute)] mb-2">Preview</p>
            <p><span className="text-[var(--mute)] text-xs">Subject: </span>
              <b>{(form[subjectField(active)] as string)
                .replace("{{name}}", "Md Shamim")
                .replace("{{orderNumber}}", "NEE-20261126-XXXXX")}</b>
            </p>
            <p className="text-[var(--mute)] text-xs mt-1">Body:</p>
            <p className="leading-relaxed">
              {(form[bodyField(active)] as string)
                .replace("{{name}}", "Md Shamim")
                .replace("{{orderNumber}}", "NEE-20261126-XXXXX")}
            </p>
          </div>
        </div>

        {err && <p className="text-sm text-red-600 font-medium">⚠ {err}</p>}
        {saved && <p className="text-sm text-green-600 font-medium">✓ Saved — email templates updated</p>}

        <div className="flex justify-end">
          <button type="submit" disabled={isPending} className="btn-solid disabled:opacity-40">
            {isPending ? "Saving…" : "Save All Templates"}
          </button>
        </div>
      </form>
    </div>
  );
}
