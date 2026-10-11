/** Admin form definitions shared by the course and product editors and their server actions. */
export type CatalogKind = "course" | "product";

export type FieldDef =
  | { name: string; label: string; type: "text" | "textarea" | "date"; required?: boolean; max?: number; placeholder?: string; hint?: string; wide?: boolean }
  | { name: string; label: string; type: "number"; required?: boolean; placeholder?: string; hint?: string; wide?: boolean }
  | { name: string; label: string; type: "select"; options: [string, string][]; wide?: boolean; hint?: string }
  | { name: string; label: string; type: "lines"; placeholder?: string; hint?: string; wide?: boolean };

export const CATALOG: Record<CatalogKind, {
  table: "courses" | "products";
  titleField: "title" | "name";
  label: string;
  publicPath: string;
  adminPath: string;
  slugPrefix: string;
  fields: FieldDef[];
}> = {
  course: {
    table: "courses",
    titleField: "title",
    label: "คอร์ส",
    publicPath: "/courses",
    adminPath: "/admin/courses",
    slugPrefix: "course",
    fields: [
      { name: "title", label: "ชื่อคอร์ส", type: "text", required: true, max: 160, wide: true },
      { name: "subtitle", label: "คำโปรย", type: "text", max: 200, wide: true },
      { name: "category", label: "หมวด", type: "text", max: 60, placeholder: "เช่น เจ้าของบ้าน, ซอฟต์แวร์ออกแบบ" },
      { name: "level", label: "ระดับ", type: "select", options: [["beginner", "พื้นฐาน"], ["intermediate", "ปานกลาง"], ["advanced", "ขั้นสูง"]] },
      { name: "format", label: "รูปแบบ", type: "select", options: [["online", "ออนไลน์"], ["onsite", "เรียนที่สถานที่จริง"], ["hybrid", "ออนไลน์ + เวิร์กช็อป"]] },
      { name: "duration", label: "ระยะเวลา", type: "text", max: 60, placeholder: "เช่น 1 วัน (6 ชั่วโมง)" },
      { name: "lessons", label: "จำนวนบทเรียน", type: "number" },
      { name: "price", label: "ราคา (บาท)", type: "number", required: true, hint: "0 = ฟรี" },
      { name: "price_original", label: "ราคาปกติ (ขีดฆ่า)", type: "number" },
      { name: "start_date", label: "วันเริ่มเรียน", type: "date", hint: "เว้นว่าง = เริ่มได้ทันที / แจ้งรอบทาง LINE" },
      { name: "location", label: "สถานที่เรียน", type: "text", max: 160 },
      { name: "seats", label: "รับจำนวน (ที่นั่ง)", type: "number" },
      { name: "description", label: "รายละเอียดคอร์ส", type: "textarea", max: 4000, wide: true },
      { name: "syllabus", label: "เนื้อหาที่จะได้เรียน (บรรทัดละ 1 หัวข้อ)", type: "lines", wide: true, placeholder: "สัญลักษณ์และมาตราส่วนในแบบ\nแปลนพื้น รูปด้าน รูปตัด" },
    ],
  },
  product: {
    table: "products",
    titleField: "name",
    label: "สินค้า",
    publicPath: "/shop",
    adminPath: "/admin/products",
    slugPrefix: "item",
    fields: [
      { name: "name", label: "ชื่อสินค้า", type: "text", required: true, max: 160, wide: true },
      { name: "category", label: "หมวด", type: "text", max: 60, placeholder: "เช่น เครื่องมือ, เอกสาร & เทมเพลต" },
      { name: "kind", label: "ประเภท", type: "select", options: [["physical", "สินค้าจัดส่ง"], ["digital", "ไฟล์ดิจิทัล (ส่งทาง LINE/อีเมล)"]] },
      { name: "price", label: "ราคา (บาท)", type: "number", required: true },
      { name: "price_original", label: "ราคาปกติ (ขีดฆ่า)", type: "number" },
      { name: "unit", label: "หน่วย", type: "text", max: 20, placeholder: "ชิ้น / เล่ม / ชุด / ไฟล์" },
      { name: "shipping_fee", label: "ค่าจัดส่งต่อคำสั่งซื้อ (บาท)", type: "number", hint: "0 = ส่งฟรี" },
      { name: "stock", label: "จำนวนคงเหลือ", type: "number", hint: "เว้นว่าง = ไม่จำกัด • 0 = สินค้าหมด" },
      { name: "description", label: "รายละเอียดสินค้า", type: "textarea", max: 4000, wide: true },
      { name: "specs", label: "สเปก / จุดเด่น (บรรทัดละ 1 ข้อ)", type: "lines", wide: true, placeholder: "ขนาด A5 • 64 หน้า\nจัดส่งทั่วประเทศ" },
    ],
  },
};
