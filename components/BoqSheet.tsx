"use client";

import { useMemo, useState } from "react";
import { baht, num } from "@/lib/format";
import type { BoqItem } from "@/lib/types";
import { Icon } from "./Icon";

const VAT = 0.07;

export function BoqSheet({ items, planCode, title }: { items: BoqItem[]; planCode: string; title: string }) {
  const [q, setQ] = useState("");
  const [collapsed, setCollapsed] = useState<number[]>([]);
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? items.filter((i) => `${i.description} ${i.spec ?? ""} ${i.item_no}`.toLowerCase().includes(t)) : items;
  }, [items, q]);

  const sections = useMemo(() => {
    const m = new Map<number, { name: string; items: BoqItem[] }>();
    for (const i of filtered) {
      if (!m.has(i.section_no)) m.set(i.section_no, { name: i.section_name, items: [] });
      m.get(i.section_no)!.items.push(i);
    }
    return [...m.entries()];
  }, [filtered]);

  const mat = items.reduce((s, i) => s + i.qty * i.material_rate, 0);
  const lab = items.reduce((s, i) => s + i.qty * i.labor_rate, 0);
  const sub = mat + lab;

  const downloadCsv = () => {
    const head = ["ลำดับ", "รายการ", "สเปก", "ปริมาณ", "หน่วย", "ค่าวัสดุ/หน่วย", "รวมค่าวัสดุ", "ค่าแรง/หน่วย", "รวมค่าแรง", "รวมเป็นเงิน"];
    const rows = items.map((i) => [i.item_no, i.description, i.spec ?? "", i.qty, i.unit, i.material_rate, i.qty * i.material_rate, i.labor_rate, i.qty * i.labor_rate, i.qty * (i.material_rate + i.labor_rate)]);
    const csv = [head, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `BOQ-${planCode}.csv` });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col gap-2 bg-ink px-4 py-3 text-[11.5px] font-semibold tracking-[0.04em] text-white md:flex-row md:items-center md:justify-between">
        <span>DOC ID: BOQ-{planCode} • {title}</span>
        <span className="text-bronze-light">สถานะ: ตรวจสอบโดยวิศวกรแล้ว (Approved) • ฉบับที่ 3.1</span>
      </div>
      <div className="flex flex-col gap-3 border-b border-hairline p-4 md:flex-row md:items-center">
        <div className="flex flex-1 border border-hairline">
          <Icon name="search" className="ml-3 self-center text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาชื่อรายการ เช่น ปูนซีเมนต์, คอนกรีต, เหล็กเส้น..." aria-label="ค้นหารายการ BOQ" className="w-full px-3 py-2.5 text-[13.5px] outline-none" />
        </div>
        <span className="text-[12px] text-muted">แสดง {filtered.length} จาก {items.length} รายการ</span>
        <button onClick={downloadCsv} className="btn btn-outline btn-sm"><Icon name="download" /> ดาวน์โหลด Excel (CSV)</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] border-collapse text-[12.5px]">
          <thead className="bg-wash text-left text-[11px] text-muted">
            <tr>
              {["ลำดับ", "รายการรายละเอียด (Item Description & Brand Spec)", "ปริมาณ", "หน่วย", "ค่าวัสดุ/หน่วย", "รวมค่าวัสดุ", "ค่าแรง/หน่วย", "รวมค่าแรง", "รวมเป็นเงิน (THB)"].map((h, i) => (
                <th key={h} className={`border-b border-hairline px-3 py-2.5 font-semibold ${i >= 2 ? "text-right" : ""}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sections.map(([no, s]) => {
              const total = s.items.reduce((t, i) => t + i.qty * (i.material_rate + i.labor_rate), 0);
              const isCollapsed = collapsed.includes(no);
              return (
                <FragmentRows key={no}>
                  <tr className="cursor-pointer bg-bronze-wash/60" onClick={() => setCollapsed((c) => (c.includes(no) ? c.filter((x) => x !== no) : [...c, no]))}>
                    <td className="px-3 py-2.5 font-bold text-bronze-dark">{no}.0</td>
                    <td className="px-3 py-2.5 font-bold" colSpan={7}><Icon name={isCollapsed ? "chevron_right" : "expand_more"} /> หมวดที่ {no}: {s.name}</td>
                    <td className="px-3 py-2.5 text-right font-bold text-bronze-dark">{baht(total)}</td>
                  </tr>
                  {!isCollapsed && s.items.map((i) => (
                    <tr key={i.id} className="border-b border-hairline hover:bg-wash/60">
                      <td className="px-3 py-2.5 text-muted">{i.item_no}</td>
                      <td className="px-3 py-2.5"><b className="block font-semibold">{i.description}</b><span className="text-[11.5px] text-muted">{i.spec}</span></td>
                      <td className="px-3 py-2.5 text-right">{num(i.qty, i.qty % 1 ? 2 : 0)}</td>
                      <td className="px-3 py-2.5 text-right">{i.unit}</td>
                      <td className="px-3 py-2.5 text-right">{num(i.material_rate, 2)}</td>
                      <td className="px-3 py-2.5 text-right">{num(i.qty * i.material_rate)}</td>
                      <td className="px-3 py-2.5 text-right">{num(i.labor_rate, 2)}</td>
                      <td className="px-3 py-2.5 text-right">{num(i.qty * i.labor_rate)}</td>
                      <td className="px-3 py-2.5 text-right font-bold">{num(i.qty * (i.material_rate + i.labor_rate))}</td>
                    </tr>
                  ))}
                </FragmentRows>
              );
            })}
            {!sections.length && <tr><td colSpan={9} className="p-8 text-center text-muted">ไม่พบรายการที่ค้นหา</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="grid gap-px border-t border-hairline bg-hairline md:grid-cols-[1fr_1fr_1.3fr]">
        <div className="bg-white p-4"><p className="text-[11px] text-muted">รวมค่าวัสดุทั้งหมด (Total Materials)</p><p className="mt-1 font-display text-[22px] font-bold">{baht(mat)}</p><p className="text-[11px] text-subtle">{sub ? Math.round((mat / sub) * 100) : 0}% • ค่าวัสดุอ้างอิง BIM Quantities</p></div>
        <div className="bg-white p-4"><p className="text-[11px] text-muted">รวมค่าแรงงานทั้งหมด (Total Labor)</p><p className="mt-1 font-display text-[22px] font-bold">{baht(lab)}</p><p className="text-[11px] text-subtle">{sub ? Math.round((lab / sub) * 100) : 0}% • อ้างอิงค่าแรงช่างฝีมือมาตรฐาน</p></div>
        <div className="bg-wash p-4 text-[13px]">
          <p className="flex justify-between"><span>ราคางานก่อสร้าง</span><span>{baht(sub)}</span></p>
          <p className="flex justify-between text-muted"><span>ภาษีมูลค่าเพิ่ม (VAT 7%)</span><span>{baht(sub * VAT)}</span></p>
          <p className="mt-2 flex justify-between border-t border-ink pt-2 font-bold"><span>ยอดงบประมาณสุทธิ</span><span className="font-display text-[20px] text-bronze-dark">{baht(sub * (1 + VAT))}</span></p>
        </div>
      </div>
    </div>
  );
}

function FragmentRows({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
