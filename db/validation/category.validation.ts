import { SLUG_PATTERN } from "../utils/slug";

export const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
export const FILTER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 &'-]{0,39}$/;

export const CATEGORY_LIMITS = {
  nameMin: 2,
  nameMax: 80,
  slugMax: 80,
  labelMax: 30,
  descriptionMax: 300,
  priceMax: 1_000_000,
} as const;

export interface CategoryPayload {
  name: string;
  slug: string;
  label: string;
  filter: string;
  description: string;
  startingPrice: string;
  bgColor: string;
  accentColor: string;
  order: string;
  isActive: boolean;
  isFeatured: boolean;
}

export type CategoryFieldKey = keyof CategoryPayload;
export type CategoryFieldErrors = Partial<Record<CategoryFieldKey, string>>;

export interface CleanCategory {
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
}

const text = (v: unknown) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ") : "");

export function validateCategory(raw: unknown):
  | { ok: true; data: CleanCategory }
  | { ok: false; errors: CategoryFieldErrors } {
  const input = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const L = CATEGORY_LIMITS;
  const errors: CategoryFieldErrors = {};

  const name = text(input.name);
  if (name.length < L.nameMin) errors.name = "Enter a category name";
  else if (name.length > L.nameMax) errors.name = `Keep the name under ${L.nameMax} characters`;

  const slug = text(input.slug).toLowerCase();
  if (!slug) errors.slug = "Enter a slug (English letters, numbers and dashes)";
  else if (slug.length > L.slugMax || !SLUG_PATTERN.test(slug))
    errors.slug = "Use lowercase English letters, numbers and single dashes, e.g. basic-tshirt";

  const label = text(input.label);
  if (label.length > L.labelMax) errors.label = `Keep the tag under ${L.labelMax} characters`;

  const filter = text(input.filter);
  if (!FILTER_PATTERN.test(filter))
    errors.filter = "Use 1–40 English letters, numbers, spaces or dashes";

  const description = text(input.description);
  if (description.length > L.descriptionMax)
    errors.description = `Keep the description under ${L.descriptionMax} characters`;

  const priceRaw = text(input.startingPrice);
  const startingPrice = priceRaw === "" ? 0 : /^\d{1,7}$/.test(priceRaw) ? Number(priceRaw) : NaN;
  if (Number.isNaN(startingPrice) || startingPrice > L.priceMax)
    errors.startingPrice = "Enter a whole taka amount (or leave empty)";

  const bgColor = text(input.bgColor);
  if (!HEX_COLOR.test(bgColor)) errors.bgColor = "Use a hex colour like #1f2937";
  const accentColor = text(input.accentColor);
  if (!HEX_COLOR.test(accentColor)) errors.accentColor = "Use a hex colour like #cbd5e1";

  const orderRaw = text(input.order);
  const order = orderRaw === "" ? 0 : /^-?\d{1,4}$/.test(orderRaw) ? Number(orderRaw) : NaN;
  if (Number.isNaN(order)) errors.order = "Use a whole number between -9999 and 9999";

  if (Object.keys(errors).length) return { ok: false, errors };

  return {
    ok: true,
    data: {
      name,
      slug,
      label,
      filter,
      description,
      startingPrice,
      bgColor: bgColor.toLowerCase(),
      accentColor: accentColor.toLowerCase(),
      order,
      isActive: input.isActive !== false,
      isFeatured: input.isFeatured === true,
    },
  };
}
