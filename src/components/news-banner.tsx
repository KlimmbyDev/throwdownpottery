import { formatNewsDate, type News } from "@/lib/news";

export default function NewsBanner({ news }: { news: News }) {
  return (
    <section aria-label="News" className="bg-blush/20 border-b border-blush">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-clay text-xs uppercase tracking-widest mb-3">
          News · <time dateTime={news.publishedAt}>{formatNewsDate(news.publishedAt)}</time>
        </p>
        <p className="font-serif text-stone text-lg md:text-xl leading-relaxed whitespace-pre-line">
          {news.body}
        </p>
      </div>
    </section>
  );
}
