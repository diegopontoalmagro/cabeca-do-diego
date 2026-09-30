// Importa portfólios em lote a partir de data/portfolios/*.json
// Uso: npm run import   (requer SUPABASE_SERVICE_KEY no .env.local)
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function main() {
  const dir = path.join(process.cwd(), "data/portfolios");
  const { data: cats } = await db.from("categories").select("id, slug");
  const catId: Record<string, string> = Object.fromEntries(
    (cats ?? []).map((c) => [c.slug, c.id])
  );

  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const { company, products } = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));

    // Reaproveita a empresa se já existir (ignora maiúsculas/minúsculas)
    let { data: comp } = await db.from("companies").select("id").ilike("name", company.name).maybeSingle();
    if (!comp) {
      const ins = await db.from("companies").insert(company).select("id").single();
      if (ins.error) { console.error(`❌ ${file}: ${ins.error.message}`); continue; }
      comp = ins.data;
    }

    const rows = products.map((p: { name: string; category: string }) => ({
      company_id: comp!.id, category_id: catId[p.category], name: p.name,
    }));
    const { error } = await db.from("products")
      .upsert(rows, { onConflict: "company_id,category_id,name", ignoreDuplicates: true });
    console.log(error ? `❌ ${file}: ${error.message}` : `✅ ${company.name}: ${rows.length} produtos`);
  }
}
main();
