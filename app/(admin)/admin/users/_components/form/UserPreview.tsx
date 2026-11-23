"use client";

import { RoleChip, UserAvatar, UserStatusBadge } from "../UserBadges";
import { statusOf } from "../types";
import type { UserFormState } from "./userFormTypes";

interface Props {
  form: UserFormState;
  /** Edit mode: verification comes from the stored account, not the form */
  isPhoneVerified: boolean;
}

export default function UserPreview({ form, isPhoneVerified }: Props) {
  const status = statusOf({ isActive: form.isActive, isPhoneVerified });

  return (
    <section className="card sec" aria-labelledby="preview-title">
      <header className="sec-h !mb-4">
        <div className="flex-1 min-w-0">
          <h2 id="preview-title" className="font-display">
            Preview
          </h2>
          <p>How this account appears in the list</p>
        </div>
      </header>

      <div className="flex items-center gap-3 p-3 rounded-2xl border border-[var(--line)]">
        <UserAvatar
          name={form.name}
          phone={form.phone}
          image={form.profileImage.trim() || undefined}
          size={40}
        />
        <div className="min-w-0 flex-1">
          <b className="block truncate">{form.name.trim() || "Full name"}</b>
          <span className="text-xs text-[var(--mute)] block truncate">
            {form.email.trim() || form.phone.trim() || "No contact details yet"}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <RoleChip role={form.role} />
        <UserStatusBadge status={status} />
      </div>
    </section>
  );
}
