import type { Metadata } from "next";

import { guardPage } from "@/app/utils/authz";
import { getStoreSettings, getMaintenanceStatus, getCurrencySettings, getBrandingSettings } from "@/db/settings.server";
import AdminTopbar from "../../_components/AdminTopbar";
import AdminBreadcrumb from "../../_components/AdminBreadcrumb";
import SettingsForm from "./_components/SettingsForm";
import MaintenanceSection from "./_components/MaintenanceSection";
import CurrencySection from "./_components/CurrencySection";
import BrandingSection from "./_components/BrandingSection";
import EnvSection from "./_components/EnvSection";
import type { EnvValues } from "@/db/actions/admin/env.admin.action";

const ENV_KEYS: (keyof EnvValues)[] = [
  "MONGO_URI",
  "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM",
  "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET",
  "STRIPE_SECRET_KEY", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "STRIPE_WEBHOOK_SECRET",
  "BULKSMSBD_API_KEY", "BULKSMSBD_SENDER_ID",
];

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings – Neeshanz Admin" };

export default async function SettingsPage() {
  const user = await guardPage("settings");
  const [settings, maintenance, currency, branding] = await Promise.all([
    getStoreSettings(),
    getMaintenanceStatus(),
    getCurrencySettings(),
    getBrandingSettings(),
  ]);

  return (
    <div>
      <AdminTopbar
        title="Settings"
        subtitle="Store details, delivery charges and inventory"
        userName={user.name}
        userRole={user.role}
        breadcrumb={[
          { label: "Dashboard", href: "/admin" },
          { label: "Settings" },
        ]}
      />
      <main className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-32 max-w-[1200px]">
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

        {/* Branding + Currency — 2-column grid */}
        <div className="mt-8 grid lg:grid-cols-2 gap-6">
          <BrandingSection initial={branding} />
          <CurrencySection initial={currency} />
        </div>

        {/* Maintenance + Env — super-admin only */}
        {user.role === "admin" && (
          <div className="mt-8 grid lg:grid-cols-2 gap-6">
            <MaintenanceSection
              initialEnabled={maintenance.enabled}
              initialMessage={maintenance.message}
            />
            <EnvSection
              values={Object.fromEntries(
                ENV_KEYS.map((k) => [k, process.env[k] ?? ""])
              ) as EnvValues}
            />
          </div>
        )}
      </main>
    </div>
  );
}
