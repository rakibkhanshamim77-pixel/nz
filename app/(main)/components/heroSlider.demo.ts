import type { HeroSlide } from "./hero/heroSlider.shared";

// Shown only in development when the database has no featured products.

const IMAGE_1 =
  "https://i.ibb.co/5hng7NHJ/U2mmu-P5-DLyr-Wj2o3-Kt-Mhd-SD7z-Hp-Xh-BOo-H7-IWx-Mn-J.webp?w=1200&h=1200&fit=crop&q=100";
const IMAGE_2 =
  "https://i.ibb.co/gLbPYhP6/QXbn-KTq-Os-BCNeckx-NZu2ll-Hc-HTb-Jxiwvn-IO8-CBFd.webp?w=1200&h=1200&fit=crop&q=100";

export const DEMO_SLIDES: HeroSlide[] = [
  {
    id: "maroon-essential-tee",
    badge: "New Collection",
    title: "Maroon Essential Tee",
    description:
      "Made from 220 GSM premium combed cotton — all-day comfort with a clean everyday look.",
    regularPrice: 1500,
    salePrice: 990,
    discount: 34,
    slug: "maroon-essential-tee",
    features: [
      "100% combed cotton, 220 GSM",
      "Pre-shrunk — keeps its shape after washing",
      "Available in sizes S to XXL",
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
    badge: "Best Winter Deal",
    title: "Signature Piqué Polo",
    description:
      "Classic piqué knit polo — a confident look from the office to casual outings.",
    regularPrice: 2200,
    salePrice: 1540,
    discount: 30,
    slug: "signature-pique-polo",
    features: [
      "Breathable piqué knit fabric",
      "Reinforced collar and placket",
      "Colour-fast dye — won't fade",
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
    badge: "Combo Deal",
    title: "Essential Tee Combo",
    description:
      "Pick any 2 Essential Tees together — extra savings, double the style.",
    regularPrice: 3000,
    salePrice: 2250,
    discount: 25,
    slug: "essential-tee-combo",
    features: [
      "2 t-shirts, your choice of colour",
      "Free delivery inside Dhaka",
      "Easy 7-day exchange",
    ],
    image: { src: IMAGE_1, alt: "Essential Tee two-piece combo pack" },
    colors: [
      { name: "Maroon", hex: "#7f1d1d" },
      { name: "Olive", hex: "#4d5b2a" },
      { name: "Sand", hex: "#d6c7a1" },
    ],
  },
];
