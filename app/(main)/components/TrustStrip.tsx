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
            <b className="block">Fast Delivery</b>
            <span className="text-mute">24–48 hours in Dhaka</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-full bg-soft grid place-items-center">
            <EmiratiDirham />
          </span>
          <span>
            <b className="block">Easy Exchange</b>
            <span className="text-mute">Wrong size? Swap it out</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-full bg-soft grid place-items-center">
            <ShieldCheck />
          </span>
          <span>
            <b className="block">Secure Payment</b>
            <span className="text-mute">bKash, Nagad, COD</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-full bg-soft grid place-items-center">
            <CircleQuestionMark />
          </span>
          <span>
            <b className="block">Direct Support</b>
            <span className="text-mute">Sat–Thu, 10 AM–8 PM</span>
          </span>
        </div>
      </div>
    </section>
  );
}
