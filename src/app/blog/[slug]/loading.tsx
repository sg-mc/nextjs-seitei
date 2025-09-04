export default function Loading() {
  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8 flex flex-col gap-4">
      <div className="h-5 w-40 rounded bg-gray-200 animate-pulse" />

      <div className="relative w-full aspect-video overflow-hidden rounded-xl bg-gray-200 animate-pulse" />

      <div className="mt-2 space-y-3">
        <div className="h-8 w-3/4 rounded bg-gray-200 animate-pulse" />
        <div className="flex gap-2">
          <span className="h-6 w-16 rounded-full bg-gray-200 animate-pulse" />
          <span className="h-6 w-16 rounded-full bg-gray-200 animate-pulse" />
          <span className="h-6 w-12 rounded-full bg-gray-200 animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-11/12 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-10/12 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-9/12 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>

      <section className="mt-12">
        <div className="h-7 w-28 mb-4 rounded bg-gray-200 animate-pulse" />
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <article
              key={i}
              className="relative rounded-2xl border border-gray-200 overflow-hidden"
            >
              <div className="aspect-video w-full bg-gray-200 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
                <div className="h-5 w-10/12 rounded bg-gray-200 animate-pulse" />
                <div className="flex gap-2">
                  <span className="h-5 w-16 rounded-full bg-gray-200 animate-pulse" />
                  <span className="h-5 w-12 rounded-full bg-gray-200 animate-pulse" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

