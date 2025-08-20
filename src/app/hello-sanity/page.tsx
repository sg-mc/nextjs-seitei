import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import Link from "next/link";

const POSTS_QUERY = `*[_type == "post"]{
  _id,
  title,
  slug,
  publishedAt
}`;

const options = { next: { revalidate: 30 } };

export default async function PostsPage() {
  const posts = await client.fetch<SanityDocument[]>(POSTS_QUERY, {}, options);

  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8">
      <h1 className="text-4xl font-bold mb-8">All Posts</h1>
      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <Link
            key={post._id}
            href={`/blog/${post.slug.current}`}
            className="border p-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-2xl font-semibold">{post.title}</h2>
            <p className="text-gray-600">
              {new Date(post.publishedAt).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
