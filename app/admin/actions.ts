"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseCsv } from "@/lib/csv";
import { serverClient } from "@/lib/supabase/server";

const STATUSES = ["new", "contacted", "quoted", "won", "lost"];

export async function signIn(_prev: { error?: string } | null, fd: FormData) {
  const email = String(fd.get("email") ?? "").trim();
  const password = String(fd.get("password") ?? "");
  if (!email || !password) return { error: "กรุณากรอกอีเมลและรหัสผ่าน" };
  const sb = await serverClient();
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
  redirect("/admin");
}

export async function signOut() {
  const sb = await serverClient();
  await sb.auth.signOut();
  redirect("/admin/login");
}

export async function updateLead(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  const status = String(fd.get("status") ?? "");
  const note = String(fd.get("admin_note") ?? "").slice(0, 2000);
  if (!id || !STATUSES.includes(status)) return;
  const sb = await serverClient();
  await sb.from("leads").update({ status, admin_note: note || null }).eq("id", id);
  revalidatePath("/admin");
}


export interface PlanFormState {
  error?: string;
  saved?: boolean;
}

const STYLES = ["nordic", "japandi", "tropical", "modern", "minimal"];
const FEATURES = ["tour360", "dollhouse", "universal", "pool", "narrow"];

function revalidatePlan(code?: string | null) {
  revalidatePath("/", "layout");
  if (code) revalidatePath(`/plans/${code}`);
}

export async function savePlan(_prev: PlanFormState | null, fd: FormData): Promise<PlanFormState> {
  const text = (k: string, max = 300) => {
    const v = String(fd.get(k) ?? "").trim().slice(0, max);
    return v || null;
  };
  const num = (k: string) => {
    const v = text(k, 20);
    if (v == null) return null;
    const n = Number(v.replace(/,/g, ""));
    return Number.isFinite(n) && n >= 0 ? n : NaN;
  };

  const id = text("id", 40);
  const code = text("code", 30)?.toUpperCase() ?? "";
  if (!/^[A-Z0-9][A-Z0-9-]{2,29}$/.test(code)) return { error: "รหัสแบบต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข หรือ - (3-30 ตัว) เช่น AP-MODERN-05" };
  const name_en = text("name_en", 120);
  const name_th = text("name_th", 160);
  if (!name_en || !name_th) return { error: "กรุณากรอกชื่อแบบทั้งภาษาไทยและภาษาอังกฤษ" };
  const style = text("style", 20);
  if (!style || !STYLES.includes(style)) return { error: "กรุณาเลือกสไตล์" };

  const storeys = num("storeys");
  const area = num("area_sqm");
  const bedrooms = num("bedrooms");
  const bathrooms = num("bathrooms");
  const price = num("price");
  const costMin = num("build_cost_min");
  const costMax = num("build_cost_max");
  const required = { storeys, area, bedrooms, bathrooms, price, costMin, costMax };
  for (const [k, v] of Object.entries(required)) if (v == null || Number.isNaN(v)) return { error: `กรุณากรอกตัวเลขให้ครบถ้วน (${k})` };
  if (storeys! < 1 || storeys! > 4) return { error: "จำนวนชั้นต้องอยู่ระหว่าง 1-4" };
  if (costMax! < costMin!) return { error: "งบก่อสร้างสูงสุดต้องไม่น้อยกว่างบต่ำสุด" };

  const floorAreas = (text("floor_areas", 80) ?? "").split(/[,\s/]+/).map(Number).filter((n) => Number.isFinite(n) && n > 0);
  const landW = num("land_width");
  const landD = num("land_depth");
  const optional = [landW, landD, num("min_land_sqwa"), num("price_original"), num("parking")];
  if (optional.some((v) => Number.isNaN(v))) return { error: "ตัวเลขบางช่องไม่ถูกต้อง" };

  let gallery: string[] = [];
  try {
    gallery = JSON.parse(String(fd.get("gallery") ?? "[]")).filter((g: unknown) => typeof g === "string").slice(0, 12);
  } catch {
    return { error: "ข้อมูลรูปภาพไม่ถูกต้อง" };
  }
  const image = text("image", 500) ?? gallery[0];
  if (!image) return { error: "กรุณาอัปโหลดรูปหลักอย่างน้อย 1 รูป" };

  const row = {
    code,
    name_en,
    name_th,
    series: text("series", 120),
    style,
    storeys,
    area_sqm: area,
    floor_areas: floorAreas.length ? floorAreas.slice(0, storeys!) : [area],
    bedrooms,
    bathrooms,
    parking: num("parking") ?? 2,
    land_width: landW,
    land_depth: landD,
    min_land_sqwa: num("min_land_sqwa") ?? (landW && landD ? Math.round(((landW * landD) / 4) * 10) / 10 : null),
    build_cost_min: costMin,
    build_cost_max: costMax,
    price: Math.round(price!),
    price_original: num("price_original"),
    badge: text("badge", 40)?.toUpperCase() ?? null,
    tagline: text("tagline", 200),
    description: text("description", 3000),
    image,
    gallery: gallery.includes(image) ? gallery : [image, ...gallery],
    panorama: text("panorama", 500),
    features: fd.getAll("features").map(String).filter((f) => FEATURES.includes(f)),
    pages_arch: num("pages_arch") ?? 36,
    pages_struct: num("pages_struct") ?? 22,
    pages_mep: num("pages_mep") ?? 16,
    is_published: fd.get("is_published") === "on",
    sort_order: num("sort_order") ?? 100,
  };

  const sb = await serverClient();
  const { data: old } = id ? await sb.from("plans").select("code").eq("id", id).maybeSingle() : { data: null };
  const { error } = id ? await sb.from("plans").update(row).eq("id", id) : await sb.from("plans").insert(row);
  if (error) {
    if (error.code === "23505") return { error: `รหัสแบบ ${code} มีอยู่แล้ว กรุณาใช้รหัสอื่น` };
    console.error("savePlan", error.message);
    return { error: "บันทึกไม่สำเร็จ: " + error.message };
  }
  revalidatePlan(code);
  if (old?.code && old.code !== code) revalidatePlan(old.code);
  if (!id) redirect("/admin/plans?saved=" + encodeURIComponent(code));
  return { saved: true };
}

