"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingBag, User, LogIn } from "lucide-react";
import { useCart } from "@/lib/CartProvider";

interface Props {
  isLoggedIn: boolean;
}

const NAV_ITEMS = [
  { id: "home", label: "হোম", icon: Home, href: "/" },
  { id: "categories", label: "ক্যাটাগরি", icon: LayoutGrid, href: "/categories" },
  { id: "cart", label: "কার্ট", icon: ShoppingBag, href: "/cart" },
];

export default function MobileNavClient({ isLoggedIn }: Props) {
  const pathname = usePathname();
  const { itemCount } = useCart();

  if (
    pathname.startsWith("/product/") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/payment")
  ) return null;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-[55] lg:hidden bg-bg/95 backdrop-blur-md border-t border-line"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-stretch h-14">
        {NAV_ITEMS.map(({ id, label, icon: Icon, href }) => {
          const active = isActive(href);
          return (
            <Link
              key={id}
              href={href}
              className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                active ? "text-ink" : "text-mute"
              }`}
            >
              {/* Active indicator */}
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-ink" />
              )}
              <span className="relative">
                <Icon
                  className="w-[22px] h-[22px]"
                  strokeWidth={active ? 2.5 : 1.75}
                />
                {id === "cart" && itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 rounded-full bg-ink text-bg text-[9px] font-bold grid place-items-center">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </span>
              <span className="text-[9px] font-medium leading-none">{label}</span>
            </Link>
          );
        })}

        {/* Account / Login */}
        <Link
          href={isLoggedIn ? "/my-account" : "/login"}
          className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
            isActive(isLoggedIn ? "/my-account" : "/login") ? "text-ink" : "text-mute"
          }`}
        >
          {isActive(isLoggedIn ? "/my-account" : "/login") && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-ink" />
          )}
          {isLoggedIn ? (
            <User className="w-[22px] h-[22px]" strokeWidth={isActive("/my-account") ? 2.5 : 1.75} />
          ) : (
            <LogIn className="w-[22px] h-[22px]" strokeWidth={isActive("/login") ? 2.5 : 1.75} />
          )}
          <span className="text-[9px] font-medium leading-none">
            {isLoggedIn ? "অ্যাকাউন্ট" : "লগইন"}
          </span>
        </Link>
      </div>
    </nav>
  );
}
