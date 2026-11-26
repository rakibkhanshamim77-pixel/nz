// Shared types for the hero slider.

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

