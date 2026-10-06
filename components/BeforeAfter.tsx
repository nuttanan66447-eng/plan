"use client";

import Image from "next/image";
import { useState } from "react";
import { Icon } from "./Icon";

export function BeforeAfter({ before, after, beforeLabel, afterLabel }: { before: string; after: string; beforeLabel: string; afterLabel: string }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative aspect-[16/10] select-none overflow-hidden bg-ink">
      <Image src={after} alt={afterLabel} fill sizes="(max-width: 1024px) 100vw, 760px" className="object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Image src={before} alt={beforeLabel} fill sizes="(max-width: 1024px) 100vw, 760px" className="object-cover" />
      </div>
      <span className="absolute left-3 top-3 bg-ink/90 px-2 py-1 text-[10.5px] font-semibold tracking-[0.06em] text-white">BEFORE • {beforeLabel}</span>
      <span className="absolute right-3 top-3 bg-bronze px-2 py-1 text-[10.5px] font-bold tracking-[0.06em] text-ink">AFTER • {afterLabel}</span>
      <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white" style={{ left: `${pos}%` }}>
        <span className="absolute top-1/2 left-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center bg-bronze text-ink shadow-[2px_2px_0_0_#1e232a]"><Icon name="code" /></span>
      </div>
      <input type="range" min={0} max={100} value={pos} onChange={(e) => setPos(Number(e.target.value))} aria-label="เลื่อนเปรียบเทียบก่อนและหลัง"
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0" />
    </div>
  );
}
