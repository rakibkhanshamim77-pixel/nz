import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL || "https://neeshanz.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/shop", "/product/", "/privacy-policy", "/terms-and-conditions", "/size-guide"],
        disallow: [
          "/admin/",
          "/login",
          "/cart",
          "/checkout",
          "/payment",
          "/order-success",
          "/track-order",
          "/my-account",
          "/api/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
