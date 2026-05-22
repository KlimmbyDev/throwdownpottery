"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { Piece, PieceCategory, PieceImage } from "@/lib/types";

const CATEGORIES: { value: PieceCategory; label: string }[] = [
  { value: "bowl", label: "Bowl" },
  { value: "mug", label: "Mug" },
  { value: "vase", label: "Vase" },
  { value: "plate", label: "Plate" },
  { value: "sculpture", label: "Sculpture" },
  { value: "cup", label: "Cup" },
  { value: "platter", label: "Platter" },
  { value: "other", label: "Other" },
];

type ExistingImage = PieceImage & { _toDelete?: boolean };
type NewImage = { url: string };

type Props = {
  potterId: string;
  potterSlug: string;
  piece?: Piece & { piece_images?: PieceImage[] };
};

export default function PieceForm({ potterId, potterSlug, piece }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(piece?.title ?? "");
  const [category, setCategory] = useState<PieceCategory>(piece?.category ?? "other");
  const [price, setPrice] = useState(piece?.price?.toString() ?? "");
  const [description, setDescription] = useState(piece?.description ?? "");
  const [materials, setMaterials] = useState(piece?.materials ?? "");
  const [dimensions, setDimensions] = useState(piece?.dimensions ?? "");
  const [available, setAvailable] = useState(piece?.available ?? true);
  const [featured, setFeatured] = useState(piece?.featured ?? false);

  const [existingImages, setExistingImages] = useState<ExistingImage[]>(
    (piece?.piece_images ?? []).sort((a, b) => a.position - b.position)
  );
  const [newImages, setNewImages] = useState<NewImage[]>([]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    const supabase = createClient();
    const uploaded: NewImage[] = [];

    for (const file of files) {
      const ext = file.name.split(".").pop();
      const filename = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("pottery-images")
        .upload(filename, file);
      if (!uploadError) {
        const { data } = supabase.storage.from("pottery-images").getPublicUrl(filename);
        uploaded.push({ url: data.publicUrl });
      }
    }

    setNewImages((prev) => [...prev, ...uploaded]);
    setUploading(false);
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const supabase = createClient();

    try {
      const fields = {
        title,
        category,
        price: price ? Number(price) : null,
        description: description || null,
        materials: materials || null,
        dimensions: dimensions || null,
        available,
        featured,
      };

      if (piece) {
        await supabase.from("pieces").update(fields).eq("id", piece.id);

        for (const img of existingImages.filter((i) => i._toDelete)) {
          await supabase.from("piece_images").delete().eq("id", img.id);
        }

        const keepCount = existingImages.filter((i) => !i._toDelete).length;
        for (let i = 0; i < newImages.length; i++) {
          await supabase.from("piece_images").insert({
            piece_id: piece.id,
            url: newImages[i].url,
            position: keepCount + i,
          });
        }
      } else {
        const { data: newPiece, error: insertError } = await supabase
          .from("pieces")
          .insert({ potter_id: potterId, ...fields })
          .select("id")
          .single();

        if (insertError || !newPiece) throw insertError;

        for (let i = 0; i < newImages.length; i++) {
          await supabase.from("piece_images").insert({
            piece_id: newPiece.id,
            url: newImages[i].url,
            position: i,
          });
        }
      }

      router.push(`/studio?potter=${potterSlug}`);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  }

  const visibleExisting = existingImages.filter((i) => !i._toDelete);
  const totalImages = visibleExisting.length + newImages.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      {/* Photos */}
      <div>
        <label className="block text-xs text-stone/50 uppercase tracking-wider mb-3">
          Photos
        </label>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {visibleExisting.map((img, i) => (
            <div
              key={img.id}
              className="aspect-square relative bg-blush/30 rounded-sm overflow-hidden group"
            >
              <Image src={img.url} alt="" fill className="object-cover" sizes="150px" />
              {i === 0 && (
                <span className="absolute bottom-1 left-1 text-[10px] bg-stone/60 text-cream px-1.5 py-0.5 rounded">
                  Main
                </span>
              )}
              <button
                type="button"
                onClick={() =>
                  setExistingImages((prev) =>
                    prev.map((x) => (x.id === img.id ? { ...x, _toDelete: true } : x))
                  )
                }
                className="absolute top-1 right-1 bg-stone/70 text-cream w-5 h-5 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              >
                ×
              </button>
            </div>
          ))}
          {newImages.map((img, i) => (
            <div
              key={img.url}
              className="aspect-square relative bg-blush/30 rounded-sm overflow-hidden group"
            >
              <Image src={img.url} alt="" fill className="object-cover" sizes="150px" />
              {visibleExisting.length === 0 && i === 0 && (
                <span className="absolute bottom-1 left-1 text-[10px] bg-stone/60 text-cream px-1.5 py-0.5 rounded">
                  Main
                </span>
              )}
              <button
                type="button"
                onClick={() =>
                  setNewImages((prev) => prev.filter((x) => x.url !== img.url))
                }
                className="absolute top-1 right-1 bg-stone/70 text-cream w-5 h-5 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              >
                ×
              </button>
            </div>
          ))}
          {totalImages < 6 && (
            <label className="aspect-square border border-dashed border-stone/20 rounded-sm flex items-center justify-center cursor-pointer hover:border-clay transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                disabled={uploading}
              />
              <span className="text-stone/30 text-2xl">{uploading ? "…" : "+"}</span>
            </label>
          )}
        </div>
        {uploading && <p className="text-xs text-stone/40">Uploading…</p>}
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs text-stone/50 uppercase tracking-wider mb-1">
          Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-stone/20 rounded px-3 py-2.5 text-sm bg-cream focus:outline-none focus:border-clay"
          required
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs text-stone/50 uppercase tracking-wider mb-1">
          Category *
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as PieceCategory)}
          className="w-full border border-stone/20 rounded px-3 py-2.5 text-sm bg-cream focus:outline-none focus:border-clay cursor-pointer"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Price */}
      <div>
        <label className="block text-xs text-stone/50 uppercase tracking-wider mb-1">
          Price (€)
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Leave empty if not for sale"
          className="w-full border border-stone/20 rounded px-3 py-2.5 text-sm bg-cream focus:outline-none focus:border-clay"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs text-stone/50 uppercase tracking-wider mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full border border-stone/20 rounded px-3 py-2.5 text-sm bg-cream focus:outline-none focus:border-clay resize-none"
        />
      </div>

      {/* Materials + Dimensions */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-stone/50 uppercase tracking-wider mb-1">
            Materials
          </label>
          <input
            type="text"
            value={materials}
            onChange={(e) => setMaterials(e.target.value)}
            placeholder="e.g. Stoneware"
            className="w-full border border-stone/20 rounded px-3 py-2.5 text-sm bg-cream focus:outline-none focus:border-clay"
          />
        </div>
        <div>
          <label className="block text-xs text-stone/50 uppercase tracking-wider mb-1">
            Dimensions
          </label>
          <input
            type="text"
            value={dimensions}
            onChange={(e) => setDimensions(e.target.value)}
            placeholder="e.g. H: 12cm"
            className="w-full border border-stone/20 rounded px-3 py-2.5 text-sm bg-cream focus:outline-none focus:border-clay"
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={available}
            onChange={(e) => setAvailable(e.target.checked)}
            className="w-4 h-4 accent-sage"
          />
          <span className="text-sm text-stone">Available</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="w-4 h-4 accent-sage"
          />
          <span className="text-sm text-stone">Featured on homepage</span>
        </label>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={saving || uploading}
          className="bg-sage text-stone font-medium px-8 py-3 rounded-full text-sm hover:bg-amber transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Saving…" : piece ? "Save changes" : "Add piece"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-stone/40 hover:text-stone transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
