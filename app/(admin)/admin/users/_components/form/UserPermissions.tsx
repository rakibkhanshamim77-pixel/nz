"use client";

import { useState } from "react";
import FormSection, { FieldError } from "../../../products/_components/form/FormSection";
import {
  PERMISSIONS,
  PERMISSION_GROUPS,
  PERMISSION_KEYS,
  permissionsInGroup,
  type Permission,
  type PermissionMeta,
  type Role,
} from "@/db/permissions";
import type { UserFormErrors } from "./userFormTypes";

interface Props {
  role: Role;
  permissions: Permission[];
  errors: UserFormErrors;
  /** The viewer can only grant what they hold themselves */
  grantable: Permission[];
  /** Nobody may change their own permissions */
  locked: boolean;
  onChange: (permissions: Permission[]) => void;
}

const GROUP_ICON: Record<PermissionMeta["group"], React.ReactNode> = {
  Commerce: (
    <>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
    </>
  ),
  People: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6" />
    </>
  ),
  System: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </>
  ),
};

export default function UserPermissions({
  role,
  permissions,
  errors,
  grantable,
  locked,
  onChange,
}: Props) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set(PERMISSION_GROUPS));

  // Administrators hold every permission implicitly; customers get no admin modules
  const readOnly = role === "admin";
  const disabled = role === "user";
  const editable = !readOnly && !disabled && !locked;

  const shown: Permission[] = readOnly ? [...PERMISSION_KEYS] : permissions;
  const has = (p: Permission) => shown.includes(p);

  function toggle(p: Permission) {
    if (!editable || !grantable.includes(p)) return;
    onChange(has(p) ? permissions.filter((x) => x !== p) : [...permissions, p]);
  }

  function setGroup(group: PermissionMeta["group"], on: boolean) {
    if (!editable) return;
    const keys = permissionsInGroup(group).filter((p) => grantable.includes(p));
    const next = new Set(permissions);
    keys.forEach((k) => (on ? next.add(k) : next.delete(k)));
    onChange(PERMISSION_KEYS.filter((k) => next.has(k)));
  }

  const allOpen = openGroups.size === PERMISSION_GROUPS.length;

  return (
    <FormSection
      id="sec-permissions"
      title="Permissions"
      description={
        readOnly
          ? "Administrators always hold every module. Change the role to restrict access."
          : disabled
            ? "Customer accounts have no access to the admin panel."
            : "Pick exactly which admin modules this account can open."
      }
      compact
      icon={
        <>
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3M12 15v2" />
        </>
      }
      action={
        !disabled && (
          <button
            type="button"
            className="mini-btn hidden sm:inline-flex"
            onClick={() =>
              setOpenGroups(allOpen ? new Set() : new Set(PERMISSION_GROUPS))
            }
          >
            {allOpen ? "Collapse all" : "Expand all"}
          </button>
        )
      }
    >
      {locked && !readOnly && (
        <p className="text-sm text-[var(--mute)] leading-relaxed mb-4" role="status">
          This is your own account, so you can&apos;t change its permissions.
        </p>
      )}

      {disabled ? (
        <p className="text-sm text-[var(--mute)] leading-relaxed">
          Switch the role to <b className="text-[var(--ink)]">Staff</b> above to assign admin
          modules.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`badge ${shown.length ? "solid" : "ghost"}`}>
              {readOnly ? "All modules" : `${shown.length} of ${PERMISSION_KEYS.length} enabled`}
            </span>
          </div>

          {PERMISSION_GROUPS.map((group) => {
            const keys = permissionsInGroup(group);
            const on = keys.filter(has).length;
            const state = on === 0 ? "" : on === keys.length ? "full" : "part";
            const isOpen = openGroups.has(group);

            return (
              <details
                key={group}
                className="pg-card"
                open={isOpen}
                onToggle={(e) => {
                  const next = new Set(openGroups);
                  if ((e.currentTarget as HTMLDetailsElement).open) next.add(group);
                  else next.delete(group);
                  setOpenGroups(next);
                }}
              >
                <summary>
                  <span className="pg-i" aria-hidden="true">
                    <svg fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      {GROUP_ICON[group]}
                    </svg>
                  </span>
                  <span className="flex-1 min-w-0">
                    <b className="font-display text-[15px] block">{group}</b>
                    <span className="text-xs text-[var(--mute)]">
                      {keys.length} module{keys.length === 1 ? "" : "s"}
                    </span>
                  </span>
                  <span className={`pg-count ${state}`}>
                    {on}/{keys.length}
                  </span>
                  <svg
                    className="chev w-4 h-4 text-[var(--mute)]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.2}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </summary>

                <div className="pg-body">
                  {editable && (
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs text-[var(--mute)]">
                        {on ? `${on} enabled` : "Nothing enabled"}
                      </span>
                      <span className="flex gap-2">
                        <button
                          type="button"
                          className="mini-btn"
                          disabled={on === keys.filter((k) => grantable.includes(k)).length}
                          onClick={() => setGroup(group, true)}
                        >
                          Enable all
                        </button>
                        <button
                          type="button"
                          className="mini-btn"
                          disabled={on === 0}
                          onClick={() => setGroup(group, false)}
                        >
                          Clear
                        </button>
                      </span>
                    </div>
                  )}

                  {keys.map((key) => {
                    const meta = PERMISSIONS[key];
                    const checked = has(key);
                    const canGrant = grantable.includes(key);
                    const rowDisabled = !editable || !canGrant;

                    return (
                      <div
                        key={key}
                        className={`perm ${checked ? "on" : ""} ${readOnly ? "ro" : ""}`}
                        onClick={() => !readOnly && toggle(key)}
                      >
                        <span className="min-w-0">
                          <b className="text-sm block flex flex-wrap items-center gap-2">
                            <span>{meta.label}</span>
                            {!meta.implemented && (
                              <span className="badge dash !h-5 !text-[10px]">Coming soon</span>
                            )}
                          </b>
                          <span className="text-xs text-[var(--mute)] leading-snug block mt-0.5">
                            {meta.description}
                          </span>
                          {!canGrant && editable && (
                            <span className="text-[11px] font-bold text-[var(--mute)] block mt-1">
                              You don&apos;t hold this permission yourself
                            </span>
                          )}
                        </span>

                        {readOnly ? (
                          <span className="perm-ro" aria-hidden="true">
                            ✓
                          </span>
                        ) : (
                          <span className="switch sm" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={rowDisabled}
                              aria-label={meta.label}
                              onChange={() => toggle(key)}
                            />
                            <span />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </>
      )}

      <p className="hint">
        <FieldError message={errors.permissions} />
      </p>
    </FormSection>
  );
}
