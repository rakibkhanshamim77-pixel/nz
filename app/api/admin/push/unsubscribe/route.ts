import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/app/utils/getUser";
import { canAccessAdmin } from "@/db/permissions";
import { removePushSubscription } from "@/db/actions/admin/push.action";

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user || !canAccessAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.endpoint) {
      return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
    }
    await removePushSubscription(user.id, body.endpoint);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
