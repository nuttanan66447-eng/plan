import { blueprintPrice, listPrice } from "./pricing";
import type { PlanStyle } from "./types";

/** Inputs the admin chooses; everything else in the plan form can be derived from these. */
export interface AutofillInput {
  style: PlanStyle;
  storeys: number;
  area?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parking?: number | null;
}

const STYLE: Record<PlanStyle, { en: string; th: string; code: string; rate: [number, number]; tagline: string; about: string }> = {
  modern: {
    en: "Modern", th: "โมเดิร์น", code: "MODERN", rate: [14000, 16000],
    tagline: "เส้นสายเรียบคม หน้าต่างกระจกบานใหญ่ ผสานผนังหินและระแนงไม้",
    about: "ออกแบบด้วยเส้นสายเรียบคม ผนังกระจกบานสูงรับแสงธรรมชาติ ตัดกับวัสดุหินและไม้ให้ความอบอุ่น พื้นที่ส่วนกลางเปิดโล่งเชื่อมต่อกันระหว่างห้องนั่งเล่น ทานอาหาร และครัว",
  },
  nordic: {
    en: "Nordic", th: "นอร์ดิก", code: "NORDIC", rate: [13000, 15000],
    tagline: "หลังคาจั่วองศาชัน หน้าต่างกระจกสูง โทนสีสว่างอบอุ่น",
    about: "หลังคาจั่วทรงสูงช่วยระบายความร้อนได้ดี ฝ้าเพดานสูงโปร่ง หน้าต่างบานใหญ่รับแสงตลอดวัน ตกแต่งด้วยโทนสีขาวและไม้ธรรมชาติ ให้บรรยากาศเรียบง่ายแต่อบอุ่น",
  },
  japandi: {
    en: "Japandi", th: "แจแปนดิ", code: "JAPANDI", rate: [14000, 16000],
    tagline: "ความเรียบง่ายแบบญี่ปุ่นผสานความอบอุ่นแบบสแกนดิเนเวียน",
    about: "ผสมผสานความเรียบง่ายแบบญี่ปุ่นกับความอบอุ่นแบบสแกนดิเนเวียน ใช้ไม้โทนอ่อน ระแนงบังแดด และคอร์ทสวนภายใน ให้บ้านสงบ เป็นส่วนตัว และอยู่สบาย",
  },
  tropical: {
    en: "Tropical", th: "ทรอปิคอล", code: "TROPICAL", rate: [14000, 16500],
    tagline: "ชายคายื่นยาว ใต้ถุนโปร่ง ระบายอากาศดีรับอากาศร้อนชื้น",
    about: "ออกแบบเพื่ออากาศร้อนชื้นโดยเฉพาะ ชายคายื่นยาวกันแดดฝน ช่องเปิดจัดวางรับลมธรรมชาติ ระเบียงและชานกว้างเชื่อมต่อสวน ลดการใช้เครื่องปรับอากาศ",
  },
  contemporary: {
    en: "Contemporary", th: "คอนเทมโพรารี", code: "CONTEMP", rate: [15000, 17500],
    tagline: "ผสมผสานเส้นสายร่วมสมัย หลังคาเรียบซ้อนชั้น วัสดุหลากผิวสัมผัส",
    about: "ออกแบบแบบร่วมสมัย ผสมหลังคาแบนและหลังคาลาดซ้อนชั้น เล่นระดับผนังและวัสดุทั้งหิน ไม้ และกระจก ให้รูปลักษณ์โดดเด่นแต่ยังอยู่สบายในชีวิตประจำวัน",
  },
  muji: {
    en: "Muji", th: "มูจิ", code: "MUJI", rate: [13000, 15000],
    tagline: "หลังคาจั่วเรียบ ผนังขาว ไม้โทนอ่อน อบอุ่นแบบญี่ปุ่น",
    about: "บ้านทรงจั่วเรียบง่ายสไตล์ญี่ปุ่น ผนังสีขาวตัดไม้โทนอ่อน ฝ้าสูงโปร่ง หน้าต่างบานใหญ่มองเห็นสวน เน้นความโล่ง สะอาดตา และใช้งานได้จริง",
  },
  loft: {
    en: "Loft", th: "ลอฟท์", code: "LOFT", rate: [13500, 15500],
    tagline: "ปูนเปลือย เหล็กดำ อิฐโชว์แนว เพดานสูงโปร่ง",
    about: "โชว์ความดิบของวัสดุทั้งผนังปูนเปลือย โครงเหล็กสีดำ และอิฐโชว์แนว เพดานสูงโล่ง ช่องแสงกรอบเหล็กบานใหญ่ เหมาะกับคนที่ชอบความเท่และดูแลรักษาง่าย",
  },
  thai: {
    en: "Thai Contemporary", th: "ไทยประยุกต์", code: "THAI", rate: [15000, 18000],
    tagline: "หลังคาทรงไทยชันสูง ชายคายื่นยาว ใต้ถุนและชานบ้านโปร่ง",
    about: "นำเอกลักษณ์เรือนไทยมาประยุกต์กับการอยู่อาศัยสมัยใหม่ หลังคาชันระบายน้ำฝนและความร้อนได้ดี ชายคายื่นยาวกันแดดฝน มีชานและระเบียงเชื่อมต่อพื้นที่ภายในกับสวน",
  },
  classic: {
    en: "Classic", th: "คลาสสิก", code: "CLASSIC", rate: [16000, 19000],
    tagline: "หลังคาทรงปั้นหยา บัวและเสาแบบยุโรป สง่างามเหนือกาลเวลา",
    about: "บ้านสไตล์คลาสสิกยุโรป หลังคาทรงปั้นหยาแข็งแรงทนลม ตกแต่งด้วยบัว เสา และกรอบหน้าต่างแบบคลาสสิก ห้องโถงสูงโอ่อ่า ให้ความรู้สึกหรูหราและมั่นคง",
  },
  minimal: {
    en: "Minimal", th: "มินิมอล", code: "MINIMAL", rate: [12000, 14000],
    tagline: "ทรงกล่องเรียบง่าย ใช้พื้นที่คุ้มค่า งบก่อสร้างควบคุมได้",
    about: "รูปทรงเรียบง่าย ลดรายละเอียดที่ไม่จำเป็น ทำให้ก่อสร้างได้รวดเร็วและควบคุมงบประมาณได้ง่าย จัดสรรพื้นที่ใช้สอยอย่างคุ้มค่าทุกตารางเมตร",
  },
};

