"use client";

import {
  PERMISSIONS,
  PERMISSION_KEYS,
  type Permission,
  type Role,
} from "@/db/permissions";

interface Props {
  role: Role;
  permissions: Permission[];
}

export default function UserPermissionSummary({ role, permissions }: Props) {
  const granted: Permission[] = role === "admin" ? [...PERMISSION_KEYS] : permissions;
  const total = PERMISSION_KEYS.length;
  const pct = Math.round((granted.length / total) * 100);

  return (
    <section className="card sec" aria-labelledby="summary-title">
      <header className="sec-h !mb-4">
        <div className="flex-1 min-w-0">
          <h2 id="summary-title" className="font-display">
            Permission Summary
          </h2>
          <p>
            {role === "admin"
              ? "Full access — the role grants everything"
              : role === "user"
                ? "No admin panel access"
                : "Modules this account can open"}
          </p>
        </div>
      </header>

      <div className="flex items-end justify-between mb-2">
        <b className="font-display font-extrabold text-3xl leading-none">
          {granted.length}
          <span className="text-base text-[var(--mute)] font-semibold"> / {total}</span>
        </b>
        <span className="text-xs text-[var(--mute)]">{pct}% access</span>
      </div>

      <div className="mini mb-4" role="presentation">
        <span style={{ width: `${pct}%` }} />
      </div>

      {granted.length === 0 ? (
        <p className="text-sm text-[var(--mute)] leading-relaxed">
          {role === "user"
            ? "Customers only get their own orders, addresses and profile."
            : "No modules yet — pick at least one above."}
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {granted.map((key) => (
            <li key={key} className="badge ghost">
              {PERMISSIONS[key].label}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
