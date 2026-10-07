import type { PlanStyle } from "./types";

const thb = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 });

export const baht = (n: number) => `฿${thb.format(Math.round(n))}`;
export const num = (n: number, digits = 0) =>
  new Intl.NumberFormat("th-TH", { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(n);
export const millions = (min: number, max: number) => `฿ ${num(min, 1)} - ${num(max, 1)} ล้าน`;

export const thaiDate = (iso: string | null, opts: Intl.DateTimeFormatOptions = { month: "short", year: "numeric" }) =>
  iso ? new Intl.DateTimeFormat("th-TH", opts).format(new Date(iso)) : "";

/** Every house style, in the order shown in filters and the admin dropdown. */
export const PLAN_STYLES: { key: PlanStyle; th: string; en: string }[] = [
  { key: "modern", th: "โมเดิร์น", en: "Modern" },
  { key: "contemporary", th: "คอนเทมโพรารี", en: "Contemporary" },
  { key: "minimal", th: "มินิมอล", en: "Minimal" },
  { key: "nordic", th: "นอร์ดิก", en: "Nordic" },
  { key: "japandi", th: "แจแปนดิ", en: "Japandi" },
  { key: "muji", th: "มูจิ", en: "Muji" },
  { key: "tropical", th: "ทรอปิคอล", en: "Tropical" },
  { key: "loft", th: "ลอฟท์", en: "Loft" },
  { key: "thai", th: "ไทยประยุกต์", en: "Thai Contemporary" },
  { key: "classic", th: "คลาสสิก / ยุโรป", en: "Classic" },
];
export const STYLE_KEYS = PLAN_STYLES.map((s) => s.key);

export const STYLE_LABEL: Record<string, string> = Object.fromEntries(PLAN_STYLES.map((s) => [s.key, `${s.th} (${s.en})`]));

export const FEATURE_LABEL: Record<string, { label: string; icon: string }> = {
  tour360: { label: "โมเดล 3D หมุนดูรอบทิศ 360°", icon: "view_in_ar" },
  dollhouse: { label: "แบบตัดแปลน 3D Dollhouse", icon: "splitscreen" },
  universal: { label: "ฟังก์ชัน Universal Design ผู้สูงอายุ", icon: "accessible" },
  pool: { label: "มีสระว่ายน้ำ", icon: "pool" },
  narrow: { label: "เหมาะที่ดินหน้าแคบ", icon: "width" },
};

export const LEAD_TYPE_LABEL: Record<string, string> = {
  consult: "ปรึกษาสถาปนิก",
  custom_design: "ออกแบบเฉพาะ",
  inspection: "ตรวจบ้าน",
  turnkey: "รับเหมาสร้างบ้าน",
  boq: "ขอ BOQ",
  order: "สั่งซื้อแบบ",
  callback: "ขอให้โทรกลับ",
};

export const LEAD_STATUS_LABEL: Record<string, string> = {
  new: "ใหม่",
  contacted: "ติดต่อแล้ว",
  quoted: "เสนอราคาแล้ว",
  won: "ปิดการขาย",
  lost: "ไม่สำเร็จ",
};
