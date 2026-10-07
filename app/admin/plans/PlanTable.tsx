"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { baht, num, PLAN_STYLES, STYLE_LABEL } from "@/lib/format";
import type { Plan } from "@/lib/types";

export type AdminPlanRow = Pick<
  Plan,
  "id" | "code" | "name_en" | "name_th" | "series" | "style" | "storeys" | "area_sqm" | "bedrooms" | "price" | "image" | "model_url" | "floorplan_images" | "section_image"
> & { is_published: boolean; sort_order: number; created_at?: string };

const SORTS = [
  ["order", "ลำดับการแสดง"],
  ["newest", "เพิ่มล่าสุด"],
  ["code", "รหัสแบบ A-Z"],
  ["price_asc", "ราคาต่ำ → สูง"],
  ["price_desc", "ราคาสูง → ต่ำ"],
  ["area_asc", "พื้นที่เล็ก → ใหญ่"],
  ["area_desc", "พื้นที่ใหญ่ → เล็ก"],
] as const;

const MISSING = [
  ["model", "ยังไม่มีโมเดล 3D (.glb)"],
  ["floorplan", "ยังไม่มีแปลน 2D"],
  ["section", "ยังไม่มีภาพตัด 3D"],
] as const;

const AREAS = [
  ["", "ทุกขนาด"],
  ["0-120", "ไม่เกิน 120 ตร.ม."],
  ["120-200", "120 – 200 ตร.ม."],
  ["200-300", "200 – 300 ตร.ม."],
  ["300-9999", "300 ตร.ม. ขึ้นไป"],
] as const;

