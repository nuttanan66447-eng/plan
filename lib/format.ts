const thb = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 });

export const baht = (n: number) => `฿${thb.format(Math.round(n))}`;
export const num = (n: number, digits = 0) =>
  new Intl.NumberFormat("th-TH", { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(n);
export const millions = (min: number, max: number) => `฿ ${num(min, 1)} - ${num(max, 1)} ล้าน`;

export const thaiDate = (iso: string | null, opts: Intl.DateTimeFormatOptions = { month: "short", year: "numeric" }) =>
  iso ? new Intl.DateTimeFormat("th-TH", opts).format(new Date(iso)) : "";

export const STYLE_LABEL: Record<string, string> = {
  nordic: "นอร์ดิก (Nordic)",
  japandi: "แจแปนดิ (Japandi)",
  tropical: "ทรอปิคอล (Tropical)",
  modern: "โมเดิร์น (Modern)",
  minimal: "มินิมอล (Minimal)",
};

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
