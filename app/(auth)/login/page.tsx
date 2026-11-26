import { cookies } from "next/headers";
import LoginForm from "./_component/LoginForm";
import { GOOGLE_PENDING_COOKIE, isGoogleConfigured, readPending } from "@/app/utils/googleAuth";

const GOOGLE_ERRORS: Record<string, string> = {
  google_failed: "Google দিয়ে লগইন করা যায়নি। আবার চেষ্টা করুন।",
  google_cancelled: "Google লগইন বাতিল করা হয়েছে।",
  google_unavailable: "Google লগইন এখন চালু নেই। মোবাইল নম্বর দিয়ে লগইন করুন।",
  account_disabled: "এই অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে।",
};

export default function page({ searchParams }: { searchParams: { error?: string } }) {
  const pendingGoogle = readPending(cookies().get(GOOGLE_PENDING_COOKIE)?.value);
  const googleError = GOOGLE_ERRORS[searchParams.error ?? ""] ?? "";

  return (
    <main className="flex-1 grid place-items-center px-4 py-8 sm:py-14">
      <div className="w-full max-w-[440px]">
        <div className="card p-6 sm:p-9">
          <LoginForm
            googleEnabled={isGoogleConfigured()}
            pendingGoogle={pendingGoogle}
            googleError={googleError}
          />
        </div>
        <p className="text-center text-sm text-mute mt-6 flex items-center justify-center gap-1.5">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <rect x={5} y={11} width={14} height={10} rx={2} />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          আপনার তথ্য সম্পূর্ণ নিরাপদ
        </p>
      </div>
    </main>
  );
}
