import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import DeletePieceButton from "@/components/studio/delete-piece-button";

export default async function StudioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/studio/login");

  const { data: potter } = await supabase
    .from("potters")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!potter) {
    return (
      <div className="py-24 text-center">
        <p className="font-serif text-xl text-stone/40 mb-2">Account not linked</p>
        <p className="text-sm text-stone/40">
          Your account hasn't been linked to a potter yet. Contact the administrator.
        </p>
      </div>
    );
  }

  const { data: pieces } = await supabase
    .from("pieces")
    .select("*, piece_images(*)")
    .eq("potter_id", potter.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sage text-xs uppercase tracking-widest mb-1">Your work</p>
          <h1 className="font-serif text-2xl text-stone">{potter.name}</h1>
        </div>
        <Link
          href="/studio/pieces/new"
          className="bg-sage text-stone text-sm font-medium px-5 py-2.5 rounded-full hover:bg-amber transition-colors"
        >
          + Add piece
        </Link>
      </div>

      {!pieces || pieces.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-stone/20 rounded">
          <p className="font-serif text-xl text-stone/40 mb-3">No pieces yet</p>
          <Link
            href="/studio/pieces/new"
            className="text-sm text-clay hover:text-amber transition-colors"
          >
            Add your first piece →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {pieces.map((piece) => {
            const image = (piece.piece_images ?? []).sort(
              (a: { position: number }, b: { position: number }) => a.position - b.position
            )[0];
            return (
              <div key={piece.id}>
                <div className="aspect-[3/4] bg-blush/30 rounded-sm overflow-hidden relative">
                  {image && (
                    <Image
                      src={image.url}
                      alt={piece.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />
                  )}
                  {!piece.available && (
                    <div className="absolute top-2 right-2 bg-stone/70 text-cream text-xs px-2 py-0.5 rounded-full">
                      Sold
                    </div>
                  )}
                  {piece.featured && (
                    <div className="absolute top-2 left-2 bg-sage/80 text-stone text-xs px-2 py-0.5 rounded-full">
                      Featured
                    </div>
                  )}
                </div>
                <div className="mt-2 space-y-1">
                  <p className="font-serif text-stone text-sm leading-tight">{piece.title}</p>
                  <p className="text-xs text-stone/40 uppercase tracking-widest">{piece.category}</p>
                </div>
                <div className="flex gap-3 mt-1.5">
                  <Link
                    href={`/studio/pieces/${piece.id}/edit`}
                    className="text-xs text-clay hover:text-amber transition-colors"
                  >
                    Edit
                  </Link>
                  <DeletePieceButton pieceId={piece.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
