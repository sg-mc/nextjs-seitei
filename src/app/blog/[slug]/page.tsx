import { PortableText, type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import Link from "next/link";
import Image from "next/image";

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]{
  ..., 
  "image": mainImage,
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
  "mainImageUrl": mainImage.asset->url
}`;

const LATEST_EXCEPT_QUERY = `*[_type == "post" && defined(slug.current) && slug.current != $slug]
  |order(publishedAt desc)[0...6]{
    _id,
    title,
    slug,
    publishedAt,
    categories[]->{ _id, title, slug },
    "mainImageUrl": mainImage.asset->url
  }`;

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

const options = { next: { revalidate: 0 } };

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await client.fetch<SanityDocument>(POST_QUERY, { slug }, options);
  const postImageUrl = post.image
    ? urlFor(post.image)?.width(1200).height(675).url()
    : null;

  const categorySlugs: string[] = Array.isArray(post.categories)
    ? post.categories
        .map((c: any) => c?.slug?.current)
        .filter((s: string | undefined): s is string => Boolean(s))
    : [];
  const tags: string[] = Array.isArray(post.tags) ? post.tags : [];

  let relatedPosts = await client.fetch<SanityDocument[]>(
    RELATED_POSTS_QUERY,
    { slug, categorySlugs, tags },
    options
  );

  if (!relatedPosts || relatedPosts.length === 0) {
    relatedPosts = await client.fetch<SanityDocument[]>(
      LATEST_EXCEPT_QUERY,
      { slug },
      options
    );
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
      
      <div className="prose">
        <p>Published: {new Date(post.publishedAt).toLocaleDateString()}</p>
        {Array.isArray(post.body) && <PortableText value={post.body} />}
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
            {relatedPosts.map((rp: any, index: number) => (
              <article
                key={rp._id}
                className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Link href={`/blog/${rp.slug.current}`} className="block">
                  {rp.mainImageUrl && (
                    <div className="aspect-video w-full overflow-hidden relative">
                      <Image
                        src={rp.mainImageUrl}
                        alt={rp.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(min-width: 768px) 50vw, 100vw"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <time className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(rp.publishedAt).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
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
