"use server";

import dbConnect from "../connect/dbConnect";
import Newsletter from "../models/NewsLetter";

export interface NewsletterState {
  status: "idle" | "success" | "error";
  message: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Server action for the newsletter form (works with React's useActionState).
 * Never throws — always returns a state the UI can show.
 */
async function subscribeNewsletter(
  _prevState: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  // Honeypot: real users never see or fill this field; bots usually do
  if (String(formData.get("company") ?? "").trim()) {
    return {
      status: "success",
      message: "ধন্যবাদ! আপনি সফলভাবে সাবস্ক্রাইব করেছেন।",
    };
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!email) {
    return { status: "error", message: "অনুগ্রহ করে আপনার ইমেইল লিখুন।" };
  }

  if (email.length > 254 || !EMAIL_REGEX.test(email)) {
    return { status: "error", message: "ইমেইলটি সঠিক নয়। আবার চেক করে দিন।" };
  }

  try {
    await dbConnect();

    const existing = await Newsletter.findOne({ email })
      .select("status")
      .lean();

    if (existing?.status === "subscribed") {
      return {
        status: "success",
        message: "এই ইমেইলটি আগে থেকেই সাবস্ক্রাইব করা আছে। ধন্যবাদ!",
      };
    }

    // New email → create; previously unsubscribed → re-subscribe
    await Newsletter.findOneAndUpdate(
      { email },
      {
        $set: {
          status: "subscribed",
          subscribedAt: new Date(),
          unsubscribedAt: null,
        },
        $setOnInsert: { email, source: "home-newsletter" },
      },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );

    return {
      status: "success",
      message:
        "সাবস্ক্রাইব সফল হয়েছে! প্রথম অর্ডারের ১০% ছাড়ের কোড আপনার ইমেইলে পাঠানো হবে।",
    };
  } catch (error) {
    // Two requests for the same email at the same moment → unique index catches the second one
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return {
        status: "success",
        message: "এই ইমেইলটি আগে থেকেই সাবস্ক্রাইব করা আছে। ধন্যবাদ!",
      };
    }

    console.error("[subscribeNewsletter] failed:", error);
    return {
      status: "error",
      message: "দুঃখিত, কিছু একটা সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।",
    };
  }
}

export { subscribeNewsletter };
