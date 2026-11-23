/**
 * Content block types and defaults.
 * No mongoose here — safe to import from client and server.
 */

export interface AnnouncementContent {
  isEnabled: boolean;
  left: string;
  right: string;
  link: string;
  bgColor: string;
}

export interface SaleBannerContent {
  isEnabled: boolean;
  badge: string;
  title: string;
  subtitle: string;
  buttonText: string;
  link: string;
  bgFrom: string;
  bgTo: string;
  deadline: string; // ISO date string or ""
}

export interface NewsletterContent {
  isEnabled: boolean;
  title: string;
  description: string;
}

export interface DeliveryExchangeContent {
  paragraph1: string;
  paragraph2: string;
}

export interface StaticPageContent {
  body: string;
}

export const CONTENT_DEFAULTS = {
  announcement: {
    isEnabled: true,
    left: "সারা বাংলাদেশে ফ্রি ডেলিভারি – ৳১৫০০ এর উপরে অর্ডারে",
    right: "কোড NZ10 দিয়ে প্রথম অর্ডারে ১০% ছাড়",
    link: "",
    bgColor: "#000000",
  } as AnnouncementContent,

  "sale-banner": {
    isEnabled: true,
    badge: "লিমিটেড অফার",
    title: "সব টি-শার্টে ৩৫% পর্যন্ত ছাড়",
    subtitle: "অফার শেষ হওয়ার আগেই আপনার পছন্দের কালার ও সাইজ বেছে নিন।",
    buttonText: "অফার দেখুন",
    link: "/shop?onSale=1",
    bgFrom: "#5a1730",
    bgTo: "#9b2c4a",
    deadline: "",
  } as SaleBannerContent,

  newsletter: {
    isEnabled: true,
    title: "নতুন কালেকশনের খবর আগে পান",
    description: "ইমেইল দিন, প্রথম অর্ডারে ১০% ছাড়ের কোড পাবেন।",
  } as NewsletterContent,

  "delivery-exchange": {
    paragraph1:
      "ঢাকার ভেতরে ৳৬০ (১–২ কার্যদিবস), ঢাকার বাইরে ৳১২০ (২–৪ কার্যদিবস)। ৳১,৫০০ বা তার বেশি অর্ডারে ডেলিভারি ফ্রি।",
    paragraph2:
      "সাইজ না মিললে পণ্য হাতে পাওয়ার ৭ দিনের মধ্যে ফ্রি এক্সচেঞ্জ। পণ্য অব্যবহৃত ও ট্যাগসহ থাকতে হবে।",
  } as DeliveryExchangeContent,

  about: {
    body: "Neeshanz সম্পর্কে তথ্য এখানে লিখুন।",
  } as StaticPageContent,

  terms: {
    body: "শর্তাবলী এখানে লিখুন।",
  } as StaticPageContent,

  "return-policy": {
    body: "রিটার্ন পলিসি এখানে লিখুন।",
  } as StaticPageContent,

  privacy: {
    body: "প্রাইভেসি পলিসি এখানে লিখুন।",
  } as StaticPageContent,
} as const;

export type ContentSlug = keyof typeof CONTENT_DEFAULTS;

export function getContentDefault<S extends ContentSlug>(
  slug: S,
): (typeof CONTENT_DEFAULTS)[S] {
  return CONTENT_DEFAULTS[slug];
}
