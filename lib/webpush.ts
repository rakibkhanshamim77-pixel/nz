import * as webpush from "web-push";
import { getActiveSubscriptionsForAdmins, deactivateSubscription } from "@/db/actions/admin/push.action";

let configured = false;

function configure() {
  if (configured) return;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:support@neeshanz.com";
  if (pub && priv) {
    webpush.setVapidDetails(subject, pub, priv);
    configured = true;
  }
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

export async function sendPushToAdmins(payload: PushPayload): Promise<void> {
  configure();
  if (!configured) return;

  let subs: { endpoint: string; keys: { p256dh: string; auth: string } }[];
  try {
    subs = await getActiveSubscriptionsForAdmins();
  } catch {
    return;
  }

  if (!subs.length) return;

  const json = JSON.stringify(payload);
  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          json,
        );
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 410 || status === 404) {
          deactivateSubscription(sub.endpoint).catch(() => {});
        } else {
          console.error("[webpush] send failed:", sub.endpoint, err);
        }
      }
    }),
  );
}
