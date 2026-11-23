"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type { Permission } from "@/db/permissions";

function matchPath(href: string, pathname: string): boolean {
  const base = href.split("?")[0];
  // Exact match for dashboard root; prefix match for everything else
  if (base === "/admin") return pathname === "/admin";
  return pathname === base || pathname.startsWith(base + "/");
}

interface Props {
  productCount?: number;
  lowStockCount?: number;
  orderCount?: number;
  userCount?: number;
  /** Effective permissions of the signed-in user; admins get the full list */
  granted: Permission[];
}

export default function AdminSidebarNav({
  productCount,
  lowStockCount,
  orderCount,
  userCount,
  granted,
}: Props) {
  const pathname = usePathname();

  // Visibility is a convenience only — every page and action re-checks on the server
  const can = (p: Permission) => granted.includes(p);
  const canOrders = can("order_management");
  const canProducts = can("product_management");
  const canUsers = can("user_management");
  const canCustomers = can("customers_management");
  const canInbox = can("inbox_management");
  const canContact = can("contact_management");
  const canContent = can("content_management");
  const canReviews = can("review_management");
  const canCoupons = can("coupon_management");
  const canSettings = can("settings");
  const canNotifications = can("notifications");

  const onProductList =
    pathname === "/admin/products" || pathname.startsWith("/admin/products/edit/");
  const onUserList =
    pathname === "/admin/users" || pathname.startsWith("/admin/users/edit/");

  // Mobile drawer: close on navigation, on the scrim and on the close button
  useEffect(() => {
    document.body.classList.remove("menu-open");
  }, [pathname]);

  useEffect(() => {
    const close = () => document.body.classList.remove("menu-open");
    const targets = [document.getElementById("scrim"), document.getElementById("closeMenu")];
    targets.forEach((el) => el?.addEventListener("click", close));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => {
      targets.forEach((el) => el?.removeEventListener("click", close));
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const ordersOpen = pathname.startsWith("/admin/orders");
  const productsOpen =
    pathname.startsWith("/admin/products") || pathname.startsWith("/admin/categories");
  const usersOpen = pathname.startsWith("/admin/users");

  const showEngage = canInbox || canContact || canContent || canReviews;
  const showSystem = canUsers || canContent || canSettings || canCoupons || canNotifications;

  return (
    <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Admin menu">
      {/* Main */}
      <p className="grp">Main</p>

      {(canOrders || canProducts) && (
        <Link href="/admin" aria-current={matchPath("/admin", pathname) ? "page" : undefined}>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <rect x={3} y={3} width={7} height={9} rx="1.5" />
            <rect x={14} y={3} width={7} height={5} rx="1.5" />
            <rect x={14} y={12} width={7} height={9} rx="1.5" />
            <rect x={3} y={16} width={7} height={5} rx="1.5" />
          </svg>
          Dashboard
        </Link>
      )}

      {/* Orders Dropdown */}
      {canOrders && (
        <details className="nav-dd" data-dd="orders" open={ordersOpen}>
          <summary>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" />
              <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
            </svg>
            Orders
            <svg
              className="chev w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <div className="sub">
            <Link
              href="/admin/orders"
              aria-current={pathname === "/admin/orders" ? "page" : undefined}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
              </svg>
              All Orders
              {orderCount !== undefined && <span className="cnt">{orderCount}</span>}
            </Link>
            <Link href="/admin/orders?status=payment_pending">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <rect x={3} y={6} width={18} height={12} rx={2} />
                <path d="M3 10h18" />
              </svg>
              Pending Payments
            </Link>
            <Link href="/admin/orders?status=confirmed">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="m5 12 5 5L20 7" />
              </svg>
              Confirmed Orders
            </Link>
          </div>
        </details>
      )}

      {/* Products Dropdown */}
      {canProducts && (
        <details className="nav-dd" data-dd="products" open={productsOpen}>
          <summary>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path d="M8 4 3 7l2 5 3-1v9h8v-9l3 1 2-5-5-3c-.7 2-2 3-4 3S8.7 6 8 4Z" />
            </svg>
            Products
            <svg
              className="chev w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <div className="sub">
            <Link href="/admin/products" aria-current={onProductList ? "page" : undefined}>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
              </svg>
              Product List
              {productCount !== undefined && <span className="cnt">{productCount}</span>}
            </Link>
            <Link
              href="/admin/products/create"
              aria-current={matchPath("/admin/products/create", pathname) ? "page" : undefined}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Create Product
            </Link>
            <Link
              href="/admin/products/low-stock"
              aria-current={matchPath("/admin/products/low-stock", pathname) ? "page" : undefined}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" />
              </svg>
              Low Stock
              {!!lowStockCount && <span className="cnt">{lowStockCount}</span>}
            </Link>
            <Link
              href="/admin/categories"
              aria-current={matchPath("/admin/categories", pathname) ? "page" : undefined}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <rect x={3} y={3} width={8} height={8} rx={1} />
                <rect x={13} y={3} width={8} height={8} rx={1} />
                <rect x={3} y={13} width={8} height={8} rx={1} />
                <rect x={13} y={13} width={8} height={8} rx={1} />
              </svg>
              Categories
            </Link>
          </div>
        </details>
      )}

      {/* Customers */}
      {canCustomers && (
        <Link
          href="/admin/customers"
          aria-current={matchPath("/admin/customers", pathname) ? "page" : undefined}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <circle cx={9} cy={8} r="3.5" />
            <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6" />
          </svg>
          Customers
        </Link>
      )}

      {/* Engage */}
      {showEngage && <p className="grp">Engage</p>}
      {canInbox && (
        <Link
          href="/admin/messages"
          aria-current={matchPath("/admin/messages", pathname) ? "page" : undefined}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
          </svg>
          Messages
        </Link>
      )}
      {canContact && (
        <Link
          href="/admin/contact"
          aria-current={matchPath("/admin/contact", pathname) ? "page" : undefined}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
          </svg>
          Contact
        </Link>
      )}
      {canReviews && (
        <Link
          href="/admin/reviews"
          aria-current={matchPath("/admin/reviews", pathname) ? "page" : undefined}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <path d="m12 3 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.4l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z" />
          </svg>
          Reviews
        </Link>
      )}

      {/* System */}
      {showSystem && <p className="grp">System</p>}

      {/* Users */}
      {canUsers && (
        <details className="nav-dd" data-dd="users" open={usersOpen}>
          <summary>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <circle cx={12} cy={8} r={4} />
              <path d="M4 21a8 8 0 0 1 16 0" />
            </svg>
            Users
            <svg
              className="chev w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <div className="sub">
            <Link href="/admin/users" aria-current={onUserList ? "page" : undefined}>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle cx={9} cy={8} r="3.5" />
                <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6" />
              </svg>
              All Users
              {userCount !== undefined && <span className="cnt">{userCount}</span>}
            </Link>
            <Link
              href="/admin/users/create"
              aria-current={matchPath("/admin/users/create", pathname) ? "page" : undefined}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle cx={10} cy={8} r={4} />
                <path d="M2 21a8 8 0 0 1 13-6.2M19 15v6M16 18h6" />
              </svg>
              Add New User
            </Link>
          </div>
        </details>
      )}

      {canCoupons && (
        <Link
          href="/admin/coupons"
          aria-current={matchPath("/admin/coupons", pathname) ? "page" : undefined}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <path d="M3 9V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v3a3 3 0 0 0 0 6v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a3 3 0 0 0 0-6Z" />
            <path d="M14 5v14" strokeDasharray="2 2" />
          </svg>
          Coupons
        </Link>
      )}
      {canContent && (
        <Link
          href="/admin/content"
          aria-current={matchPath("/admin/content", pathname) ? "page" : undefined}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <path d="M4 6h16M4 10h16M4 14h10M4 18h7" />
          </svg>
          Content
        </Link>
      )}
      {canSettings && (
        <Link
          href="/admin/settings"
          aria-current={matchPath("/admin/settings", pathname) ? "page" : undefined}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <circle cx={12} cy={12} r={3} />
            <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
          </svg>
          Settings
        </Link>
      )}
      {canNotifications && (
        <Link
          href="/admin/notifications"
          aria-current={matchPath("/admin/notifications", pathname) ? "page" : undefined}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7M10 20a2 2 0 0 0 4 0" />
          </svg>
          Notifications
        </Link>
      )}
    </nav>
  );
}
