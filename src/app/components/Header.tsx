"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Close menu on route change
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:bg-gray-950 dark:border-gray-800">
      <div className="container mx-auto max-w-[1920px] px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-lg md:text-xl font-black tracking-tight font-sans text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 animate-gradient">
          聖丁日記
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm md:text-base">
          <Link href="/blog" className="text-gray-700 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-indigo-400">ブログ</Link>
          <Link href="/#services" className="text-gray-700 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-indigo-400">関連サービス</Link>
          <Link href="/#sns" className="text-gray-700 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-indigo-400">SNS</Link>
        </nav>
        <button
          className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-900"
          aria-label="メニュー"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {open ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>
      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950">
          <nav className="container mx-auto max-w-[1920px] px-6 py-3 flex flex-col gap-2 text-base">
            <Link href="/blog" className="py-2 text-gray-800 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-indigo-400">ブログ</Link>
            <Link href="/#services" className="py-2 text-gray-800 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-indigo-400">関連サービス</Link>
            <Link href="/#sns" className="py-2 text-gray-800 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-indigo-400">SNS</Link>
          </nav>
        </div>
      )}
    </header>
  );
}

