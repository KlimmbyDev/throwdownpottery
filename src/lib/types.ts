export type PieceCategory =
  | "bowl"
  | "mug"
  | "vase"
  | "plate"
  | "sculpture"
  | "cup"
  | "platter"
  | "other";

export type Potter = {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  specialty: string | null;
  avatar_url: string | null;
  instagram_url: string | null;
  created_at: string;
};

export type PieceImage = {
  id: string;
  piece_id: string;
  url: string;
  alt: string | null;
  position: number;
};

export type Piece = {
  id: string;
  potter_id: string;
  title: string;
  description: string | null;
  category: PieceCategory;
  price: number | null;
  dimensions: string | null;
  materials: string | null;
  available: boolean;
  featured: boolean;
  created_at: string;
  potter?: Potter;
  piece_images?: PieceImage[];
};
