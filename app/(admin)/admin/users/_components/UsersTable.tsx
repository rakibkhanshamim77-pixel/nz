import Link from "next/link";
import { RoleChip, UserAvatar, UserStatusBadge } from "./UserBadges";
import UserRowActions from "./UserRowActions";
import {
  editHref,
  fmtDate,
  fmtRelative,
  statusOf,
  type UserRow,
} from "./types";

interface Props {
  users: UserRow[];
  currentUserId: string;
  currentUserRole: string;
}

export default function UsersTable({
  users,
  currentUserId,
  currentUserRole,
}: Props) {
  if (users.length === 0) return null;

  return (
    <section className="card hidden md:block overflow-hidden mb-5">
      <div className="overflow-x-auto overflow-y-hidden">
        <table className="ptbl">
          <thead>
            <tr>
              <th className="w-[56px]">
                <span className="sr-only">Avatar</span>
              </th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Registered</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="row-in">
                <td>
                  <UserAvatar
                    name={u.name}
                    phone={u.phone}
                    image={u.profileImage || undefined}
                    size={38}
                  />
                </td>
                <td>
                  <Link
                    href={editHref(u)}
                    className="font-semibold hover:underline underline-offset-4 max-w-[200px] truncate block"
                  >
                    {u.name.trim() || (
                      <span className="text-[var(--mute)] italic">No name</span>
                    )}
                  </Link>
                  {u.orderCount > 0 && (
                    <span className="text-xs text-[var(--mute)]">
                      {u.orderCount} order{u.orderCount === 1 ? "" : "s"}
                    </span>
                  )}
                </td>
                <td>
                  {u.email ? (
                    <span className="text-sm max-w-[200px] truncate block">
                      {u.email}
                    </span>
                  ) : (
                    <span className="text-[var(--mute)]">—</span>
                  )}
                </td>
                <td>
                  <span className="mono text-[13px] text-[var(--mute)]">
                    {u.phone}
                  </span>
                </td>
                <td>
                  <RoleChip role={u.role} />
                </td>
                <td>
                  <UserStatusBadge status={statusOf(u)} />
                </td>
                <td className="text-sm text-[var(--mute)]">
                  {fmtRelative(u.lastLogin)}
                </td>
                <td className="text-sm text-[var(--mute)]">
                  {fmtDate(u.createdAt)}
                </td>
                <td>
                  <UserRowActions
                    user={u}
                    currentUserId={currentUserId}
                    currentUserRole={currentUserRole}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
