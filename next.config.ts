import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.4", "localhost"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/:locale(en|ar)/api/:path*",
        destination: "/api/:path*",
      },
    ];
  },
};

export default nextConfig;
