import dbConnect from "@/db/connect/dbConnect";
import Order from "@/db/models/Order";
import Product from "@/db/models/Product";
import User from "@/db/models/User";
import { getUser } from "@/app/utils/getUser";
import { getLowStockThreshold } from "@/db/settings.server";
import { effectivePermissions, type Permission } from "@/db/permissions";
import AdminSidebarLogo from "./AdminSidebarLogo";
import AdminSidebarNav from "./AdminSidebarNav";
import AdminSidebarFooter from "./AdminSidebarFooter";

interface Counts {
  productCount?: number;
  lowStockCount?: number;
  orderCount?: number;
  userCount?: number;
}

/** Only counts the viewer is allowed to see are queried at all. */
async function loadCounts(granted: Permission[]): Promise<Counts> {
  const canProducts = granted.includes("product_management");
  const canOrders = granted.includes("order_management");
  const canUsers = granted.includes("user_management");

  try {
    await dbConnect();
    const [productCount, lowStockCount, orderCount, userCount] = await Promise.all([
      canProducts ? Product.estimatedDocumentCount() : undefined,
      canProducts ? getLowStockThreshold().then((t) => Product.countDocuments({ stock: { $lte: t } })) : undefined,
      canOrders ? Order.estimatedDocumentCount() : undefined,
      canUsers ? User.estimatedDocumentCount() : undefined,
    ]);
    return { productCount, lowStockCount, orderCount, userCount };
  } catch {
    // Counts are decorative — never break the admin shell over them
    return {};
  }
}

export default async function AdminSidebar() {
  const user = await getUser();
  const granted = effectivePermissions(user);
  const counts = await loadCounts(granted);

  return (
    <>
      {/* Mobile scrim overlay */}
      <div
        id="scrim"
        className="scrim fixed inset-0 z-40 bg-black/50 opacity-0 pointer-events-none lg:hidden"
      />
      <aside className="drawer side fixed inset-y-0 left-0 z-50 w-[264px] bg-surface border-r border-line flex flex-col">
        <AdminSidebarLogo />
        <AdminSidebarNav {...counts} granted={granted} />
        <AdminSidebarFooter />
      </aside>
    </>
  );
}
