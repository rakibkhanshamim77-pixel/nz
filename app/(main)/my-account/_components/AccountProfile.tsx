"use client";

import { useTransition, useState } from "react";
import { updateProfile } from "../actions";
import type { AccountUser } from "./account.types";

type Status = "idle" | "saving" | "success" | "error";

export default function AccountProfile({ user }: { user: AccountUser }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus]       = useState<Status>("idle");
  const [errorMsg, setErrorMsg]   = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setStatus("saving");
    setErrorMsg("");
    startTransition(async () => {
      const result = await updateProfile(formData);
      setStatus(result.success ? "success" : "error");
      if (!result.success) setErrorMsg(result.error);
    });
  }

  return (
    <section id="profile">
      <form className="card p-4 sm:p-7" onSubmit={handleSubmit} noValidate>
        <h2 className="font-display font-bold text-xl mb-1">Profile Information</h2>
        <p className="text-sm text-mute mb-6">This information will be used at checkout.</p>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="lbl">Full Name *</span>
            <input
              name="name"
              className="inp"
              defaultValue={user.name ?? ""}
              autoComplete="name"
              maxLength={60}
              minLength={2}
              required
            />
          </label>

          <label className="block">
            <span className="lbl">Mobile Number</span>
            <input
              className="inp"
              defaultValue={`+88 ${user.phone}`}
              disabled
              aria-label="Mobile number (not changeable)"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="lbl">
              Email <span className="font-medium text-mute">(optional)</span>
            </span>
            <input
              name="email"
              type="email"
              className="inp"
              defaultValue={user.email ?? ""}
              placeholder="you@example.com"
              autoComplete="email"
              maxLength={80}
            />
          </label>
        </div>

        {/* Feedback */}
        {status === "success" && (
          <p className="mt-4 text-sm font-medium text-ink flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            Profile saved.
          </p>
        )}
        {status === "error" && (
          <p role="alert" className="mt-4 text-sm font-medium">⚠ {errorMsg}</p>
        )}

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={isPending}
            className="h-12 px-7 rounded-2xl bg-ink text-bg font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </section>
  );
}
