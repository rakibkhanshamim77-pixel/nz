export const DEFAULT_LIMIT = 15;

export const FILTER_TABS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "published", label: "Published" },
  { value: "featured", label: "Featured" },
] as const;

export type ReviewFilterTab = "" | "pending" | "published" | "featured";

export interface ReviewRow {
  _id: string;
  customerName: string;
  avatarColor: string;
  badge: string;
  rating: number;
  comment: string;
  storeReply: string | null;
  storeRepliedAt: string | null;
  isVerifiedPurchase: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  order: number;
  productName: string | null;
  createdAt: string;
}

export function starLabel(rating: number) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
