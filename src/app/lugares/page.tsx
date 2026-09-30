import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import PlaceCard from "@/components/places/PlaceCard";
import type { Category, Place, Section } from "@/lib/types";

// Rota estática: tem prioridade sobre o [section] genérico (que serve as ervas).
export default async function LugaresPage({ searchParams }: { searchParams: { cat?: string } }) {
  const db = supabaseServer();
  const { data: section } = await db.from("sections").select("*").eq("slug", "lugares").single<Section>();
  if (!section || !section.is_active) notFound();

  const { data: cats } = await db.from("categories").select("*").eq("section_id", section.id).order("sort_order");
  const categories = (cats ?? []) as Category[];
  const active = categories.find((c) => c.slug === searchParams.cat);

  let query = db
    .from("places")
    .select("id,name,maps_url,photo_url,notes,city:cities(city,state,country),category:categories(id,slug,name)")
    .order("created_at", { ascending: false });
  if (active) query = query.eq("category_id", active.id);
  const { data } = await query;
  const places = (data ?? []) as unknown as Place[];

  const { data: { user } } = await db.auth.getUser();
  const chip = (on: boolean) => `rounded-lg px-4 py-2 font-semibold ${on ? "bg-erva text-espuma" : "bg-espuma hover:bg-erva-claro"}`;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-4xl font-bold text-erva md:text-5xl">{section.name}</h1>
        {user && (
          <Link href="/lugares/novo" className="rounded-lg bg-erva px-4 py-2 font-semibold text-espuma hover:bg-erva/90">
            Cadastrar local
          </Link>
        )}
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link href="/lugares" className={chip(!active)}>Todos</Link>
        {categories.map((c) => (
          <Link key={c.id} href={`/lugares?cat=${c.slug}`} className={chip(active?.id === c.id)}>{c.name}</Link>
        ))}
      </div>

      {places.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {places.map((p) => <PlaceCard key={p.id} place={p} />)}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-erva/30 p-10 text-center">
          <p className="text-lg font-semibold">Nenhum local cadastrado{active ? ` em ${active.name}` : ""}</p>
          <Link href={user ? "/lugares/novo" : "/login?next=/lugares/novo"} className="mt-2 inline-block text-erva underline">
            {user ? "Cadastrar o primeiro" : "Entrar para cadastrar"}
          </Link>
        </div>
      )}
    </div>
  );
}
