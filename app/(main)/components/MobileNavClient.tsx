"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, ShoppingCart, User, LogIn } from "lucide-react";
import CartBadgeCount from "./CartBadgeCount";

interface MobileNavClientProps {
  isLoggedIn: boolean;
}

const NAV_ITEMS = [
  { id: "home", title: "হোম", icon: Home, href: "/" },
  { id: "shop", title: "শপ", icon: Store, href: "/shop" },
  { id: "cart", title: "কার্ট", icon: ShoppingCart, href: "/cart", badge: true },
];

export default function MobileNavClient({ isLoggedIn }: MobileNavClientProps) {
  const pathname = usePathname();

  // These pages have their own fixed UI or focused flows — hide the nav there
  if (
    pathname.startsWith("/product/") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/payment") ||
    pathname.startsWith("/cart")
  ) return null;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[55] lg:hidden bg-surface/95 backdrop-blur border border-line rounded-2xl shadow-xl px-3 py-2 flex gap-1"
      style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {NAV_ITEMS.map(({ id, title, icon: Icon, href, badge }) => {
        const active = isActive(href);
        return (
          <Link
            key={id}
            href={href}
            className={`w-16 py-1.5 flex flex-col items-center text-xs transition-colors ${
              active ? "font-semibold text-ink" : "text-mute"
            }`}
          >
            <span className="relative w-10 h-10 grid place-items-center mb-0.5">
              <Icon
                className={`w-5 h-5 transition-colors ${active ? "stroke-[2.5]" : "stroke-2"}`}
              />
              {badge && <CartBadgeCount />}
            </span>
            {title}
          </Link>
        );
      })}

      {/* Account / Login — only shown when logged out */}
      {isLoggedIn ? (
        <Link
          href="/my-account"
          className={`w-16 py-1.5 flex flex-col items-center text-xs transition-colors ${
            isActive("/my-account") ? "font-semibold text-ink" : "text-mute"
          }`}
        >
          <span className="w-10 h-10 grid place-items-center mb-0.5">
            <User
              className={`w-5 h-5 transition-colors ${isActive("/my-account") ? "stroke-[2.5]" : "stroke-2"}`}
            />
          </span>
          আমার
        </Link>
      ) : (
        <Link
          href="/login"
          className={`w-16 py-1.5 flex flex-col items-center text-xs transition-colors ${
            isActive("/login") ? "font-semibold text-ink" : "text-mute"
          }`}
        >
          <span className="w-10 h-10 grid place-items-center mb-0.5">
            <LogIn
              className={`w-5 h-5 transition-colors ${isActive("/login") ? "stroke-[2.5]" : "stroke-2"}`}
            />
          </span>
          লগইন
        </Link>
      )}
    </nav>
  );
}
