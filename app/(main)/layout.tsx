import { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";
import Announcement from "./components/Announcement";
import Footer from "./components/Footer";
import Header from "./components/Header";
import MobileNav from "./components/MobileNav";
import NetworkStatus from "./components/NetworkStatus";
import ChatWidget from "./components/chat/ChatWidget";
import MaintenancePage from "./components/MaintenancePage";
import { getMaintenanceStatus, getCurrencySettings, getBrandingSettings } from "@/db/settings.server";
import { CurrencyProvider } from "@/app/context/CurrencyProvider";

export const dynamic = "force-dynamic";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  noStore(); // prevent Next.js from caching this layout
  const [maintenance, currency, branding] = await Promise.all([
    getMaintenanceStatus(),
    getCurrencySettings(),
    getBrandingSettings(),
  ]);

  if (maintenance.enabled) {
    return <MaintenancePage message={maintenance.message} />;
  }

  const DEFAULT_COLOR = "#9b2c4a";
  const colorOverride = branding.primaryColor !== DEFAULT_COLOR ? branding.primaryColor : null;

  return (
    <CurrencyProvider currency={currency}>
      {colorOverride && (
        <style>{`:root { --wine: ${colorOverride}; } .dark { --wine: ${colorOverride}; }`}</style>
      )}
      <Announcement />
      <Header />
      {/* pb-24 on mobile so content isn't hidden behind the fixed bottom nav */}
      <div className="pb-24 lg:pb-0">
        {children}
      </div>
      <Suspense fallback={null}>
        <MobileNav />
      </Suspense>
      <Footer />
      <NetworkStatus />
      <ChatWidget />
    </CurrencyProvider>
  );
}
