import { client } from "@/sanity/client";
import BlogPageClient, {
  type CategoryWithCount,
  type PostListItem,
} from "./BlogPageClient";

export const revalidate = 86400;
export const dynamic = "force-static";

const POSTS_QUERY = `*[
  _type == "post"
  && defined(slug.current)
]|order(publishedAt desc){
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

const options = { next: { tags: ["posts", "categories"] } };

export default async function BlogPage() {
  let categories: CategoryWithCount[] = [];
  let posts: PostListItem[] = [];

  try {
    [categories, posts] = await Promise.all([
      client.fetch<CategoryWithCount[]>(CATEGORIES_QUERY, {}, options),
      client.fetch<PostListItem[]>(POSTS_QUERY, {}, options),
    ]);
  } catch (e) {
    console.error("[blog] Failed to fetch categories or posts", e);
  }

  return <BlogPageClient categories={categories} posts={posts} />;
}