export async function deletePlan(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  if (!id) return;
  const sb = await serverClient();
  const { data } = await sb.from("plans").delete().eq("id", id).select("code").maybeSingle();
  revalidatePlan(data?.code);
  redirect("/admin/plans?deleted=" + encodeURIComponent(data?.code ?? ""));
}

export interface BoqImportState {
  error?: string;
  imported?: number;
}

export async function importBoq(_prev: BoqImportState | null, fd: FormData): Promise<BoqImportState> {
  const planId = String(fd.get("plan_id") ?? "");
  const file = fd.get("file");
  if (!planId || !(file instanceof File) || !file.size) return { error: "กรุณาเลือกไฟล์ CSV" };
  if (file.size > 2_000_000) return { error: "ไฟล์ใหญ่เกิน 2MB" };
  const rows = parseCsv(await file.text());
  const body = rows.filter((r) => /^\d+(\.\d+)*$/.test((r[1] ?? "").trim()));
  if (!body.length) return { error: "ไม่พบรายการในไฟล์ ใช้รูปแบบเดียวกับไฟล์ที่ดาวน์โหลดจากหน้า BOQ (คอลัมน์: หมวด, ลำดับ, รายการ, สเปก, ปริมาณ, หน่วย, ค่าวัสดุ/หน่วย, รวมค่าวัสดุ, ค่าแรง/หน่วย, ...)" };
  const n = (v: string | undefined) => Number(String(v ?? "").replace(/,/g, "")) || 0;
  const items = body.slice(0, 1000).map((r, i) => ({
    plan_id: planId,
    section_no: Number(r[1].split(".")[0]),
    section_name: (r[0] ?? "").trim() || `หมวดที่ ${r[1].split(".")[0]}`,
    item_no: r[1].trim(),
    description: (r[2] ?? "").trim() || "-",
    spec: (r[3] ?? "").trim() || null,
    qty: n(r[4]),
    unit: (r[5] ?? "").trim() || "หน่วย",
    material_rate: n(r[6]),
    labor_rate: n(r[8]),
    sort_order: i + 1,
  }));
  const sb = await serverClient();
  const del = await sb.from("boq_items").delete().eq("plan_id", planId);
  if (del.error) return { error: "ลบรายการเดิมไม่สำเร็จ: " + del.error.message };
  const { error } = await sb.from("boq_items").insert(items);
  if (error) return { error: "นำเข้าไม่สำเร็จ: " + error.message };
  revalidatePath("/boq");
  return { imported: items.length };
}
