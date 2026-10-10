"use client";

import { Fragment, useState } from "react";
import { baht } from "@/lib/format";
import { addonPrice, ORDER_ADDONS } from "@/lib/pricing";
import { DeedUpload } from "./DeedUpload";
import { Icon } from "./Icon";
import { Field, LeadForm } from "./LeadForm";

const INCLUDED = [
  "เล่มพิมพ์เขียวแบบก่อสร้าง A3 จำนวน 5 ชุด",
  "เล่มรายการคำนวณโครงสร้าง ลงนามวิศวกร",
  "เอกสาร BOQ ถอดแบบวัสดุและค่าแรง (Excel + PDF)",
];

export function OrderForm({ code, price, area }: { code: string; price: number; area: number }) {
  // add-on prices scale with the house size
  const ADDONS = ORDER_ADDONS.map((a) => ({ key: a.key, label: a.label, price: addonPrice(a, area) }));
  const [sel, setSel] = useState<string[]>([]);
  const total = price + ADDONS.filter((a) => sel.includes(a.key)).reduce((s, a) => s + a.price, 0);
  const pkg = ["ชุดแบบมาตรฐาน (เล่มแบบ 5 ชุด + รายการคำนวณ + BOQ)", ...ADDONS.filter((a) => sel.includes(a.key)).map((a) => a.label)].join(" + ");
  return (
    <LeadForm type="order" hidden={{ plan_code: code, estimate_thb: total, service_package: pkg.slice(0, 80), deliverables: pkg }} submitLabel={`ยืนยันสั่งซื้อ (${baht(total)})`} successTitle="รับคำสั่งซื้อเรียบร้อย">
      <div className="border border-hairline bg-wash p-4">
        <div className="flex items-center justify-between text-[13.5px]">
          <span>ชุดแบบก่อสร้างมาตรฐาน {code}</span><b>{baht(price)}</b>
        </div>
        {/* included in every set — shown ticked so buyers see what they get */}
        <ul className="mt-3 space-y-2 border-t border-hairline pt-3">
          {INCLUDED.map((t) => (
            <li key={t} className="flex items-center gap-3 text-[13px]">
              <span className="grid h-[18px] w-[18px] shrink-0 place-items-center bg-success text-white"><Icon name="check" className="text-[14px]" /></span>
              <span className="flex-1">{t}</span><span className="text-[12px] font-semibold text-success">รวมแล้ว</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 border-t border-hairline pt-3 text-[11.5px] font-semibold text-muted">เลือกเพิ่ม</p>
        <div className="mt-2 space-y-2">
          {ADDONS.map((a) => (
            <Fragment key={a.key}>
              <label className="flex cursor-pointer items-center gap-3 text-[13px]">
                <input type="checkbox" className="check" checked={sel.includes(a.key)} onChange={() => setSel((s) => (s.includes(a.key) ? s.filter((x) => x !== a.key) : [...s, a.key]))} />
                <span className="flex-1">{a.label}</span><span className="text-muted">+{baht(a.price)}</span>
              </label>
              {/* site adaptation needs the land deed */}
              {a.key === "site" && sel.includes("site") && <DeedUpload />}
            </Fragment>
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
