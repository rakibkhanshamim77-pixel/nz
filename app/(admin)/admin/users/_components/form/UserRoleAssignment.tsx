"use client";

import FormSection, { FieldError } from "../../../products/_components/form/FormSection";
import { ROLES, ROLE_DESCRIPTION, ROLE_LABEL, type Role } from "@/db/permissions";
import { RoleTileIcon } from "../UserBadges";
import type { UserFormErrors } from "./userFormTypes";

interface Props {
  role: Role;
  errors: UserFormErrors;
  /** Only an administrator may create or promote an administrator */
  canAssignAdmin: boolean;
  /** Nobody may change their own role */
  locked: boolean;
  onChange: (role: Role) => void;
}

export default function UserRoleAssignment({
  role,
  errors,
  canAssignAdmin,
  locked,
  onChange,
}: Props) {
  return (
    <FormSection
      id="sec-role"
      title="Role Assignment"
      description="A role decides which admin modules this account can be given"
      icon={
        <>
          <path d="M12 3 5 6v6c0 4.2 2.8 7.4 7 9 4.2-1.6 7-4.8 7-9V6z" />
          <path d="m9 12 2 2 4-4" />
        </>
      }
    >
      {locked && (
        <p className="text-sm text-[var(--mute)] leading-relaxed mb-4" role="status">
          This is your own account, so you can&apos;t change its role. Ask another administrator.
        </p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" role="radiogroup" aria-label="Role">
        {ROLES.map((r) => {
          const blocked = locked || (r === "admin" && !canAssignAdmin);
          const reason =
            r === "admin" && !canAssignAdmin && !locked
              ? "Only an administrator can assign this role"
              : null;

          return (
            <label key={r} className={`role-card ${blocked ? "opacity-55" : ""}`}>
              <input
                type="radio"
                name="user-role"
                value={r}
                checked={role === r}
                disabled={blocked}
                onChange={() => onChange(r)}
              />
              <span className={`rc ${blocked ? "!cursor-not-allowed" : ""}`}>
                <span className="tick" aria-hidden="true">
                  <svg fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path d="m5 12 5 5L20 7" />
                  </svg>
                </span>
                <span className="rtile" aria-hidden="true">
                  <RoleTileIcon role={r} />
                </span>
                <span className="block">
                  <b className="font-display text-[15px] block">{ROLE_LABEL[r]}</b>
                  <span className="text-xs text-[var(--mute)] leading-snug block mt-1">
                    {ROLE_DESCRIPTION[r]}
                  </span>
                </span>
                {reason && (
                  <span className="text-[11px] font-bold text-[var(--mute)] mt-auto">{reason}</span>
                )}
              </span>
            </label>
          );
        })}
      </div>

      <p className="hint">
        <FieldError message={errors.role} />
      </p>
    </FormSection>
  );
}
