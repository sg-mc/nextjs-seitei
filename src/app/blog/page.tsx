import Link from "next/link";
import Image from "next/image";
// no need for SanityDocument type here
import { client } from "@/sanity/client";
import { formatDate } from "@/lib/date"; // 変更理由: 日付表示を共通化して重複削減・可読性改善

// Local types for fetched data
type SlugRef = { current?: string };
type CategoryWithCount = { _id: string; title: string; slug?: SlugRef; count: number };
type Category = { _id: string; title: string; slug?: SlugRef };
type PostListItem = {
  _id: string;
  title: string;
  slug: SlugRef;
  publishedAt?: string;
  tags?: string[];
  categories?: Category[];
  mainImageUrl?: string;
};

// 変更理由: ページネーション対応のため、スライスを変数化（$start, $end）
const POSTS_QUERY = `*[
  _type == "post"
  && defined(slug.current)
  && (!defined($category) || $category in categories[]->slug.current)
]|order(publishedAt desc)[$start...$end]{
  _id, 
  title, 
  slug, 
  publishedAt,
  tags,
  categories[]->{ _id, title, slug },
  "mainImageUrl": mainImage.asset->url
}`;

// 変更理由: 総件数を取得してページ数計算に利用（UI/ナビに必要）
const POSTS_COUNT_QUERY = `count(*[
  _type == "post"
  && defined(slug.current)
  && (!defined($category) || $category in categories[]->slug.current)
])`;

const CATEGORIES_QUERY = `*[_type == "category"]{
  _id,
  title,
  slug,
  "count": count(*[_type == "post" && defined(slug.current) && references(^._id)])
} | order(count desc, title asc)`;

const options = { next: { tags: ["posts", "categories"] } };

// 変更理由: ページ番号配列を生成するヘルパーでUIロジックを分離し可読性向上
function createPagination(current: number, total: number, siblingCount = 1): Array<number | 'dots'> {
  const totalPageNumbers = siblingCount * 2 + 5; // 1, last, current±sibling, 2つのドット
  if (total <= totalPageNumbers) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const leftSibling = Math.max(current - siblingCount, 2);
  const rightSibling = Math.min(current + siblingCount, total - 1);
  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < total - 1;

  const pages: Array<number | 'dots'> = [1];
  if (showLeftDots) {
    pages.push('dots');
  } else {
    for (let i = 2; i < leftSibling; i++) pages.push(i);
  }
  for (let i = leftSibling; i <= rightSibling; i++) pages.push(i);
  if (showRightDots) {
    pages.push('dots');
  } else {
    for (let i = rightSibling + 1; i < total; i++) pages.push(i);
  }
  pages.push(total);
  return pages;
}

