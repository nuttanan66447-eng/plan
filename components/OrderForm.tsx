"use client";

import { useState } from "react";
import { baht } from "@/lib/format";
import { addonPrice, ORDER_ADDONS, PERMIT_PROVINCE } from "@/lib/pricing";
import { DeedUpload } from "./DeedUpload";
import { Icon } from "./Icon";
import { Field, LeadForm } from "./LeadForm";

const INCLUDED: [string, string][] = [
  ["เล่มพิมพ์เขียวแบบก่อสร้าง A3 จำนวน 5 ชุด", "รวมแล้ว"],
  ["เล่มรายการคำนวณโครงสร้าง ลงนามวิศวกร", "รวมแล้ว"],
  ["เอกสาร BOQ ถอดแบบวัสดุและค่าแรง (Excel + PDF)", "รวมแล้ว"],
  ["ปรับกลับด้าน / หมุนทิศผังให้เข้ากับแปลงที่ดิน", "ฟรี"],
];

export function OrderForm({ code, price, area }: { code: string; price: number; area: number }) {
  // add-on prices scale with the house size
  const ADDONS = ORDER_ADDONS.map((a) => ({ key: a.key, label: a.label, price: addonPrice(a, area), province: "province" in a ? a.province : undefined }));
  const [sel, setSel] = useState<string[]>([]);
  const [where, setWhere] = useState<"" | "roiet" | "other">("");
  const [otherProvince, setOtherProvince] = useState("");
  const province = where === "roiet" ? PERMIT_PROVINCE : otherProvince.trim();
  const allowed = (a: { province?: string }) => !a.province || where === "roiet";
  const chosen = ADDONS.filter((a) => sel.includes(a.key) && allowed(a));
  const total = price + chosen.reduce((s, a) => s + a.price, 0);
  const pkg = ["ชุดแบบมาตรฐาน (เล่มแบบ 5 ชุด + รายการคำนวณ + BOQ + ปรับทิศผังฟรี)", ...chosen.map((a) => a.label)].join(" + ");
  const permit = chosen.some((a) => a.key === "permit");

  return (
    <LeadForm type="order" hidden={{ plan_code: code, estimate_thb: total, service_package: pkg.slice(0, 80), deliverables: pkg, province }} submitLabel={`ยืนยันสั่งซื้อ (${baht(total)})`} successTitle="รับคำสั่งซื้อเรียบร้อย">
      <div className="border border-hairline bg-wash p-4">
        <div className="flex items-center justify-between text-[13.5px]">
          <span>ชุดแบบก่อสร้างมาตรฐาน {code}</span><b>{baht(price)}</b>
        </div>

        {/* included in every set — shown ticked so buyers see what they get */}
        <ul className="mt-3 space-y-2 border-t border-hairline pt-3">
          {INCLUDED.map(([t, tag]) => (
            <li key={t} className="flex items-center gap-3 text-[13px]">
              <span className="grid h-[18px] w-[18px] shrink-0 place-items-center bg-success text-white"><Icon name="check" className="text-[14px]" /></span>
              <span className="flex-1">{t}</span><span className="text-[12px] font-semibold text-success">{tag}</span>
            </li>
          ))}
        </ul>

        <div className="mt-3 border-t border-hairline pt-3">
          <p className="text-[12px] font-semibold">จังหวัดที่จะก่อสร้าง</p>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {([["roiet", `จ.${PERMIT_PROVINCE}`], ["other", "จังหวัดอื่น"]] as const).map(([k, l]) => (
              <button key={k} type="button" onClick={() => setWhere(k)} aria-pressed={where === k}
                className={`border px-3 py-2 text-[13px] font-semibold ${where === k ? "border-ink bg-ink text-white" : "border-hairline bg-white hover:border-ink"}`}>{l}</button>
            ))}
          </div>
          {where === "other" && (
            <input value={otherProvince} onChange={(e) => setOtherProvince(e.target.value)} placeholder="ระบุจังหวัด เช่น ขอนแก่น" aria-label="จังหวัดที่จะก่อสร้าง" className="input mt-2 !py-2 text-[13px]" maxLength={60} />
          )}
        </div>

        <p className="mt-3 border-t border-hairline pt-3 text-[11.5px] font-semibold text-muted">เลือกเพิ่ม</p>
        <div className="mt-2 space-y-2">
          {ADDONS.map((a) => {
            const ok = allowed(a);
            return (
              <div key={a.key}>
                <label className={`flex items-center gap-3 text-[13px] ${ok ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}>
                  <input type="checkbox" className="check" disabled={!ok} checked={ok && sel.includes(a.key)}
                    onChange={() => setSel((s) => (s.includes(a.key) ? s.filter((x) => x !== a.key) : [...s, a.key]))} />
                  <span className="flex-1">{a.label}{a.province && <span className="ml-1 text-[11.5px] font-semibold text-bronze-dark">(เฉพาะ จ.{a.province})</span>}</span>
                  <span className="text-muted">+{baht(a.price)}</span>
                </label>
                {a.province && where === "other" && (
                  <p className="ml-[30px] mt-1 text-[11.5px] text-muted">นอก จ.{a.province}: นำเล่มแบบไปยื่นที่ อบต./เทศบาลในพื้นที่ได้เอง — เล่มแบบมีลายเซ็นวิศวกรพร้อมยื่นครบชุด</p>
                )}
                {a.province && where === "" && <p className="ml-[30px] mt-1 text-[11.5px] text-muted">เลือกจังหวัดที่จะก่อสร้างด้านบนก่อน</p>}
              </div>
            );
          })}
        </div>

        {/* deed: optional for the free re-orientation, needed for permit filing */}
        <DeedUpload needed={permit} />

        <div className="mt-3 flex items-center justify-between border-t border-ink pt-3">
          <span className="text-[13px] font-semibold">ยอดรวม (รวม VAT)</span>
          <span className="font-display text-[24px] font-bold text-bronze-dark">{baht(total)}</span>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field name="name" label="ชื่อ-นามสกุล" required autoComplete="name" />
        <Field name="phone" label="เบอร์โทรศัพท์" type="tel" required autoComplete="tel" placeholder="08x-xxx-xxxx" />
        <Field name="email" label="อีเมล (รับใบเสร็จ)" type="email" autoComplete="email" className="sm:col-span-2" />
        <Field name="message" as="textarea" label="ที่อยู่จัดส่งเล่มแบบ / หมายเหตุ" className="sm:col-span-2" placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์" />
      </div>
    </LeadForm>
  );
}
