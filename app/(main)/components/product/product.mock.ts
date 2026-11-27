// Preview data only — replace with real data from the action files when they're ready.
// Reviews are clearly marked as test entries so they're never mistaken for real customer feedback.

import type { ProductCardData } from "@/db/actions/product.action";
import type { ReviewItem } from "@/db/actions/review.action";
import type { ProductDetails, ReviewSummaryData } from "./product.types";

const IMAGE_1 =
  "/images/demo/maroon-tee.webp";
const IMAGE_2 =
  "/images/demo/pique-polo.webp";

export const MOCK_PRODUCT: ProductDetails = {
  _id: "mock-midnight-oversized-tee",
  name: "Midnight Oversized Tee",
  slug: "midnight-oversized-tee",
  eyebrow: "Oversized Tee",
  category: { name: "টি-শার্ট", slug: "t-shirt" },
  images: [IMAGE_1, IMAGE_2, IMAGE_1],
  description:
    "ড্রপ-শোল্ডার কাট আর রিল্যাক্সড ফিটের প্রিমিয়াম কটন টি-শার্ট। নরম, হালকা আর বাতাস চলাচলের উপযোগী — গরমের দিনেও সারাদিন আরাম।",
  highlights: [
    "ড্রপ-শোল্ডার ওভারসাইজড ফিট",
    "রিব-নিট গোল গলা, সহজে ঢিলে হয় না",
    "ডাবল-স্টিচ হাতা ও নিচের অংশ",
    "পেছনে ছোট NEESHANZ প্রিন্ট",
  ],
  fabric: "১০০% কটন",
  care: "ঠান্ডা পানিতে উল্টো করে ধুবেন, ব্লিচ ব্যবহার করবেন না, ছায়ায় শুকাবেন, কম তাপে আয়রন করবেন।",
  regularPrice: 990,
  salePrice: 790,
  discount: 20,
  isNew: true,
  colors: [
    { name: "কালো", hex: "#111111", images: [IMAGE_1, IMAGE_2] },
    { name: "সাদা", hex: "#f5f5f4", images: [IMAGE_2, IMAGE_1] },
    { name: "ধূসর", hex: "#9e9e9e" },
  ],
  sizes: [
    { label: "S", stock: 8 },
    { label: "M", stock: 3 },
    { label: "L", stock: 12 },
    { label: "XL", stock: 0 },
    { label: "XXL", stock: 5 },
  ],
  stock: 28,
  sizeChart: {
    unit: "ইঞ্চি",
    rows: [
      { size: "S", chest: 40, length: 27, sleeve: 20 },
      { size: "M", chest: 42, length: 28, sleeve: 21 },
      { size: "L", chest: 44, length: 29, sleeve: 22 },
      { size: "XL", chest: 46, length: 30, sleeve: 23 },
      { size: "XXL", chest: 48, length: 31, sleeve: 24 },
    ],
    note: "ওভারসাইজড ফিট — রেগুলার ফিট চাইলে এক সাইজ ছোট নিন।",
  },
};

export const MOCK_REVIEWS: ReviewItem[] = [
  {
    id: "mock-review-1",
    customerName: "টেস্ট কাস্টমার ১",
    avatarColor: "#3b82f6",
    badge: "ক্রেতা",
    rating: 5,
    comment:
      "[ডেমো রিভিউ] এখানে আসল কাস্টমারের রিভিউ দেখাবে — এই লেখাটি শুধু UI প্রিভিউয়ের জন্য।",
    storeReply: "[ডেমো] এখানে স্টোরের রিপ্লাই দেখাবে।",
    isVerifiedPurchase: true,
    createdAt: "2026-11-12T10:00:00.000Z",
  },
  {
    id: "mock-review-2",
    customerName: "টেস্ট কাস্টমার ২",
    avatarColor: "#10b981",
    badge: "ক্রেতা",
    rating: 4,
    comment:
      "[ডেমো রিভিউ] রিপ্লাই ছাড়া রিভিউ কার্ড কেমন দেখায় তা দেখার জন্য।",
    storeReply: null,
    isVerifiedPurchase: false,
    createdAt: "2026-11-05T10:00:00.000Z",
  },
];

export const MOCK_REVIEW_SUMMARY: ReviewSummaryData = {
  average: 4.5,
  total: 2,
  distribution: { 5: 1, 4: 1, 3: 0, 2: 0, 1: 0 },
};

export const MOCK_RELATED: ProductCardData[] = [
  {
    _id: "r1",
    name: "Classic Essential Tee",
    slug: "classic-essential-tee",
    images: [IMAGE_1],
    regularPrice: 288,
    salePrice: 188,
    discount: 35,
  },
  {
    _id: "r2",
    name: "Oxford Formal Shirt",
    slug: "oxford-formal-shirt",
    images: [IMAGE_2],
    regularPrice: 1890,
    salePrice: 1450,
    discount: 23,
  },
  {
    _id: "r3",
    name: "Stone Grey Tee",
    slug: "stone-grey-tee",
    images: [IMAGE_1],
    regularPrice: 590,
    salePrice: 450,
    discount: 24,
  },
  {
    _id: "r4",
    name: "Noir Casual Shirt",
    slug: "noir-casual-shirt",
    images: [],
    regularPrice: 1490,
    salePrice: 1190,
    discount: 20,
  },
];
