import Link from "next/link";
import Image from "next/image";
import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import ScrollAnimation from "./components/ScrollAnimation";
import MobileCardTapToReveal from "./components/MobileCardTapToReveal";

const LATEST_POSTS_QUERY = `*[
  _type == "post"
  && defined(slug.current)
]|order(publishedAt desc)[0...5]{
  _id, 
  title, 
  slug, 
  publishedAt,
  tags,
  categories[]->{ _id, title, slug },
  "mainImageUrl": mainImage.asset->url
}`;

// Enable ISR so latest posts refresh automatically even without webhooks
const options = { next: { revalidate: 60, tags: ["posts", "categories"] } };

export default async function HomePage() {
  const latestPosts = await client.fetch<SanityDocument[]>(LATEST_POSTS_QUERY, {}, options);

  return (
    <main className="min-h-screen">
      <MobileCardTapToReveal />
      <ScrollAnimation />
      {/* Hero Section */}
      <section className="relative text-white overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/banner.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative z-10 container mx-auto max-w-6xl px-6 py-16 md:py-32">
          <div className="animate-fadeInUp">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-400 animate-gradient glow-text">
              聖丁日記-旧アメブロ跡地-
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
              残酷な資本主義世界で、カネと女の道案内をするブログ。
            </p>
          </div>
        </div>
      </section>

      {/* Self Introduction */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-5xl px-6 scroll-animate">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="prose prose-lg dark:prose-invert">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient animate-fadeInUp">
                聖丁
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                聖丁（旧サウザー）という名前で発信活動をしております。<br />
                元はブラック企業勤務の勤め人で、資本主義の攻略法を考え実践することで勤め人卒業。<br />
                カネがあって、女とセックスできて、楽しい仲間がたくさんいる。持続可能で自由で怠惰な暮らしを構築する方法を届けよう。
              </p>
            </div>
            <div className="flex justify-center animate-fadeInUp" style={{animationDelay: '0.3s'}}>
              <Image 
                src="/seitei-icon.png" 
                alt="聖丁アイコン" 
                width={256}
                height={256}
                className="w-64 h-64 object-contain mix-blend-multiply dark:mix-blend-screen"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Latest Blog Posts */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl px-6 scroll-animate">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
            最新のブログ記事
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
            {latestPosts.slice(0, 3).map((post, index) => (
              <article
                key={post._id}
                className="group relative bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden animate-fadeInUp hover-lift gradient-border"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Link href={`/blog/${post.slug.current}`} className="block">
                  <div className="aspect-video w-full overflow-hidden relative">
                    <Image 
                      src={post.mainImageUrl ?? "/blank.png"} 
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    />
                  </div>
                  <div className="p-6">
                  <time className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(post.publishedAt).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                  
                  <h3 className="mt-3 text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.categories && post.categories.map((category: { _id: string; title: string }) => (
                      <span key={category._id} className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                        {category.title}
                      </span>
                    ))}
                  </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
          
          <div className="text-center">
            <Link href="/blog" className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-full font-bold hover:shadow-lg transition-shadow">
              すべての記事を見る →
            </Link>
          </div>
        </div>
      </section>

      {/* Related Services */}
      <section id="services" className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl px-6 scroll-animate">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
            関連サービス
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 max-w-3xl sm:max-w-4xl mx-auto">
            <a href="https://note.com/fistofphoenix/magazines" target="_blank" rel="noopener noreferrer" className="service-card group relative w-full bg-white dark:bg-gray-900 rounded-xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 aspect-[4/3] md:aspect-[3/2] flex flex-col justify-center items-center text-center overflow-hidden hover-lift card-3d gradient-border animate-scaleIn">
              <div className="absolute inset-0 opacity-20">
                <Image 
                  src="/illust.png" 
                  alt="白熱教室" 
                  fill
                  className="object-cover rounded-xl"
                />
              </div>
              <div className="w-16 h-16 mb-4 relative z-10">
                <Image 
                  src="/audio.png" 
                  alt="白熱教室アイコン" 
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-xl font-bold mb-3 relative z-10">白熱教室</h3>
              <p className="desc text-base text-gray-600 dark:text-gray-400 px-4 max-h-0 group-hover:max-h-40 overflow-y-auto transition-all duration-300 relative z-10">
                noteでオーディオブックを販売しています。
男子の人生にとって必須の栄養であるカネと女の成功、その成分がたくさん含まれた音声教材です。
              </p>
              <div className="cta mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10">
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">続きはこちら →</span>
              </div>
            </a>
            <div className="service-card group relative w-full bg-white dark:bg-gray-900 rounded-xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 aspect-[4/3] md:aspect-[3/2] flex flex-col justify-center items-center text-center overflow-hidden hover-lift card-3d gradient-border animate-scaleIn" style={{animationDelay: '0.1s'}}>
              <div className="absolute inset-0 opacity-20">
                <Image 
                  src="/club.png" 
                  alt="聖丁倶楽部" 
                  fill
                  className="object-cover rounded-xl"
                />
              </div>
              <div className="w-16 h-16 mb-4 relative z-10">
                <Image 
                  src="/clubicon.png" 
                  alt="聖丁倶楽部アイコン" 
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-xl font-bold mb-3 relative z-10">聖丁倶楽部</h3>
              <p className="desc text-base text-gray-600 dark:text-gray-400 px-4 max-h-0 group-hover:max-h-40 overflow-y-auto transition-all duration-300 relative z-10">
                DIY技術向上と、所有物件のリフォーム完工を図る、コミュニティ参加型の実践型DIYスクールです。
              </p>
              <div className="cta mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10">
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">詳しくは下記X,メルマガをチェック</span>
              </div>
            </div>
            <a href="https://itoshima-honeygift.com/" target="_blank" rel="noopener noreferrer" className="service-card group relative w-full bg-white dark:bg-gray-900 rounded-xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 aspect-[4/3] md:aspect-[3/2] flex flex-col justify-center items-center text-center overflow-hidden hover:aspect-auto hover:min-h-[200px] hover-lift card-3d gradient-border animate-scaleIn" style={{animationDelay: '0.2s'}}>
              <div className="absolute inset-0 opacity-20">
                <Image 
                  src="/honey.jpg" 
                  alt="ITOSHIMA HONEY" 
                  fill
                  className="object-cover rounded-xl"
                />
              </div>
              <div className="relative z-10">
                <div className="w-20 h-20 mb-4 mx-auto">
                  <Image 
                    src="/honeylogo.png" 
                    alt="ITOSHIMA HONEYロゴ" 
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold mb-3">ITOSHIMA HONEY</h3>
                <p className="desc text-base text-gray-600 dark:text-gray-400 px-4 max-h-0 group-hover:max-h-40 overflow-hidden transition-all duration-300">
                  福岡県糸島市の豊かな土地の、四季折々の花から集めた蜜からなる絶品のはちみつです。
                </p>
                <div className="cta mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">続きはこちら →</span>
                </div>
              </div>
            </a>
            <a href="https://saintgrail.org/" target="_blank" rel="noopener noreferrer" className="service-card group relative w-full bg-white dark:bg-gray-900 rounded-xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 aspect-[4/3] md:aspect-[3/2] flex flex-col justify-center items-center text-center overflow-hidden hover:aspect-auto hover:min-h-[200px] hover-lift card-3d gradient-border animate-scaleIn" style={{animationDelay: '0.3s'}}>
              <div className="absolute inset-0 opacity-20">
                <Image 
                  src="/saint-grail.png" 
                  alt="セイントグレイル製品" 
                  fill
                  className="object-cover rounded-xl"
                />
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 mb-4 mx-auto">
                  <Image 
                    src="/sglogo.png" 
                    alt="セイントグレイルロゴ" 
                    width={64}
                    height={64}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold mb-3">セイントグレイル</h3>
                <p className="desc text-base text-gray-600 dark:text-gray-400 px-4 max-h-0 group-hover:max-h-40 overflow-hidden transition-all duration-300">
                  「自分で使いたい」から開発した、
                  <br />Amazon限定の男性用基礎化粧品セット
                </p>
                <div className="cta mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">続きはこちら →</span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* SNS Links */}
      <section id="sns" className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto max-w-4xl px-6 scroll-animate">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
            SNS
          </h2>
          <div className="flex flex-col items-center gap-4">
            <a 
              href="https://x.com/fist_of_phoenix"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-64 text-center bg-black text-white px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all duration-300 hover-lift"
            >
              X（旧Twitter）はこちら
            </a>
            <a 
              href="https://x.bmd.jp/bm/p/f/tf.php?id=bm94198yj&task=regist"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-64 text-center bg-gradient-to-r from-red-600 to-orange-600 text-white px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all duration-300 hover-lift animate-gradient"
            >
              メルマガ登録はこちら
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
