"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { categoryTone } from "@/lib/theme";
import CompanyAutocomplete from "./CompanyAutocomplete";
import StarInput from "./StarInput";
import type { Category, Company } from "@/lib/types";

type PortfolioItem = { name: string; category: string };

export default function ProductForm({ categories, backHref }: { categories: Category[]; backHref: string }) {
  const [companyName, setCompanyName] = useState("");
  const [company, setCompany] = useState<Company | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [productName, setProductName] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("Brasil");
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Empresa existente escolhida → preenche a origem e carrega o portfólio
  useEffect(() => {
    if (!company) { setPortfolio([]); return; }
    setCity(company.city ?? "");
    setState(company.state ?? "");
    setCountry(company.country ?? "Brasil");
    supabase
      .from("products")
      .select("name, categories(name)")
      .eq("company_id", company.id)
      .then(({ data }) =>
        setPortfolio(
          (data ?? []).map((p: any) => ({ name: p.name, category: p.categories?.name ?? "" }))
        )
      );
  }, [company]);

  const duplicate = portfolio.some(
    (p) => p.name.toLowerCase() === productName.trim().toLowerCase() &&
           p.category === categories.find((c) => c.id === categoryId)?.name
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      // 1) Empresa: usa a existente ou cria (checando duplicata por nome)
      let current = company;
      if (!current) {
        const { data: found } = await supabase
          .from("companies").select("id,name,city,state,country").ilike("name", companyName.trim()).maybeSingle();
        if (found) current = found as Company;
        else {
          const { data, error } = await supabase
            .from("companies")
            .insert({ name: companyName.trim(), city: city || null, state: state || null, country: country || null })
            .select("id,name,city,state,country").single();
          if (error) throw error;
          current = data as Company;
        }
        setCompany(current);
        setCompanyName(current.name);
      }

      // 2) Foto no Storage
      let photo_url: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const up = await supabase.storage.from("product-photos").upload(path, file);
        if (up.error) throw up.error;
        photo_url = supabase.storage.from("product-photos").getPublicUrl(path).data.publicUrl;
      }

      // 3) Produto
      const { error } = await supabase.from("products").insert({
        company_id: current.id, category_id: categoryId, name: productName.trim(),
        photo_url, rating: rating || null, description: description.trim() || null, city: city || null, state: state || null, country: country || null,
      });
      if (error) throw error;

      setPortfolio((p) => [...p, { name: productName.trim(), category: categories.find((c) => c.id === categoryId)?.name ?? "" }]);
      setMsg({ ok: true, text: `Salvo: ${productName.trim()}. A empresa continua selecionada para o próximo.` });
      setProductName(""); setFile(null); setRating(0); setDescription("");
      (document.getElementById("foto") as HTMLInputElement | null)?.value && ((document.getElementById("foto") as HTMLInputElement).value = "");
    } catch (err: any) {
      setMsg({ ok: false, text: err.message ?? "Não foi possível salvar. Tente de novo." });
    } finally {
      setSaving(false);
    }
  }

  const input = "w-full rounded-lg border border-erva/25 bg-espuma px-3 py-2";

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-5">
      <CompanyAutocomplete value={companyName} onChange={setCompanyName} onSelect={setCompany} />

      {company && portfolio.length > 0 && (
        <div className="rounded-lg bg-erva-claro p-3 text-sm">
          <p className="mb-2 font-semibold">Já cadastrados de {company.name}</p>
          <div className="flex flex-wrap gap-2">
            {portfolio.map((p) => (
              <span key={p.name + p.category} className="rounded-full bg-espuma px-2.5 py-0.5">
                {p.name} ({p.category})
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <label htmlFor="erva" className="mb-1 block text-sm font-medium">Nome da erva</label>
        <input id="erva" required value={productName} onChange={(e) => setProductName(e.target.value)}
               placeholder="Tradicional, Pura Folha, Menta e Limão" className={input} />
        {duplicate && <p className="mt-1 text-sm text-amber-700">Essa erva já está no portfólio desta empresa.</p>}
      </div>

      <fieldset>
        <legend className="mb-1 text-sm font-medium">Categoria</legend>
        <div className="flex gap-2">
          {categories.map((c) => (
            <button type="button" key={c.id} onClick={() => setCategoryId(c.id)} aria-pressed={categoryId === c.id}
              className={`rounded-lg px-5 py-2 font-semibold ${categoryId === c.id ? categoryTone(c.slug).solid : "bg-espuma"}`}>
              {c.name}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-1 text-sm font-medium">Origem</legend>
        <div className="grid grid-cols-3 gap-2">
          <input aria-label="Cidade" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Cidade" className={input} />
          <input aria-label="Estado" value={state} onChange={(e) => setState(e.target.value)} placeholder="Estado" className={input} />
          <input aria-label="País" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="País" className={input} />
        </div>
      </fieldset>

      <div>
        <span id="nota-label" className="mb-1 block text-sm font-medium">Nota (arraste sobre as estrelas)</span>
        <StarInput value={rating} onChange={setRating} labelledBy="nota-label" />
      </div>

      <div>
        <label htmlFor="descricao" className="mb-1 block text-sm font-medium">Descrição</label>
        <textarea id="descricao" value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Sabor, moagem, corte, o que achou..." rows={3} className={input} />
      </div>

      <div>
        <label htmlFor="foto" className="mb-1 block text-sm font-medium">Foto</label>
        <input id="foto" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </div>

      <div className="flex items-center gap-4">
        <button disabled={saving || duplicate} className="rounded-lg bg-erva px-6 py-2.5 font-semibold text-espuma disabled:opacity-50">
          {saving ? "Salvando..." : "Salvar erva"}
        </button>
        <Link href={backHref} className="text-erva underline">Ver catálogo</Link>
      </div>

      {msg && <p role="status" className={msg.ok ? "text-erva" : "text-red-700"}>{msg.text}</p>}
    </form>
  );
}
