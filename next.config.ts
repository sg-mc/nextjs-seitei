import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const scriptSrc = [
  "'self'",
  "https://www.googletagmanager.com",
  "https://www.google-analytics.com",
  "'unsafe-inline'",
  // Next.js の開発モードでは eval が使われるため、開発時のみ許可
  ...(isDev ? ["'unsafe-eval'"] : []),
].join(" ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src ${scriptSrc}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://cdn.sanity.io",
      "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com",
      "font-src 'self' data:",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
  { key: "X-Frame-Options", value: "DENY" },
  // HTTPS 運用時に有効。ローカル開発には影響なし
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/hello-sanity/:slug",
        destination: "/blog/:slug",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      // ダウンロード画像の設置前でも表示されるよう一時的にPNGへリライト
      {
        source: "/聖丁アイコン.jpg",
        destination: "/seitei-icon.png",
      },
    ];
  },
};

export default nextConfig;
