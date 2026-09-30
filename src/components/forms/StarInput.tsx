"use client";
import { useRef, useState } from "react";

const PATH = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z";
const SIZE = 40;

function Row({ className }: { className: string }) {
  return (
    <span className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" width={SIZE} height={SIZE} className={`block shrink-0 ${className}`} aria-hidden="true">
          <path d={PATH} />
        </svg>
      ))}
    </span>
  );
}

/**
 * Nota de 0,5 a 5 em passos de meia estrela.
 * Arraste (mouse ou dedo) sobre as estrelas; também funciona com as setas do teclado.
 */
export default function StarInput({
  value, onChange, labelledBy,
}: { value: number; onChange: (v: number) => void; labelledBy?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  function fromPointer(clientX: number) {
    const r = ref.current!.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    return Math.max(0.5, Math.ceil(x * 10) / 2); // arredonda para cima em passos de 0,5
  }

  function onKeyDown(e: React.KeyboardEvent) {
    let v = value;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") v = Math.min(5, value + 0.5);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") v = Math.max(0, value - 0.5);
    else if (e.key === "Home") v = 0;
    else if (e.key === "End") v = 5;
    else return;
    e.preventDefault();
    onChange(v);
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div
        ref={ref}
        role="slider"
        tabIndex={0}
        aria-labelledby={labelledBy}
        aria-valuemin={0}
        aria-valuemax={5}
        aria-valuenow={value}
        aria-valuetext={value ? `${value} de 5` : "Sem nota"}
        onKeyDown={onKeyDown}
        onPointerDown={(e) => { setDragging(true); e.currentTarget.setPointerCapture(e.pointerId); onChange(fromPointer(e.clientX)); }}
        onPointerMove={(e) => dragging && onChange(fromPointer(e.clientX))}
        onPointerUp={(e) => { setDragging(false); e.currentTarget.releasePointerCapture(e.pointerId); }}
        onPointerCancel={() => setDragging(false)}
        className="relative inline-flex cursor-pointer select-none"
        style={{ touchAction: "pan-y" }}
      >
        <Row className="fill-erva/20" />
        <div className="pointer-events-none absolute left-0 top-0 h-full overflow-hidden" style={{ width: `${(value / 5) * 100}%` }}>
          <Row className="fill-estrela" />
        </div>
      </div>
      <span className="min-w-[4.5rem] font-display text-2xl font-bold">
        {value ? String(value).replace(".", ",") : "Sem nota"}
      </span>
      {value > 0 && (
        <button type="button" onClick={() => onChange(0)} className="text-sm text-erva underline">Limpar</button>
      )}
    </div>
  );
}
