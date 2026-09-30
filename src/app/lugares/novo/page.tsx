import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import PlaceForm from "@/components/forms/PlaceForm";
import type { Category } from "@/lib/types";

export default async function NovoLugarPage() {
  const db = supabaseServer();
  const { data: section } = await db.from("sections").select("id,name").eq("slug", "lugares").single();
  if (!section) notFound();
  const { data } = await db.from("categories").select("*").eq("section_id", section.id).order("sort_order");
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-erva">Cadastrar local</h1>
      <PlaceForm sectionId={section.id} categories={(data ?? []) as Category[]} backHref="/lugares" />
    </div>
  );
}
