import { NEWS_ANCHOR, newsHasMore, type News } from "@/lib/news";

// One-line strip under the site menu showing the headline, so news is visible
// without scrolling. "Read more" jumps to the full NewsBanner, and only exists
// when there is text or a photo to read.
export default function NewsBar({ news }: { news: News }) {
  const more = newsHasMore(news);
  const content = (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-center gap-3 text-sm">
      <span className="shrink-0 text-xs uppercase tracking-widest font-medium">News</span>
      <span className="truncate min-w-0">{news.title}</span>
      {more && (
        <span className="shrink-0 underline underline-offset-2 group-hover:no-underline">
          Read more
        </span>
      )}
    </div>
  );

  return more ? (
    <a href={`#${NEWS_ANCHOR}`} className="group block bg-blush text-stone hover:bg-blush/80 transition-colors">
      {content}
    </a>
  ) : (
    <div className="bg-blush text-stone">{content}</div>
  );
}
