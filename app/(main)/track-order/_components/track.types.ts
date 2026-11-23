export interface TrackItem {
  name: string;
  slug: string;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface TrackActivity {
  title: string;
  createdAt: string;
}

export interface TrackData {
  orderNumber: string;
  status: string;
  createdAt: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    district: string;
    division?: string;
    upazila?: string;
  };
  items: TrackItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  totalAmount: number;
  payment: { method: string; transactionId?: string; gateway?: string };
  delivery: { courier?: string; trackingNumber?: string; estimatedDeliveryAt?: string };
  activities: TrackActivity[];
}

export const STATUS_STEP: Record<string, number> = {
  pending:    1,
  confirmed:  2,
  processing: 2,
  shipped:    3,
  delivered:  5,
  cancelled:  -1,
  returned:   -1,
  refunded:   -1,
};

export const STATUS_COLOR: Record<string, string> = {
  pending:    "border-line text-mute",
  confirmed:  "border-ink text-ink",
  processing: "border-ink text-ink",
  shipped:    "border-ink text-ink",
  delivered:  "bg-ink text-bg border-ink",
  cancelled:  "border-line text-mute line-through",
  returned:   "border-line text-mute",
  refunded:   "border-line text-mute",
};

export const STATUS_LABEL: Record<string, string> = {
  pending:    "পেমেন্ট যাচাই চলছে",
  confirmed:  "প্যাকিং চলছে",
  processing: "প্যাকিং চলছে",
  shipped:    "কুরিয়ারে আছে",
  delivered:  "ডেলিভারি সম্পন্ন",
  cancelled:  "বাতিল",
  returned:   "ফেরত",
  refunded:   "রিফান্ড",
};
