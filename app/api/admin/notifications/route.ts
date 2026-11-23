import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/app/utils/getUser";
import { canAccessAdmin } from "@/db/permissions";
import { getAdminNotifications, deleteNotification } from "@/db/actions/admin/notification.action";

export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user || !canAccessAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const type = searchParams.get("type") || undefined;
  const isRead = searchParams.has("isRead")
    ? searchParams.get("isRead") === "true"
    : undefined;

  const result = await getAdminNotifications(user.id, page, { type, isRead });
  return NextResponse.json(result);
}

export async function DELETE(req: NextRequest) {
  const user = await getUser();
  if (!user || !canAccessAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await deleteNotification(id, user.id);
  return NextResponse.json({ ok: true });
}
