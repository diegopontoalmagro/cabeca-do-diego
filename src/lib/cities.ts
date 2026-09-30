import { supabase } from "@/lib/supabase/client";

export type CityInput = { city: string; state: string; country: string };

/** Reaproveita a cidade se já existir no banco geográfico; senão cria. Retorna o id. */
export async function ensureCity({ city, state, country }: CityInput): Promise<string | null> {
  const c = city.trim();
  if (!c) return null;
  const s = state.trim();
  const p = country.trim() || "Brasil";

  const { data: found } = await supabase
    .from("cities").select("id").ilike("city", c).ilike("state", s).ilike("country", p).maybeSingle();
  if (found) return found.id;

  const { data, error } = await supabase
    .from("cities").insert({ city: c, state: s, country: p }).select("id").single();
  if (error) throw error;
  return data.id;
}

export function slugify(name: string) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
