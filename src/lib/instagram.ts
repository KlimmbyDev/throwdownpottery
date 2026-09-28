const HANDLE = /^[A-Za-z0-9._]{1,30}$/;

// Accepts "@handle", "handle" or an instagram.com link and returns a canonical
// https URL. Anything else is rejected so arbitrary links (including
// javascript: URLs) can never end up in the public page's href.
export function toInstagramUrl(input: string): string | null | "invalid" {
  const value = input.trim();
  if (!value) return null;

  const bare = value.replace(/^@/, "");
  if (HANDLE.test(bare)) return `https://www.instagram.com/${bare}/`;

  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    const host = url.hostname.toLowerCase();
    if (host !== "instagram.com" && host !== "www.instagram.com") return "invalid";
    const handle = url.pathname.split("/").filter(Boolean)[0] ?? "";
    return HANDLE.test(handle) ? `https://www.instagram.com/${handle}/` : "invalid";
  } catch {
    return "invalid";
  }
}

export function instagramHandle(url: string | null): string {
  if (!url) return "";
  try {
    const handle = new URL(url).pathname.split("/").filter(Boolean)[0];
    return handle ? `@${handle}` : url;
  } catch {
    return url;
  }
}
