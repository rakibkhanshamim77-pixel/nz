export const dynamic = "force-dynamic";

import AdminTopbar from "@/app/(admin)/_components/AdminTopbar";
import AdminBreadcrumb from "@/app/(admin)/_components/AdminBreadcrumb";
import { guardPage } from "@/app/utils/authz";
import { getContactSettings } from "@/db/settings.server";
import ContactSettingsForm from "./_components/ContactSettingsForm";

export default async function ContactSettingsPage() {
  await guardPage("contact_management");
  const settings = await getContactSettings();

  return (
    <>
      <AdminTopbar />
      <main className="p-6 max-w-3xl">
        <AdminBreadcrumb
          items={[
            { label: "Contact", href: "/admin/contact" },
            { label: "Settings" },
          ]}
        />
        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl">Contact Page Settings</h1>
          <p className="text-sm text-[var(--mute)] mt-1">
            Manage the public Contact page content and form settings.
          </p>
        </div>
        <ContactSettingsForm initial={settings} />
      </main>
    </>
  );
}
