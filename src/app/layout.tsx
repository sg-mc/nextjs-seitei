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

export const metadata: Metadata = {
  title: "聖丁日記",
  description: "聖丁（旧サウザー）のブログ『聖丁日記』",
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
    <html lang="en">
      <head>
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
