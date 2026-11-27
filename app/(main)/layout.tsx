import { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";
import Announcement from "./components/Announcement";
import Footer from "./components/Footer";
import Header from "./components/Header";
import MobileNav from "./components/MobileNav";
import NetworkStatus from "./components/NetworkStatus";
import ChatWidget from "./components/chat/ChatWidget";
import MaintenancePage from "./components/MaintenancePage";
import { getMaintenanceStatus } from "@/db/settings.server";

export const dynamic = "force-dynamic";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  noStore(); // prevent Next.js from caching this layout
  const maintenance = await getMaintenanceStatus();

  if (maintenance.enabled) {
    return <MaintenancePage message={maintenance.message} />;
  }

  return (
    <>
      <Announcement />
      <Header />
      {/* pb-16 on mobile so content isn't hidden behind the fixed bottom nav */}
      <div className="pb-16 lg:pb-0">
        {children}
      </div>
      <Suspense fallback={null}>
        <MobileNav />
      </Suspense>
      <Footer />
      <NetworkStatus />
      <ChatWidget />
    </>
  );
}
