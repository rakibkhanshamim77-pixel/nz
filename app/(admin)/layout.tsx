import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getUser } from "@/app/utils/getUser";
import { canAccessAdmin } from "@/db/permissions";
import AdminSidebar from "./_components/AdminSidebar";
import AdminToastProvider from "./_components/AdminToast";
import NotificationProvider from "./_components/NotificationProvider";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Admins always pass; everyone else needs at least one module permission.
  // Per-module access is enforced again by each page's own guard.
  const user = await getUser();
  if (!canAccessAdmin(user)) redirect("/login");

  return (
    <AdminToastProvider>
      <NotificationProvider>
        <div className="min-h-screen bg-[var(--soft)]">
          <AdminSidebar />
          <div className="lg:pl-[264px] min-h-screen">{children}</div>
        </div>
      </NotificationProvider>
    </AdminToastProvider>
  );
}
