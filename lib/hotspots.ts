import type { Hotspot } from "./types";

/** Shown on plans that have never had their own points set (hotspots = null). */
export const DEFAULT_HOTSPOTS: Hotspot[] = [
  { x: 38, y: 30, title: "ระบบหลังคา & ฉนวน", body: "หลังคาเมทัลชีทเคลือบ AZ150 หรือกระเบื้องคอนกรีต พร้อมฉนวน PU กันความร้อน" },
  { x: 62, y: 52, title: "ช่องแสงกระจก Low-E", body: "กระจกลามิเนต Low-E ลดความร้อน 65% รับแสงธรรมชาติเต็มที่" },
  { x: 25, y: 74, title: "พื้นยกระดับ & เทอร์เรซ", body: "พื้น WPC กันปลวก ยกระดับ +0.45 ม. ป้องกันน้ำท่วมขัง" },
];

export const MAX_HOTSPOTS = 8;

/** Quick-pick presets for the admin editor. */
export const HOTSPOT_PRESETS: Omit<Hotspot, "x" | "y">[] = [
  ...DEFAULT_HOTSPOTS.map(({ title, body }) => ({ title, body })),
  { title: "ผนังภายนอก", body: "ผนังอิฐมวลเบา ฉาบเรียบ ทาสีกันร้อน ลดความร้อนเข้าตัวบ้าน" },
  { title: "ระแนงไม้ / บังแดด", body: "ระแนงไม้สังเคราะห์ บังแดดบ่าย เพิ่มความเป็นส่วนตัว" },
  { title: "โรงจอดรถ", body: "โรงจอดรถในตัวบ้าน หลังคาคลุม พื้นคอนกรีตขัดมัน" },
  { title: "ประตูทางเข้าหลัก", body: "ประตูไม้จริงบานใหญ่ พร้อมระบบ Digital Door Lock" },
  { title: "สวน & ภูมิทัศน์", body: "พื้นที่สวนหน้าบ้าน ทางเดินหินและไฟส่องต้นไม้" },
];

export function parseHotspots(raw: unknown): Hotspot[] | null {
  if (!Array.isArray(raw)) return null;
  return raw
    .filter((h): h is Record<string, unknown> => !!h && typeof h === "object")
    .map((h) => ({
      x: Math.min(98, Math.max(2, Math.round(Number(h.x) * 10) / 10 || 50)),
      y: Math.min(98, Math.max(2, Math.round(Number(h.y) * 10) / 10 || 50)),
      title: String(h.title ?? "").trim().slice(0, 80),
      body: String(h.body ?? "").trim().slice(0, 300),
    }))
    .filter((h) => h.title)
    .slice(0, MAX_HOTSPOTS);
}
