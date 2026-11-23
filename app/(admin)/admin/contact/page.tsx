export const dynamic = "force-dynamic";

import AdminTopbar from "@/app/(admin)/_components/AdminTopbar";
import AdminBreadcrumb from "@/app/(admin)/_components/AdminBreadcrumb";
import { guardPage } from "@/app/utils/authz";
import { getContactStats, getContactMessages } from "@/db/actions/admin/contact.admin.action";
import ContactDashboard from "./_components/ContactDashboard";
import ContactInbox from "./_components/ContactInbox";
import Link from "next/link";

interface SearchParams {
  page?: string;
  search?: string;
  status?: string;
  category?: string;
  isRead?: string;
  sort?: string;
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await guardPage("contact_management");

  const page = Math.max(1, parseInt(searchParams.page || "1", 10));

  const [stats, { messages, total }] = await Promise.all([
    getContactStats(),
    getContactMessages({
      page,
      search: searchParams.search,
      status: searchParams.status,
      category: searchParams.category,
      isRead: searchParams.isRead,
      sort: (searchParams.sort as "newest" | "oldest") || "newest",
    }),
  ]);

  return (
    <>
      <AdminTopbar />
      <main className="p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <AdminBreadcrumb items={[{ label: "Contact" }]} />
          <Link
            href="/admin/contact/settings"
            className="btn-ghost !h-9 !px-4 !text-sm inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx={12} cy={12} r={3} />
              <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
            </svg>
            Settings
          </Link>
        </div>

        <ContactDashboard stats={stats} />
        <ContactInbox initialMessages={messages} total={total} page={page} />
      </main>
    </>
  );
}
