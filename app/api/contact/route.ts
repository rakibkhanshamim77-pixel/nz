import { NextRequest, NextResponse } from "next/server";
import { submitContactMessage } from "@/db/actions/contact.action";
import { sendPushToAdmins } from "@/lib/webpush";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await submitContactMessage(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Fire-and-forget push notification
    sendPushToAdmins({
      title: "New contact message!",
      body: `${body.name} — ${body.subject}`,
      url: "/admin/contact",
    }).catch(() => {});

    return NextResponse.json({ success: true, referenceId: result.referenceId });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
