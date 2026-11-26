"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import dbConnect from "@/db/connect/dbConnect";
import User from "@/db/models/User";
import { getUser } from "@/app/utils/getUser";

type Result = { success: boolean; error: string };


export async function updateProfile(formData: FormData): Promise<Result> {
  const session = await getUser();
  if (!session) return { success: false, error: "লগইন করুন" };

  const name  = (formData.get("name")  as string)?.trim();
  const email = (formData.get("email") as string)?.trim() || undefined;

  if (!name || name.length < 2) {
    return { success: false, error: "নাম কমপক্ষে ২ অক্ষর হতে হবে" };
  }

  try {
    await dbConnect();
    const update = email
      ? { $set: { name, email } }
      : { $set: { name }, $unset: { email: "" } };
    await User.findByIdAndUpdate(session.id, update);
    revalidatePath("/my-account");
    return { success: true, error: "" };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("email")) return { success: false, error: "এই ইমেইল ইতিমধ্যে ব্যবহৃত হচ্ছে" };
    return { success: false, error: "সেভ করা যায়নি। আবার চেষ্টা করুন।" };
  }
}

export async function addAddress(formData: FormData): Promise<Result> {
  const session = await getUser();
  if (!session) return { success: false, error: "লগইন করুন" };

  const label     = (formData.get("label")     as string)?.trim() || "home";
  const name      = (formData.get("name")      as string)?.trim();
  const phone     = (formData.get("phone")     as string)?.trim().replace(/\D/g, "");
  const district  = (formData.get("district")  as string)?.trim();
  const city      = (formData.get("city")      as string)?.trim() || "";
  const address   = (formData.get("address")   as string)?.trim();
  const isDefault = formData.get("isDefault") === "on";

  if (!name || !phone || !district || !address) {
    return { success: false, error: "সব আবশ্যিক তথ্য পূরণ করুন" };
  }
  if (!/^01[3-9]\d{8}$/.test(phone)) {
    return { success: false, error: "সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)" };
  }

  try {
    await dbConnect();
    const user = await User.findById(session.id);
    if (!user) return { success: false, error: "ব্যবহারকারী পাওয়া যায়নি" };

    if (isDefault) {
      user.addresses?.forEach((a) => { a.isDefault = false; });
    }

    user.addresses = user.addresses ?? [];
    user.addresses.push({ label, name, phone, address, district, city, isDefault });
    await user.save();

    revalidatePath("/my-account");
    return { success: true, error: "" };
  } catch {
    return { success: false, error: "ঠিকানা সেভ করা যায়নি। আবার চেষ্টা করুন।" };
  }
}

export async function deleteAddress(id: string): Promise<Result> {
  const session = await getUser();
  if (!session) return { success: false, error: "লগইন করুন" };

  try {
    await dbConnect();
    await User.findByIdAndUpdate(session.id, {
      $pull: { addresses: { _id: new mongoose.Types.ObjectId(id) } },
    });
    revalidatePath("/my-account");
    return { success: true, error: "" };
  } catch {
    return { success: false, error: "মুছে ফেলা যায়নি।" };
  }
}

export async function setDefaultAddress(id: string): Promise<Result> {
  const session = await getUser();
  if (!session) return { success: false, error: "লগইন করুন" };

  try {
    await dbConnect();
    const user = await User.findById(session.id);
    if (!user) return { success: false, error: "ব্যবহারকারী পাওয়া যায়নি" };

    user.addresses?.forEach((a) => { a.isDefault = String(a._id) === id; });
    await user.save();

    revalidatePath("/my-account");
    return { success: true, error: "" };
  } catch {
    return { success: false, error: "আপডেট করা যায়নি।" };
  }
}
