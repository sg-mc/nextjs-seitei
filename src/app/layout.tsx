import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-ZV3NSZHERG"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-ZV3NSZHERG');
`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:bg-gray-950 dark:border-gray-800">
          <div className="container mx-auto max-w-[1920px] px-6 h-16 flex items-center justify-between">
            <Link href="/" className="text-lg md:text-xl font-black tracking-tight font-sans text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 animate-gradient">
              聖丁日記
            </Link>
            <nav className="flex items-center gap-6 text-sm md:text-base">
              <Link href="/blog" className="text-gray-700 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-indigo-400">ブログ</Link>
              <Link href="/#services" className="text-gray-700 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-indigo-400">関連サービス</Link>
              <Link href="/#sns" className="text-gray-700 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-indigo-400">SNS</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
