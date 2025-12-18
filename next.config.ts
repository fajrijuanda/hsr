import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.hakush.in",
        pathname: "/hsr/**",
      },
      {
        protocol: "https",
        hostname: "act-webstatic.hoyoverse.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/Mar-7th/StarRailRes/**",
      },
    ],
  },
};

export default nextConfig;
