import Link from "next/link";
import { SITE } from "@/lib/site";
import { Icon } from "./Icon";
import { Logo } from "./Logo";

const CATEGORIES = [
  { href: "/plans?storeys=1", label: "บ้านชั้นเดียวโมเดิร์นทรอปิคอล" },
  { href: "/plans?style=nordic", label: "แบบบ้านสองชั้นสไตล์นอร์ดิก" },
  { href: "/plans?features=pool", label: "พูลวิลล่าและบ้านพักตากอากาศ" },
  { href: "/plans?features=narrow", label: "แบบบ้านหน้าแคบสำหรับที่ดินในเมือง" },
  { href: "/plans?features=universal", label: "บ้าน Universal Design ผู้สูงอายุ" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-hairline bg-white">
      <div className="shell grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo className="h-14 w-auto" />
          <p className="mt-5 text-[13px] leading-6 text-muted">
            สถาปัตยกรรมที่คำนวณได้จริง บริการจำหน่ายแบบบ้านโมเดิร์น สไตล์สแกนดิเนเวีย-มินิมอล พร้อมไฟล์ 3D BIM, BOQ
            ละเอียด และเอกสารวิศวกรรมรับรองพร้อมยื่นเทศบาล
          </p>
          <p className="mt-5 flex items-center gap-2 text-[11px] font-semibold text-ink-3">
            <span className="h-2 w-2 bg-bronze" /> ควบคุมงานโดยวิศวกรโยธา {SITE.license}
          </p>
        </div>
        <div>
          <h3 className="text-[15px] font-bold">หมวดหมู่แบบบ้านยอดนิยม</h3>
          <ul className="mt-4 space-y-2.5 text-[13px] text-muted">
            {CATEGORIES.map((c) => (
              <li key={c.href}><Link href={c.href} className="hover:text-bronze-dark">{c.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-[15px] font-bold">เอกสารวิศวกรรม &amp; กฎหมาย</h3>
          <Link href="/boq" className="mt-4 block border border-hairline bg-wash p-4 hover:border-ink">
            <span className="label-tech text-bronze-dark">Download Blueprint Spec</span>
            <span className="mt-1.5 block text-[13px] text-muted">
              ดูตัวอย่างเล่มแบบแปลนพิมพ์เขียว ขนาด A3 พร้อมรายการวัสดุ (BOQ)
            </span>
            <span className="mt-2 flex items-center gap-1.5 text-[12px] font-semibold"><Icon name="download" /> ตัวอย่างเล่มแบบ BOQ ออนไลน์</span>
          </Link>
          <p className="mt-4 text-[11px] text-subtle">ควบคุมงานโดย {SITE.engineer} วิศวกรโยธา ({SITE.license})</p>
        </div>
        <div>
          <h3 className="text-[15px] font-bold">ติดต่อ NATBUILD</h3>
          <p className="mt-4 text-[13px] leading-6 text-muted">{SITE.address}</p>
          <ul className="mt-4 space-y-2 text-[13px]">
            <li><a href={SITE.phoneHref} className="flex items-center gap-2 hover:text-bronze-dark"><Icon name="call" className="text-bronze" />{SITE.phone}</a></li>
            <li><a href={`mailto:${SITE.email}`} className="flex items-center gap-2 hover:text-bronze-dark"><Icon name="mail" className="text-bronze" />{SITE.email}</a></li>
            <li><a href={SITE.lineHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-bronze-dark"><Icon name="chat" className="text-bronze" />LINE {SITE.line}</a></li>
            <li className="flex items-center gap-2"><Icon name="schedule" className="text-bronze" />{SITE.hours}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-hairline">
        <div className="shell flex flex-col gap-3 py-5 text-[11px] text-subtle md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} NATBUILD Co., Ltd. สงวนลิขสิทธิ์ทุกประการ</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            <Link href="/about#privacy" className="hover:text-ink">นโยบายความเป็นส่วนตัว</Link>
            <Link href="/about#license" className="hover:text-ink">ข้อกำหนดการใช้งานแบบแปลนและ BIM ลิขสิทธิ์</Link>
            <Link href="/admin" className="hover:text-ink">สำหรับเจ้าหน้าที่</Link>
          </div>
          <p className="label-tech">ISO 9001:2015 Quality Architectural Design</p>
        </div>
      </div>
    </footer>
  );
}
