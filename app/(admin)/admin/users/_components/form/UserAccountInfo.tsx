"use client";

import FormSection, { FieldError } from "../../../products/_components/form/FormSection";
import { USER_LIMITS } from "@/db/validation/user.validation";
import type { Role } from "@/db/permissions";
import type { UserFormErrors, UserFormPatch } from "./userFormTypes";

interface Props {
  mode: "create" | "edit";
  role: Role;
  isActive: boolean;
  password: string;
  errors: UserFormErrors;
  /** Edit mode extras, shown read-only */
  createdAt?: string;
  lastLogin?: string | null;
  isPhoneVerified?: boolean;
  /** You can't switch your own account off */
  lockActive?: boolean;
  onChange: (patch: UserFormPatch) => void;
}

const fmtDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "—";

export default function UserAccountInfo({
  mode,
  role,
  isActive,
  password,
  errors,
  createdAt,
  lastLogin,
  isPhoneVerified,
  lockActive,
  onChange,
}: Props) {
  // Customers authenticate with a one-time code, so no password is collected
  const needsPassword = mode === "create" && role !== "user";

  return (
    <FormSection
      id="sec-account"
      title="Account Information"
      description="Sign-in details and account state"
      icon={
        <>
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </>
      }
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 rounded-2xl border border-[var(--line)] p-4 flex items-center justify-between gap-4">
          <span>
            <b className="text-sm block">Account active</b>
            <span className="text-xs text-[var(--mute)]">
              {lockActive
                ? "You can't deactivate your own account"
                : isActive
                  ? "They can sign in right now"
                  : "Sign-in is blocked while this is off"}
            </span>
          </span>
          <span className="switch">
            <input
              type="checkbox"
              checked={isActive}
              disabled={lockActive}
              aria-label="Account active"
              onChange={(e) => onChange({ isActive: e.target.checked })}
            />
            <span />
          </span>
        </div>

        {needsPassword && (
          <label className="block sm:col-span-2">
            <span className="flbl">Password *</span>
            <input
              type="password"
              className={`inp ${errors.password ? "err" : ""}`}
              minLength={USER_LIMITS.passwordMin}
              maxLength={USER_LIMITS.passwordMax}
              placeholder={`At least ${USER_LIMITS.passwordMin} characters`}
              autoComplete="new-password"
              value={password}
              aria-invalid={!!errors.password}
              aria-describedby="password-err"
              onChange={(e) => onChange({ password: e.target.value })}
            />
            <span className="hint">
              <FieldError id="password-err" message={errors.password} />
            </span>
            <p className="hint">Staff and administrators sign in with a phone number and password.</p>
          </label>
        )}

        {mode === "create" && role === "user" && (
          <p className="sm:col-span-2 text-sm text-[var(--mute)] leading-relaxed">
            Customer accounts sign in with a one-time code sent to their phone, so there&apos;s no
            password to set.
          </p>
        )}

        {mode === "edit" && (
          <>
            <div className="rounded-2xl border border-[var(--line)] p-4">
              <span className="flbl !mb-1">Registered</span>
              <b className="text-sm">{fmtDate(createdAt)}</b>
            </div>
            <div className="rounded-2xl border border-[var(--line)] p-4">
              <span className="flbl !mb-1">Last login</span>
              <b className="text-sm">{lastLogin ? fmtDate(lastLogin) : "Never"}</b>
            </div>
            <div className="sm:col-span-2 rounded-2xl border border-[var(--line)] p-4 flex items-center justify-between gap-3">
              <span>
                <b className="text-sm block">Phone verified</b>
                <span className="text-xs text-[var(--mute)]">
                  Set when they first sign in with a one-time code
                </span>
              </span>
              <span className={`badge ${isPhoneVerified ? "solid" : "dash"}`}>
                {isPhoneVerified ? "Verified" : "Not yet"}
              </span>
            </div>
            <p className="sm:col-span-2 hint">
              Passwords aren&apos;t shown or changed here.
            </p>
          </>
        )}
      </div>
    </FormSection>
  );
}
