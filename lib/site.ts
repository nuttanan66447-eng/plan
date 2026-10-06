export const SITE = {
  name: "NATBUILD",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://archiplan-kappa.vercel.app",
  phone: "02-892-4114",
  phoneHref: "tel:028924114",
  mobile: "098-765-4321",
  roiEtPhone: "043-512-345",
  email: "contact@natbuild.co.th",
  line: "@natbuild",
  lineHref: "https://line.me/R/ti/p/@natbuild",
  license: "น-5241/65",
  address: "เลขที่ 88 อาคารอาร์คิสเปซ ชั้น 14 ถ.สาทรใต้ แขวงยานนาวา เขตสาทร กรุงเทพมหานคร 10120",
  roiEtAddress: "168/12 ถ.เทวาภิบาล ต.ในเมือง อ.เมือง จ.ร้อยเอ็ด 45000",
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
