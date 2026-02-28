import { PortableText } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation"; // 変更理由: データ未取得時に適切に404へ（エラーハンドリング改善）
import { formatDate } from "@/lib/date"; // 変更理由: 日付表示の共通化（DRY）

// Local types for fetched data
type SlugRef = { current?: string };
type Category = { _id: string; title: string; slug?: SlugRef };
type Post = {
  _id: string;
  title: string;
  slug: SlugRef;
  publishedAt?: string | Date;
  body?: unknown;
  image?: SanityImageSource | null;
  imageLqip?: string | null;
  tags?: string[];
  categories?: Category[];
};
type RelatedPost = {
  _id: string;
  title: string;
  slug: SlugRef;
  publishedAt?: string;
  categories?: Category[];
  mainImageUrl?: string | null;
  mainImageLqip?: string | null;
};
type PostSlug = { slug?: string };

export const revalidate = 1800;
export const dynamicParams = true;
export const dynamic = "force-static";

// 不要フィールドの展開を避け、必要最小限の取得に絞る（GROQ最適化）
const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  publishedAt,
  body[]{
    ...,
    _type == "image" => {
      ...,
      asset->{ _id, url, metadata { lqip, dimensions } }
    }
  },
  "image": mainImage,
  "imageLqip": mainImage.asset->metadata.lqip,
  tags,
  categories[]->{ _id, title, slug }
}`;

const RELATED_POSTS_QUERY = `*[
  _type == "post" && defined(slug.current) && slug.current != $slug && (
    count((categories[]->slug.current)[@ in $categorySlugs]) > 0 ||
    count(tags[@ in $tags]) > 0
  )
]|order(publishedAt desc)[0...6]{
  _id,
  title,
  slug,
  publishedAt,
  categories[]->{ _id, title, slug },
  "mainImageUrl": mainImage.asset->url,
  "mainImageLqip": mainImage.asset->metadata.lqip
}`;

const LATEST_EXCEPT_QUERY = `*[_type == "post" && defined(slug.current) && slug.current != $slug]
  |order(publishedAt desc)[0...6]{
    _id,
    title,
    slug,
    publishedAt,
    categories[]->{ _id, title, slug },
    "mainImageUrl": mainImage.asset->url,
    "mainImageLqip": mainImage.asset->metadata.lqip
  }`;
const POST_SLUGS_QUERY = `*[
  _type == "post"
  && defined(slug.current)
]{
  "slug": slug.current
}`;

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

// options will be created per-request to include slug-based tags

export async function generateStaticParams() {
  try {
    const slugs = await client.fetch<PostSlug[]>(POST_SLUGS_QUERY, {}, { next: { tags: ["posts"] } });
    return slugs
      .map((entry) => entry.slug)
      .filter((slug): slug is string => Boolean(slug))
      .map((slug) => ({ slug }));
  } catch (e) {
    console.error("[blog slug] Failed to fetch static params", e);
    return [];
  }
}

export default async function PostPage({
  params,
}: {
  // Netlifyの型チェックに合わせ、NextのPageProps準拠（Promise）に戻す
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const postOptions: { next: { tags: string[] } } = { next: { tags: [`post:${slug}`, "posts"] } };
  let post: Post | null = null;
  try {
    post = await client.fetch<Post>(POST_QUERY, { slug }, postOptions);
  } catch (e) {
    console.error(`[post:${slug}] Failed to fetch post`, e);
  }
  if (!post) {
    // 変更理由: 不正slugやエラー時に404を明示
    notFound();
  }
  const postImageUrl = post.image
    ? urlFor(post.image)?.width(1200).height(675).url()
    : null;
  const postImageBlur = typeof (post as { imageLqip?: unknown }).imageLqip === "string"
    ? ((post as { imageLqip?: string }).imageLqip!.startsWith("data:")
        ? (post as { imageLqip?: string }).imageLqip!
        : `data:image/jpeg;base64,${(post as { imageLqip?: string }).imageLqip!}`)
    : undefined;

  const categorySlugs: string[] = Array.isArray(post.categories)
    ? post.categories
        .map((c: Category) => c?.slug?.current)
        .filter((s: string | undefined): s is string => Boolean(s))
    : [];
  const tags: string[] = Array.isArray(post.tags) ? post.tags : [];

  const listOptions: { next: { tags: string[] } } = { next: { tags: ["posts"] } };
  let relatedPosts: RelatedPost[] = [];
  try {
    relatedPosts = await client.fetch<RelatedPost[]>(
      RELATED_POSTS_QUERY,
      { slug, categorySlugs, tags },
      listOptions
    );
    if (!relatedPosts || relatedPosts.length === 0) {
      relatedPosts = await client.fetch<RelatedPost[]>(
        LATEST_EXCEPT_QUERY,
        { slug },
        listOptions
      );
    }
  } catch (e) {
    console.error(`[post:${slug}] Failed to fetch related posts`, e);
  }

  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8 flex flex-col gap-4">
      <Link href="/blog" className="hover:underline">
        ← 記事一覧に戻る
      </Link>
      {postImageUrl && (
        <div className="relative w-full aspect-video overflow-hidden rounded-xl">
          <Image
            src={postImageUrl}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 768px, 100vw"
            priority
            {...(postImageBlur
              ? { placeholder: "blur" as const, blurDataURL: postImageBlur }
              : {})}
          />
        </div>
      )}
      <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {post.categories && post.categories.map((category: { _id: string; title: string }) => (
          <span key={category._id} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
            {category.title}
          </span>
        ))}
        {post.tags && post.tags.map((tag: string, index: number) => (
          <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
            #{tag}
          </span>
        ))}
      </div>
      
      <div>
        {post.publishedAt ? (
          <p>Published: {formatDate(post.publishedAt)}</p>
        ) : null}
        {Array.isArray(post.body) && (
          <PortableText
            value={post.body}
            components={{
              // 安全なリンクのみ許可
              types: {
                image: ({ value }) => {
                  const imageValue = value as
                    | {
                        asset?:
                          | { _ref?: string }
                          | { url?: string; metadata?: { lqip?: string; dimensions?: { aspectRatio?: number } } };
                        alt?: string;
                        caption?: string;
                      }
                    | undefined;
                  if (!imageValue?.asset) return null;

                  const imageUrl = urlFor(imageValue)?.width(1600).fit("max").auto("format").url();
                  if (!imageUrl) return null;

                  const lqip =
                    typeof imageValue.asset === "object" &&
                    imageValue.asset &&
                    "metadata" in imageValue.asset &&
                    typeof imageValue.asset.metadata?.lqip === "string"
                      ? imageValue.asset.metadata.lqip
                      : undefined;
                  const blurDataURL =
                    typeof lqip === "string"
                      ? lqip.startsWith("data:") ? lqip : `data:image/jpeg;base64,${lqip}`
                      : undefined;
                  const aspectRatio =
                    typeof imageValue.asset === "object" &&
                    imageValue.asset &&
                    "metadata" in imageValue.asset &&
                    typeof imageValue.asset.metadata?.dimensions?.aspectRatio === "number"
                      ? imageValue.asset.metadata.dimensions.aspectRatio
                      : undefined;
                  const alt =
                    typeof imageValue.alt === "string" && imageValue.alt.trim().length > 0
                      ? imageValue.alt
                      : "Embedded image";
                  const caption =
                    typeof imageValue.caption === "string" && imageValue.caption.trim().length > 0
                      ? imageValue.caption
                      : null;

                  return (
                    <figure className="my-8">
                      <div
                        className="relative w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800"
                        style={{ aspectRatio: aspectRatio || 16 / 9 }}
                      >
                        <Image
                          src={imageUrl}
                          alt={alt}
                          fill
                          className="object-contain"
                          sizes="(min-width: 768px) 768px, 100vw"
                          {...(blurDataURL ? { placeholder: "blur" as const, blurDataURL } : {})}
                        />
                      </div>
                      {caption ? (
                        <figcaption className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
                          {caption}
                        </figcaption>
                      ) : null}
                    </figure>
                  );
                },
              },
              block: {
                h1: ({ children }) => (
                  <h1 className="mt-8 mb-4 text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="mt-8 mb-4 text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mt-6 mb-3 text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="mt-6 mb-2 text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {children}
                  </h4>
                ),
                normal: ({ children }) => (
                  <p className="my-4 leading-7 text-gray-800 dark:text-gray-200">{children}</p>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="my-6 border-l-4 border-indigo-500 pl-4 italic text-gray-700 dark:text-gray-300">
                    {children}
                  </blockquote>
                ),
              },
              list: {
                bullet: ({ children }) => (
                  <ul className="my-4 list-disc pl-6 space-y-1">{children}</ul>
                ),
                number: ({ children }) => (
                  <ol className="my-4 list-decimal pl-6 space-y-1">{children}</ol>
                ),
              },
              listItem: {
                bullet: ({ children }) => <li className="leading-7">{children}</li>,
                number: ({ children }) => <li className="leading-7">{children}</li>,
              },
              marks: {
                link: ({ children, value }) => {
                  const v = value as Record<string, unknown> | undefined;
                  const rawHref = v && typeof v.href === "string" ? (v.href as string) : undefined;

                  const sanitizeHref = (href?: string): string | undefined => {
                    if (!href) return undefined;
                    // 許可: 相対パス, アンカー, http/https, mailto, tel
                    if (href.startsWith("/") || href.startsWith("#")) return href;
                    try {
                      const url = new URL(href);
                      const allowed = ["http:", "https:", "mailto:", "tel:"];
                      return allowed.includes(url.protocol.toLowerCase()) ? href : undefined;
                    } catch {
                      return undefined;
                    }
                  };

                  const href = sanitizeHref(rawHref);
                  if (!href) {
                    return <span>{children}</span>;
                  }
                  const isExternal = href.startsWith("http://") || href.startsWith("https://");
                  return (
                    <a
                      href={href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className="underline decoration-indigo-500/60 hover:decoration-indigo-500 text-indigo-700 dark:text-indigo-400"
                    >
                      {children}
                    </a>
                  );
                },
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
              },
            }}
          />
        )}
      </div>

      {/* Newsletter CTA */}
      <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900 shadow-sm text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            最新記事や限定コンテンツを配信中
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            メルマガ登録はこちらから。
          </p>
          <a
            href="https://x.bmd.jp/bm/p/f/tf.php?id=bm94198yj&task=regist"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transition-all"
          >
            メルマガに登録する
          </a>
        </div>
      </div>

      {/* Related Posts */}
      {Array.isArray(relatedPosts) && relatedPosts.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            関連記事
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {relatedPosts.map((rp: RelatedPost, index: number) => (
              <article
                key={rp._id}
                className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Link href={`/blog/${rp.slug.current}`} prefetch={false} className="block">
                  <div className="aspect-video w-full overflow-hidden relative">
                    {rp.mainImageUrl ? (
                      <Image
                        src={rp.mainImageUrl}
                        alt={rp.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(min-width: 768px) 50vw, 100vw"
                        {...(typeof rp.mainImageLqip === "string" && rp.mainImageLqip
                          ? {
                              placeholder: "blur" as const,
                              blurDataURL: rp.mainImageLqip.startsWith("data:")
                                ? rp.mainImageLqip
                                : `data:image/jpeg;base64,${rp.mainImageLqip}`,
                            }
                          : {})}
                      />
                    ) : (
                      <Image
                        src="/聖丁アイコン.jpg"
                        alt={rp.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(min-width: 768px) 50vw, 100vw"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <time className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(rp.publishedAt)}
                    </time>
                    <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {rp.title}
                    </h3>
                    {rp.categories && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {rp.categories.map((category: { _id: string; title: string }) => (
                          <span
                            key={category._id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100"
                          >
                            {category.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