export default async function BlogPage({
  searchParams,
}: {
  // Netlifyの型チェックに合わせ、NextのPageProps準拠（Promise）に戻す
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const categoryParam = Array.isArray(sp.category) ? sp.category[0] : sp.category;
  const categorySlug = categoryParam ?? null;
  // 変更理由: ページネーション（10件/ページ）を導入
  const pageSize = 10;
  const pageRaw = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Math.max(1, Number.parseInt(String(pageRaw || '1'), 10) || 1);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  // 変更理由: フェッチのエラーハンドリングを追加し、UIの堅牢性を向上
  let categories: CategoryWithCount[] = [];
  let posts: PostListItem[] = [];
  let totalCount = 0;
  try {
    [categories, posts, totalCount] = await Promise.all([
      client.fetch<CategoryWithCount[]>(CATEGORIES_QUERY, {}, options),
      client.fetch<PostListItem[]>(POSTS_QUERY, { category: categorySlug, start, end }, options),
      client.fetch<number>(POSTS_COUNT_QUERY, { category: categorySlug }, options),
    ]);
  } catch (e) {
    console.error("[blog] Failed to fetch categories or posts", e);
  }
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1;
  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const pageItems = createPagination(page, totalPages, 1);
  const selectedCategory = categories?.find(
    (c) => c?.slug?.current === categoryParam
  );
  const chapterOrder = [
    "一章", "二章", "三章", "四章", "五章", "六章", "七章",
  ];
  // 明示的なカテゴリ順（タイトル完全一致で優先）
  const desiredOrderTitles = [
    "一章【これからのカネの話】勤め人卒業へ",
    "二章【これからの女の話】オナ禁でモテる法",
    "三章【これからのカネの話】カネの話",
    "四章【これからの女の話】恋愛エッセイ",
    "五章【これからのカネの話】資本家になろう",
    "六章【これからの女の話】全てはモテるため",
    "七章【これからのカネの話】税金とか会計",
  ];
  const orderIndex = (title: string | undefined) =>
    title ? desiredOrderTitles.indexOf(title) : -1;
  const getChapterIndex = (title: string | undefined) => {
    if (!title) return Number.MAX_SAFE_INTEGER;
    const t = title.replace(/\s+/g, "").replace(/^第/, "");
    const idx = chapterOrder.indexOf(t);
    return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
  };
  const sortedCategories = Array.isArray(categories)
    ? [...categories].sort((a, b) => {
        const ai = orderIndex(a?.title);
        const bi = orderIndex(b?.title);
        if (ai !== -1 || bi !== -1) {
          const av = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
          const bv = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
          if (av !== bv) return av - bv;
        }
        // フォールバック: 章順 → タイトル昇順
        const ca = getChapterIndex(a?.title);
        const cb = getChapterIndex(b?.title);
        if (ca !== cb) return ca - cb;
        return String(a?.title || '').localeCompare(String(b?.title || ''));
      })
    : categories;

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
          {/* Sidebar: Categories summary */}
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
                  {sortedCategories?.map((cat) => (
                    <li key={cat._id}>
                      <Link
                        href={`/blog?category=${cat?.slug?.current}`}
                        className={`flex items-start justify-between gap-3 rounded-xl px-4 py-3 text-sm md:text-base hover:bg-gray-50 min-w-0 ${
                          selectedCategory?.slug?.current === cat?.slug?.current
                            ? "text-indigo-800 bg-indigo-50"
                            : "text-gray-800"
                        }`}
                      >
                        <span className="font-medium whitespace-nowrap leading-snug flex-1 min-w-0 overflow-visible" title={cat.title}>{cat.title}</span>
                        <span className="ml-3 inline-flex items-center justify-center self-start rounded-full bg-gray-100 text-gray-800 border border-gray-200 px-2.5 py-1 text-sm min-w-[2.25rem]">
                          {cat.count}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* Mobile: Collapsible categories */}
          <div className="lg:hidden">  {/* or: className="lg:hidden col-span-full" */}
            <details className="rounded-2xl border border-gray-200 bg-white">
              <summary className="list-none cursor-pointer px-4 py-3 font-semibold text-gray-900 flex items-center justify-between">
                カテゴリ
                <span className="text-gray-500 text-sm">タップして展開</span>
              </summary>
              <div className="p-3 pt-0">
                <ul className="divide-y divide-gray-100">
                  <li>
                    <Link
                      href="/blog"
                      className="flex items-center justify-between px-2 py-3 text-sm"
                    >
                      <span className="font-medium">すべて</span>
                    </Link>
                  </li>
                  {sortedCategories?.map((cat) => (
                    <li key={cat._id}>
                      <Link
                        href={`/blog?category=${cat?.slug?.current}`}
                        className="flex items-center justify-between px-2 py-3 text-sm"
                      >
                        <span className="font-medium whitespace-nowrap">{cat.title}</span>
                        <span className="ml-3 inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-800 border border-gray-200 px-2.5 py-1 text-xs min-w-[2rem]">
                          {cat.count}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          </div>

          {/* Grid: Posts */}
          <div className="col-span-full lg:col-span-7 grid grid-cols-2 items-start gap-3 sm:gap-4 md:gap-6">
            {posts.map((post, index) => (
              <article
                key={post._id}
                className="group relative self-start bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden animate-slideIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
              <Link href={`/blog/${post.slug.current}`} className="block">
                <div className="aspect-[16/9] md:aspect-video w-full overflow-hidden relative">
                  <Image
                    src={post.mainImageUrl ?? "/聖丁アイコン.jpg"}
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
                    {post.categories && post.categories.map((category: { _id: string; title: string }) => (
                      <span key={category._id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {category.title}
                      </span>
                    ))}
                    {post.tags && post.tags.map((tag: string, index: number) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                </div>
              </Link>
            </article>
          ))}
          </div>
          
          {/* Pagination: サイトのスタイルに合わせたリッチUI */}
          <div className="col-span-full lg:col-span-7 mt-8">
            <nav aria-label="ページネーション"
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm px-4 py-3 flex items-center justify-center gap-2 md:gap-3">
              {/* Prev */}
              {hasPrev ? (
                <Link
                  href={`/blog?${new URLSearchParams({ ...(categorySlug ? { category: categorySlug } : {}), page: String(page - 1) }).toString()}`}
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

              {/* Page numbers */}
              <ul className="flex items-center gap-1">
                {pageItems.map((item, idx) => {
                  if (item === 'dots') {
                    return (
                      <li key={`dots-${idx}`}>
                        <span className="px-3 py-2 text-gray-400">…</span>
                      </li>
                    );
                  }
                  const isCurrent = item === page;
                  const href = `/blog?${new URLSearchParams({ ...(categorySlug ? { category: categorySlug } : {}), page: String(item) }).toString()}`;
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

              {/* Next */}
              {hasNext ? (
                <Link
                  href={`/blog?${new URLSearchParams({ ...(categorySlug ? { category: categorySlug } : {}), page: String(page + 1) }).toString()}`}
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
            <p className="mt-2 text-center text-xs text-gray-500">ページ {page} / {totalPages}</p>
          </div>
        </div>
        
        {posts.length === 0 && (
          <div className="text-center py-20 animate-fadeIn">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-xl text-gray-500">
              まだ投稿がありません
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
