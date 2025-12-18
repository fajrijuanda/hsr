import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.hakush.in",
        pathname: "/hsr/**",
      },
    ],
  },
};

export default nextConfig;
