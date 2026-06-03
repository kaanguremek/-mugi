import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'picsum.photos' }],
    unoptimized: true,   // static export için zorunlu
  },
};

export default nextConfig;
