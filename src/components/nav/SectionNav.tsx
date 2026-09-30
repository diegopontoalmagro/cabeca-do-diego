"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { Category, Section } from "@/lib/types";
import { categoryTone } from "@/lib/theme";

/**
 * Menu modular: lê as seções do banco.
 * - is_active = true  → link normal; a seção atual abre e mostra suas subcategorias
 * - is_active = false → aparece como "em breve"
 * Para criar uma nova aba basta inserir uma linha em `sections`.
 */
export default function SectionNav({ sections, categories }: { sections: Section[]; categories: Category[] }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const currentSlug = pathname.split("/")[1];

  return (
    <aside className="border-b border-erva/15 md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:border-b-0 md:border-r">
      <div className="px-4 pb-3 pt-5 md:px-6 md:pt-10">
        <Link href="/" className="font-display text-2xl font-bold leading-none text-erva">
          cabeça
          <br className="hidden md:block" /> do Diego
        </Link>
      </div>

      <nav aria-label="Seções" className="flex gap-1 overflow-x-auto px-3 pb-3 md:block md:space-y-1 md:overflow-visible md:px-3">
        {sections.map((s) => {
          const isCurrent = s.slug === currentSlug;
          const subs = categories.filter((c) => c.section_id === s.id);
          const activeCat = params.get("cat") ?? (s.show_all ? undefined : subs[0]?.slug);

          if (!s.is_active) {
            return (
              <span key={s.id} className="flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-tinta/45">
                {s.name}
                <small className="rounded bg-tinta/10 px-1.5 py-0.5 text-xs">em breve</small>
              </span>
            );
          }
          return (
            <div key={s.id} className="shrink-0 md:shrink">
              <Link
                href={`/${s.slug}`}
                aria-current={isCurrent ? "page" : undefined}
                className={`block whitespace-nowrap rounded-lg px-3 py-2 font-medium ${
                  isCurrent ? "bg-erva text-espuma" : "hover:bg-erva-claro"
                }`}
              >
                {s.name}
              </Link>
              {isCurrent && subs.length > 0 && (
                <ul className="mt-1 hidden space-y-0.5 pl-3 md:block">
                  {subs.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/${s.slug}?cat=${c.slug}`}
                        className={`block rounded-md px-3 py-1.5 text-sm ${
                          activeCat === c.slug ? categoryTone(c.slug).soft + " font-semibold" : "hover:bg-erva-claro"
                        }`}
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
