export const SITE = {
  name: "NATBUILD",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://natbuild.vercel.app",
  phone: "080-406-6447",
  phoneHref: "tel:0804066447",
  email: "contact@natbuild.co.th",
  line: "@natbuild",
  lineHref: "https://line.me/R/ti/p/@natbuild",
  engineer: "ณัฐธนัน มะธิปิไข",
  license: "ภย.72134",
  address: "ถ.แจ้งสนิท ต.เหนือเมือง อ.เมืองร้อยเอ็ด จ.ร้อยเอ็ด 45000",
  hours: "จันทร์ - เสาร์: 09:00 - 18:00 น.",
};

export const NAV: { href: string; label: string; short?: string }[] = [
  { href: "/", label: "หน้าหลัก" },
  { href: "/plans", label: "คลังแบบบ้าน 3D", short: "แบบบ้าน 3D" },
  { href: "/custom-design", label: "รับออกแบบ-เขียนแบบ", short: "ออกแบบ-เขียนแบบ" },
  { href: "/boq", label: "BOQ & ใบขออนุญาต", short: "BOQ & ใบอนุญาต" },
  { href: "/turnkey", label: "รับเหมา & ตรวจบ้าน", short: "รับเหมา-ตรวจบ้าน" },
  { href: "/portfolio", label: "ผลงานที่สร้างจริง", short: "ผลงาน" },
  { href: "/courses", label: "คอร์สเรียน" },
  { href: "/shop", label: "ร้านค้า" },
  { href: "/about", label: "เกี่ยวกับเรา", short: "เกี่ยวกับ" },
];
