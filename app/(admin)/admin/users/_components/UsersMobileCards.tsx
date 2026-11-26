import Link from "next/link";
import { RoleChip, UserAvatar, UserStatusBadge } from "./UserBadges";
import UserRowActions from "./UserRowActions";
import { editHref, fmtDate, fmtRelative, statusOf, type UserRow } from "./types";

interface Props {
  users: UserRow[];
  currentUserId: string;
  currentUserRole: string;
}

export default function UsersMobileCards({ users, currentUserId, currentUserRole }: Props) {
  if (users.length === 0) return null;

  return (
    <section className="md:hidden grid gap-3 mb-5">
      {users.map((u) => (
        <article key={u.id} className="card p-4">
          <div className="flex gap-3.5">
            <UserAvatar name={u.name} phone={u.phone} image={u.profileImage || undefined} size={48} />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <Link href={editHref(u)} className="font-semibold leading-snug truncate">
                  {u.name.trim() || <span className="text-[var(--mute)] italic">No name</span>}
                </Link>
                <UserStatusBadge status={statusOf(u)} />
              </div>
              <p className="text-xs text-[var(--mute)] mt-0.5 truncate">
                {u.email || <span className="mono">{u.phone}</span>}
              </p>
              {u.email && <p className="text-xs text-[var(--mute)] mono mt-0.5">{u.phone}</p>}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <RoleChip role={u.role} />
                {u.orderCount > 0 && (
                  <span className="text-xs text-[var(--mute)]">
                    {u.orderCount} order{u.orderCount === 1 ? "" : "s"}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 mt-3.5 pt-3.5 border-t border-[var(--line)]">
            <div className="text-xs text-[var(--mute)] leading-tight">
              <span className="block">Last login: {fmtRelative(u.lastLogin)}</span>
              <span className="block">Joined {fmtDate(u.createdAt)}</span>
            </div>
            <UserRowActions user={u} currentUserId={currentUserId} currentUserRole={currentUserRole} />
          </div>
        </article>
      ))}
    </section>
  );
}
