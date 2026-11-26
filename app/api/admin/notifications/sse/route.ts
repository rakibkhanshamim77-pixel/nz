import { getUser } from "@/app/utils/getUser";
import { canAccessAdmin } from "@/db/permissions";
import { getUnreadNotificationCount } from "@/db/actions/admin/notification.action";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getUser();
  if (!user || !canAccessAdmin(user)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const adminId = user.id;

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      let closed = false;

      function send(data: string) {
        if (closed) return;
        try {
          controller.enqueue(enc.encode(data));
        } catch {
          closed = true;
        }
      }

      // Send initial count
      try {
        const count = await getUnreadNotificationCount(adminId);
        send(`data: ${JSON.stringify({ unread: count })}\n\n`);
      } catch {}

      // Poll every 10 seconds
      const pollInterval = setInterval(async () => {
        if (closed) { clearInterval(pollInterval); return; }
        try {
          const count = await getUnreadNotificationCount(adminId);
          send(`data: ${JSON.stringify({ unread: count })}\n\n`);
        } catch {}
      }, 10_000);

      // Keepalive ping every 20 seconds
      const pingInterval = setInterval(() => {
        send(": ping\n\n");
      }, 20_000);

      // Auto-close after 2 minutes to allow reconnection
      const timeout = setTimeout(() => {
        clearInterval(pollInterval);
        clearInterval(pingInterval);
        closed = true;
        try { controller.close(); } catch {}
      }, 120_000);

      // Cleanup if client disconnects
      return () => {
        closed = true;
        clearInterval(pollInterval);
        clearInterval(pingInterval);
        clearTimeout(timeout);
      };
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
