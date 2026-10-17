import Image from "next/image";
import { NEWS_ANCHOR, formatNewsDate, type News } from "@/lib/news";

export default function NewsBanner({ news }: { news: News }) {
  const label = (
    <p className="text-clay text-xs uppercase tracking-widest mb-3">
      News · <time dateTime={news.publishedAt}>{formatNewsDate(news.publishedAt)}</time>
    </p>
  );
  const body = (
    <p className="font-serif text-stone text-lg md:text-xl leading-relaxed whitespace-pre-line">
      {news.body}
    </p>
  );

  return (
    // scroll-mt clears the sticky site menu when "Read more" jumps here.
    <section id={NEWS_ANCHOR} aria-label="News" className="bg-blush/20 border-b border-blush scroll-mt-20">
      {news.imageUrl ? (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-[2fr_3fr] gap-8 items-center">
          <div className="relative aspect-[4/3] rounded-sm overflow-hidden bg-blush/30">
            <Image
              src={news.imageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </div>
          <div className="text-center md:text-left">
            {label}
            {body}
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          {label}
          {body}
        </div>
      )}
    </section>
  );
}
