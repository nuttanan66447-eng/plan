"use client";

import { useMemo, useState } from "react";
import { baht, num } from "@/lib/format";
import { Field, LeadForm } from "./LeadForm";

// Design fee per sq.m. by house type — mirrors the studio's published rate card
const TYPES = [
  { value: "1", label: "บ้านเดี่ยวโมเดิร์น 1-2 ชั้น", rate: 120, min: 25000 },
  { value: "2", label: "บ้านพักตากอากาศ / พูลวิลล่า", rate: 160, min: 45000 },
  { value: "3", label: "บ้านหน้าแคบ / ทาวน์โฮม", rate: 110, min: 22000 },
  { value: "4", label: "อาคารพาณิชย์ / โฮมออฟฟิศ", rate: 180, min: 60000 },
];

export function QuickEstimator() {
  const [type, setType] = useState("1");
  const [area, setArea] = useState(250);
  const t = TYPES.find((x) => x.value === type)!;
  const fee = useMemo(() => Math.max(t.min, Math.round((area * t.rate) / 500) * 500), [t, area]);

  return (
    <div className="card p-6 md:p-8">
      <h3 className="text-[19px] font-bold">ประเมินราคาเขียนแบบเบื้องต้น</h3>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="qe-type" className="field-label">ประเภทอาคาร</label>
          <select id="qe-type" className="input" value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="qe-area" className="field-label">พื้นที่ใช้สอยประมาณ (ตร.ม.)</label>
          <input id="qe-area" type="number" min={60} max={1500} className="input" value={area}
            onChange={(e) => setArea(Math.min(1500, Math.max(0, Number(e.target.value) || 0)))} />
        </div>
      </div>
      <input type="range" min={60} max={1000} step={10} value={Math.min(area, 1000)} onChange={(e) => setArea(Number(e.target.value))}
        className="mt-5 w-full accent-[#c59b27]" aria-label="ปรับพื้นที่ใช้สอย" />
      <div className="flex justify-between text-[11px] text-subtle"><span>60 ตร.ม.</span><span>{num(area)} ตร.ม.</span><span>1,000 ตร.ม.</span></div>
      <div className="mt-5 flex items-center justify-between gap-4 bg-ink p-5 text-white">
        <div>
          <p className="label-tech text-bronze-light">ประมาณการค่าบริการเขียนแบบครบชุด</p>
          <p className="mt-1 text-[12px] text-white/60">รวมสถาปัตย์ โครงสร้าง ไฟฟ้า สุขาภิบาล BOQ และยื่นอนุญาต</p>
        </div>
        <p className="font-display text-[30px] font-bold text-bronze">{baht(fee)}</p>
      </div>
      <LeadForm type="callback" hidden={{ estimate_thb: fee, area_sqm: area, budget: t.label, source: "home-estimator" }}
        submitLabel="ส่งข้อมูลให้สถาปนิกติดต่อกลับ" consent={false} className="mt-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field name="name" label="ชื่อ" placeholder="ชื่อของคุณ" required autoComplete="name" />
          <Field name="phone" label="เบอร์โทรศัพท์" placeholder="08x-xxx-xxxx" required type="tel" autoComplete="tel" />
        </div>
      </LeadForm>
    </div>
  );
}
