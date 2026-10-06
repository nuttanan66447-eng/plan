"use client";

import { useRef, useState } from "react";
import { Icon } from "./Icon";

/** Drag-to-pan equirectangular-style panorama (lightweight 360° tour without WebGL). */
export function Panorama({ src, label, points = [] }: { src: string; label: string; points?: string[] }) {
  const [x, setX] = useState(50);
  const drag = useRef<{ start: number; x: number } | null>(null);
  const [active, setActive] = useState(0);

  const onDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { start: e.clientX, x };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const w = (e.currentTarget as HTMLElement).clientWidth;
    const nx = drag.current.x - ((e.clientX - drag.current.start) / w) * 60;
    setX(((nx % 100) + 100) % 100);
  };
  const heading = Math.round((x / 100) * 360);

  return (
    <div className="relative overflow-hidden border border-ink bg-ink">
      <div
        role="img"
        aria-label={label}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setX((v) => (v - 3 + 100) % 100);
          if (e.key === "ArrowRight") setX((v) => (v + 3) % 100);
        }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        className="aspect-[16/8] cursor-grab touch-pan-y select-none active:cursor-grabbing"
        style={{ backgroundImage: `url(${src})`, backgroundSize: "auto 100%", backgroundRepeat: "repeat-x", backgroundPosition: `${x}% 50%` }}
      />
      <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 bg-ink/85 px-2.5 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-white">
        <Icon name="360" className="text-bronze" /> 360° VIRTUAL TOUR • {heading}°
      </div>
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 px-3 py-1 text-[11px] text-ink">
        <Icon name="swipe" /> คลิกและลากเพื่อหมุนชม 360 องศา
      </div>
      {points.length > 0 && (
        <div className="absolute right-3 top-3 flex flex-col gap-1">
          {points.map((p, i) => (
            <button key={p} onClick={() => { setActive(i); setX((i * 100) / points.length); }}
              className={`px-2.5 py-1 text-left text-[11px] ${active === i ? "bg-bronze text-ink" : "bg-ink/80 text-white hover:bg-ink"}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
