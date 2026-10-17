export const NEWS_MAX_LENGTH = 1000;

export type News = { body: string; publishedAt: string };

export function formatNewsDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}
