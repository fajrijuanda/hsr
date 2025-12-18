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
    ],
  },
};

export default nextConfig;
