import Link from "next/link";
import Announcement from "./(main)/components/Announcement";
import Header from "./(main)/components/Header";
import Footer from "./(main)/components/Footer";

export default function NotFound() {
  return (
    <>
      <Announcement />
      <Header />
      <main className="min-h-[65vh] flex flex-col items-center justify-center text-center px-4 py-20">
        <p
          className="font-display font-extrabold leading-none select-none mb-4"
          style={{ fontSize: "clamp(5rem,20vw,10rem)", color: "var(--soft)" }}
          aria-hidden="true"
        >
          404
        </p>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl mb-3 tracking-tight">
          পেজটি পাওয়া যায়নি
        </h1>
        <p className="text-mute text-[15px] max-w-xs sm:max-w-sm leading-relaxed mb-8">
          আপনি যে পেজটি খুঁজছেন সেটি সরিয়ে ফেলা হয়েছে, নাম পরিবর্তন হয়েছে বা
          সাময়িকভাবে অনুপলব্ধ।
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="h-12 px-7 rounded-2xl bg-ink text-bg font-semibold hover:opacity-90 inline-flex items-center gap-2 transition-opacity"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            হোমে ফিরুন
          </Link>
          <Link
            href="/shop"
            className="h-12 px-7 rounded-2xl border border-line font-semibold hover:bg-soft inline-flex items-center gap-2 transition-colors"
          >
            শপ দেখুন
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
