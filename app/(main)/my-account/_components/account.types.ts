export interface AccountOrderItem {
  name: string;
  slug?: string;
  image?: string;
  size?: string;
  color?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface AccountOrder {
  orderNumber: string;
  status: string;
  createdAt: string;
  items: AccountOrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  totalAmount: number;
  payment: { method: string; transactionId?: string; gateway?: string };
  delivery: { courier?: string; trackingNumber?: string };
  customer: { name: string; phone: string; address: string; district: string; division?: string };
}

export interface AccountAddress {
  _id: string;
  label: string;
  name: string;
  phone: string;
  address: string;
  district: string;
  city: string;
  isDefault: boolean;
}

export interface AccountStats {
  totalOrders: number;
  activeOrders: number;
  totalItems: number;
  totalSpent: number;
}

export interface AccountUser {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  role: string;
  profileImage?: string;
  isPhoneVerified: boolean;
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending:    "পেমেন্ট যাচাই চলছে",
  confirmed:  "প্যাকিং চলছে",
  processing: "প্যাকিং চলছে",
  shipped:    "কুরিয়ারে আছে",
  delivered:  "ডেলিভারি সম্পন্ন",
  cancelled:  "বাতিল",
  returned:   "ফেরত",
  refunded:   "রিফান্ড",
};

export const ORDER_STATUS_COLOR: Record<string, string> = {
  pending:    "border-line text-mute",
  confirmed:  "border-ink text-ink",
  processing: "border-ink text-ink",
  shipped:    "border-ink text-ink",
  delivered:  "bg-ink text-bg border-ink",
  cancelled:  "border-line text-mute line-through",
  returned:   "border-line text-mute",
  refunded:   "border-line text-mute",
};
