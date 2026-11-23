import { getUser } from "@/app/utils/getUser";
import MobileNavClient from "./MobileNavClient";

export default async function MobileNav() {
  const user = await getUser();
  return <MobileNavClient isLoggedIn={!!user} />;
}
