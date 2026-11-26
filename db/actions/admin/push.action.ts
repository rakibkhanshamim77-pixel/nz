"use server";

import mongoose from "mongoose";
import dbConnect from "@/db/connect/dbConnect";
import PushSubscriptionModel from "@/db/models/PushSubscription";
import User from "@/db/models/User";

export async function savePushSubscription(
  userId: string,
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  userAgent?: string,
  deviceLabel?: string,
): Promise<void> {
  await dbConnect();
  await PushSubscriptionModel.findOneAndUpdate(
    { endpoint: subscription.endpoint },
    {
      userId: new mongoose.Types.ObjectId(userId),
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      userAgent,
      deviceLabel,
      isActive: true,
    },
    { upsert: true, new: true },
  );
}

export async function removePushSubscription(
  userId: string,
  endpoint: string,
): Promise<void> {
  await dbConnect();
  await PushSubscriptionModel.findOneAndUpdate(
    {
      endpoint,
      userId: new mongoose.Types.ObjectId(userId),
    },
    { isActive: false },
  );
}

export async function getActiveSubscriptionsForAdmins(): Promise<
  { endpoint: string; keys: { p256dh: string; auth: string } }[]
> {
  await dbConnect();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admins = await User.find({ role: "admin" } as any).select("_id").lean();
  const adminIds = admins.map((a) => a._id);
  if (!adminIds.length) return [];

  const subs = await PushSubscriptionModel.find({
    userId: { $in: adminIds },
    isActive: true,
  })
    .select("endpoint keys")
    .lean();

  return subs.map((s) => ({
    endpoint: s.endpoint,
    keys: s.keys,
  }));
}

export async function deactivateSubscription(endpoint: string): Promise<void> {
  await dbConnect();
  await PushSubscriptionModel.findOneAndUpdate({ endpoint }, { isActive: false });
}
