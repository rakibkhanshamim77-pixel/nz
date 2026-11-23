import {
  CircleQuestionMark,
  EmiratiDirham,
  ShieldCheck,
  Van,
} from "lucide-react";
export default function TrustStrip() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-16">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-6 border-y border-line text-sm">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-full bg-soft grid place-items-center">
            <Van />
          </span>
          <span>
            <b className="block">দ্রুত ডেলিভারি</b>
            <span className="text-mute">ঢাকায় ২৪–৪৮ ঘন্টা</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-full bg-soft grid place-items-center">
            <EmiratiDirham />
          </span>
          <span>
            <b className="block">সহজ এক্সচেঞ্জ</b>
            <span className="text-mute">সাইজ ভুল? বদলে নিন</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-full bg-soft grid place-items-center">
            <ShieldCheck />
          </span>
          <span>
            <b className="block">নিরাপদ পেমেন্ট</b>
            <span className="text-mute">bKash, Nagad, COD</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-full bg-soft grid place-items-center">
            <CircleQuestionMark />
          </span>
          <span>
            <b className="block">সরাসরি সাপোর্ট</b>
            <span className="text-mute">শনি–বৃহঃ, ১০টা–৮টা</span>
          </span>
        </div>
      </div>
    </section>
  );
}
