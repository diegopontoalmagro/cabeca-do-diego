const PATH = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z";

function Row({ size, className }: { size: number; className: string }) {
  return (
    <span className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" width={size} height={size} className={`block shrink-0 ${className}`} aria-hidden="true">
          <path d={PATH} />
        </svg>
      ))}
    </span>
  );
}

/** Estrelas somente leitura; aceita meia estrela (ex.: 4.5). */
export default function StarDisplay({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="relative inline-flex" role="img" aria-label={`Nota ${value} de 5`}>
      <Row size={size} className="fill-erva/20" />
      <span className="absolute left-0 top-0 h-full overflow-hidden" style={{ width: `${(value / 5) * 100}%` }}>
        <Row size={size} className="fill-estrela" />
      </span>
    </span>
  );
}
