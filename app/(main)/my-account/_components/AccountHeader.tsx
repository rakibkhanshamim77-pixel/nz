import type { AccountUser } from "./account.types";

function initials(name?: string, phone?: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return phone ? phone.slice(-2) : "??";
}

export default function AccountHeader({ user }: { user: AccountUser }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-8">
      <span className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-ink text-bg grid place-items-center font-display font-extrabold text-lg sm:text-2xl shrink-0 select-none">
        {initials(user.name, user.phone)}
      </span>
      <div className="min-w-0">
        <p className="text-sm text-mute">Welcome,</p>
        <h1 className="font-display font-extrabold text-2xl sm:text-4xl tracking-tight leading-tight truncate">
          {user.name || "User"}
        </h1>
        <p className="text-sm text-mute">+88 {user.phone}</p>
      </div>
    </div>
  );
}
