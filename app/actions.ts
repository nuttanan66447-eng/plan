"use server";

import { publicClient } from "@/lib/supabase/public";
import type { LeadType } from "@/lib/types";

export interface LeadState {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
}

const TYPES: LeadType[] = ["consult", "custom_design", "inspection", "turnkey", "boq", "order", "callback"];
const META_KEYS = ["storeys", "style", "rooms", "deliverables", "steps", "source", "service_type", "house_status"];

const str = (fd: FormData, k: string, max = 200) => {
  const v = fd.get(k);
  if (typeof v !== "string") return null;
  const t = v.trim().slice(0, max);
  return t.length ? t : null;
};
const numOrNull = (fd: FormData, k: string) => {
  const v = str(fd, k, 20);
  if (!v) return null;
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : null;
};

export async function submitLead(_prev: LeadState | null, fd: FormData): Promise<LeadState> {
  // honeypot: real visitors never fill this hidden field
  if (str(fd, "website")) return { ok: true, message: "ได้รับข้อมูลแล้ว" };

  const type = str(fd, "type") as LeadType | null;
  const name = str(fd, "name", 120);
  const phone = str(fd, "phone", 30);
  const email = str(fd, "email", 200);
  const errors: Record<string, string> = {};

  if (!type || !TYPES.includes(type)) errors.type = "ประเภทคำขอไม่ถูกต้อง";
  if (!name) errors.name = "กรุณากรอกชื่อ";
  if (!phone || !/^[0-9+\-\s()]{9,20}$/.test(phone)) errors.phone = "กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "อีเมลไม่ถูกต้อง";
  if (fd.has("consent_required") && fd.get("consent") !== "on") errors.consent = "กรุณายอมรับนโยบายความเป็นส่วนตัว";
  if (Object.keys(errors).length) return { ok: false, message: "กรุณาตรวจสอบข้อมูลอีกครั้ง", errors };

  const date = str(fd, "preferred_date", 10);
  const meta: Record<string, string> = {};
  for (const k of META_KEYS) {
    const v = str(fd, k, 300);
    if (v) meta[k] = v;
  }

  const sb = publicClient();
  if (!sb) return { ok: false, message: "ระบบยังไม่ได้เชื่อมต่อฐานข้อมูล กรุณาโทร 02-892-4114" };

  const { error } = await sb.from("leads").insert({
    type,
    name,
    phone,
    email,
    line_id: str(fd, "line_id", 80),
    province: str(fd, "province", 80),
    district: str(fd, "district", 120),
    plan_code: str(fd, "plan_code", 40),
    service_package: str(fd, "service_package", 80),
    land_width: numOrNull(fd, "land_width"),
    land_depth: numOrNull(fd, "land_depth"),
    area_sqm: numOrNull(fd, "area_sqm"),
    budget: str(fd, "budget", 80),
    estimate_thb: numOrNull(fd, "estimate_thb"),
    preferred_date: date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null,
    preferred_slot: str(fd, "preferred_slot", 40),
    message: str(fd, "message", 4000),
    meta,
  });

  if (error) {
    console.error("submitLead", error.message);
    return { ok: false, message: "ส่งข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง หรือโทร 02-892-4114" };
  }
  return {
    ok: true,
    message:
      type === "order"
        ? "รับคำสั่งซื้อแล้ว ทีมงานจะโทรยืนยันและส่งรายละเอียดการชำระเงินภายใน 2 ชั่วโมงทำการ"
        : "ได้รับข้อมูลเรียบร้อย สถาปนิกจะติดต่อกลับภายใน 24 ชั่วโมงทำการ",
  };
}
