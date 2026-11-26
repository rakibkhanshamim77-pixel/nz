interface Props {
  division?: string;
  district: string;
  upazila?: string;
  address: string;
  courier?: string;
  trackingNumber?: string;
}

export default function OrderDeliveryCard({
  division,
  district,
  upazila,
  address,
  courier,
  trackingNumber,
}: Props) {
  return (
    <section className="card p-5">
      <h2 className="font-display font-bold text-lg mb-4">Delivery Address</h2>

      <dl className="space-y-0 text-sm">
        {division && (
          <div className="flex justify-between gap-4 py-2.5 border-b border-[var(--line)]">
            <dt className="text-[var(--mute)]">Division</dt>
            <dd className="font-semibold">{division}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4 py-2.5 border-b border-[var(--line)]">
          <dt className="text-[var(--mute)]">District</dt>
          <dd className="font-semibold">{district}</dd>
        </div>
        {upazila && (
          <div className="flex justify-between gap-4 py-2.5 border-b border-[var(--line)]">
            <dt className="text-[var(--mute)]">Upazila</dt>
            <dd className="font-semibold">{upazila}</dd>
          </div>
        )}
        <div className="py-2.5 border-b border-[var(--line)]">
          <dt className="text-[var(--mute)] mb-1">Full address</dt>
          <dd className="text-sm leading-relaxed">{address}</dd>
        </div>

        {/* Courier info */}
        {courier && (
          <>
            <div className="flex justify-between gap-4 py-2.5 border-b border-[var(--line)]">
              <dt className="text-[var(--mute)]">Courier</dt>
              <dd className="font-semibold">{courier}</dd>
            </div>
            {trackingNumber && (
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-[var(--mute)]">Tracking #</dt>
                <dd className="font-mono text-xs font-semibold">{trackingNumber}</dd>
              </div>
            )}
          </>
        )}

        {!courier && (
          <div className="flex justify-between gap-4 py-2.5">
            <dt className="text-[var(--mute)]">Courier</dt>
            <dd className="text-[var(--mute)]">Not assigned yet</dd>
          </div>
        )}
      </dl>
    </section>
  );
}
