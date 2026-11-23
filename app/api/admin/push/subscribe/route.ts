import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/app/utils/getUser";
import { canAccessAdmin } from "@/db/permissions";
import { savePushSubscription } from "@/db/actions/admin/push.action";

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user || !canAccessAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.subscription?.endpoint || !body.subscription?.keys) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }
    const userAgent = req.headers.get("user-agent") || undefined;
    await savePushSubscription(user.id, body.subscription, userAgent, body.deviceLabel);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
