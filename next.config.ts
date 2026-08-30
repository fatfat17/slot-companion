import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    "/api/halls/search": ["./data/japan-postal-addresses.json.br"],
  },
};

export default nextConfig;
