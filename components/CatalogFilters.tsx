"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Icon } from "./Icon";

type Params = Record<string, string | undefined>;

const BUDGETS = [
  { key: "compact", label: "Compact", range: "< 3 ล้าน" },
  { key: "popular", label: "Popular", range: "3 - 5 ล้าน" },
  { key: "luxury", label: "Luxury", range: "5 - 8 ล้าน" },
  { key: "mansion", label: "Mansion", range: "8+ ล้าน" },
];
const FEATURES = [
  { key: "tour360", label: "โมเดล 3D หมุนดูรอบทิศ 360°", icon: "view_in_ar" },
  { key: "dollhouse", label: "แบบตัดแปลน 3D Dollhouse", icon: "splitscreen" },
  { key: "universal", label: "Universal Design ผู้สูงอายุ", icon: "accessible" },
  { key: "pool", label: "มีสระว่ายน้ำ", icon: "pool" },
  { key: "narrow", label: "เหมาะที่ดินหน้าแคบ", icon: "width" },
];

export function useParamNav(params: Params) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();
  const set = (patch: Params) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...params, ...patch, page: patch.page })) if (v) next.set(k, v);
    start(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  };
  return { set, pending };
}

const list = (v?: string) => (v ? v.split(",").filter(Boolean) : []);
const toggleIn = (v: string | undefined, item: string) => {
  const l = list(v);
  return (l.includes(item) ? l.filter((x) => x !== item) : [...l, item]).join(",") || undefined;
};

