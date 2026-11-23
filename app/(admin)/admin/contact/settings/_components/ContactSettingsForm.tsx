"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/(admin)/_components/AdminToast";
import { updateContactSettings } from "@/db/actions/admin/contact.settings.action";
import type { ContactSettings } from "@/db/settings";

interface Props {
  initial: ContactSettings;
}

export default function ContactSettingsForm({ initial }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<ContactSettings>({ ...initial });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  function set<K extends keyof ContactSettings>(k: K, v: ContactSettings[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setDirty(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const r = await updateContactSettings(form);
    setSaving(false);
    if (r.ok) {
      toast.success("Settings saved");
      setDirty(false);
      router.refresh();
    } else {
      toast.error(r.error || "Failed to save");
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Hero */}
      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-[var(--mute)]">Hero Section</h3>
        <label className="field block">
          <span className="lbl">Hero Title</span>
          <input className="inp" value={form.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} />
        </label>
        <label className="field block">
          <span className="lbl">Hero Description</span>
          <textarea rows={2} className="inp" style={{ height: "auto", paddingTop: 10, paddingBottom: 10 }} value={form.heroDescription} onChange={(e) => set("heroDescription", e.target.value)} />
        </label>
      </div>

      {/* Contact Info */}
      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-[var(--mute)]">Contact Information</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="field block">
            <span className="lbl">Phone Number</span>
            <input className="inp" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+880 1700 000000" />
          </label>
          <label className="field block">
            <span className="lbl">WhatsApp Number</span>
            <input className="inp" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+880 1700 000000" />
          </label>
          <label className="field block">
            <span className="lbl">Support Email</span>
            <input type="email" className="inp" value={form.supportEmail} onChange={(e) => set("supportEmail", e.target.value)} />
          </label>
          <label className="field block">
            <span className="lbl">Business Hours</span>
            <input className="inp" value={form.businessHours} onChange={(e) => set("businessHours", e.target.value)} placeholder="Sat–Thu, 10 AM – 8 PM" />
          </label>
        </div>
        <label className="field block">
          <span className="lbl">Business Address</span>
          <textarea rows={2} className="inp" style={{ height: "auto", paddingTop: 10, paddingBottom: 10 }} value={form.address} onChange={(e) => set("address", e.target.value)} />
        </label>
      </div>

      {/* Social Links */}
      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-[var(--mute)]">Social Links</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="field block">
            <span className="lbl">Facebook URL</span>
            <input className="inp" value={form.facebook} onChange={(e) => set("facebook", e.target.value)} placeholder="https://facebook.com/neeshanz" />
          </label>
          <label className="field block">
            <span className="lbl">Instagram URL</span>
            <input className="inp" value={form.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="https://instagram.com/neeshanz" />
          </label>
        </div>
        <label className="field block">
          <span className="lbl">Other Social Links (comma-separated URLs)</span>
          <input className="inp" value={form.otherSocialLinks} onChange={(e) => set("otherSocialLinks", e.target.value)} placeholder="https://tiktok.com/..., https://youtube.com/..." />
        </label>
      </div>

      {/* Map */}
      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-[var(--mute)]">Google Maps</h3>
        <label className="field block">
          <span className="lbl">Google Maps Embed URL</span>
          <input className="inp" value={form.mapUrl} onChange={(e) => set("mapUrl", e.target.value)} placeholder="https://www.google.com/maps/embed?pb=…" />
        </label>
        <p className="text-xs text-[var(--mute)]">Go to Google Maps → Share → Embed a map → copy the src URL from the iframe code.</p>
      </div>

      {/* Form settings */}
      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-[var(--mute)]">Contact Form</h3>
        <label className="flex items-center gap-3 cursor-pointer">
          <span
            className={`relative w-11 h-6 rounded-full transition-colors ${form.formEnabled ? "bg-[var(--ink)]" : "bg-[var(--line)]"}`}
            onClick={() => set("formEnabled", !form.formEnabled)}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.formEnabled ? "translate-x-5" : ""}`} />
          </span>
          <span className="text-sm font-medium">{form.formEnabled ? "Form enabled" : "Form disabled"}</span>
        </label>
        <label className="field block">
          <span className="lbl">Success Message</span>
          <textarea rows={2} className="inp" style={{ height: "auto", paddingTop: 10, paddingBottom: 10 }} value={form.successMessage} onChange={(e) => set("successMessage", e.target.value)} />
        </label>
      </div>

      {/* SEO */}
      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-[var(--mute)]">SEO</h3>
        <label className="field block">
          <span className="lbl">SEO Title</span>
          <input className="inp" value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} />
        </label>
        <label className="field block">
          <span className="lbl">SEO Description</span>
          <textarea rows={2} className="inp" style={{ height: "auto", paddingTop: 10, paddingBottom: 10 }} value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} />
        </label>
      </div>

      <div className="flex justify-end gap-3 pb-8">
        <button type="button" className="btn-ghost" disabled={!dirty || saving} onClick={() => { setForm({ ...initial }); setDirty(false); }}>
          Discard
        </button>
        <button type="submit" className="btn-solid disabled:opacity-40" disabled={saving}>
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
