import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export default async function Home() {
  const { data } = await supabaseServer()
    .from("sections").select("slug").eq("is_active", true).order("sort_order").limit(1);
  if (data?.[0]) redirect(`/${data[0].slug}`);
  return <p>Nenhuma seção ativa ainda. Rode o supabase/schema.sql.</p>;
}
