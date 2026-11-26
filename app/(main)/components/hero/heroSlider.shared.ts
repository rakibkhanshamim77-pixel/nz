// Shared types + small formatting helpers for the hero slider.

export interface HeroSlideImage {
  src: string;
  alt: string;
}

export interface HeroSlideColor {
  name: string;
  hex: string;
}

export interface HeroSlide {
  id: string;
  badge: string;
  title: string;
  description: string;
  /** Prices in BDT (whole taka) */
  regularPrice: number;
  salePrice: number;
  /** Discount percentage, e.g. 34 */
  discount: number;
  slug: string;
  features: string[];
  image: HeroSlideImage;
  colors?: HeroSlideColor[];
}

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** 1250 -> "১২৫০" (deterministic, so server and client render the same output) */
export function toBengaliDigits(value: number | string): string {
  return String(value).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}

/** 1250 -> "BDT 1,250" */
export function formatTaka(amount: number): string {
  const grouped = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `BDT ${grouped}`;
}
