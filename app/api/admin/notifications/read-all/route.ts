import { NextResponse } from "next/server";
import { getUser } from "@/app/utils/getUser";
import { canAccessAdmin } from "@/db/permissions";
import { markAllNotificationsRead } from "@/db/actions/admin/notification.action";

export async function POST() {
  const user = await getUser();
  if (!user || !canAccessAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await markAllNotificationsRead(user.id);
  return NextResponse.json({ ok: true });
}
