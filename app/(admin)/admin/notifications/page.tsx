export const dynamic = "force-dynamic";

import AdminTopbar from "@/app/(admin)/_components/AdminTopbar";
import AdminBreadcrumb from "@/app/(admin)/_components/AdminBreadcrumb";
import { guardPage, getCurrentUser } from "@/app/utils/authz";
import { getAdminNotifications } from "@/db/actions/admin/notification.action";
import NotificationsList from "./_components/NotificationsList";

interface SearchParams {
  page?: string;
}

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await guardPage("notifications");
  const user = await getCurrentUser();
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));

  const { notifications, total } = await getAdminNotifications(user!.id, page);

  return (
    <>
      <AdminTopbar />
      <main className="p-6 max-w-3xl">
        <AdminBreadcrumb items={[{ label: "Notifications" }]} />
        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl">Notifications</h1>
          <p className="text-sm text-[var(--mute)] mt-1">
            New orders, contact messages, and system events.
          </p>
        </div>
        <NotificationsList initialNotifications={notifications} total={total} page={page} />
      </main>
    </>
  );
}
