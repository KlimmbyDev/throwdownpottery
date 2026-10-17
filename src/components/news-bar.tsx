import { NEWS_ANCHOR, newsTeaser, type News } from "@/lib/news";

// One-line strip under the site menu so news is visible without scrolling;
// "Read more" jumps to the full NewsBanner further down.
export default function NewsBar({ news }: { news: News }) {
  return (
    <a
      href={`#${NEWS_ANCHOR}`}
      className="group block bg-blush text-stone hover:bg-blush/80 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-center gap-3 text-sm">
        <span className="shrink-0 text-xs uppercase tracking-widest font-medium">News</span>
        <span className="truncate min-w-0">{newsTeaser(news.body)}</span>
        <span className="shrink-0 underline underline-offset-2 group-hover:no-underline">
          Read more
        </span>
      </div>
    </a>
  );
}
