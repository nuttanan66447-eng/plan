"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import type { Plan } from "@/lib/types";
import { FloorPlan, SunPath } from "./FloorPlan";
import { Icon } from "./Icon";

const Model3D = dynamic(() => import("./Model3D"), {
  ssr: false,
  loading: () => (
    <div className="blueprint grid h-full place-items-center text-[13px] text-muted">
      <span className="flex items-center gap-2"><Icon name="progress_activity" className="animate-spin text-bronze-dark" /> กำลังโหลดโมเดล 3 มิติ...</span>
    </div>
  ),
});

const TABS = [
  { key: "model", label: "โมเดล 3D หมุนได้", icon: "3d_rotation" },
  { key: "exterior", label: "ภาพจริง EXTERIOR", icon: "photo_library" },
  { key: "section", label: "ตัดขวาง SECTION 3D", icon: "splitscreen" },
  { key: "plan", label: "แปลน 2D FLOORPLAN", icon: "architecture" },
  { key: "sun", label: "ทิศแดด-ลม (SUN PATH)", icon: "light_mode" },
] as const;

const HOTSPOTS = [
  { x: 38, y: 30, title: "ระบบหลังคา & ฉนวน", body: "หลังคาเมทัลชีทเคลือบ AZ150 หรือกระเบื้องคอนกรีต พร้อมฉนวน PU กันความร้อน" },
  { x: 62, y: 52, title: "ช่องแสงกระจก Low-E", body: "กระจกลามิเนต Low-E ลดความร้อน 65% รับแสงธรรมชาติเต็มที่" },
  { x: 25, y: 74, title: "พื้นยกระดับ & เทอร์เรซ", body: "พื้น WPC กันปลวก ยกระดับ +0.45 ม. ป้องกันน้ำท่วมขัง" },
];

export function PlanViewer({ plan }: { plan: Plan }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("model");
  const [img, setImg] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [floor, setFloor] = useState(0);
  const [spot, setSpot] = useState<number | null>(null);
  const photos = plan.gallery.filter((g) => g !== plan.panorama);
  const exterior = photos.length ? photos : [plan.image];
  const sectionImg = plan.gallery.find((g) => g.includes("section")) ?? "/images/section-cutaway.jpg";

  return (
    <div className="card overflow-hidden">
      <div className="flex overflow-x-auto bg-ink p-1.5 scrollbar-none" role="tablist">
        {TABS.map((t) => (
          <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => { setTab(t.key); setZoom(1); }}
            className={`flex shrink-0 items-center gap-2 px-3.5 py-2.5 text-[11.5px] font-semibold tracking-[0.05em] ${tab === t.key ? "bg-bronze text-ink" : "text-white/80 hover:text-white"}`}>
            <Icon name={t.icon} /> {t.label}
          </button>
        ))}
        <span className="ml-auto hidden shrink-0 items-center gap-2 px-3 text-[10.5px] font-bold tracking-[0.1em] text-bronze-light md:flex">
          <span className="h-1.5 w-1.5 animate-pulse bg-bronze" /> LIVE 3D
        </span>
      </div>

      <div className="relative aspect-[16/10] overflow-hidden bg-wash-2">
        {tab === "model" && <Model3D plan={plan} />}
        {tab === "exterior" && (
          <>
            <div className="absolute inset-0 transition-transform duration-300" style={{ transform: `scale(${zoom})` }}>
              <Image src={exterior[img]} alt={`${plan.code} มุมมองภายนอก`} fill priority sizes="(max-width: 1024px) 100vw, 860px" className="object-cover" />
              {img === 0 && HOTSPOTS.map((h, i) => (
                <button key={i} onClick={() => setSpot(spot === i ? null : i)} style={{ left: `${h.x}%`, top: `${h.y}%` }}
                  className={`absolute grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center text-[11px] font-bold shadow-[2px_2px_0_0_#1e232a] ${spot === i ? "bg-ink text-white" : "bg-bronze text-ink"}`}
                  aria-label={h.title}>
                  {String(i + 1).padStart(2, "0")}
                </button>
              ))}
            </div>
            {spot !== null && (
              <div className="absolute left-4 top-4 max-w-[260px] border border-ink bg-white p-3 shadow-[4px_4px_0_0_rgba(30,35,42,.12)] animate-fade-up">
                <p className="text-[13px] font-bold">{HOTSPOTS[spot].title}</p>
                <p className="mt-1 text-[12px] text-muted">{HOTSPOTS[spot].body}</p>
              </div>
            )}
          </>
        )}
        {tab === "section" && (
          <div className="absolute inset-0 transition-transform duration-300" style={{ transform: `scale(${zoom})` }}>
            <Image src={sectionImg} alt={`${plan.code} ภาพตัด 3 มิติ`} fill sizes="(max-width: 1024px) 100vw, 860px" className="object-cover" />
            <span className="absolute left-4 top-4 bg-ink px-2 py-1 text-[10.5px] font-semibold tracking-[0.08em] text-white">SECTION A-A • CLEAR HEIGHT 3.00 M.</span>
          </div>
        )}
        {tab === "plan" && <div className="absolute inset-0 transition-transform duration-300" style={{ transform: `scale(${zoom})` }}><FloorPlan plan={plan} floor={floor} /></div>}
        {tab === "sun" && <div className="absolute inset-0"><SunPath plan={plan} /></div>}

        {tab !== "model" && <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-ink/90 p-1 text-[11.5px] text-white">
          {tab === "plan" ? (
            <>
              <span className="px-2 text-white/60">ระดับชั้น:</span>
              {Array.from({ length: plan.storeys }, (_, i) => (
                <button key={i} onClick={() => setFloor(i)} className={`px-2.5 py-1 ${floor === i ? "bg-bronze font-bold text-ink" : "hover:bg-white/10"}`}>ชั้น {i + 1}</button>
              ))}
            </>
          ) : tab === "exterior" && exterior.length > 1 ? (
            <>
              <span className="px-2 text-white/60">มุมมอง:</span>
              {exterior.map((_, i) => (
                <button key={i} onClick={() => { setImg(i); setSpot(null); }} className={`px-2.5 py-1 ${img === i ? "bg-bronze font-bold text-ink" : "hover:bg-white/10"}`}>{String(i + 1).padStart(2, "0")}</button>
              ))}
            </>
          ) : (
            <span className="px-2 text-white/70">{plan.code} • LOD 350</span>
          )}
        </div>}
        {tab !== "sun" && tab !== "model" && (
          <div className="absolute bottom-3 right-3 flex bg-ink/90 text-white">
            <button onClick={() => setZoom((z) => Math.min(2, z + 0.25))} className="grid h-9 w-9 place-items-center hover:bg-white/10" aria-label="ซูมเข้า"><Icon name="zoom_in" /></button>
            <button onClick={() => setZoom((z) => Math.max(1, z - 0.25))} className="grid h-9 w-9 place-items-center hover:bg-white/10" aria-label="ซูมออก"><Icon name="zoom_out" /></button>
            {tab === "exterior" && exterior.length > 1 && (
              <button onClick={() => { setImg((i) => (i + 1) % exterior.length); setSpot(null); }} className="grid h-9 w-9 place-items-center hover:bg-white/10" aria-label="ภาพถัดไป"><Icon name="navigate_next" /></button>
            )}
            <button onClick={() => { setZoom(1); setImg(0); setSpot(null); }} className="grid h-9 w-9 place-items-center text-bronze hover:bg-white/10" aria-label="รีเซ็ตมุมมอง"><Icon name="restart_alt" /></button>
          </div>
        )}
      </div>
    </div>
  );
}
