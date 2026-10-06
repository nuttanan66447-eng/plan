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

export const NAV = [
  { href: "/", label: "หน้าหลัก" },
  { href: "/plans", label: "คลังแบบบ้าน 3D" },
  { href: "/custom-design", label: "รับออกแบบ-เขียนแบบ" },
  { href: "/boq", label: "BOQ & ใบขออนุญาต" },
  { href: "/turnkey", label: "รับเหมา & ตรวจบ้าน" },
  { href: "/portfolio", label: "ผลงานที่สร้างจริง" },
  { href: "/about", label: "เกี่ยวกับเรา" },
];
