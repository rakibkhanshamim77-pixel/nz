export default function TrackHeader() {
  return (
    <div className="max-w-2xl mb-6 sm:mb-8">
      <p className="text-xs font-semibold tracking-[.22em] uppercase text-mute mb-2">
        Order Tracking
      </p>
      <h1 className="font-display font-extrabold text-[1.75rem] min-[400px]:text-[2.2rem] sm:text-5xl tracking-tight leading-tight sm:leading-none break-words">
        অর্ডার ট্র্যাক করুন
      </h1>
      <p className="text-mute mt-3 text-sm sm:text-[15px]">
        অর্ডার নম্বর ও অর্ডারে দেওয়া মোবাইল নম্বর দিয়ে আপনার অর্ডার কোথায় আছে দেখুন।
      </p>
    </div>
  );
}
