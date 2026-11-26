export default function DeliveryMethodSection() {
  return (
    <section className="card p-5 sm:p-7">
      <div className="flex items-start gap-3 mb-6">
        <span className="step-no">2</span>
        <div>
          <h2 className="font-display font-bold text-xl leading-tight">
            Delivery Method
          </h2>
          <p className="text-sm text-mute mt-0.5">
            Free delivery on orders over 1,500
          </p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="opt flex items-center gap-3 rounded-2xl p-4">
          <input
            type="radio"
            name="ship"
            defaultValue={60}
            className="sr-only"
          />
          <span className="radio-dot" aria-hidden="true" />
          <span className="flex-1 min-w-0">
            <b className="block">Inside Dhaka</b>
            <span className="text-sm text-mute">1–2 business days</span>
          </span>
          <b className="font-display" data-ship={60}>
            60
          </b>
        </label>
        <label className="opt flex items-center gap-3 rounded-2xl p-4">
          <input
            type="radio"
            name="ship"
            defaultValue={120}
            className="sr-only"
          />
          <span className="radio-dot" aria-hidden="true" />
          <span className="flex-1 min-w-0">
            <b className="block">Outside Dhaka</b>
            <span className="text-sm text-mute">2–4 business days</span>
          </span>
          <b className="font-display" data-ship={120}>
            120
          </b>
        </label>
      </div>
    </section>
  );
}
