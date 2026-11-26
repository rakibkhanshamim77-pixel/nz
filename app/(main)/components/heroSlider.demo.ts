import type { HeroSlide } from "./hero/heroSlider.shared";

// Shown only in development when the database has no featured products.

const IMAGE_1 =
  "/images/demo/maroon-tee.webp";
const IMAGE_2 =
  "/images/demo/pique-polo.webp";

export const DEMO_SLIDES: HeroSlide[] = [
  {
    id: "maroon-essential-tee",
    badge: "নতুন কালেকশন",
    title: "Maroon Essential Tee",
    description:
      "২২০ GSM প্রিমিয়াম কম্বড কটনে তৈরি — সারাদিনের আরাম আর প্রতিদিনের পরিপাটি স্টাইল।",
    regularPrice: 1500,
    salePrice: 990,
    discount: 34,
    slug: "maroon-essential-tee",
    features: [
      "১০০% কম্বড কটন, ২২০ GSM",
      "প্রি-শ্রাঙ্ক — ধোয়ার পরও সাইজ ঠিক থাকে",
      "S থেকে XXL সব সাইজ",
    ],
    image: {
      src: IMAGE_1,
      alt: "Maroon Essential Tee — premium cotton t-shirt",
    },
    colors: [
      { name: "Maroon", hex: "#7f1d1d" },
      { name: "Black", hex: "#111827" },
      { name: "Off White", hex: "#f5f5f4" },
    ],
  },
  {
    id: "signature-pique-polo",
    badge: "শীতের সেরা অফার",
    title: "Signature Piqué Polo",
    description:
      "ক্লাসিক পিকে নিটের পোলো — অফিস থেকে আড্ডা, সব জায়গায় আত্মবিশ্বাসী লুক।",
    regularPrice: 2200,
    salePrice: 1540,
    discount: 30,
    slug: "signature-pique-polo",
    features: [
      "ব্রিদেবল পিকে নিট ফ্যাব্রিক",
      "রিইনফোর্সড কলার ও প্লাকেট",
      "কালার-ফাস্ট ডাই — রং ফিকে হয় না",
    ],
    image: {
      src: IMAGE_2,
      alt: "Signature Piqué Polo — men's knit polo shirt",
    },
    colors: [
      { name: "Navy", hex: "#1e3a8a" },
      { name: "Mint", hex: "#99f6e4" },
      { name: "Charcoal", hex: "#374151" },
    ],
  },
  {
    id: "essential-tee-combo",
    badge: "কম্বো অফার",
    title: "Essential Tee Combo",
    description:
      "যেকোনো ২টি এসেনশিয়াল টি একসাথে নিন — বাড়তি সাশ্রয়, দ্বিগুণ স্টাইল।",
    regularPrice: 3000,
    salePrice: 2250,
    discount: 25,
    slug: "essential-tee-combo",
    features: [
      "২টি টি-শার্ট, পছন্দমতো রং",
      "ঢাকার ভেতরে ফ্রি ডেলিভারি",
      "৭ দিনের সহজ এক্সচেঞ্জ",
    ],
    image: { src: IMAGE_1, alt: "Essential Tee two-piece combo pack" },
    colors: [
      { name: "Maroon", hex: "#7f1d1d" },
      { name: "Olive", hex: "#4d5b2a" },
      { name: "Sand", hex: "#d6c7a1" },
    ],
  },
];
