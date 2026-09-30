export type Section = { id: string; slug: string; name: string; sort_order: number; is_active: boolean; show_all?: boolean };
export type Category = { id: string; section_id: string; slug: string; name: string };
export type Company = {
  id: string; name: string;
  city: string | null; state: string | null; country: string | null;
  product_count?: number;
};
export type Product = {
  id: string; name: string; photo_url: string | null;
  rating: number | null; description: string | null;
  city: string | null; state: string | null; country: string | null;
  company: Pick<Company, "id" | "name">;
  category: Pick<Category, "id" | "slug" | "name">;
};
export type City = { id: string; city: string; state: string; country: string };
export type Place = {
  id: string; name: string; maps_url: string; photo_url: string | null; notes: string | null;
  city: Pick<City, "city" | "state" | "country"> | null;
  category: Pick<Category, "id" | "slug" | "name">;
};
