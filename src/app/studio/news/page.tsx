import { requireAdmin } from "@/lib/studio-auth";
import { createClient } from "@/lib/supabase/server";
import NewsForm from "@/components/studio/news-form";

export default async function NewsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_news")
    .select("body, published_at")
    .eq("id", 1)
    .maybeSingle();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl text-stone">News</h1>
        <p className="text-sm text-stone/50 mt-1">
          Shown on the homepage, right under the header. When it&apos;s switched off, nothing
          appears there.
        </p>
      </div>
      {error || !data ? (
        <p className="text-sm text-red-500">
          News isn&apos;t set up in the database yet. Ask Luka to run the news SQL.
        </p>
      ) : (
        <NewsForm initialBody={data.body ?? ""} publishedAt={data.published_at} />
      )}
    </div>
  );
}
