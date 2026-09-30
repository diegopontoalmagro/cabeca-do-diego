import type { Product } from "@/lib/types";
import { categoryTone } from "@/lib/theme";
import StarDisplay from "./StarDisplay";

export default function ProductCard({ product: p }: { product: Product }) {
  const origin = [p.city, p.state, p.country].filter(Boolean).join(", ");
  const tone = categoryTone(p.category.slug);
  return (
    <article className="overflow-hidden rounded-lg bg-espuma shadow-[0_1px_0_rgba(45,74,42,.12)]">
      <div className={`h-1.5 ${tone.bar}`} />
      <div className="aspect-[4/5] bg-erva-claro">
        {p.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.photo_url} alt={`${p.company.name} ${p.name}`} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-erva/50">sem foto</div>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm text-tinta/60">{p.company.name}</p>
        <h3 className="text-lg font-bold leading-tight">{p.name}</h3>
        <p className="mt-1 text-sm text-tinta/60">{origin || "Origem não informada"}</p>
        {p.rating ? (
          <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
            <StarDisplay value={p.rating} size={16} />
            {p.rating.toString().replace(".", ",")}
          </div>
        ) : null}
        {p.description && <p className="mt-2 line-clamp-3 text-sm">{p.description}</p>}
      </div>
    </article>
  );
}
