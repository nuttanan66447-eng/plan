"use server";

import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase/env";
import { publicClient } from "@/lib/supabase/public";
import type { LeadType } from "@/lib/types";
import { newOrderNo } from "@/lib/orders";
import { SITE } from "@/lib/site";

export interface LeadState {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
  /** set for blueprint orders: the number the customer tracks the order with */
  orderNo?: string;
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
  // land-deed files uploaded to the private lead-files bucket (paths only; admins open them)
  const deeds = (str(fd, "deed_files", 400) ?? "").split("|").filter((p) => /^deeds\/[0-9a-f-]{36}\/deed-\d\.[a-z0-9]{2,5}$/.test(p)).slice(0, 3);
  if (deeds.length) meta.deed_files = deeds.join("|");

  const sb = publicClient();
  if (!sb) return { ok: false, message: `ระบบยังไม่ได้เชื่อมต่อฐานข้อมูล กรุณาโทร ${SITE.phone}` };

  const row = {
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
  };
  let orderNo: string | undefined;
  let error: { code?: string; message: string } | null = null;
  if (type === "order") {
    // orders get a trackable number; retry on the (very unlikely) clash
    for (let i = 0; i < 3; i++) {
      orderNo = newOrderNo();
      ({ error } = await sb.from("leads").insert({ ...row, order_no: orderNo, order_status: "pending_payment" }));
      if (error?.code !== "23505") break;
    }
  } else ({ error } = await sb.from("leads").insert(row));

  if (error) {
    console.error("submitLead", error.message);
    return { ok: false, message: `ส่งข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง หรือโทร ${SITE.phone}` };
  }
  return {
    ok: true,
    orderNo,
    message:
      type === "order"
        ? "รับคำสั่งซื้อแล้ว ทีมงานจะโทรยืนยันและส่งรายละเอียดการชำระเงินภายใน 2 ชั่วโมงทำการ"
        : "ได้รับข้อมูลเรียบร้อย สถาปนิกจะติดต่อกลับภายใน 24 ชั่วโมงทำการ",
  };
}

export interface TrackedOrder {
  order_no: string;
  plan_code: string | null;
  service_package: string | null;
  estimate_thb: number | null;
  order_status: string | null;
  carrier: string | null;
  tracking_no: string | null;
  created_at: string;
  order_updated_at: string | null;
}
export interface OrderFile {
  kind: string;
  name: string;
  size: number | null;
  url: string;
}
export interface TrackState {
  error?: string;
  order?: TrackedOrder;
  /** download links, once the order is paid */
  files?: OrderFile[];
  /** BIM/CAD files exist but were not part of this order */
  cadLocked?: boolean;
}

const PAID = ["paid", "preparing", "shipped", "delivered"];

/** Signed download links from the order-files edge function (it re-checks order no. + phone and payment). */
async function orderFiles(orderNo: string, phone: string) {
  if (!SUPABASE_URL) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/order-files`, {
      method: "POST",
      headers: { "content-type": "application/json", apikey: SUPABASE_KEY },
      body: JSON.stringify({ order_no: orderNo, phone }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as { files?: OrderFile[]; cadLocked?: boolean };
  } catch (e) {
    console.error("orderFiles", (e as Error).message);
    return null;
  }
}

/** Order lookup for customers: order number + the phone number used when ordering. */
export async function trackOrder(_prev: TrackState | null, fd: FormData): Promise<TrackState> {
  const orderNo = (str(fd, "order_no", 20) ?? "").toUpperCase().replace(/\s/g, "");
  const phone = str(fd, "phone", 30) ?? "";
  if (!/^NB\d{6}-[A-Z0-9]{4}$/.test(orderNo)) return { error: "เลขที่คำสั่งซื้อไม่ถูกต้อง (เช่น NB261010-7KQ4)" };
  if (phone.replace(/\D/g, "").length < 9) return { error: "กรุณากรอกเบอร์โทรศัพท์ที่ใช้สั่งซื้อ" };
  const sb = publicClient();
  if (!sb) return { error: "ระบบยังไม่ได้เชื่อมต่อฐานข้อมูล" };
  const { data, error } = await sb.rpc("track_order", { p_order_no: orderNo, p_phone: phone });
  if (error) {
    console.error("trackOrder", error.message);
    return { error: `ค้นหาไม่สำเร็จ กรุณาลองใหม่ หรือโทร ${SITE.phone}` };
  }
  const order = (data as TrackedOrder[] | null)?.[0];
  if (!order) return { error: "ไม่พบคำสั่งซื้อ กรุณาตรวจสอบเลขที่คำสั่งซื้อและเบอร์โทรศัพท์" };
  if (!PAID.includes(order.order_status ?? "")) return { order };
  const dl = await orderFiles(orderNo, phone);
  return { order, files: dl?.files ?? [], cadLocked: dl?.cadLocked };
}

export interface ReviewState {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
}

const PROJECT_TYPES = ["สั่งซื้อแบบบ้าน", "ออกแบบเฉพาะ", "รับเหมาก่อสร้าง", "ตรวจบ้าน"];

/** Public review submission — stored unpublished until an admin approves it in /admin/reviews. */
export async function submitReview(_prev: ReviewState | null, fd: FormData): Promise<ReviewState> {
  if (str(fd, "website")) return { ok: true, message: "ขอบคุณสำหรับรีวิว" };
  const name = str(fd, "name", 80);
  const body = str(fd, "body", 1500);
  const rating = Number(fd.get("rating"));
  const errors: Record<string, string> = {};
  if (!name) errors.name = "กรุณากรอกชื่อ";
  if (!body || body.length < 10) errors.body = "กรุณาเขียนรีวิวอย่างน้อย 10 ตัวอักษร";
  if (!(rating >= 1 && rating <= 5)) errors.rating = "กรุณาให้คะแนน 1-5 ดาว";
  if (Object.keys(errors).length) return { ok: false, message: "กรุณาตรวจสอบข้อมูลอีกครั้ง", errors };

  const type = str(fd, "project_type", 40);
  const planCode = str(fd, "plan_code", 40)?.toUpperCase() ?? null;
  const sb = publicClient();
  if (!sb) return { ok: false, message: "ระบบยังไม่ได้เชื่อมต่อฐานข้อมูล" };
  const { error } = await sb.from("reviews").insert({
    name,
    body,
    rating: Math.round(rating),
    role: str(fd, "role", 120),
    district: str(fd, "district", 80),
    project_type: type && PROJECT_TYPES.includes(type) ? type : null,
    plan_code: planCode && /^[A-Z0-9-]{3,30}$/.test(planCode) ? planCode : null,
    is_published: false,
  });
  if (error) {
    console.error("submitReview", error.message);
    return { ok: false, message: "ส่งรีวิวไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" };
  }
  return { ok: true, message: "ขอบคุณสำหรับรีวิว! ทีมงานจะตรวจสอบและเผยแพร่ภายใน 1-2 วันทำการ" };
}
