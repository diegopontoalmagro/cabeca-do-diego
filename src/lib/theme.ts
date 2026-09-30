// Cor de cada categoria: chimarrão = madeira da cuia, tererê = gelo
export function categoryTone(slug?: string) {
  if (slug === "chimarrao") return { solid: "bg-cuia text-espuma", soft: "bg-cuia-claro text-cuia", bar: "bg-cuia" };
  if (slug === "terere") return { solid: "bg-gelo text-espuma", soft: "bg-gelo-claro text-gelo", bar: "bg-gelo" };
  return { solid: "bg-erva text-espuma", soft: "bg-erva-claro text-erva", bar: "bg-erva" };
}
