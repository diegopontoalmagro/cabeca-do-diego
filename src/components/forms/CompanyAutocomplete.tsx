"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";
import type { Company } from "@/lib/types";

type Props = {
  value: string;
  onChange: (name: string) => void;             // texto digitado
  onSelect: (company: Company | null) => void;  // empresa existente (ou null = nova)
};

/** Busca empresas no banco enquanto você digita (tolera erro de digitação). */
export default function CompanyAutocomplete({ value, onChange, onSelect }: Props) {
  const [results, setResults] = useState<Company[]>([]);
  const [open, setOpen] = useState(false);
  const debounced = useDebounce(value, 250);

  useEffect(() => {
    const q = debounced.trim();
    if (q.length < 2) { setResults([]); return; }
    let cancelled = false;
    supabase.rpc("search_companies", { q }).then(({ data }) => {
      if (!cancelled) setResults((data as Company[]) ?? []);
    });
    return () => { cancelled = true; };
  }, [debounced]);

  const exact = results.some((r) => r.name.toLowerCase() === value.trim().toLowerCase());

  return (
    <div className="relative">
      <label htmlFor="empresa" className="mb-1 block text-sm font-medium">Empresa / fabricante</label>
      <input
        id="empresa"
        value={value}
        onChange={(e) => { onChange(e.target.value); onSelect(null); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        autoComplete="off"
        required
        className="w-full rounded-lg border border-erva/25 bg-espuma px-3 py-2"
      />

      {open && value.trim().length >= 2 && (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-erva/20 bg-espuma shadow-lg">
          {results.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onMouseDown={() => { onChange(c.name); onSelect(c); setOpen(false); }}
                className="w-full px-3 py-2 text-left hover:bg-erva-claro"
              >
                <span className="font-medium">{c.name}</span>
                <span className="block text-xs text-tinta/60">
                  {[c.city, c.state, c.country].filter(Boolean).join(", ") || "Origem não informada"}
                  {" – "}{c.product_count ?? 0} produto(s)
                </span>
              </button>
            </li>
          ))}
          {!exact && (
            <li className="border-t border-erva/15 px-3 py-2 text-sm text-tinta/70">
              Empresa nova: <b>{value.trim()}</b> (será criada ao salvar)
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
