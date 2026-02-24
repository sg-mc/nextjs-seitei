import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import Link from "next/link";
import { formatDate } from "@/lib/date"; // 変更理由: 日付表示を共通関数に統一（DRY/可読性向上）

const POSTS_QUERY = `*[_type == "post"]{
  _id,
  title,
  slug,
  publishedAt
}`;

const options = { next: { tags: ["posts"] } };

export default async function PostsPage() {
  // 変更理由: フェッチ失敗時でもUIを保ち、ログのみ出す（エラーハンドリング改善）
  let posts: SanityDocument[] = [];
  try {
    posts = await client.fetch<SanityDocument[]>(POSTS_QUERY, {}, options);
  } catch (e) {
    console.error("[hello-sanity] Failed to fetch posts", e);
  }

  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8">
      <h1 className="text-4xl font-bold mb-8">All Posts</h1>
      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <Link
            key={post._id}
            href={`/blog/${post.slug.current}`}
            prefetch={false}
            className="border p-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-2xl font-semibold">{post.title}</h2>
            <p className="text-gray-600">
              {formatDate(post.publishedAt)}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
