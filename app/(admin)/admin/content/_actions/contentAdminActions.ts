"use server";

import dbConnect from "@/db/connect/dbConnect";
import ContentModel from "@/db/models/Content";
import Faq from "@/db/models/Faq";
import { guardPage } from "@/app/utils/authz";
import { revalidatePath } from "next/cache";
import type { ContentSlug } from "@/db/content";

async function guardContent() {
  return guardPage("content_management");
}

// ─── Generic content block save ───────────────────────────────────────────────

export async function saveContent(
  slug: ContentSlug,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await guardContent();
  await dbConnect();

  try {
    await ContentModel.findOneAndUpdate(
      { slug },
      { $set: { data } },
      { upsert: true, new: true },
    );
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/content");
    return { ok: true };
  } catch {
    return { ok: false, error: "সংরক্ষণ করতে ব্যর্থ" };
  }
}

// ─── FAQ CRUD ─────────────────────────────────────────────────────────────────

export interface FaqInput {
  question: string;
  answer: string;
  category: string;
  order: number;
  isPublished: boolean;
}

export async function createFaq(
  input: FaqInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await guardContent();
  if (!input.question?.trim()) return { ok: false, error: "প্রশ্ন প্রয়োজন" };
  if (!input.answer?.trim()) return { ok: false, error: "উত্তর প্রয়োজন" };

  await dbConnect();
  await Faq.create({
    question: input.question.trim(),
    answer: input.answer.trim(),
    category: input.category?.trim() || "",
    order: input.order || 0,
    isPublished: input.isPublished,
  });
  revalidatePath("/admin/content");
  return { ok: true };
}

export async function updateFaq(
  id: string,
  input: FaqInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await guardContent();
  if (!input.question?.trim()) return { ok: false, error: "প্রশ্ন প্রয়োজন" };
  if (!input.answer?.trim()) return { ok: false, error: "উত্তর প্রয়োজন" };

  await dbConnect();
  await Faq.findByIdAndUpdate(id, {
    question: input.question.trim(),
    answer: input.answer.trim(),
    category: input.category?.trim() || "",
    order: input.order || 0,
    isPublished: input.isPublished,
  });
  revalidatePath("/admin/content");
  return { ok: true };
}

export async function deleteFaq(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await guardContent();
  await dbConnect();
  await Faq.findByIdAndDelete(id);
  revalidatePath("/admin/content");
  return { ok: true };
}

export async function toggleFaqPublished(
  id: string,
  isPublished: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await guardContent();
  await dbConnect();
  await Faq.findByIdAndUpdate(id, { isPublished });
  revalidatePath("/admin/content");
  return { ok: true };
}
