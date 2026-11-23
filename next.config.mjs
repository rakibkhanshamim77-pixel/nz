/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "i.ibb.co.com" },
      // add other image hosts here
    ],
    // Serve modern formats (avif → webp → original) when the browser supports them
    formats: ["image/avif", "image/webp"],
    // Reasonable device sizes covering the product image breakpoints
    deviceSizes: [390, 640, 768, 1024, 1280, 1920],
    imageSizes: [180, 260, 300, 400, 560, 640],
  },
  experimental: {
    serverActions: {
      // One product image (max 5 MB) is sent per server action call
      bodySizeLimit: "6mb",
    },
  },
  // Cache static assets aggressively
  async headers() {
    return [
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
