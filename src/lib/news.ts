export const NEWS_MAX_LENGTH = 1000;
export const NEWS_TITLE_MAX_LENGTH = 120;
export const NEWS_ANCHOR = "news";

export type News = {
  title: string;
  body: string | null;
  publishedAt: string;
  imageUrl: string | null;
};

type NewsRow = {
  title?: string | null;
  body?: string | null;
  published_at?: string | null;
  image_url?: string | null;
};

// Rows are read with select("*") so pages keep working whichever news columns
// exist yet. A post from before headlines existed uses its text's first line
// as the headline and the rest as the text.
export function toNews(row: NewsRow | null): News | null {
  if (!row?.published_at) return null;
  let title = row.title?.trim() || null;
  let body = row.body?.trim() || null;
  if (!title && body) {
    const [first, ...rest] = body.split("\n");
    title = first.trim();
    body = rest.join("\n").trim() || null;
  }
  if (!title) return null;
  return { title, body, publishedAt: row.published_at, imageUrl: row.image_url ?? null };
}

// "Read more" and the full news only exist when there's more than the headline.
export function newsHasMore(news: Pick<News, "body" | "imageUrl">) {
  return Boolean(news.body || news.imageUrl);
}

export function formatNewsDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}
