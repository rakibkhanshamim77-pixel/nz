/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "i.ibb.co.com" },
      // add other image hosts here
    ],
  },
  experimental: {
    serverActions: {
      // One product image (max 5 MB) is sent per server action call
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
