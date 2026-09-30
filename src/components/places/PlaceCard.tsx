import { MapPin, ExternalLink } from "lucide-react";
import type { Place } from "@/lib/types";
import { isGoogleMapsUrl } from "@/lib/maps";

export default function PlaceCard({ place: p }: { place: Place }) {
  const where = p.city ? [p.city.city, p.city.state, p.city.country].filter(Boolean).join(", ") : "";
  const valid = isGoogleMapsUrl(p.maps_url);

  return (
    <article className="flex flex-col overflow-hidden rounded-lg bg-espuma shadow-[0_1px_0_rgba(45,74,42,.12)]">
      <div className="aspect-[4/3] bg-erva-claro">
        {p.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.photo_url} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-erva/50">sem foto</div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span className="mb-2 w-fit rounded-full bg-erva-claro px-2.5 py-0.5 text-xs font-semibold text-erva">{p.category.name}</span>
        <h3 className="text-xl font-bold leading-tight">{p.name}</h3>
        {where && (
          <p className="mt-1 flex items-center gap-1 text-sm text-tinta/60">
            <MapPin size={14} aria-hidden="true" /> {where}
          </p>
        )}
        {p.notes && <p className="mt-3 line-clamp-4 whitespace-pre-line text-sm">{p.notes}</p>}

        <div className="mt-auto pt-4">
          {valid ? (
            <a href={p.maps_url} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 rounded-lg bg-erva px-4 py-2 text-sm font-semibold text-espuma hover:bg-erva/90">
              Abrir no Google Maps <ExternalLink size={14} aria-hidden="true" />
            </a>
          ) : (
            <span className="text-sm text-tinta/50">Link do mapa inválido</span>
          )}
        </div>
      </div>
    </article>
  );
}
