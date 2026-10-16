import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import PieceActions from "@/components/studio/piece-actions";
import PotterPicker from "@/components/studio/potter-picker";
import ArtistSwitcher from "@/components/studio/artist-switcher";
import { requireMember } from "@/lib/studio-auth";
import type { Piece, PieceImage } from "@/lib/types";

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ potter?: string }>;
}) {
  const { potter: potterSlug } = await searchParams;
  const member = await requireMember();
  const isAdmin = member.role === "admin";
  const supabase = await createClient();

  const { data: potters } = await supabase
    .from("potters")
    .select("*")
    .is("archived_at", null)
    .order("name");

  // Artists only ever see their own studio.
  if (!isAdmin) {
    const own = potters?.find((p) => p.id === member.potterId);
    if (!own) {
      return (
        <div className="py-24 text-center max-w-md mx-auto">
          <h1 className="font-serif text-2xl text-stone mb-3">No artist profile yet</h1>
          <p className="text-sm text-stone/60">
            Your login isn&apos;t linked to an artist profile, or the profile is archived. Ask
            Sarah to set it up.
          </p>
        </div>
      );
    }
    if (potterSlug !== own.slug) redirect(`/studio?potter=${own.slug}`);
  }

  // Super admins land on their own studio like everyone else; the picker is
  // only a fallback for an admin login without an artist profile.
  if (!potterSlug) {
    const own = potters?.find((p) => p.id === member.potterId);
    if (own) redirect(`/studio?potter=${own.slug}`);
    return <PotterPicker potters={potters ?? []} />;
  }

  const potter = potters?.find((p) => p.slug === potterSlug);
  if (!potter) redirect("/studio");

  const { data } = await supabase
    .from("pieces")
    .select("*, piece_images(*)")
    .eq("potter_id", potter.id)
    .order("created_at", { ascending: false });

  const pieces: Piece[] = data ?? [];
  const live = pieces.filter((p) => !p.archived_at);
  const archived = pieces.filter((p) => p.archived_at);

  function renderPiece(piece: Piece) {
    const image = [...(piece.piece_images ?? [])].sort(
      (a: PieceImage, b: PieceImage) => a.position - b.position
    )[0];
    return (
      <div key={piece.id} className={piece.archived_at ? "opacity-60" : undefined}>
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
          {piece.featured && !piece.archived_at && (
            <div className="absolute top-2 left-2 bg-sage/80 text-stone text-xs px-2 py-0.5 rounded-full">
              Homepage
            </div>
          )}
        </div>
        <div className="mt-2 space-y-1">
          <p className="font-serif text-stone text-sm leading-tight">{piece.title}</p>
          <p className="text-xs text-stone/40 uppercase tracking-widest">{piece.category}</p>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
          <Link
            href={`/studio/pieces/${piece.id}/edit?potter=${potter!.slug}`}
            className="text-xs text-clay hover:text-amber transition-colors"
          >
            Edit
          </Link>
          <PieceActions pieceId={piece.id} archived={!!piece.archived_at} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          {isAdmin && (
            <ArtistSwitcher
              artists={(potters ?? []).map((p) => ({ name: p.name, slug: p.slug }))}
              current={potter.slug}
            />
          )}
          <h1 className="font-serif text-2xl text-stone">{potter.name}</h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <Link
              href={`/studio/profile?potter=${potter.slug}`}
              className="text-xs text-clay hover:text-amber transition-colors"
            >
              Edit profile
            </Link>
            <a
              href={`/artists/${potter.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-clay hover:text-amber transition-colors"
            >
              {isAdmin ? "View public page ↗" : "View my page ↗"}
            </a>
          </div>
        </div>
        <Link
          href={`/studio/pieces/new?potter=${potter.slug}`}
          className="bg-sage text-stone text-sm font-medium px-5 py-2.5 rounded-full hover:bg-amber transition-colors"
        >
          + Add piece
        </Link>
      </div>

      {live.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-stone/20 rounded">
          <p className="font-serif text-xl text-stone/40 mb-3">No pieces yet</p>
          <Link
            href={`/studio/pieces/new?potter=${potter.slug}`}
            className="text-sm text-clay hover:text-amber transition-colors"
          >
            Add your first piece →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">{live.map(renderPiece)}</div>
      )}

      {archived.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-lg text-stone">Archived</h2>
          <p className="text-xs text-stone/40 mb-6">
            Hidden from the site. Restore a piece to show it again.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">{archived.map(renderPiece)}</div>
        </section>
      )}
    </div>
  );
}
