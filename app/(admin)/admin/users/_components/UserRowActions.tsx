"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useToast } from "@/app/(admin)/_components/AdminToast";
import { deleteUser, setUserActive } from "@/db/actions/admin/user.admin.action";
import DeleteUserDialog from "./DeleteUserDialog";
import { editHref, type UserRow } from "./types";

interface Props {
  user: UserRow;
  currentUserId: string;
  currentUserRole: string;
  /** Styles the group for the mobile card footer vs the table cell */
  align?: "end" | "start";
}


/**
 * The server actions enforce all of this again. These checks only keep the UI
 * from offering a button that is certain to be refused.
 */
export function canManage(
  user: UserRow,
  currentUserId: string,
  currentUserRole: string,
): { editable: boolean; togglable: boolean; deletable: boolean; reason?: string } {
  const isSelf = user.id === currentUserId;
  const viewerIsAdmin = currentUserRole === "admin";

  if (user.role === "admin" && !viewerIsAdmin)
    return {
      editable: false,
      togglable: false,
      deletable: false,
      reason: "Only an administrator can change an administrator",
    };

  if (isSelf)
    return { editable: true, togglable: false, deletable: false, reason: "This is your own account" };

  return { editable: true, togglable: true, deletable: true };
}

export default function UserRowActions({ user, currentUserId, currentUserRole, align = "end" }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [, startTransition] = useTransition();
  const [toggling, setToggling] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const perms = canManage(user, currentUserId, currentUserRole);
  const label = user.name.trim() || user.phone;

  async function toggleActive() {
    setToggling(true);
    try {
      const res = await setUserActive(user.id, !user.isActive);
      if (!res.ok) return toast.error(res.error);
      toast.success(user.isActive ? `${label} deactivated` : `${label} activated`);
      startTransition(() => router.refresh());
    } catch {
      toast.error("Couldn't update the account. Please try again.");
    } finally {
      setToggling(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      const res = await deleteUser(id);
      if (!res.ok) return toast.error(res.error);
      toast.success(`${label} deleted`);
      setDeleteTarget(null);
      startTransition(() => router.refresh());
    } catch {
      toast.error("Couldn't delete the account. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className={`flex items-center gap-1.5 ${align === "end" ? "justify-end" : ""}`}>
        {perms.editable ? (
          <Link
            href={editHref(user)}
            className="icon-btn tip-wrap"
            data-tip="Edit"
            aria-label={`Edit ${label}`}
          >
            <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M4 20h4L19 9l-4-4L4 16z" />
              <path d="m13 7 4 4" />
            </svg>
          </Link>
        ) : (
          <span className="icon-btn tip-wrap opacity-40 cursor-not-allowed" data-tip={perms.reason}>
            <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M4 20h4L19 9l-4-4L4 16z" />
              <path d="m13 7 4 4" />
            </svg>
          </span>
        )}

        <button
          type="button"
          className="icon-btn tip-wrap"
          data-tip={perms.togglable ? (user.isActive ? "Deactivate" : "Activate") : perms.reason}
          aria-label={user.isActive ? `Deactivate ${label}` : `Activate ${label}`}
          disabled={!perms.togglable || toggling}
          onClick={toggleActive}
        >
          {toggling ? (
            <span className="spin !w-4 !h-4" />
          ) : user.isActive ? (
            <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx={12} cy={12} r={9} />
              <path d="m5.6 5.6 12.8 12.8" />
            </svg>
          ) : (
            <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="m5 12 5 5L20 7" />
            </svg>
          )}
        </button>

        <button
          type="button"
          className="icon-btn solid tip-wrap"
          data-tip={perms.deletable ? "Delete" : perms.reason}
          aria-label={`Delete ${label}`}
          disabled={!perms.deletable}
          onClick={() => setDeleteTarget(user)}
        >
          <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
          </svg>
        </button>
      </div>

      <DeleteUserDialog
        user={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