const STOREY_TH = ["", "ชั้นเดียว", "สองชั้น", "สามชั้น", "สี่ชั้น"];
const DEFAULT_AREA = [0, 120, 220, 320, 420];

const round = (n: number, step: number) => Math.round(n / step) * step;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function sizeWord(area: number, storeys: number) {
  if (area < 110) return { en: "Compact Home", th: "บ้านขนาดกะทัดรัด" };
  if (area < 200) return { en: storeys === 1 ? "Family Home" : "Family House", th: "บ้านครอบครัว" };
  if (area < 320) return { en: "Family Villa", th: "บ้านครอบครัวขนาดใหญ่" };
  return { en: "Grand Residence", th: "บ้านหรูขนาดใหญ่" };
}

/** Next free code for the style, following the prefix the existing plans use (e.g. AP-MODERN-05). */
export function nextPlanCode(style: PlanStyle, existing: string[]) {
  const tag = STYLE[style].code;
  const prefixes = existing.map((c) => c.split("-")[0]).filter(Boolean);
  const prefix = prefixes.length
    ? Object.entries(prefixes.reduce<Record<string, number>>((m, p) => ((m[p] = (m[p] ?? 0) + 1), m), {})).sort((a, b) => b[1] - a[1])[0][0]
    : "NB";
  const taken = new Set(existing.map((c) => c.toUpperCase()));
  const nums = existing
    .map((c) => c.toUpperCase().match(new RegExp(`^${prefix}-${tag}-(\\d+)$`)))
    .map((m) => (m ? Number(m[1]) : 0));
  let n = Math.max(0, ...nums) + 1;
  while (taken.has(`${prefix}-${tag}-${String(n).padStart(2, "0")}`)) n++;
  return `${prefix}-${tag}-${String(n).padStart(2, "0")}`;
}

