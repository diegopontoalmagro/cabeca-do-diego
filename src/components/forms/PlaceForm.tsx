"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { ensureCity, slugify } from "@/lib/cities";
import { isGoogleMapsUrl, normalizeMapsUrl } from "@/lib/maps";
import CityFields from "./CityFields";
import type { Category } from "@/lib/types";

const NEW = "__new__";

export default function PlaceForm({
  sectionId, categories: initial, backHref,
}: { sectionId: string; categories: Category[]; backHref: string }) {
  const [categories, setCategories] = useState(initial);
  const [categoryId, setCategoryId] = useState(initial[0]?.id ?? NEW);
  const [newCategory, setNewCategory] = useState("");
  const [name, setName] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [mapsTouched, setMapsTouched] = useState(false);
  const [geo, setGeo] = useState({ city: "", state: "", country: "Brasil" });
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const urlOk = isGoogleMapsUrl(mapsUrl);
  const urlError = mapsTouched && !urlOk
    ? "Cole um link do Google Maps, como https://maps.app.goo.gl/... ou https://www.google.com/maps/..."
    : null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMapsTouched(true);
    if (!urlOk) return;
    setSaving(true); setMsg(null);
    try {
      // 1) Subdivisão: usa a escolhida ou cria uma nova na hora
      let catId = categoryId;
      if (categoryId === NEW) {
        const label = newCategory.trim();
        if (!label) throw new Error("Digite o nome da nova subdivisão.");
        const slug = slugify(label);
        const existing = categories.find((c) => c.slug === slug);
        if (existing) catId = existing.id;
        else {
          const { data, error } = await supabase
            .from("categories")
            .insert({ section_id: sectionId, slug, name: label, sort_order: categories.length + 1 })
            .select("*").single();
          if (error) throw error;
          setCategories((c) => [...c, data as Category]);
          catId = data.id;
        }
        setCategoryId(catId); setNewCategory("");
      }

      // 2) Cidade: reaproveita a do banco geográfico ou cadastra
      const cityId = await ensureCity(geo);

      // 3) Foto
      let photo_url: string | null = null;
      if (file) {
        const path = `places/${crypto.randomUUID()}.${file.name.split(".").pop() ?? "jpg"}`;
        const up = await supabase.storage.from("product-photos").upload(path, file);
        if (up.error) throw up.error;
        photo_url = supabase.storage.from("product-photos").getPublicUrl(path).data.publicUrl;
      }

      // 4) Local
      const { error } = await supabase.from("places").insert({
        category_id: catId, city_id: cityId, name: name.trim(),
        maps_url: normalizeMapsUrl(mapsUrl), photo_url, notes: notes.trim() || null,
      });
      if (error) throw error;

      setMsg({ ok: true, text: `Salvo: ${name.trim()}.` });
      setName(""); setMapsUrl(""); setMapsTouched(false); setNotes(""); setFile(null);
      const f = document.getElementById("foto-local") as HTMLInputElement | null;
      if (f) f.value = "";
    } catch (err: any) {
      setMsg({ ok: false, text: err.message ?? "Não foi possível salvar. Tente de novo." });
    } finally {
      setSaving(false);
    }
  }

  const input = "w-full rounded-lg border border-erva/25 bg-espuma px-3 py-2";

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-5" noValidate>
      <div>
        <label htmlFor="local-nome" className="mb-1 block text-sm font-medium">Nome do local</label>
        <input id="local-nome" required value={name} onChange={(e) => setName(e.target.value)} className={input} />
      </div>

      <div>
        <label htmlFor="subdivisao" className="mb-1 block text-sm font-medium">Subdivisão</label>
        <select id="subdivisao" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={input}>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          <option value={NEW}>+ Nova subdivisão...</option>
        </select>
        {categoryId === NEW && (
          <input aria-label="Nome da nova subdivisão" placeholder="Ex.: Cachoeiras, Cafés, Trilhas"
                 value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className={`${input} mt-2`} />
        )}
      </div>

      <div>
        <label htmlFor="maps" className="mb-1 block text-sm font-medium">Link do Google Maps</label>
        <input id="maps" type="url" inputMode="url" value={mapsUrl} placeholder="https://maps.app.goo.gl/..."
               onChange={(e) => setMapsUrl(e.target.value)} onBlur={() => setMapsTouched(true)}
               aria-invalid={!!urlError} aria-describedby={urlError ? "maps-erro" : undefined} className={input} />
        {urlError && <p id="maps-erro" role="alert" className="mt-1 text-sm text-red-700">{urlError}</p>}
        {mapsUrl && urlOk && (
          <a href={normalizeMapsUrl(mapsUrl)} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm text-erva underline">
            Testar o link
          </a>
        )}
      </div>

      <CityFields value={geo} onChange={setGeo} />

      <div>
        <label htmlFor="anotacoes" className="mb-1 block text-sm font-medium">Anotações e dicas</label>
        <textarea id="anotacoes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="Melhor horário, o que pedir, como chegar..." className={input} />
      </div>

      <div>
        <label htmlFor="foto-local" className="mb-1 block text-sm font-medium">Foto do local</label>
        <input id="foto-local" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </div>

      <div className="flex items-center gap-4">
        <button disabled={saving} className="rounded-lg bg-erva px-6 py-2.5 font-semibold text-espuma disabled:opacity-50">
          {saving ? "Salvando..." : "Salvar local"}
        </button>
        <Link href={backHref} className="text-erva underline">Ver lugares</Link>
      </div>
      {msg && <p role="status" className={msg.ok ? "text-erva" : "text-red-700"}>{msg.text}</p>}
    </form>
  );
}
