import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/app/utils/getUser";
import { canAccessAdmin } from "@/db/permissions";
import { getContactMessage } from "@/db/actions/admin/contact.admin.action";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUser();
  if (!user || !canAccessAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const msg = await getContactMessage(params.id);
  if (!msg) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(msg);
}
