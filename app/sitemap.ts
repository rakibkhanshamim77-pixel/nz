import type { MetadataRoute } from "next";
import dbConnect from "@/db/connect/dbConnect";
import Product from "@/db/models/Product";
import { publishedProductFilter } from "@/db/utils/productVisibility";

const base = process.env.NEXT_PUBLIC_SITE_URL || "https://neeshanz.com";

const staticRoutes: MetadataRoute.Sitemap = [
  {
    url: `${base}/`,
    changeFrequency: "daily",
    priority: 1.0,
    lastModified: new Date(),
  },
  {
    url: `${base}/shop`,
    changeFrequency: "daily",
    priority: 0.9,
    lastModified: new Date(),
  },
  {
    url: `${base}/size-guide`,
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    url: `${base}/privacy-policy`,
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: `${base}/terms-and-conditions`,
    changeFrequency: "yearly",
    priority: 0.3,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    await dbConnect();

    const products = await Product.find(publishedProductFilter())
      .select("slug updatedAt")
      .lean<{ slug: string; updatedAt?: Date }[]>()
      .exec();

    const productUrls: MetadataRoute.Sitemap = products
      .filter((p) => p.slug)
      .map((p) => ({
        url: `${base}/product/${p.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.8,
        ...(p.updatedAt ? { lastModified: p.updatedAt } : {}),
      }));

    return [...staticRoutes, ...productUrls];
  } catch {
    return staticRoutes;
  }
}
