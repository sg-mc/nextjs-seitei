import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/hello-sanity/:slug",
        destination: "/blog/:slug",
        permanent: false,
      },
      {
        source: "/hello-sanity",
        destination: "/blog",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
