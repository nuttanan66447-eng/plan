import type { ModelConfig, ModelRoom, ModelView } from "./types";

export const MAX_ROOMS = 40;

/** Common Thai room names with the small English line shown under them. */
export const ROOM_PRESETS: { th: string; en: string }[] = [
  { th: "ห้องนั่งเล่น", en: "LIVING" },
  { th: "ห้องนอนใหญ่", en: "MASTER BED" },
  { th: "ห้องนอน", en: "BEDROOM" },
  { th: "ห้องน้ำ", en: "WC" },
  { th: "ครัว", en: "KITCHEN" },
  { th: "รับประทานอาหาร", en: "DINING" },
  { th: "โถง", en: "HALL" },
  { th: "บันได", en: "STAIR" },
  { th: "ห้องทำงาน", en: "OFFICE" },
  { th: "ห้องพระ", en: "SHRINE" },
  { th: "ห้องเก็บของ", en: "STORAGE" },
  { th: "ซักล้าง", en: "LAUNDRY" },
  { th: "ระเบียง", en: "BALCONY" },
  { th: "เทอร์เรซ", en: "TERRACE" },
  { th: "จอดรถ", en: "CARPORT" },
  { th: "ห้องแต่งตัว", en: "WALK-IN" },
];

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
};

export function parseModelConfig(raw: unknown): ModelConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const cuts = (Array.isArray(r.cuts) ? r.cuts : []).slice(0, 4).map((c) => {
    const n = num(c);
    return n != null && n > 0 && n < 200 ? n : null;
  });
  const rooms: ModelRoom[] = (Array.isArray(r.rooms) ? r.rooms : [])
    .filter((x): x is Record<string, unknown> => !!x && typeof x === "object")
    .map((x) => ({
      floor: Math.min(3, Math.max(0, Math.round(Number(x.floor) || 0))),
      x: num(x.x) ?? 0,
      y: num(x.y) ?? 0,
      z: num(x.z) ?? 0,
      th: String(x.th ?? "").trim().slice(0, 40),
      en: String(x.en ?? "").trim().toUpperCase().slice(0, 30),
    }))
    .filter((x) => x.th)
    .slice(0, MAX_ROOMS);
  const vec = (v: unknown) =>
    Array.isArray(v) && v.length === 3 && v.every((n) => Number.isFinite(Number(n)) && Math.abs(Number(n)) < 5000)
      ? (v.map((n) => Math.round(Number(n) * 100) / 100) as [number, number, number])
      : null;
  const views = (Array.isArray(r.views) ? r.views : []).slice(0, 4).map((v): ModelView | null => {
    const o = v && typeof v === "object" ? (v as Record<string, unknown>) : null;
    const p = vec(o?.p);
    const t = vec(o?.t);
    return p && t ? { p, t } : null;
  });
  const h = r.home && typeof r.home === "object" ? (r.home as Record<string, unknown>) : null;
  const hp = vec(h?.p);
  const ht = vec(h?.t);
  const home = hp && ht ? { p: hp, t: ht } : null;
  if (!cuts.some((c) => c != null) && !rooms.length && !views.some(Boolean) && !home) return null;
  return { cuts, rooms, views, home };
}
