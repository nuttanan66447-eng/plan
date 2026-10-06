"use client";

import { useState } from "react";
import { baht } from "@/lib/format";
import { Field, LeadForm } from "./LeadForm";

const ADDONS = [
  { key: "bim", label: "ไฟล์ดิจิทัล BIM / Revit / AutoCAD (.dwg)", price: 8000 },
  { key: "site", label: "ปรับผังให้เข้ากับที่ดิน + ยื่นขออนุญาตแทน", price: 12000 },
  { key: "extra", label: "เล่มพิมพ์เขียวเพิ่ม 3 ชุด (สำหรับธนาคาร)", price: 2500 },
];

export function OrderForm({ code, price }: { code: string; price: number }) {
  const [sel, setSel] = useState<string[]>([]);
  const total = price + ADDONS.filter((a) => sel.includes(a.key)).reduce((s, a) => s + a.price, 0);
  const pkg = ["ชุดแบบมาตรฐาน", ...ADDONS.filter((a) => sel.includes(a.key)).map((a) => a.label)].join(" + ");
  return (
    <LeadForm type="order" hidden={{ plan_code: code, estimate_thb: total, service_package: pkg.slice(0, 80), deliverables: pkg }} submitLabel={`ยืนยันสั่งซื้อ (${baht(total)})`} successTitle="รับคำสั่งซื้อเรียบร้อย">
      <div className="border border-hairline bg-wash p-4">
        <div className="flex items-center justify-between text-[13.5px]">
          <span>ชุดแบบก่อสร้างมาตรฐาน {code}</span><b>{baht(price)}</b>
        </div>
        <div className="mt-3 space-y-2 border-t border-hairline pt-3">
          {ADDONS.map((a) => (
            <label key={a.key} className="flex cursor-pointer items-center gap-3 text-[13px]">
              <input type="checkbox" className="check" checked={sel.includes(a.key)} onChange={() => setSel((s) => (s.includes(a.key) ? s.filter((x) => x !== a.key) : [...s, a.key]))} />
              <span className="flex-1">{a.label}</span><span className="text-muted">+{baht(a.price)}</span>
            </label>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-ink pt-3">
          <span className="text-[13px] font-semibold">ยอดรวม (รวม VAT)</span>
          <span className="font-display text-[24px] font-bold text-bronze-dark">{baht(total)}</span>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field name="name" label="ชื่อ-นามสกุล" required autoComplete="name" />
        <Field name="phone" label="เบอร์โทรศัพท์" type="tel" required autoComplete="tel" placeholder="08x-xxx-xxxx" />
        <Field name="email" label="อีเมล (รับใบเสร็จ)" type="email" autoComplete="email" />
        <Field name="province" label="จังหวัดที่จะก่อสร้าง" placeholder="เช่น ร้อยเอ็ด" />
        <Field name="message" as="textarea" label="ที่อยู่จัดส่งเล่มแบบ / หมายเหตุ" className="sm:col-span-2" placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์" />
      </div>
    </LeadForm>
  );
}
