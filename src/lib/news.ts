export const NEWS_MAX_LENGTH = 1000;
export const NEWS_ANCHOR = "news";

export type News = { body: string; publishedAt: string; imageUrl: string | null };

export function formatNewsDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

// The slim bar shows only the first line; CSS truncates it to fit.
export function newsTeaser(body: string) {
  return body.split("\n").find((line) => line.trim())?.trim() ?? "";
}
