import Link from "next/link";
import Image from "next/image";
import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";

const POSTS_QUERY = `*[
  _type == "post"
  && defined(slug.current)
  && (!defined($category) || $category in categories[]->slug.current)
]|order(publishedAt desc)[0...12]{
  _id, 
  title, 
  slug, 
  publishedAt,
  tags,
  categories[]->{ _id, title, slug },
  "mainImageUrl": mainImage.asset->url
}`;

const CATEGORIES_QUERY = `*[_type == "category"]{
  _id,
  title,
  slug,
  "count": count(*[_type == "post" && defined(slug.current) && references(^._id)])
} | order(count desc, title asc)`;

const options = { next: { revalidate: 0 } };

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const categoryParam = Array.isArray(sp?.category) ? sp.category[0] : sp?.category;
  const categorySlug = categoryParam ?? null;
  const [categories, posts] = await Promise.all([
    client.fetch<any[]>(CATEGORIES_QUERY, {}, options),
    client.fetch<SanityDocument[]>(POSTS_QUERY, { category: categorySlug }, options),
  ]);
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

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Sidebar: Categories summary */}
          <aside className="lg:col-span-4 space-y-4">
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

          {/* Grid: Posts */}
          <div className="lg:col-span-7 grid gap-10 md:grid-cols-2 lg:grid-cols-2">
            {posts.map((post, index) => (
              <article
                key={post._id}
                className="group relative bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden animate-slideIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
              <Link href={`/blog/${post.slug.current}`} className="block">
                {post.mainImageUrl && (
                  <div className="aspect-video w-full overflow-hidden relative">
                    <Image
                      src={post.mainImageUrl}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 100vw"
                    />
                  </div>
                )}
                
                <div className="p-8">
                  <time className="text-base text-gray-500 font-medium">
                    {new Date(post.publishedAt).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                  
                  <h2 className="mt-3 text-2xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-2">
                    {post.title}
                  </h2>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
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
