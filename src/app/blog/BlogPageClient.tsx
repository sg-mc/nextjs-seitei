"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { formatDate } from "@/lib/date";

export type SlugRef = { current?: string };
export type Category = { _id: string; title: string; slug?: SlugRef };
export type CategoryWithCount = { _id: string; title: string; slug?: SlugRef; count: number };
export type PostListItem = {
  _id: string;
  title: string;
  slug: SlugRef;
  publishedAt?: string;
  tags?: string[];
  categories?: Category[];
  mainImageUrl?: string;
};

type BlogPageClientProps = {
  categories: CategoryWithCount[];
  posts: PostListItem[];
};

const PAGE_SIZE = 10;

function toPositiveInt(value: string | null): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}

function createPagination(current: number, total: number, siblingCount = 1): Array<number | "dots"> {
  const totalPageNumbers = siblingCount * 2 + 5;
  if (total <= totalPageNumbers) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const leftSibling = Math.max(current - siblingCount, 2);
  const rightSibling = Math.min(current + siblingCount, total - 1);
  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < total - 1;

  const pages: Array<number | "dots"> = [1];
  if (showLeftDots) {
    pages.push("dots");
  } else {
    for (let i = 2; i < leftSibling; i++) pages.push(i);
  }
  for (let i = leftSibling; i <= rightSibling; i++) pages.push(i);
  if (showRightDots) {
    pages.push("dots");
  } else {
    for (let i = rightSibling + 1; i < total; i++) pages.push(i);
  }
  pages.push(total);
  return pages;
}

