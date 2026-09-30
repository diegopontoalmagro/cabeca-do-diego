import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import ProductForm from "@/components/forms/ProductForm";
import type { Category } from "@/lib/types";

export default async function NewProductPage({ params }: { params: { section: string } }) {
  const db = supabaseServer();
  const { data: section } = await db.from("sections").select("id,name").eq("slug", params.section).single();
  if (!section) notFound();
  const { data } = await db.from("categories").select("*").eq("section_id", section.id).order("sort_order");
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-erva">Cadastrar em {section.name}</h1>
      <ProductForm categories={(data ?? []) as Category[]} backHref={`/${params.section}`} />
    </div>
  );
}
