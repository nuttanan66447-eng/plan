"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { DEFAULT_HOTSPOTS, HOTSPOT_PRESETS, MAX_HOTSPOTS } from "@/lib/hotspots";
import type { Hotspot } from "@/lib/types";

const no = (i: number) => String(i + 1).padStart(2, "0");

/** Click the cover photo to add a numbered point, drag a point to move it, then name it below. */
export function HotspotEditor({ image, value, onChange }: { image: string; value: Hotspot[]; onChange: (h: Hotspot[]) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<number | null>(null);
  // pointer capture turns the release after a drag into a click on the photo — swallow it
  const skipClick = useRef(false);
  const [active, setActive] = useState<number | null>(null);

  const pos = (e: { clientX: number; clientY: number }) => {
    const r = box.current!.getBoundingClientRect();
    const c = (n: number) => Math.round(Math.min(98, Math.max(2, n)) * 10) / 10;
    return { x: c(((e.clientX - r.left) / r.width) * 100), y: c(((e.clientY - r.top) / r.height) * 100) };
  };
  const set = (i: number, patch: Partial<Hotspot>) => onChange(value.map((h, k) => (k === i ? { ...h, ...patch } : h)));
  const add = (e: React.MouseEvent) => {
    if (skipClick.current) { skipClick.current = false; return; }
    if (value.length >= MAX_HOTSPOTS) return;
    const preset = HOTSPOT_PRESETS.find((p) => !value.some((h) => h.title === p.title)) ?? { title: "", body: "" };
    onChange([...value, { ...pos(e), ...preset }]);
    setActive(value.length);
  };

  return (
    <div className="mt-5 border-t border-dashed border-hairline pt-4">
      <p className="flex items-center gap-2 text-[13.5px] font-bold"><Icon name="pin_drop" className="text-bronze-dark" /> จุดอธิบาย 01 02 03 บนรูปหลัก</p>
      <p className="mt-1 text-[12px] text-muted">
        <b>คลิกบนรูป</b> เพื่อเพิ่มจุดตรงตำแหน่งนั้น • <b>ลากจุด</b> เพื่อย้าย • ตั้งชื่อและคำอธิบายด้านขวา (ลูกค้ากดที่ตัวเลขบนรูปจะเห็นกล่องข้อความนี้) • สูงสุด {MAX_HOTSPOTS} จุด
      </p>
      {!image ? (
        <p className="mt-3 bg-wash p-3 text-[12.5px] text-muted">อัปโหลดรูปภาพด้านบนก่อน แล้วจึงวางจุดบนรูปหลักได้</p>
      ) : (
        <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <div>
            <div ref={box} onClick={add} className="relative aspect-[16/10] cursor-crosshair touch-none select-none overflow-hidden bg-wash-2"
              onPointerMove={(e) => { if (drag != null) set(drag, pos(e)); }}
              onPointerUp={() => setDrag(null)}>
              <Image src={image} alt="รูปหลัก" fill sizes="(max-width: 1024px) 100vw, 640px" className="pointer-events-none object-cover" />
              {value.map((h, i) => (
                <button key={i} type="button" style={{ left: `${h.x}%`, top: `${h.y}%` }} aria-label={`จุด ${no(i)} ${h.title}`}
                  onClick={(e) => { e.stopPropagation(); setActive(i); }}
                  onPointerDown={(e) => { e.stopPropagation(); e.currentTarget.parentElement!.setPointerCapture(e.pointerId); skipClick.current = true; setDrag(i); setActive(i); }}
                  className={`absolute grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 cursor-grab place-items-center text-[11px] font-bold shadow-[2px_2px_0_0_#1e232a] active:cursor-grabbing ${active === i ? "bg-ink text-white" : "bg-bronze text-ink"}`}>
                  {no(i)}
                </button>
              ))}
              {!value.length && (
                <span className="pointer-events-none absolute inset-x-0 bottom-3 mx-auto w-fit bg-ink/85 px-3 py-1.5 text-[12px] text-white">คลิกบนรูปเพื่อวางจุดแรก</span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-[12px]">
              {!value.length && (
                <button type="button" onClick={() => onChange(DEFAULT_HOTSPOTS)} className="font-semibold text-bronze-dark hover:underline">ใช้จุดตัวอย่าง 3 จุด</button>
              )}
              {value.length > 0 && (
                <button type="button" onClick={() => { if (confirm("ลบจุดทั้งหมดบนรูป?")) { onChange([]); setActive(null); } }} className="text-danger hover:underline">ลบทุกจุด (ไม่แสดงตัวเลขบนรูป)</button>
              )}
            </div>
          </div>
          <ol className="space-y-2">
            {value.map((h, i) => (
              <li key={i} onFocus={() => setActive(i)} className={`border p-2.5 ${active === i ? "border-ink bg-white" : "border-hairline bg-wash"}`}>
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center bg-bronze text-[11px] font-bold text-ink">{no(i)}</span>
                  <input value={h.title} onChange={(e) => set(i, { title: e.target.value })} placeholder="หัวข้อ เช่น ระบบหลังคา & ฉนวน" maxLength={80}
                    aria-label={`หัวข้อจุด ${no(i)}`} className="input !py-1.5 text-[13px] font-semibold" />
                  <select value="" aria-label="เลือกข้อความสำเร็จรูป" onChange={(e) => { const p = HOTSPOT_PRESETS[Number(e.target.value)]; if (p) set(i, p); }}
                    className="input !w-10 shrink-0 !bg-none !px-0 text-center" title="ข้อความสำเร็จรูป">
                    <option value="">⋯</option>
                    {HOTSPOT_PRESETS.map((p, k) => <option key={k} value={k}>{p.title}</option>)}
                  </select>
                  <button type="button" onClick={() => { onChange(value.filter((_, k) => k !== i)); setActive(null); }}
                    className="grid h-8 w-8 shrink-0 place-items-center text-muted hover:bg-danger hover:text-white" aria-label={`ลบจุด ${no(i)}`}><Icon name="delete" /></button>
                </div>
                <textarea value={h.body} onChange={(e) => set(i, { body: e.target.value })} placeholder="คำอธิบาย (ไม่บังคับ)" maxLength={300} rows={2}
                  aria-label={`คำอธิบายจุด ${no(i)}`} className="input mt-2 !py-1.5 text-[12.5px]" />
              </li>
            ))}
            {value.some((h) => !h.title.trim()) && <li className="text-[12px] text-danger">จุดที่ไม่มีหัวข้อจะไม่ถูกบันทึก</li>}
          </ol>
        </div>
      )}
    </div>
  );
}
