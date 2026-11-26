import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/app/utils/getUser";
import { canAccessAdmin } from "@/db/permissions";
import { markNotificationRead } from "@/db/actions/admin/notification.action";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUser();
  if (!user || !canAccessAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await markNotificationRead(params.id, user.id);
  return NextResponse.json({ ok: true });
}