function buildBlogHref(category: string | null, page: number) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/blog?${query}` : "/blog";
}

export default function BlogPageClient({ categories, posts }: BlogPageClientProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const requestedPage = toPositiveInt(searchParams.get("page"));

  const selectedCategory = useMemo(
    () => categories.find((category) => category.slug?.current === categoryParam),
    [categories, categoryParam]
  );

  const filteredPosts = useMemo(() => {
    if (!categoryParam) return posts;
    return posts.filter((post) =>
      post.categories?.some((category) => category.slug?.current === categoryParam)
    );
  }, [posts, categoryParam]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  const pageItems = createPagination(page, totalPages, 1);
  const start = (page - 1) * PAGE_SIZE;
  const pagedPosts = filteredPosts.slice(start, start + PAGE_SIZE);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto max-w-[1920px] px-6 py-16">
        <header className="mb-10 text-center animate-fadeIn">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-2">
            記事一覧{selectedCategory ? `（${selectedCategory.title}）` : ""}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            2017年ごろに書いていた、カネと女の攻略法の記事を順次アップしています。
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
          <aside className="hidden lg:block lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="p-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">カテゴリ</h2>
              </div>
              <div className="p-3">
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/blog"
                      className={`flex items-start justify-between gap-3 rounded-xl px-4 py-3 text-sm md:text-base hover:bg-gray-50 min-w-0 ${
                        !selectedCategory ? "text-indigo-800 bg-indigo-50" : "text-gray-800"
                      }`}
                    >
                      <span className="font-medium leading-snug whitespace-nowrap overflow-visible">すべて</span>
                    </Link>
                  </li>
                  {categories.map((category) => (
                    <li key={category._id}>
                      <Link
                        href={buildBlogHref(category.slug?.current ?? null, 1)}
                        className={`flex items-start justify-between gap-3 rounded-xl px-4 py-3 text-sm md:text-base hover:bg-gray-50 min-w-0 ${
                          selectedCategory?.slug?.current === category.slug?.current
                            ? "text-indigo-800 bg-indigo-50"
                            : "text-gray-800"
                        }`}
                      >
                        <span className="font-medium whitespace-nowrap leading-snug flex-1 min-w-0 overflow-visible" title={category.title}>
                          {category.title}
                        </span>
                        <span className="ml-3 inline-flex items-center justify-center self-start rounded-full bg-gray-100 text-gray-800 border border-gray-200 px-2.5 py-1 text-sm min-w-[2.25rem]">
                          {category.count}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          <div className="lg:hidden">
            <details className="rounded-2xl border border-gray-200 bg-white">
              <summary className="list-none cursor-pointer px-4 py-3 font-semibold text-gray-900 flex items-center justify-between">
                カテゴリ
                <span className="text-gray-500 text-sm">タップして展開</span>
              </summary>
              <div className="p-3 pt-0">
                <ul className="divide-y divide-gray-100">
                  <li>
                    <Link href="/blog" className="flex items-center justify-between px-2 py-3 text-sm">
                      <span className="font-medium">すべて</span>
                    </Link>
                  </li>
                  {categories.map((category) => (
                    <li key={category._id}>
                      <Link
                        href={buildBlogHref(category.slug?.current ?? null, 1)}
                        className="flex items-center justify-between px-2 py-3 text-sm"
                      >
                        <span className="font-medium whitespace-nowrap">{category.title}</span>
                        <span className="ml-3 inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-800 border border-gray-200 px-2.5 py-1 text-xs min-w-[2rem]">
                          {category.count}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          </div>

          <div className="col-span-full lg:col-span-7 grid grid-cols-2 items-start gap-3 sm:gap-4 md:gap-6">
            {pagedPosts.map((post, index) => (
              <article
                key={post._id}
                className="group relative self-start bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden animate-slideIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Link href={`/blog/${post.slug.current}`} prefetch={false} className="block">
                  <div className="aspect-[16/9] md:aspect-video w-full overflow-hidden relative">
                    <Image
                      src={post.mainImageUrl ?? "/seitei-icon.png"}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 50vw"
                    />
                  </div>

                  <div className="p-2 sm:p-4 md:p-6 lg:p-8">
                    <time className="text-xs sm:text-sm md:text-base text-gray-500 font-medium">
                      {formatDate(post.publishedAt)}
                    </time>

                    <h2 className="mt-1.5 sm:mt-2 text-sm sm:text-lg md:text-2xl leading-snug font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-2 break-words">
                      {post.title}
                    </h2>

                    <div className="hidden sm:flex mt-2 sm:mt-3 md:mt-4 flex-wrap gap-2">
                      {post.categories?.map((category) => (
                        <span key={category._id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {category.title}
                        </span>
                      ))}
                      {post.tags?.map((tag, indexTag) => (
                        <span key={`${post._id}-${indexTag}`} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          <div className="col-span-full lg:col-span-7 mt-8">
            <nav
              aria-label="Pagination"
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm px-4 py-3 flex items-center justify-center gap-2 md:gap-3"
            >
              {hasPrev ? (
                <Link
                  href={buildBlogHref(categoryParam, page - 1)}
                  className="inline-flex items-center gap-1 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  aria-label="前のページ"
                >
                  ← 前へ
                </Link>
              ) : (
                <span
                  className="inline-flex items-center gap-1 rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 px-3 py-2 text-sm font-medium text-gray-400 cursor-not-allowed"
                  aria-disabled="true"
                >
                  ← 前へ
                </span>
              )}

              <ul className="flex items-center gap-1">
                {pageItems.map((item, idx) => {
                  if (item === "dots") {
                    return (
                      <li key={`dots-${idx}`}>
                        <span className="px-3 py-2 text-gray-400">...</span>
                      </li>
                    );
                  }
                  const isCurrent = item === page;
                  const href = buildBlogHref(categoryParam, item);
                  return (
                    <li key={item}>
                      {isCurrent ? (
                        <span
                          aria-current="page"
                          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 text-sm font-semibold shadow-sm"
                        >
                          {item}
                        </span>
                      ) : (
                        <Link
                          href={href}
                          aria-label={`ページ ${item}`}
                          className="inline-flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                        >
                          {item}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>

              {hasNext ? (
                <Link
                  href={buildBlogHref(categoryParam, page + 1)}
                  className="inline-flex items-center gap-1 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  aria-label="次のページ"
                >
                  次へ →
                </Link>
              ) : (
                <span
                  className="inline-flex items-center gap-1 rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 px-3 py-2 text-sm font-medium text-gray-400 cursor-not-allowed"
                  aria-disabled="true"
                >
                  次へ →
                </span>
              )}
            </nav>
            <p className="mt-2 text-center text-xs text-gray-500">
              ページ {page} / {totalPages}
            </p>
          </div>
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-20 animate-fadeIn">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-xl text-gray-500">まだ投稿がありません</p>
          </div>
        )}
      </div>
    </main>
  );
}
