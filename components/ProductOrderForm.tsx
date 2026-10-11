"use client";

import { useState } from "react";
import { baht } from "@/lib/format";
import type { Product } from "@/lib/types";
import { Icon } from "./Icon";
import { Field, LeadForm } from "./LeadForm";

/** Shop order: becomes an "order" lead with an order number, trackable at /track. */
export function ProductOrderForm({ product: p }: { product: Product }) {
  const max = p.stock ?? 99;
  const [qty, setQty] = useState(1);
  if (p.stock === 0) {
    return <p className="flex items-center gap-2 border border-danger/30 bg-[#fff1ef] p-4 text-[14px] font-semibold text-danger"><Icon name="inventory_2" /> สินค้าหมดชั่วคราว — สอบถามรอบสินค้าเข้าได้ทาง LINE</p>;
  }
  const ship = p.kind === "physical" ? p.shipping_fee : 0;
  const total = p.price * qty + ship;
  const pkg = `สินค้า: ${p.name} x ${qty} ${p.unit}`;
  return (
    <LeadForm type="order" hidden={{ product_slug: p.slug, qty, estimate_thb: total, service_package: pkg.slice(0, 80), deliverables: pkg }} submitLabel={`สั่งซื้อ (${baht(total)})`} successTitle="รับคำสั่งซื้อเรียบร้อย">
      <div className="border border-hairline bg-wash p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] font-semibold">จำนวน</span>
          <div className="flex items-center border border-hairline bg-white">
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-10 w-10 place-items-center hover:bg-wash" aria-label="ลดจำนวน"><Icon name="remove" /></button>
            <span className="w-12 text-center text-[16px] font-bold" aria-live="polite">{qty}</span>
            <button type="button" onClick={() => setQty((q) => Math.min(max, q + 1))} className="grid h-10 w-10 place-items-center hover:bg-wash" aria-label="เพิ่มจำนวน"><Icon name="add" /></button>
          </div>
        </div>
        <div className="mt-3 space-y-1 border-t border-hairline pt-3 text-[13px]">
          <p className="flex justify-between"><span>{p.name} x {qty}</span><span>{baht(p.price * qty)}</span></p>
          {p.kind === "physical" && <p className="flex justify-between text-muted"><span>ค่าจัดส่ง</span><span>{ship ? baht(ship) : "ฟรี"}</span></p>}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-ink pt-3">
          <span className="text-[13px] font-semibold">ยอดรวม</span>
          <span className="font-display text-[24px] font-bold text-bronze-dark">{baht(total)}</span>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field name="name" label="ชื่อ-นามสกุล" required autoComplete="name" />
        <Field name="phone" label="เบอร์โทรศัพท์" type="tel" required autoComplete="tel" />
        <Field name="email" label={p.kind === "digital" ? "อีเมล (รับไฟล์)" : "อีเมล (รับใบเสร็จ)"} type="email" autoComplete="email" />
        <Field name="line_id" label="LINE ID" />
        {p.kind === "physical"
          ? <Field name="message" as="textarea" label="ที่อยู่จัดส่ง" required className="sm:col-span-2" placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์" />
          : <Field name="message" as="textarea" label="หมายเหตุ" className="sm:col-span-2" />}
      </div>
    </LeadForm>
  );
}
