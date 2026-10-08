"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { MAX_ROOMS, ROOM_PRESETS } from "@/lib/model-config";
import type { ModelConfig, ModelRoom, ModelView, Plan } from "@/lib/types";

const Model3D = dynamic(() => import("@/components/Model3D"), {
  ssr: false,
  loading: () => <div className="blueprint grid h-full place-items-center text-[13px] text-muted">กำลังโหลดโมเดล 3 มิติ...</div>,
});

const EMPTY: ModelConfig = { cuts: [], rooms: [] };

/**
 * Admin set-up for an uploaded .glb: pick each storey's cut height with the slider, then click on the
 * floor of each room to drop a label. Saved with the plan as model_config.
 */
export function ModelSetup({ plan, value, onChange }: { plan: Plan; value: ModelConfig | null; onChange: (c: ModelConfig | null) => void }) {
  const cfg = value ?? EMPTY;
  const [floor, setFloor] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [moving, setMoving] = useState<number | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const save = (next: ModelConfig) => onChange(next.rooms.length || next.cuts.some((c) => c != null) || next.views?.some(Boolean) ? next : null);
  const setView = (f: number, v: ModelView | null) => {
    const views = [...(cfg.views ?? [])];
    while (views.length <= f) views.push(null);
    views[f] = v;
    save({ ...cfg, views });
  };
  const setRoom = (i: number, patch: Partial<ModelRoom>) => save({ ...cfg, rooms: cfg.rooms.map((r, k) => (k === i ? { ...r, ...patch } : r)) });
  const setCut = (f: number, h: number | null) => {
    const cuts = [...cfg.cuts];
    while (cuts.length <= f) cuts.push(null);
    cuts[f] = h == null ? null : Math.round(h * 10) / 10;
    save({ ...cfg, cuts });
  };

  const onPick = (p: { x: number; y: number; z: number }, f: number | null) => {
    if (f == null) {
      setHint("กดปุ่ม “ตัดชั้น 1” (หรือชั้นอื่น) ใต้ภาพก่อน แล้วคลิกบนพื้นห้อง");
      return;
    }
    const pos = { x: Math.round(p.x * 100) / 100, y: Math.round(p.y * 100) / 100, z: Math.round(p.z * 100) / 100 };
    setHint(null);
    if (moving != null) {
      setRoom(moving, { ...pos, floor: f });
      setSelected(moving);
      setMoving(null);
      return;
    }
    if (cfg.rooms.length >= MAX_ROOMS) {
      setHint(`วางป้ายได้สูงสุด ${MAX_ROOMS} ห้อง`);
      return;
    }
    const onFloor = cfg.rooms.filter((r) => r.floor === f);
    const preset = ROOM_PRESETS.find((x) => !onFloor.some((r) => r.th === x.th)) ?? ROOM_PRESETS[2];
    save({ ...cfg, rooms: [...cfg.rooms, { floor: f, ...pos, ...preset }] });
    setSelected(cfg.rooms.length);
  };

  const list = cfg.rooms.map((r, i) => ({ r, i })).filter(({ r }) => floor == null || r.floor === floor);

  return (
    <div className="mt-4 border border-hairline bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline bg-wash px-4 py-2.5">
        <p className="flex items-center gap-2 text-[13.5px] font-bold"><Icon name="layers" className="text-bronze-dark" /> ตั้งค่าตัดชั้น &amp; ป้ายชื่อห้อง</p>
        <span className="text-[11.5px] text-muted">ลูกค้าจะเห็นตามที่ตั้งไว้ตรงนี้เมื่อกด “ตัดชั้น”</span>
      </div>
      <ol className="flex flex-wrap gap-x-5 gap-y-1 px-4 pt-3 text-[12px] text-ink-3">
        <li><b>1.</b> กด <b>ตัดชั้น 1</b> ใต้ภาพ</li>
        <li><b>2.</b> เลื่อนแถบความสูงให้ตัดผ่านกลางผนัง (เหนือพื้นราว 1.2–1.5 ม.)</li>
        <li><b>3.</b> คลิกบนพื้นของแต่ละห้องเพื่อวางป้าย แล้วตั้งชื่อด้านขวา</li>
        <li><b>4.</b> หมุน/ซูมให้ได้มุมที่ชอบ แล้วกด <b>ใช้มุมนี้</b> (มุมขวาล่างของภาพ)</li>
      </ol>
      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div>
          <div className={`relative aspect-[16/10] overflow-hidden bg-wash-2 ${floor != null ? "ring-2 ring-bronze" : ""}`}>
            <Model3D plan={plan} config={cfg} highlight={selected}
              onPick={onPick}
              onCut={(f, h) => setCut(f, h)}
              onView={(f, v) => { setView(f, v); setHint(`บันทึกมุมกล้องของชั้น ${f + 1} แล้ว — ลูกค้าจะเห็นมุมนี้เมื่อกดตัดชั้น ${f + 1}`); }}
              onFloor={(f) => { setFloor(f); setSelected(null); setMoving(null); setHint(null); }} />
          </div>
          {(hint || moving != null) && (
            <p className="mt-2 flex items-center gap-1.5 text-[12.5px] font-semibold text-bronze-dark" role="status">
              <Icon name="ads_click" /> {hint ?? `คลิกบนโมเดลเพื่อย้ายป้าย “${cfg.rooms[moving!]?.th}”`}
              {moving != null && <button type="button" onClick={() => setMoving(null)} className="ml-2 text-muted underline">ยกเลิก</button>}
            </p>
          )}
        </div>

        <div className="space-y-4 text-[12.5px]">
          <div>
            <p className="field-label">ความสูงที่ตัดแต่ละชั้น (ม. จากจุดต่ำสุดของโมเดล)</p>
            <ul className="mt-1.5 divide-y divide-hairline border border-hairline">
              {Array.from({ length: plan.storeys }, (_, f) => (
                <li key={f} className={`flex flex-wrap items-center justify-between gap-x-2 gap-y-1 px-3 py-2 ${floor === f ? "bg-bronze-wash" : ""}`}>
                  <span className="font-semibold">ชั้น {f + 1}</span>
                  <span className="order-last w-full text-[11.5px] text-muted">
                    มุมกล้อง: {cfg.views?.[f] ? <>บันทึกแล้ว <button type="button" onClick={() => setView(f, null)} className="underline hover:text-danger">ล้าง</button></> : "อัตโนมัติ (ซูมเข้าหาห้องที่วางป้าย)"}
                  </span>
                  {cfg.cuts[f] != null ? (
                    <span className="flex items-center gap-2"><b>{cfg.cuts[f]!.toFixed(1)} ม.</b>
                      <button type="button" onClick={() => setCut(f, null)} className="text-muted underline hover:text-danger">ใช้ค่าอัตโนมัติ</button></span>
                  ) : <span className="text-subtle">อัตโนมัติ — กดตัดชั้น {f + 1} แล้วเลื่อนแถบเพื่อตั้งค่า</span>}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="field-label">ป้ายชื่อห้อง {floor != null ? `ชั้น ${floor + 1}` : "(ทุกชั้น)"} — {list.length} ห้อง</p>
            {!list.length && <p className="mt-1.5 bg-wash p-3 text-muted">{floor == null ? "กดตัดชั้นใต้ภาพ แล้วคลิกบนพื้นห้องเพื่อวางป้ายแรก" : "คลิกบนพื้นห้องในภาพเพื่อวางป้าย"}</p>}
            {/* Enter in these fields must not submit the plan form */}
            <ul className="mt-1.5 max-h-[340px] space-y-1.5 overflow-y-auto pr-1" onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}>
              {list.map(({ r, i }) => (
                <li key={i} onFocus={() => setSelected(i)} onMouseEnter={() => setSelected(i)}
                  className={`flex items-center gap-1.5 border p-1.5 ${selected === i ? "border-bronze bg-bronze-wash" : "border-hairline"}`}>
                  {floor == null && <span className="shrink-0 bg-ink px-1.5 text-[10.5px] font-bold text-white">ชั้น {r.floor + 1}</span>}
                  <input value={r.th} onChange={(e) => setRoom(i, { th: e.target.value })} maxLength={40} aria-label="ชื่อห้อง" className="input min-w-0 flex-1 !px-2 !py-1.5 text-[12.5px] font-semibold" />
                  <input value={r.en} onChange={(e) => setRoom(i, { en: e.target.value.toUpperCase() })} maxLength={30} aria-label="ชื่อภาษาอังกฤษ" placeholder="EN" className="input !w-24 !px-2 !py-1.5 text-[11px]" />
                  <select value="" aria-label="เลือกชื่อห้องสำเร็จรูป" title="ชื่อห้องสำเร็จรูป" onChange={(e) => { const p = ROOM_PRESETS[Number(e.target.value)]; if (p) setRoom(i, p); }}
                    className="input !w-9 shrink-0 !bg-none !px-0 !py-1.5 text-center">
                    <option value="">⋯</option>
                    {ROOM_PRESETS.map((p, k) => <option key={k} value={k}>{p.th}</option>)}
                  </select>
                  <button type="button" onClick={() => { setMoving(i); setSelected(i); }} title="ย้ายตำแหน่ง" aria-label={`ย้ายป้าย ${r.th}`}
                    className={`grid h-8 w-8 shrink-0 place-items-center ${moving === i ? "bg-bronze text-ink" : "text-muted hover:bg-wash-2"}`}><Icon name="open_with" /></button>
                  <button type="button" onClick={() => { save({ ...cfg, rooms: cfg.rooms.filter((_, k) => k !== i) }); setSelected(null); setMoving(null); }}
                    aria-label={`ลบป้าย ${r.th}`} className="grid h-8 w-8 shrink-0 place-items-center text-muted hover:bg-danger hover:text-white"><Icon name="delete" /></button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
