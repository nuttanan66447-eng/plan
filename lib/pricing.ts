/**
 * All service prices in one place, scaled by usable floor area (ตร.ม.).
 * Benchmarks (Oct 2026): ready-made plan sets sell for ~3,000–5,000 THB, permit drafting ~45–60 THB/m²,
 * full design ~1–2% of construction cost. NATBUILD sits a little above the cheapest because every set is
 * engineer-signed (ภย.) with structural calculations and BOQ.
 */

const up = (n: number, step: number) => Math.ceil(n / step) * step;
const near = (n: number, step: number) => Math.round(n / step) * step;

/** Ready-made blueprint set (engineer-signed, permit-ready, 5 printed sets). 120 m² → 6,900 • 200 m² → 8,900 • 385 m² → 14,900 */
export const BLUEPRINT = { base: 2900, perSqm: 30, min: 4900 };
export function blueprintPrice(area: number) {
  return Math.max(BLUEPRINT.min, up(BLUEPRINT.base + BLUEPRINT.perSqm * Math.max(0, area), 1000) - 100);
}
/** "Normal price" shown struck through next to the blueprint price. */
export const listPrice = (price: number) => near(price * 1.3, 1000);

/** Add-ons offered when ordering a blueprint set. */
export const ORDER_ADDONS = [
  { key: "bim", label: "ไฟล์ดิจิทัล BIM / Revit / AutoCAD (.dwg)", base: 2000, perSqm: 10 },
  // site plan drawn on the customer's real lot (from the deed) — any province, flat price
  { key: "siteplan", label: "ผังบริเวณตามที่ดินจริง (จากโฉนดที่แนบ)", base: 2000, perSqm: 0 },
  // permit filing is only offered where the team works on site; it already includes the site plan
  { key: "permit", label: "ยื่นขออนุญาตก่อสร้างแทน (รวมผังบริเวณแล้ว)", base: 3000, perSqm: 20, province: "ร้อยเอ็ด", includes: "siteplan" },
  { key: "extra", label: "เล่มพิมพ์เขียวเพิ่ม 3 ชุด (สำหรับธนาคาร)", base: 1500, perSqm: 0 },
] as const;
/** Province where permit filing (ยื่นขออนุญาตแทน) is available. */
export const PERMIT_PROVINCE = "ร้อยเอ็ด";
export const addonPrice = (a: { base: number; perSqm: number }, area: number) => near(a.base + a.perSqm * Math.max(0, area), 500);

/** Custom design / drafting packages (หน้า รับออกแบบ-เขียนแบบ). fee = max(min, area × perSqm) */
export const DESIGN_PACKAGES = [
  { key: "standard", label: "Standard Plan", th: "แบบสำเร็จรูป + ปรับเล็กน้อย", min: 9900, perSqm: 60 },
  { key: "custom", label: "Custom Drafting", th: "เขียนแบบใหม่ 100%", min: 19000, perSqm: 150 },
  { key: "turnkey", label: "Full-Turnkey BIM", th: "ออกแบบ + BIM + ภายใน", min: 39000, perSqm: 280 },
] as const;
export const designFee = (p: { min: number; perSqm: number }, area: number) => Math.max(p.min, near(area * p.perSqm, 500));

/** Extras on the standard package that the bigger packages include. */
export const ENGINEERING_CALC = { perSqm: 20, min: 3000 };
export const BOQ_SERVICE = { perSqm: 25, min: 3000 };
