import { ROLE_LABEL, type Role } from "@/db/permissions";
import { STATUS_LABEL, type UserStatus } from "./types";

/** Deterministic avatar colour so a user keeps the same one across renders. */
const AVATAR_COLORS = [
  "#0f766e", "#7c2d12", "#1e3a8a", "#581c87", "#9d174d",
  "#065f46", "#854d0e", "#1e40af", "#4c1d95", "#9f1239",
];

export function avatarColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export function initialsOf(name: string, phone: string): string {
  const clean = name.trim();
  if (!clean) return phone.slice(-2) || "??";
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface AvatarProps {
  name: string;
  phone: string;
  image?: string;
  size?: number;
  className?: string;
}

export function UserAvatar({ name, phone, image, size = 38, className = "" }: AvatarProps) {
  const label = name.trim() || phone;
  return (
    <span
      className={`av ${className}`}
      style={{
        width: size,
        height: size,
        background: avatarColor(label),
        fontSize: Math.max(11, Math.round(size * 0.36)),
      }}
      aria-hidden="true"
    >
      <b>{initialsOf(name, phone)}</b>
      {/* Remote avatar URLs are arbitrary, so next/image isn't used here */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {image ? <img src={image} alt="" /> : null}
    </span>
  );
}

const STATUS_ICON: Record<UserStatus, React.ReactNode> = {
  active: <i />,
  inactive: <i />,
  pending: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.6} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
};

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return (
    <span className={`ust ${status}`}>
      {STATUS_ICON[status]}
      {STATUS_LABEL[status]}
    </span>
  );
}

const ROLE_ICON: Record<Role, React.ReactNode> = {
  admin: (
    <>
      <path d="M12 3 5 6v6c0 4.2 2.8 7.4 7 9 4.2-1.6 7-4.8 7-9V6z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  moderator: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </>
  ),
  user: (
    <>
      <path d="M6 7h12l-1 13H7z" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" />
    </>
  ),
};

export function RoleChip({ role }: { role: Role }) {
  return (
    <span className={`rchip ${role === "admin" ? "top" : ""}`}>
      <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
        {ROLE_ICON[role]}
      </svg>
      {ROLE_LABEL[role]}
    </span>
  );
}

export function RoleTileIcon({ role }: { role: Role }) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      {ROLE_ICON[role]}
    </svg>
  );
}
