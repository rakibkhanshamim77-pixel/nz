"use client";

import { useState } from "react";

const CATEGORIES = [
  { value: "general", label: "General Inquiry" },
  { value: "order", label: "Order Related" },
  { value: "product", label: "Product Information" },
  { value: "delivery", label: "Delivery Information" },
  { value: "return_exchange", label: "Return & Exchange" },
  { value: "payment", label: "Payment Issue" },
  { value: "complaint", label: "Complaint" },
  { value: "other", label: "Other" },
];

interface Props {
  successMessage: string;
}

export default function ContactForm({ successMessage }: Props) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "general",
    orderId: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Please enter a valid email";
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (!form.message.trim()) e.message = "Message is required";
    else if (form.message.trim().length < 20)
      e.message = "Message must be at least 20 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          subject: form.subject.trim(),
          category: form.category,
          orderId: form.orderId.trim() || undefined,
          message: form.message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setSubmitError(data.error || "Something went wrong"); return; }
      setReferenceId(data.referenceId);
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (referenceId) {
    return (
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 grid place-items-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="m5 12 5 5L20 7" />
          </svg>
        </div>
        <h3 className="font-display font-bold text-xl mb-2 text-[var(--ink)]">Message Sent!</h3>
        <p className="text-[var(--mute)] mb-4">{successMessage}</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--soft)] border border-[var(--line)]">
          <span className="text-sm text-[var(--mute)]">Reference ID:</span>
          <span className="text-sm font-bold font-mono text-[var(--ink)]">{referenceId}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 sm:p-8">
      <h2 className="font-display font-bold text-xl text-[var(--ink)] mb-6">Send a Message</h2>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="field block">
            <span className="lbl">Full Name *</span>
            <input
              className={`inp ${errors.name ? "border-red-400" : ""}`}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </label>
          <label className="field block">
            <span className="lbl">Email Address *</span>
            <input
              type="email"
              className={`inp ${errors.email ? "border-red-400" : ""}`}
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="field block">
            <span className="lbl">Phone Number</span>
            <input
              type="tel"
              className="inp"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="Optional"
              autoComplete="tel"
            />
          </label>
          <label className="field block">
            <span className="lbl">Order ID</span>
            <input
              className="inp"
              value={form.orderId}
              onChange={(e) => set("orderId", e.target.value)}
              placeholder="e.g. NEE-20250101-XXXX"
            />
          </label>
        </div>

        <label className="field block">
          <span className="lbl">Inquiry Category *</span>
          <select
            className="inp"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </label>

        <label className="field block">
          <span className="lbl">Subject *</span>
          <input
            className={`inp ${errors.subject ? "border-red-400" : ""}`}
            value={form.subject}
            onChange={(e) => set("subject", e.target.value)}
            placeholder="Brief description of your inquiry"
          />
          {errors.subject && <p className="text-xs text-red-600 mt-1">{errors.subject}</p>}
        </label>

        <label className="field block">
          <span className="lbl">Message *</span>
          <textarea
            rows={5}
            className={`inp ${errors.message ? "border-red-400" : ""}`}
            style={{ height: "auto", paddingTop: 12, paddingBottom: 12 }}
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            placeholder="Please describe your issue in detail (minimum 20 characters)"
          />
          <div className="flex justify-between items-center mt-1">
            {errors.message ? (
              <p className="text-xs text-red-600">{errors.message}</p>
            ) : (
              <span />
            )}
            <span className="text-xs text-[var(--mute)]">{form.message.length}/2000</span>
          </div>
        </label>

        {submitError && (
          <p className="text-sm text-red-600 font-medium">⚠ {submitError}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-solid w-full disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Sending…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="m22 2-7 20-4-9-9-4 20-7z" />
              </svg>
              Send Message
            </>
          )}
        </button>
      </form>
    </div>
  );
}
