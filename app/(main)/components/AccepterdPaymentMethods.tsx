export default function AccepterdPaymentMethods() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 border-t border-line flex flex-wrap items-center justify-between gap-3 text-sm">
      <span className="text-mute">We accept</span>
      <div className="flex flex-wrap gap-2">
        <span className="px-3 py-1.5 rounded-md border border-line">bKash</span>
        <span className="px-3 py-1.5 rounded-md border border-line">Nagad</span>
        <span className="px-3 py-1.5 rounded-md border border-line">
          Rocket
        </span>
        <span className="px-3 py-1.5 rounded-md border border-line">
          Cash on delivery
        </span>
      </div>
    </div>
  );
}
