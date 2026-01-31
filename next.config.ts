import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "example.com",
        pathname: "/**",
      },
    ],
  },

  // (opsiyonel) LAN'dan açınca gelen uyarı için:
  allowedDevOrigins: ["http://localhost:3000", "http://192.168.1.23:3000"],
};

export default nextConfig;
