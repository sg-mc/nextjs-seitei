import type { Metadata } from "next";
import Header from "./components/Header";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "聖丁日記",
  description: "聖丁（旧サウザー）のブログ『聖丁日記』",
  alternates: { canonical: "/" },
  openGraph: {
    title: "聖丁日記",
    description: "聖丁（旧サウザー）のブログ『聖丁日記』",
    siteName: "聖丁日記",
    images: [
      {
        url: "/banner.jpg",
        width: 1200,
        height: 630,
        alt: "聖丁日記",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "聖丁日記",
    description: "聖丁（旧サウザー）のブログ『聖丁日記』",
    images: ["/banner.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <meta name="google-site-verification" content="l48rwPgw2gEjsECfMJzIu6bZ-U0Ed0s11kHfxFR4wgw" />
        {/* 変更理由: GAへの接続を事前確立し、初回ロードのレイテンシを低減（パフォーマンス微改善） */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        {/* Google tag (gtag.js) */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-ZV3NSZHERG"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-ZV3NSZHERG');
          `}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