/** Derives every other plan field from style + size. Values are strings ready for the form inputs. */
export function autofillPlan(input: AutofillInput, existingCodes: string[] = []): Record<string, string> {
  const s = STYLE[input.style] ?? STYLE.modern;
  const storeys = clamp(Math.round(input.storeys || 1), 1, 4);
  const area = input.area && input.area > 0 ? input.area : DEFAULT_AREA[storeys];
  const bedrooms = input.bedrooms && input.bedrooms > 0 ? input.bedrooms : clamp(Math.round(area / 75), 1, 6);
  const bathrooms = input.bathrooms && input.bathrooms > 0 ? input.bathrooms : bedrooms + (storeys > 1 ? 1 : 0);
  const parking = input.parking ?? (area >= 180 ? 2 : 1);

  // ground floor carries the living areas and parking, so it is a little larger
  const ground = storeys === 1 ? area : round((area * (storeys === 2 ? 0.55 : 0.42)), 5);
  const each = storeys === 1 ? 0 : round((area - ground) / (storeys - 1), 5);
  // the top floor takes the rounding remainder so the floors add up to the total
  const upper = Array.from({ length: storeys - 1 }, (_, i) => (i === storeys - 2 ? area - ground - each * (storeys - 2) : each));
  const floorAreas = [ground, ...upper];

  // footprint + 2 m side setbacks, roughly 1:1.2 proportion, front and back yards
  const buildW = Math.sqrt(ground / 1.2);
  const landW = Math.ceil(buildW + 4);
  const landD = Math.ceil(ground / buildW + 7);

  const costMin = Math.round((area * s.rate[0]) / 1e5) / 10;
  const costMax = Math.round((area * s.rate[1]) / 1e5) / 10;
  const price = blueprintPrice(area);
  const size = sizeWord(area, storeys);

  return {
    code: nextPlanCode(input.style, existingCodes),
    name_en: `${s.en} ${size.en}`,
    name_th: `บ้าน${s.th}${STOREY_TH[storeys]} ${bedrooms} ห้องนอน`,
    series: `${s.en} Series`,
    badge: "NEW",
    tagline: s.tagline,
    description:
      `${size.th}สไตล์${s.th}${STOREY_TH[storeys]} พื้นที่ใช้สอย ${area} ตร.ม. ${bedrooms} ห้องนอน ${bathrooms} ห้องน้ำ ที่จอดรถ ${parking} คัน ` +
      `เหมาะกับที่ดินหน้ากว้างตั้งแต่ ${landW} ม. ลึก ${landD} ม. ขึ้นไป\n\n${s.about}\n\n` +
      `ชุดแบบประกอบด้วยแบบสถาปัตยกรรม โครงสร้าง และงานระบบครบชุด พร้อมยื่นขออนุญาตก่อสร้าง ลงนามโดยวิศวกรผู้มีใบอนุญาต`,
    area_sqm: String(area),
    floor_areas: floorAreas.join(", "),
    bedrooms: String(bedrooms),
    bathrooms: String(bathrooms),
    parking: String(parking),
    land_width: String(landW),
    land_depth: String(landD),
    min_land_sqwa: String(Math.ceil((landW * landD) / 4)),
    build_cost_min: costMin.toFixed(1),
    build_cost_max: costMax.toFixed(1),
    price: String(price),
    price_original: String(listPrice(price)),
    pages_arch: String(24 + storeys * 6),
    pages_struct: String(14 + storeys * 4),
    pages_mep: String(10 + storeys * 3),
  };
}
