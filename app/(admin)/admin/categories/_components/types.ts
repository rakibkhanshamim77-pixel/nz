export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  label: string;
  filter: string;
  description: string;
  startingPrice: number;
  bgColor: string;
  accentColor: string;
  order: number;
  isActive: boolean;
  isFeatured: boolean;
  productCount: number;
  /** Lowest sale price among this category's live products, if any */
  lowestLivePrice: number | null;
}

export interface CategoryChoice {
  filter: string;
  name: string;
}
