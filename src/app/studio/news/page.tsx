import { requireAdmin } from "@/lib/studio-auth";
import { createClient } from "@/lib/supabase/server";
import NewsForm from "@/components/studio/news-form";

export default async function NewsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.from("site_news").select("*").eq("id", 1).maybeSingle();

  // A post written before headlines existed: offer its first line as the
  // headline and the rest as the text, matching how the homepage shows it.
  let title: string = data?.title ?? "";
  let body: string = data?.body ?? "";
  if (!title.trim() && body.trim()) {
    const [first, ...rest] = body.trim().split("\n");
    title = first.trim();
    body = rest.join("\n").trim();
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl text-stone">News</h1>
        <p className="text-sm text-stone/50 mt-1">
          The headline shows in a slim bar at the top of the homepage. If you add text or a
          photo, &ldquo;Read more&rdquo; takes visitors to them under the header. When it&apos;s
          switched off, nothing appears.
        </p>
      </div>
      {error || !data ? (
        <p className="text-sm text-red-500">
          News isn&apos;t fully set up in the database yet. Ask Luka to run the news SQL.
        </p>
      ) : (
        <NewsForm
          initialTitle={title}
          initialBody={body}
          initialImageUrl={data.image_url ?? null}
          publishedAt={data.published_at}
        />
      )}
    </div>
  );
}
