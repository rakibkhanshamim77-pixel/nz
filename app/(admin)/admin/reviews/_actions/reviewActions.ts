"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import dbConnect from "@/db/connect/dbConnect";
import Review from "@/db/models/Review";
import { getUser } from "@/app/utils/getUser";
import { userHasPermission } from "@/db/permissions";
import { NOT_ALLOWED } from "@/app/utils/authz";

type ActionResult = { ok: true } | { ok: false; error: string };

async function guardReviews(): Promise<ActionResult> {
  const user = await getUser();
  if (!userHasPermission(user, "review_management")) {
    return { ok: false, error: NOT_ALLOWED };
  }
  return { ok: true };
}

function isValidId(id: string): boolean {
  return mongoose.isValidObjectId(id);
}

export async function publishReview(id: string): Promise<ActionResult> {
  const auth = await guardReviews();
  if (!auth.ok) return auth;
  if (!isValidId(id)) return { ok: false, error: "Invalid ID" };

  await dbConnect();
  await Review.findByIdAndUpdate(id, { isPublished: true });
  revalidatePath("/admin/reviews");
  return { ok: true };
}

export async function unpublishReview(id: string): Promise<ActionResult> {
  const auth = await guardReviews();
  if (!auth.ok) return auth;
  if (!isValidId(id)) return { ok: false, error: "Invalid ID" };

  await dbConnect();
  await Review.findByIdAndUpdate(id, { isPublished: false, isFeatured: false });
  revalidatePath("/admin/reviews");
  return { ok: true };
}

export async function featureReview(id: string): Promise<ActionResult> {
  const auth = await guardReviews();
  if (!auth.ok) return auth;
  if (!isValidId(id)) return { ok: false, error: "Invalid ID" };

  await dbConnect();
  // Feature implies published
  await Review.findByIdAndUpdate(id, { isFeatured: true, isPublished: true });
  revalidatePath("/admin/reviews");
  return { ok: true };
}

export async function unfeatureReview(id: string): Promise<ActionResult> {
  const auth = await guardReviews();
  if (!auth.ok) return auth;
  if (!isValidId(id)) return { ok: false, error: "Invalid ID" };

  await dbConnect();
  await Review.findByIdAndUpdate(id, { isFeatured: false });
  revalidatePath("/admin/reviews");
  return { ok: true };
}

export async function deleteReview(id: string): Promise<ActionResult> {
  const auth = await guardReviews();
  if (!auth.ok) return auth;
  if (!isValidId(id)) return { ok: false, error: "Invalid ID" };

  await dbConnect();
  await Review.findByIdAndDelete(id);
  revalidatePath("/admin/reviews");
  return { ok: true };
}

export async function replyToReview(
  id: string,
  text: string,
): Promise<ActionResult> {
  const auth = await guardReviews();
  if (!auth.ok) return auth;
  if (!isValidId(id)) return { ok: false, error: "Invalid ID" };

  const trimmed = text.trim();
  if (!trimmed || trimmed.length < 2) {
    return { ok: false, error: "Reply text is too short" };
  }
  if (trimmed.length > 500) {
    return { ok: false, error: "Reply must be 500 characters or less" };
  }

  await dbConnect();
  await Review.findByIdAndUpdate(id, {
    storeReply: { text: trimmed, repliedAt: new Date() },
  });
  revalidatePath("/admin/reviews");
  return { ok: true };
}

export async function removeReply(id: string): Promise<ActionResult> {
  const auth = await guardReviews();
  if (!auth.ok) return auth;
  if (!isValidId(id)) return { ok: false, error: "Invalid ID" };

  await dbConnect();
  await Review.findByIdAndUpdate(id, { $unset: { storeReply: "" } });
  revalidatePath("/admin/reviews");
  return { ok: true };
}
