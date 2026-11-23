import type { Metadata } from "next";

import { guardPage } from "@/app/utils/authz";
import { getStoreSettings } from "@/db/settings.server";
import AdminTopbar from "../../_components/AdminTopbar";
import AdminBreadcrumb from "../../_components/AdminBreadcrumb";
import SettingsForm from "./_components/SettingsForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings – Neeshanz Admin" };

export default async function SettingsPage() {
  const user = await guardPage("settings");
  const settings = await getStoreSettings();

  return (
    <div>
      <AdminTopbar
        title="Settings"
        subtitle="Store details, delivery charges and payment numbers"
        userName={user.name}
        userRole={user.role}
        breadcrumb={[
          { label: "Dashboard", href: "/admin" },
          { label: "Settings" },
        ]}
      />
      <main className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-32 max-w-[900px]">
        <AdminBreadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Settings" },
          ]}
        />

        <div className="mb-6">
          <h1 className="font-display font-extrabold text-[1.9rem] sm:text-4xl tracking-tight leading-tight">
            Settings
          </h1>
          <p className="text-sm text-[var(--mute)] mt-1">
            Changes apply to the storefront as soon as you save — no restart
            needed.
          </p>
        </div>

        <SettingsForm initial={settings} />
      </main>
    </div>
  );
}
