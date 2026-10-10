/** Fulfilment steps of a blueprint order, in order. */
export const ORDER_STEPS = [
  { key: "pending_payment", label: "รอชำระเงิน", icon: "payments", note: "ทีมงานจะโทรยืนยันและส่งรายละเอียดการชำระเงิน" },
  { key: "paid", label: "ชำระเงินแล้ว", icon: "verified", note: "ได้รับยอดชำระเรียบร้อย" },
  { key: "preparing", label: "กำลังจัดเตรียมแบบ", icon: "architecture", note: "ปรับผัง ลงนามวิศวกร และพิมพ์เล่มแบบ" },
  { key: "shipped", label: "จัดส่งแล้ว", icon: "local_shipping", note: "เล่มแบบอยู่ระหว่างขนส่ง" },
  { key: "delivered", label: "ได้รับแล้ว", icon: "home", note: "ส่งถึงลูกค้าเรียบร้อย" },
] as const;

export const ORDER_STATUS_LABEL: Record<string, string> = {
  ...Object.fromEntries(ORDER_STEPS.map((s) => [s.key, s.label])),
  cancelled: "ยกเลิก",
};

export const CARRIERS: Record<string, { label: string; url?: (no: string) => string }> = {
  thaipost: { label: "ไปรษณีย์ไทย", url: (n) => `https://track.thailandpost.co.th/?trackNumber=${encodeURIComponent(n)}` },
  kerry: { label: "KEX (Kerry Express)", url: (n) => `https://th.kex-express.com/th/track/?track=${encodeURIComponent(n)}` },
  flash: { label: "Flash Express", url: (n) => `https://www.flashexpress.co.th/fle/tracking?se=${encodeURIComponent(n)}` },
  jt: { label: "J&T Express", url: (n) => `https://www.jtexpress.co.th/service/track?billcode=${encodeURIComponent(n)}` },
  other: { label: "อื่นๆ / ส่งด้วยตนเอง" },
};

/** NB + yymmdd (Bangkok) + 4 random characters, e.g. NB261010-7KQ4. Unambiguous letters only. */
export function newOrderNo(now = new Date()) {
  const d = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Bangkok", year: "2-digit", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const part = (t: string) => d.find((p) => p.type === t)?.value ?? "00";
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const rnd = Array.from(crypto.getRandomValues(new Uint32Array(4)), (n) => chars[n % chars.length]).join("");
  return `NB${part("year")}${part("month")}${part("day")}-${rnd}`;
}
