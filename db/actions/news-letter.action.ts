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
      message: "Thank you! You have successfully subscribed.",
    };
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!email) {
    return { status: "error", message: "Please enter your email address." };
  }

  if (email.length > 254 || !EMAIL_REGEX.test(email)) {
    return { status: "error", message: "That email doesn't look right. Please check and try again." };
  }

  try {
    await dbConnect();

    const existing = await Newsletter.findOne({ email })
      .select("status")
      .lean();

    if (existing?.status === "subscribed") {
      return {
        status: "success",
        message: "This email is already subscribed. Thank you!",
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
        "Subscribed! A 10% discount code for your first order will be sent to your email.",
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
        message: "This email is already subscribed. Thank you!",
      };
    }

    console.error("[subscribeNewsletter] failed:", error);
    return {
      status: "error",
      message: "Sorry, something went wrong. Please try again in a moment.",
    };
  }
}

export { subscribeNewsletter };
