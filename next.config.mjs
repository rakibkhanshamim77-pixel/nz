/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Product images are uploaded to this server and served from /uploads/... (same origin),
    // so no remote image hosts are needed. Add one here only if you start using an external CDN.
    remotePatterns: [],
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
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), payment=()",
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
    ];

    return [
      // Security headers on all routes
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      // Cache-control: no-store on API routes that return user data
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
      // Cache static assets aggressively
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
