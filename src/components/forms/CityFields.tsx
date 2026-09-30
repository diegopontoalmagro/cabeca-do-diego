"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";
import type { City } from "@/lib/types";

type Value = { city: string; state: string; country: string };

/**
 * Cidade / Estado / País com sugestão a partir do banco geográfico (tabela `cities`).
 * Ao escolher uma cidade conhecida, estado e país são preenchidos sozinhos.
 */
export default function CityFields({ value, onChange }: { value: Value; onChange: (v: Value) => void }) {
  const [results, setResults] = useState<City[]>([]);
  const [open, setOpen] = useState(false);
  const debounced = useDebounce(value.city, 250);

  useEffect(() => {
    const q = debounced.trim();
    if (q.length < 2) { setResults([]); return; }
    let cancelled = false;
    supabase.rpc("search_cities", { q }).then(({ data }) => { if (!cancelled) setResults((data as City[]) ?? []); });
    return () => { cancelled = true; };
  }, [debounced]);

  const input = "w-full rounded-lg border border-erva/25 bg-espuma px-3 py-2";
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-medium">Cidade, estado e país</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="relative">
          <input
            aria-label="Cidade" placeholder="Cidade" autoComplete="off" className={input}
            value={value.city}
            onChange={(e) => { onChange({ ...value, city: e.target.value }); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
          />
          {open && results.length > 0 && (
            <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-erva/20 bg-espuma shadow-lg">
              {results.map((c) => (
                <li key={c.id}>
                  <button type="button" className="w-full px-3 py-2 text-left hover:bg-erva-claro"
                    onMouseDown={() => { onChange({ city: c.city, state: c.state, country: c.country }); setOpen(false); }}>
                    <span className="font-medium">{c.city}</span>
                    <span className="block text-xs text-tinta/60">{[c.state, c.country].filter(Boolean).join(", ")}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <input aria-label="Estado" placeholder="Estado" className={input} value={value.state}
               onChange={(e) => onChange({ ...value, state: e.target.value })} />
        <input aria-label="País" placeholder="País" className={input} value={value.country}
               onChange={(e) => onChange({ ...value, country: e.target.value })} />
      </div>
    </fieldset>
  );
}
