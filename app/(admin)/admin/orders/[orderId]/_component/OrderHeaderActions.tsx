"use client";

import { useState } from "react";
import Link from "next/link";
import UpdateStatusModal from "./UpdateStatusModal";

interface Props {
  orderId: string;
  currentStatus: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
}

export default function OrderHeaderActions({
  orderId,
  currentStatus,
  orderNumber,
  customerName,
  totalAmount,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <Link
          href={`/invoice/${orderNumber}`}
          target="_blank"
          className="btn-ghost !h-9 !px-3 text-sm inline-flex items-center gap-1.5"
          aria-label="Download invoice"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M12 16l-4-4h3V4h2v8h3l-4 4zM4 18h16v2H4z" fill="currentColor" stroke="none"/>
          </svg>
          <span className="hidden sm:inline">Invoice</span>
        </Link>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="btn-solid !h-9 !px-4 text-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />
            <circle cx={7} cy={18} r={1.6} />
            <circle cx={18} cy={18} r={1.6} />
          </svg>
          Update status
        </button>
      </div>

      <UpdateStatusModal
        orderId={orderId}
        currentStatus={currentStatus}
        orderNumber={orderNumber}
        customerName={customerName}
        totalAmount={totalAmount}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