/** Instant filters for the admin plan list; kept in the URL so they survive going to "แก้ไข" and back. */
export function PlanTable({ plans }: { plans: AdminPlanRow[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const get = (k: string) => sp.get(k) ?? "";
  const [q, setQ] = useState(get("q"));

  const set = (patch: Record<string, string>) => {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) v ? next.set(k, v) : next.delete(k);
    next.delete("saved");
    next.delete("deleted");
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  };

  const f = { style: get("style"), storeys: get("storeys"), beds: get("beds"), area: get("area"), status: get("status"), missing: get("missing"), sort: get("sort") || "order" };

  const shown = useMemo(() => {
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const [aMin, aMax] = f.area ? f.area.split("-").map(Number) : [0, Infinity];
    const rows = plans.filter((p) => {
      const hay = `${p.code} ${p.name_en} ${p.name_th} ${p.series ?? ""} ${STYLE_LABEL[p.style] ?? ""}`.toLowerCase();
      if (words.some((w) => !hay.includes(w))) return false;
      if (f.style && p.style !== f.style) return false;
      if (f.storeys && String(p.storeys) !== f.storeys) return false;
      if (f.beds && (f.beds === "5" ? p.bedrooms < 5 : String(p.bedrooms) !== f.beds)) return false;
      if (p.area_sqm < aMin || p.area_sqm >= aMax) return false;
      if (f.status === "published" && !p.is_published) return false;
      if (f.status === "hidden" && p.is_published) return false;
      if (f.missing === "model" && p.model_url) return false;
      if (f.missing === "floorplan" && p.floorplan_images?.some(Boolean)) return false;
      if (f.missing === "section" && p.section_image) return false;
      return true;
    });
    const by: Record<string, (a: AdminPlanRow, b: AdminPlanRow) => number> = {
      order: (a, b) => a.sort_order - b.sort_order,
      newest: (a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""),
      code: (a, b) => a.code.localeCompare(b.code),
      price_asc: (a, b) => a.price - b.price,
      price_desc: (a, b) => b.price - a.price,
      area_asc: (a, b) => a.area_sqm - b.area_sqm,
      area_desc: (a, b) => b.area_sqm - a.area_sqm,
    };
    return rows.sort(by[f.sort] ?? by.order);
  }, [plans, q, f.style, f.storeys, f.beds, f.area, f.status, f.missing, f.sort]);

  const active = Object.entries(f).filter(([k, v]) => v && !(k === "sort" && v === "order")).length + (q.trim() ? 1 : 0);
  const usedStyles = PLAN_STYLES.filter((s) => plans.some((p) => p.style === s.key));
  const count = (style: string) => plans.filter((p) => p.style === style).length;

  return (
    <>
      <div className="mt-5 border border-hairline bg-white p-3">
        <form role="search" onSubmit={(e) => { e.preventDefault(); set({ q: q.trim() }); }} className="flex border border-hairline">
          <Icon name="search" className="ml-3 self-center text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} onBlur={() => set({ q: q.trim() })} placeholder="ค้นหารหัส ชื่อแบบ หรือซีรีส์ เช่น AP-MODERN, วิลล่า, Nordic..."
            aria-label="ค้นหาแบบบ้าน" className="min-w-0 flex-1 px-3 py-2.5 text-[14px] outline-none" />
          {q && <button type="button" onClick={() => { setQ(""); set({ q: "" }); }} className="px-3 text-muted hover:text-ink" aria-label="ล้างคำค้น"><Icon name="close" /></button>}
        </form>
        <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-7">
          <Select label="สไตล์" value={f.style} onChange={(v) => set({ style: v })}
            options={[["", "ทุกสไตล์"], ...usedStyles.map((s) => [s.key, `${s.th} (${count(s.key)})`] as [string, string])]} />
          <Select label="จำนวนชั้น" value={f.storeys} onChange={(v) => set({ storeys: v })} options={[["", "ทุกจำนวนชั้น"], ["1", "1 ชั้น"], ["2", "2 ชั้น"], ["3", "3 ชั้น"], ["4", "4 ชั้น"]]} />
          <Select label="ห้องนอน" value={f.beds} onChange={(v) => set({ beds: v })} options={[["", "ทุกจำนวนห้องนอน"], ["1", "1 ห้องนอน"], ["2", "2 ห้องนอน"], ["3", "3 ห้องนอน"], ["4", "4 ห้องนอน"], ["5", "5 ห้องนอนขึ้นไป"]]} />
          <Select label="พื้นที่ใช้สอย" value={f.area} onChange={(v) => set({ area: v })} options={AREAS.map(([v, l]) => [v, l])} />
          <Select label="สถานะ" value={f.status} onChange={(v) => set({ status: v })} options={[["", "ทุกสถานะ"], ["published", "แสดงบนเว็บ"], ["hidden", "ซ่อนอยู่"]]} />
          <Select label="ข้อมูลที่ยังขาด" value={f.missing} onChange={(v) => set({ missing: v })} options={[["", "ไม่กรอง"], ...MISSING.map(([v, l]) => [v, l] as [string, string])]} />
          <Select label="เรียงตาม" value={f.sort} onChange={(v) => set({ sort: v === "order" ? "" : v })} options={SORTS.map(([v, l]) => [v, l])} />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[12.5px]">
          <span className="text-muted">พบ <b className="text-ink">{shown.length}</b> จาก {plans.length} แบบ</span>
          {active > 0 && (
            <button type="button" onClick={() => { setQ(""); router.replace(pathname, { scroll: false }); }} className="flex items-center gap-1 font-semibold text-bronze-dark hover:underline">
              <Icon name="filter_alt_off" /> ล้างตัวกรองทั้งหมด ({active})
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 overflow-x-auto border border-hairline bg-white">
        <table className="w-full min-w-[760px] text-[13px]">
          <thead className="bg-wash text-left text-[11.5px] text-muted">
            <tr><th className="p-3">แบบ</th><th className="p-3">สไตล์ / สเปก</th><th className="p-3 text-right">ราคาชุดแบบ</th><th className="p-3">สถานะ</th><th className="p-3" /></tr>
          </thead>
          <tbody>
            {shown.map((p) => (
              <tr key={p.id} className="border-t border-hairline hover:bg-wash/50">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-20 shrink-0 bg-wash-2"><Image src={p.image} alt="" fill sizes="80px" className="object-cover" /></div>
                    <div>
                      <p className="font-bold">{p.code}</p>
                      <p className="text-[12px] text-muted">{p.name_en} • {p.name_th}</p>
                      <p className="mt-0.5 flex gap-1.5 text-[10.5px] font-semibold">
                        {p.model_url && <span className="bg-wash-2 px-1.5">3D .glb</span>}
                        {p.floorplan_images?.some(Boolean) && <span className="bg-wash-2 px-1.5">แปลนจริง</span>}
                        {p.section_image && <span className="bg-wash-2 px-1.5">ภาพตัด</span>}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-muted">{STYLE_LABEL[p.style]}<br />{num(p.area_sqm)} ตร.ม. • {p.bedrooms} นอน • {p.storeys} ชั้น</td>
                <td className="p-3 text-right font-semibold">{baht(p.price)}</td>
                <td className="p-3">{p.is_published ? <span className="bg-[#e9f5ee] px-2 py-0.5 text-[11px] font-semibold text-success">แสดงบนเว็บ</span> : <span className="bg-wash-3 px-2 py-0.5 text-[11px] font-semibold text-muted">ซ่อน</span>}</td>
                <td className="p-3 text-right"><Link href={`/admin/plans/${p.id}`} className="btn btn-primary btn-sm"><Icon name="edit" /> แก้ไข</Link></td>
              </tr>
            ))}
            {!shown.length && (
              <tr><td colSpan={5} className="p-8 text-center text-muted">ไม่พบแบบที่ตรงกับตัวกรอง</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: readonly (readonly [string, string])[] }) {
  return (
    <label className="field">
      <span className="text-[11px] font-semibold text-muted">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`input !py-2 text-[13px] ${value ? "!border-ink" : ""}`}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}
