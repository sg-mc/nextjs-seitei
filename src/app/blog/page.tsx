import Link from "next/link";
import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";

const POSTS_QUERY = `*[
  _type == "post"
  && defined(slug.current)
]|order(publishedAt desc)[0...12]{
  _id, 
  title, 
  slug, 
  publishedAt,
  tags,
  categories[]->{ _id, title, slug },
  "mainImageUrl": mainImage.asset->url
}`;

const options = { next: { revalidate: 0 } };

export default async function BlogPage() {
  const posts = await client.fetch<SanityDocument[]>(POSTS_QUERY, {}, options);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="container mx-auto max-w-5xl px-6 py-16">
        <header className="mb-16 text-center animate-fadeIn">
          <h1 className="text-6xl font-black text-transparent bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text mb-4">
            記事一覧
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            2017年ごろに書いていた、カネと女の攻略法の記事を順次アップしています。
          </p>
        </header>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <article
              key={post._id}
              className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-700/50 animate-slideIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Link href={`/hello-sanity/${post.slug.current}`} className="block">
                {post.mainImageUrl && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={post.mainImageUrl} 
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <time className="text-sm text-slate-500 font-medium">
                    {new Date(post.publishedAt).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                  
                  <h2 className="mt-3 text-xl font-bold text-slate-100 group-hover:text-slate-300 transition-colors duration-200 line-clamp-2">
                    {post.title}
                  </h2>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.categories && post.categories.map((category: any) => (
                      <span key={category._id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-rose-900/30 to-pink-900/30 text-rose-200 border border-rose-800/30">
                        {category.title}
                      </span>
                    ))}
                    {post.tags && post.tags.map((tag: string, index: number) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800/50 text-slate-400 border border-slate-700/50">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                </div>
              </Link>
            </article>
          ))}
        </div>
        
        {posts.length === 0 && (
          <div className="text-center py-20 animate-fadeIn">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-xl text-slate-400">
              まだ投稿がありません
            </p>
          </div>
        )}
      </div>
    </main>
  );
}