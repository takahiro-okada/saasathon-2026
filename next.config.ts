import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Woolworths NZ 商品画像
      {
        protocol: "https",
        hostname: "cdn0.woolworths.media",
      },
      {
        protocol: "https",
        hostname: "www.woolworths.co.nz",
      },
      {
        protocol: "https",
        hostname: "assets.woolworths.com.au",
      },
      // Foodstuffs (Pak'nSave / New World) 商品画像
      {
        protocol: "https",
        hostname: "a.fsimg.co.nz",
      },
    ],
  },
};

export default nextConfig;
