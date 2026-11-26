import type {
  ProductFieldErrors,
  ProductStatus,
  SizeChartRowInput,
} from "@/db/validation/product.validation";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/db/utils/imageHosts";

export type RemoteImage = { id: string; kind: "remote"; url: string };

export type LocalImage = {
  id: string;
  kind: "local";
  file: File;
  /** name + size + lastModified — used to stop the same file being added twice */
  fingerprint: string;
  preview: string;
  /** Set once uploaded, so a failed save never re-uploads the same file */
  uploadedUrl?: string;
  status: "idle" | "uploading" | "done" | "error";
  error?: string;
};

export type ImageItem = RemoteImage | LocalImage;

export type ChartRow = SizeChartRowInput & { id: string };

export interface ProductFormState {
  name: string;
  sku: string;
  category: string;
  description: string;
  regularPrice: string;
  salePrice: string;
  stock: string;
  thumbnail: ImageItem | null;
  gallery: ImageItem[];
  colors: string[];
  /** Optional per-color images: { [colorName]: ImageItem[] } */
  colorImages: Record<string, ImageItem[]>;
  sizes: string[];
  features: string[];
  sizeChart: ChartRow[];
  status: ProductStatus;
  publishDate: string;
  publishTime: string;
  isFeatured: boolean;
}

export interface CategoryOption {
  value: string;
  label: string;
}

/** Plain, serializable product data passed from the edit page (server) to the form (client). */
export interface ProductFormInitial {
  id: string;
  slug: string;
  updatedAt: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  regularPrice: number;
  salePrice: number;
  stock: number;
  images: string[];
  colors: string[];
  colorImages: Record<string, string[]>;
  sizes: string[];
  features: string[];
  sizeChart: SizeChartRowInput[];
  isActive: boolean;
  isFeatured: boolean;
  publishAt: string | null;
}

export type FormErrors = ProductFieldErrors;

export type FormPatch = Partial<ProductFormState>;

let seq = 0;
export const uid = (p = "id") => `${p}-${Date.now().toString(36)}-${(seq++).toString(36)}`;

export const imageSrc = (img: ImageItem) => (img.kind === "remote" ? img.url : img.preview);

export const fingerprintOf = (f: File) => `${f.name}:${f.size}:${f.lastModified}`;

/** Client-side pre-check; the server action re-validates the real bytes. */
export function checkImageFile(file: File): string | null {
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type))
    return `${file.name}: only JPG, PNG or WebP images are allowed`;
  if (file.size > MAX_IMAGE_BYTES) return `${file.name}: images must be 5 MB or smaller`;
  return null;
}

export const taka = (n: number) => "BDT " + Math.round(n).toLocaleString("en-US");
