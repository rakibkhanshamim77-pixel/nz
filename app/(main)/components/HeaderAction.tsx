import Link from "next/link";
import ThemeSwitcher from "./ThemeSwitcher";
import { ShoppingCartPlus } from "lucide-react";
import UserMenu from "./UserMenu";
import { getUser } from "@/app/utils/getUser";
import CartBadgeCount from "./CartBadgeCount";

export default async function HeaderAction() {
  const user = await getUser();

  return (
    <div className="ml-auto md:ml-0 flex items-center gap-2">
      <ThemeSwitcher />
      <Link
        href="/cart"
        className="relative w-10 h-10 rounded-full border border-line grid place-items-center hover:bg-soft"
        aria-label="Cart"
      >
        <ShoppingCartPlus className="size-5" />
        <CartBadgeCount />
      </Link>
      <UserMenu user={user} />
    </div>
  );
}
