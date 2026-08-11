import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow larger body for image/PDF base64 in API if needed (Vercel has limits)
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
