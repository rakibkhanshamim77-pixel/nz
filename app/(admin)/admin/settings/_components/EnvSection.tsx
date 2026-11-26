"use client";

import { useState, useTransition } from "react";
import { updateEnvValues, type EnvValues } from "@/db/actions/admin/env.admin.action";

const GROUPS = [
  {
    id: "db",
    label: "Database",
    icon: "M4 7a8 3 0 1 0 16 0A8 3 0 1 0 4 7zM4 7v5a8 3 0 0 0 16 0V7M4 12v5a8 3 0 0 0 16 0v-5",
    warn: "Changing MONGO_URI requires a server restart to reconnect.",
    fields: [
      { key: "MONGO_URI", label: "MongoDB URI", secret: true, placeholder: "mongodb+srv://user:pass@cluster.mongodb.net/db" },
    ],
  },
  {
    id: "smtp",
    label: "Email (SMTP)",
    icon: "M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z",
    warn: null,
    fields: [
      { key: "SMTP_HOST",  label: "SMTP Host",     secret: false, placeholder: "smtp.gmail.com" },
      { key: "SMTP_PORT",  label: "SMTP Port",     secret: false, placeholder: "587" },
      { key: "SMTP_USER",  label: "SMTP Username", secret: false, placeholder: "you@gmail.com" },
      { key: "SMTP_PASS",  label: "SMTP Password", secret: true,  placeholder: "App password / SMTP password" },
      { key: "SMTP_FROM",  label: "From Address",  secret: false, placeholder: "you@gmail.com" },
    ],
  },
  {
    id: "google",
    label: "Google OAuth",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
    warn: null,
    fields: [
      { key: "GOOGLE_CLIENT_ID",     label: "Client ID",     secret: false, placeholder: "XXXXXXXX.apps.googleusercontent.com" },
      { key: "GOOGLE_CLIENT_SECRET", label: "Client Secret", secret: true,  placeholder: "GOCSPX-…" },
    ],
  },
  {
    id: "stripe",
    label: "Stripe",
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3z",
    warn: null,
    fields: [
      { key: "STRIPE_SECRET_KEY",                  label: "Secret Key",         secret: true,  placeholder: "sk_live_…" },
      { key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", label: "Publishable Key",    secret: false, placeholder: "pk_live_…" },
      { key: "STRIPE_WEBHOOK_SECRET",              label: "Webhook Secret",     secret: true,  placeholder: "whsec_…" },
    ],
  },
  {
    id: "sms",
    label: "Bulk SMS",
    icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-5 5v-5z",
    warn: null,
    fields: [
      { key: "BULKSMSBD_API_KEY",   label: "API Key",   secret: true,  placeholder: "API key from bulksmsbd.net" },
      { key: "BULKSMSBD_SENDER_ID", label: "Sender ID", secret: false, placeholder: "880XXXXXXXXXX" },
    ],
  },
] as const;

type FieldKey = string;

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <path d="M1 1l22 22" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx={12} cy={12} r={3} />
    </svg>
  );
}

function EnvGroup({
  group,
  values,
}: {
  group: typeof GROUPS[number];
  values: EnvValues;
}) {
  const [fields, setFields] = useState<Record<FieldKey, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of group.fields) init[f.key] = values[f.key] ?? "";
    return init;
  });
  const [revealed, setRevealed] = useState<Record<FieldKey, boolean>>({});
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  function handleSave() {
    setSaved(false);
    setErr("");
    startTransition(async () => {
      const res = await updateEnvValues(fields);
      if (!res.ok) { setErr(res.error); return; }
      setSaved(true);
    });
  }

  return (
    <div className="rounded-2xl border border-[var(--line)] overflow-hidden">
      {/* Group header */}
      <div className="flex items-center gap-3 px-5 py-3.5 bg-[var(--soft)] border-b border-[var(--line)]">
        <span className="w-7 h-7 rounded-lg bg-[var(--ink)] grid place-items-center shrink-0">
          <svg className="w-3.5 h-3.5 text-[var(--bg)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d={group.icon} />
          </svg>
        </span>
        <span className="font-semibold text-sm">{group.label}</span>
      </div>

      {/* Fields */}
      <div className="p-5 space-y-4 bg-[var(--bg)]">
        {group.warn && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M12 9v4M12 17h.01M10.3 3.9 2.5 17.5A2 2 0 0 0 4.2 20.5h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
            </svg>
            {group.warn}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {group.fields.map((f) => {
            const isSecret = f.secret;
            const show = revealed[f.key];
            return (
              <label key={f.key} className="field block">
                <span className="lbl">{f.label}</span>
                <div className="relative">
                  <input
                    type={isSecret && !show ? "password" : "text"}
                    className="inp pr-10 font-mono text-sm"
                    value={fields[f.key]}
                    onChange={(e) => { setFields((p) => ({ ...p, [f.key]: e.target.value })); setSaved(false); }}
                    placeholder={f.placeholder}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {isSecret && (
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setRevealed((p) => ({ ...p, [f.key]: !p[f.key] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--mute)] hover:text-[var(--ink)] transition-colors"
                      aria-label={show ? "Hide" : "Show"}
                    >
                      <EyeIcon open={!show} />
                    </button>
                  )}
                </div>
                <span className="text-[11px] text-[var(--mute)] mt-1 block font-mono select-all">{f.key}</span>
              </label>
            );
          })}
        </div>

        {err && <p className="text-sm text-red-600 font-medium">⚠ {err}</p>}
        {saved && (
          <p className="text-sm text-green-600 font-medium flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24">
              <path d="m5 12 5 5L20 7" />
            </svg>
            Saved — changes are live immediately (email, Stripe, etc.). MONGO_URI needs a server restart.
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="btn-solid disabled:opacity-40"
          >
            {isPending ? "Saving…" : `Save ${group.label}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EnvSection({ values }: { values: EnvValues }) {
  return (
    <section className="space-y-5">
      <div className="flex items-start gap-3">
        <div>
          <h2 className="font-display font-bold text-xl">Environment & Secrets</h2>
          <p className="text-sm text-[var(--mute)] mt-0.5">
            Sensitive configuration stored in <code className="bg-[var(--soft)] px-1 rounded text-xs">.env</code>.
            Changes are written to disk and take effect immediately for most services.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-500 bg-amber-500 px-5 py-3.5 flex items-start gap-3 text-sm text-white">
        <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <rect x={3} y={11} width={18} height={11} rx={2} />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span>
          <b>Super-admin only.</b> These values are written directly to your <code className="bg-white/20 px-1 rounded text-xs">.env</code> file.
          Keep this page private and do not share access with untrusted users.
        </span>
      </div>

      {GROUPS.map((g) => (
        <EnvGroup key={g.id} group={g} values={values} />
      ))}
    </section>
  );
}
