import { User } from "lucide-react";
import type { AccountUser } from "./account.types";

/** First character of the name (code-point safe), or "" when there is no name */
function initial(name?: string): string {
  const first = Array.from((name ?? "").trim())[0];
  return first ? first.toUpperCase() : "";
}

export default function AccountHeader({ user }: { user: AccountUser }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-8">
      <span className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-ink text-bg grid place-items-center font-display font-extrabold text-lg sm:text-2xl shrink-0 select-none">
        {initial(user.name) || <User className="w-6 h-6 sm:w-8 sm:h-8" aria-hidden="true" />}
      </span>
      <div className="min-w-0">
        <p className="text-sm text-mute">স্বাগতম,</p>
        <h1 className="font-display font-extrabold text-2xl sm:text-4xl tracking-tight leading-tight truncate">
          {user.name || "ব্যবহারকারী"}
        </h1>
        <p className="text-sm text-mute">+88 {user.phone}</p>
      </div>
    </div>
  );
}
