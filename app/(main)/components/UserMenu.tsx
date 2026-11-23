"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Settings, LogOut } from "lucide-react";
import { logout } from "@/db/actions/auth.action";
import type { AuthUser } from "@/app/utils/getUser";

interface UserMenuProps {
  user: AuthUser | null;
}

export default function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const wrapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    function onPointer(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  // Close on Escape
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
        লগইন করুন
      </Link>
    );
  }

  const displayName = user.name || "আমার অ্যাকাউন্ট";

  return (
    <div ref={wrapRef} className="relative hidden sm:block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 pl-2 pr-4 h-12 rounded-xl border border-line text-left hover:bg-soft transition-colors"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span
          className="w-8 h-8 rounded-full grid place-items-center shrink-0"
          style={{ background: "var(--soft)" }}
        >
          <User className="w-4 h-4" />
        </span>
        <span className="leading-tight">
          <b className="block text-sm">{displayName}</b>
          <span className="text-xs text-mute">{user.phone}</span>
        </span>
        <svg
          className={`w-3.5 h-3.5 text-mute ml-1 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-56 card p-1.5 z-50"
          role="menu"
        >
          {/* User info row */}
          <div className="px-3 py-2.5 mb-1">
            <p className="text-sm font-semibold truncate">{displayName}</p>
            <p className="text-xs text-mute truncate">{user.phone}</p>
          </div>
          <div
            className="h-px mx-1 mb-1"
            style={{ background: "var(--line)" }}
          />

          <Link
            href="/my-account"
            onClick={() => setOpen(false)}
            role="menuitem"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-soft transition-colors"
          >
            <Settings
              className="w-4 h-4 shrink-0"
              style={{ color: "var(--mute)" }}
            />
            প্রোফাইল সেটিংস
          </Link>

          <div
            className="h-px mx-1 my-1"
            style={{ background: "var(--line)" }}
          />

          <button
            onClick={handleLogout}
            disabled={isPending}
            role="menuitem"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-soft transition-colors text-left disabled:opacity-50"
          >
            <LogOut
              className="w-4 h-4 shrink-0"
              style={{ color: "var(--mute)" }}
            />
            {isPending ? "লগআউট হচ্ছে…" : "লগআউট"}
          </button>
        </div>
      )}
    </div>
  );
}
