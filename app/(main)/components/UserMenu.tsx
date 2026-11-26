"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Settings, LogOut, LayoutDashboard } from "lucide-react";
import { logout } from "@/db/actions/auth.action";
import type { AuthUser } from "@/app/utils/getUser";

interface UserMenuProps {
  user: AuthUser | null;
}

const ADMIN_ROLES = new Set(["admin", "superadmin", "manager", "staff"]);

export default function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const wrapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onPointer(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function handleLogout() {
    setOpen(false);
    startTransition(async () => {
      await logout();
      router.replace("/login");
      router.refresh();
    });
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="hidden sm:flex items-center gap-2 pl-3 pr-4 h-10 rounded-xl border border-line text-sm font-semibold hover:bg-soft transition-colors"
      >
        <User className="w-4 h-4" />
        Login
      </Link>
    );
  }

  const displayName = user.name || "My Account";
  const isAdmin = ADMIN_ROLES.has(user.role);

  const initials = displayName
    .trim()
    .split(/\s+/)
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div ref={wrapRef} className="relative hidden sm:block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 pl-2 pr-4 h-12 rounded-xl border border-line text-left hover:bg-soft transition-colors"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="w-8 h-8 rounded-full grid place-items-center shrink-0 font-bold text-xs"
          style={{ background: "var(--ink)", color: "var(--bg)" }}>
          {initials}
        </span>
        <span className="leading-tight">
          <b className="block text-sm">{displayName}</b>
          <span className="text-xs text-mute">{user.phone}</span>
        </span>
        <svg className={`w-3.5 h-3.5 text-mute ml-1 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-60 card p-1.5 z-50 shadow-lg" role="menu">
          {/* User info */}
          <div className="px-3 py-2.5 mb-1">
            <p className="text-sm font-semibold truncate">{displayName}</p>
            <p className="text-xs truncate" style={{ color: "var(--mute)" }}>{user.phone}</p>
            {isAdmin && (
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                style={{ background: "var(--ink)", color: "var(--bg)" }}>
                {user.role}
              </span>
            )}
          </div>
          <div className="h-px mx-1 mb-1" style={{ background: "var(--line)" }} />

          <Link href="/my-account" onClick={() => setOpen(false)} role="menuitem"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-soft transition-colors">
            <Settings className="w-4 h-4 shrink-0" style={{ color: "var(--mute)" }} />
            Profile Settings
          </Link>

          {isAdmin && (
            <>
              <div className="h-px mx-1 my-1" style={{ background: "var(--line)" }} />
              <Link href="/admin" onClick={() => setOpen(false)} role="menuitem"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-soft transition-colors">
                <LayoutDashboard className="w-4 h-4 shrink-0" style={{ color: "var(--mute)" }} />
                Admin Panel
              </Link>
            </>
          )}

          <div className="h-px mx-1 my-1" style={{ background: "var(--line)" }} />

          <button onClick={handleLogout} disabled={isPending} role="menuitem"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-soft transition-colors text-left disabled:opacity-50"
            style={{ color: isPending ? undefined : "var(--ink)" }}>
            <LogOut className="w-4 h-4 shrink-0" style={{ color: "var(--mute)" }} />
            {isPending ? "Logging out…" : "Logout"}
          </button>
        </div>
      )}
    </div>
  );
}
