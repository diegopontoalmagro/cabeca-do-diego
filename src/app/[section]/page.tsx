import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import ProductCard from "@/components/catalog/ProductCard";
import { categoryTone } from "@/lib/theme";
import type { Category, Product, Section } from "@/lib/types";

export default async function SectionPage({
  params, searchParams,
}: { params: { section: string }; searchParams: { cat?: string } }) {
  const db = supabaseServer();

  const { data: section } = await db.from("sections").select("*").eq("slug", params.section).single<Section>();
  if (!section || !section.is_active) notFound();

  const { data: cats } = await db.from("categories").select("*").eq("section_id", section.id).order("sort_order");
  const categories = (cats ?? []) as Category[];
  const active = categories.find((c) => c.slug === searchParams.cat) ?? categories[0];

  const { data: products } = await db
    .from("products")
    .select("id,name,photo_url,rating,description,city,state,country,company:companies(id,name),category:categories(id,slug,name)")
    .eq("category_id", active?.id ?? "")
    .order("created_at", { ascending: false });

  const { data: { user } } = await db.auth.getUser();
  const list = (products ?? []) as unknown as Product[];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-4xl font-bold text-erva md:text-5xl">{section.name}</h1>
        {user && (
          <Link href={`/${section.slug}/novo`} className="rounded-lg bg-erva px-4 py-2 font-semibold text-espuma hover:bg-erva/90">
            Cadastrar erva
          </Link>
        )}
      </div>

      <div role="tablist" aria-label="Categoria" className="mb-8 flex gap-2">
        {categories.map((c) => {
          const on = c.id === active?.id;
          return (
            <Link
              key={c.id}
              href={`/${section.slug}?cat=${c.slug}`}
              role="tab"
              aria-selected={on}
              className={`rounded-lg px-5 py-2.5 text-lg font-semibold ${
                on ? categoryTone(c.slug).solid : "bg-espuma hover:bg-erva-claro"
              }`}
            >
              {c.name}
            </Link>
          );
        })}
      </div>

      {list.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {list.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-erva/30 p-10 text-center">
          <p className="text-lg font-semibold">Nenhuma erva de {active?.name} cadastrada</p>
          {user ? (
            <Link href={`/${section.slug}/novo`} className="mt-2 inline-block text-erva underline">Cadastrar a primeira</Link>
          ) : (
            <Link href="/login" className="mt-2 inline-block text-erva underline">Entrar para cadastrar</Link>
          )}
        </div>
      )}
    </div>
  );
}