export function CatalogFilters({ params, counts }: { params: Params; counts: Record<number, number> }) {
  const { set, pending } = useParamNav(params);
  const [area, setArea] = useState(Number(params.area) || 600);
  const [open, setOpen] = useState(false);
  useEffect(() => setArea(Number(params.area) || 600), [params.area]);

  const storeys = list(params.storeys);
  const features = list(params.features);
  const activeCount = ["storeys", "area", "beds", "land", "budget", "features"].filter((k) => params[k]).length;

  const body = (
    <div className={`divide-y divide-hairline transition-opacity ${pending ? "opacity-60" : ""}`}>
      <fieldset className="pb-5">
        <legend className="label-tech mb-3 text-muted">01 / จำนวนชั้น (Storeys)</legend>
        {[[1, "1 ชั้น (Single Floor)"], [2, "2 ชั้น (Two Storey)"], [3, "3 ชั้นขึ้นไป (Multi-Level)"]].map(([n, l]) => (
          <label key={n} className="flex cursor-pointer items-center gap-3 py-1.5 text-[13.5px]">
            <input type="checkbox" className="check" checked={storeys.includes(String(n))} onChange={() => set({ storeys: toggleIn(params.storeys, String(n)) })} />
            <span className="flex-1">{l}</span>
            <span className={`text-[12px] ${storeys.includes(String(n)) ? "font-bold text-bronze-dark" : "text-subtle"}`}>{counts[n as number] ?? 0}</span>
          </label>
        ))}
      </fieldset>

      <div className="py-5">
        <div className="flex items-center justify-between">
          <p className="label-tech text-muted">02 / พื้นที่ใช้สอย (ตร.ม.)</p>
          <p className="text-[12px] font-bold text-bronze-dark">ไม่เกิน {area} ตร.ม.</p>
        </div>
        <input type="range" min={100} max={600} step={10} value={area} aria-label="พื้นที่ใช้สอยสูงสุด"
          onChange={(e) => setArea(Number(e.target.value))}
          onPointerUp={() => set({ area: area >= 600 ? undefined : String(area) })}
          onKeyUp={() => set({ area: area >= 600 ? undefined : String(area) })}
          className="mt-3 w-full accent-[#c59b27]" />
        <div className="flex justify-between text-[10.5px] text-subtle"><span>100 ตร.ม.</span><span>350 ตร.ม.</span><span>600+ ตร.ม.</span></div>
      </div>

      <div className="py-5">
        <p className="label-tech mb-3 text-muted">03 / จำนวนห้องนอน (Beds)</p>
        <div className="grid grid-cols-4 gap-1.5">
          {["2", "3", "4", "5"].map((b) => (
            <button key={b} type="button" onClick={() => set({ beds: params.beds === b ? undefined : b })}
              className={`h-9 border text-[13px] font-semibold ${params.beds === b ? "border-ink bg-ink text-white" : "border-hairline bg-white hover:border-ink"}`}>
              {b === "5" ? "5+" : b}
            </button>
          ))}
        </div>
      </div>

      <fieldset className="py-5">
        <legend className="label-tech mb-3 text-muted">04 / ขนาดที่ดินขั้นต่ำ</legend>
        {[["s", "ไม่เกิน 50 ตร.ว. (บ้านหน้าแคบ)"], ["m", "50 - 100 ตร.ว. (มาตรฐานเดี่ยว)"], ["l", "มากกว่า 100 ตร.ว. (แปลงใหญ่/พูลวิลล่า)"]].map(([k, l]) => (
          <label key={k} className="flex cursor-pointer items-center gap-3 py-1.5 text-[13.5px]">
            <input type="radio" name="land" className="radio" checked={params.land === k} onChange={() => set({ land: k })} onClick={() => params.land === k && set({ land: undefined })} />
            {l}
          </label>
        ))}
      </fieldset>

      <div className="py-5">
        <p className="label-tech mb-3 text-muted">05 / งบประมาณก่อสร้างโดยประมาณ</p>
        <div className="grid grid-cols-2 gap-1.5">
          {BUDGETS.map((b) => (
            <button key={b.key} type="button" onClick={() => set({ budget: params.budget === b.key ? undefined : b.key })}
              className={`border p-2.5 text-left ${params.budget === b.key ? "border-ink bg-ink text-white" : "border-hairline bg-wash hover:border-ink"}`}>
              <span className={`block text-[10.5px] font-bold uppercase tracking-[0.1em] ${params.budget === b.key ? "text-bronze-light" : "text-bronze-dark"}`}>{b.label}</span>
              <span className="text-[12.5px]">{b.range}</span>
            </button>
          ))}
        </div>
      </div>

      <fieldset className="pt-5">
        <legend className="label-tech mb-3 text-muted">06 / คุณสมบัติโมเดล &amp; แบบ</legend>
        {FEATURES.map((f) => (
          <label key={f.key} className="flex cursor-pointer items-center gap-3 py-1.5 text-[13.5px]">
            <input type="checkbox" className="check" checked={features.includes(f.key)} onChange={() => set({ features: toggleIn(params.features, f.key) })} />
            <Icon name={f.icon} className="text-muted" /> {f.label}
          </label>
        ))}
      </fieldset>
    </div>
  );

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn btn-outline w-full lg:hidden">
        <Icon name="tune" /> ตัวกรองพารามิเตอร์ {activeCount > 0 && <span className="bg-bronze px-1.5 text-[11px] text-ink">{activeCount}</span>}
      </button>
      <aside className="card hidden p-5 lg:block">
        <div className="mb-4 flex items-center justify-between border-b border-hairline pb-4">
          <h2 className="flex items-center gap-2 text-[16px] font-bold"><Icon name="tune" className="text-bronze-dark" /> พารามิเตอร์แปลน</h2>
          {activeCount > 0 && <button onClick={() => set({ storeys: undefined, area: undefined, beds: undefined, land: undefined, budget: undefined, features: undefined })} className="text-[12px] text-bronze-dark underline-offset-2 hover:underline">รีเซ็ตค่า</button>}
        </div>
        {body}
      </aside>
      {open && (
        <div className="fixed inset-0 z-[60] flex lg:hidden" role="dialog" aria-modal="true" aria-label="ตัวกรอง">
          <div className="absolute inset-0 bg-ink/60 backdrop-blur-[4px]" onClick={() => setOpen(false)} />
          <div className="relative ml-auto flex h-full w-[88%] max-w-sm flex-col border-l border-ink bg-white">
            <div className="flex items-center justify-between border-b border-hairline p-4">
              <h2 className="text-[16px] font-bold">พารามิเตอร์แปลน</h2>
              <button onClick={() => setOpen(false)} aria-label="ปิด" className="grid h-9 w-9 place-items-center border border-hairline"><Icon name="close" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{body}</div>
            <div className="grid grid-cols-2 gap-2 border-t border-hairline p-4">
              <button className="btn btn-ghost" onClick={() => set({ storeys: undefined, area: undefined, beds: undefined, land: undefined, budget: undefined, features: undefined })}>รีเซ็ต</button>
              <button className="btn btn-primary" onClick={() => setOpen(false)}>ดูผลลัพธ์</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function CatalogToolbar({ params, total }: { params: Params; total: number }) {
  const { set, pending } = useParamNav(params);
  const [q, setQ] = useState(params.q ?? "");
  useEffect(() => setQ(params.q ?? ""), [params.q]);
  const styles = [["", "ทุกสไตล์"], ["nordic", "นอร์ดิก"], ["japandi", "แจแปนดิ"], ["tropical", "ทรอปิคอล"], ["modern", "โมเดิร์น"], ["minimal", "มินิมอล"]];
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
      <form onSubmit={(e) => { e.preventDefault(); set({ q: q.trim() || undefined }); }} className="flex flex-1 border border-hairline bg-white" role="search">
        <Icon name="search" className="ml-3 self-center text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหารหัสแบบบ้าน เช่น AP-NORDIC, มินิมอล, 2 ชั้น..." aria-label="ค้นหาแบบบ้าน" className="min-w-0 flex-1 px-3 py-2.5 text-[14px] outline-none" />
        <button className="btn btn-primary btn-sm m-1">{pending ? <Icon name="progress_activity" className="animate-spin" /> : "ค้นหาแบบ"}</button>
      </form>
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
        {styles.map(([k, l]) => (
          <button key={k} onClick={() => set({ style: k || undefined })} className={`chip h-9 shrink-0 cursor-pointer ${(params.style ?? "") === k ? "chip-active" : "hover:border-ink"}`}>
            {l}{!k && (params.style ? "" : ` (${total})`)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SortSelect({ params }: { params: Params }) {
  const { set } = useParamNav(params);
  return (
    <label className="flex items-center gap-2 text-[12px] text-muted">
      จัดเรียง:
      <select value={params.sort ?? "popular"} onChange={(e) => set({ sort: e.target.value === "popular" ? undefined : e.target.value })} className="input !w-auto !py-2 text-[13px]">
        <option value="popular">แบบบ้านยอดนิยมสูงสุด</option>
        <option value="price_asc">ราคาแบบ ต่ำ → สูง</option>
        <option value="price_desc">ราคาแบบ สูง → ต่ำ</option>
        <option value="area_asc">พื้นที่ใช้สอย น้อย → มาก</option>
        <option value="area_desc">พื้นที่ใช้สอย มาก → น้อย</option>
        <option value="newest">แบบใหม่ล่าสุด</option>
      </select>
    </label>
  );
}
