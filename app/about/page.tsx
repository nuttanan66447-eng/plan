import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { SectionHeading } from "@/components/SectionHeading";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "เกี่ยวกับเรา",
  description: "NATBUILD สตูดิโอสถาปัตยกรรมและวิศวกรรม BIM ผู้ให้บริการแบบบ้านพร้อมยื่นขออนุญาต ออกแบบเฉพาะ รับเหมาก่อสร้าง และตรวจบ้าน",
};

export default function AboutPage() {
  return (
    <>
      <section className="blueprint border-b border-hairline py-14">
        <div className="shell grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow">About NATBUILD</p>
            <h1 className="mt-3 text-[32px] font-bold leading-snug md:text-[44px]">สถาปัตยกรรมที่คำนวณได้จริง ก่อสร้างได้จริง</h1>
            <p className="mt-4 text-muted">
              NATBUILD ก่อตั้งโดยทีมสถาปนิกและวิศวกรโครงสร้างที่เชื่อว่าบ้านที่ดีต้องเริ่มจากข้อมูลที่แม่นยำ เราใช้กระบวนการ BIM
              (Building Information Modeling) ในทุกโครงการ ตั้งแต่แบบบ้านมาตรฐานในคลัง ไปจนถึงงานออกแบบเฉพาะและการควบคุมการก่อสร้าง
              เพื่อให้เจ้าของบ้านเห็นภาพ งบประมาณ และปริมาณวัสดุที่ชัดเจนก่อนลงเสาเข็มต้นแรก
            </p>
            <div className="mt-6 grid grid-cols-3 border border-hairline bg-white">
              {[["2014", "ก่อตั้งสตูดิโอ"], ["1,240+", "บ้านที่ออกแบบ"], ["450+", "บ้านสร้างจริง"]].map(([v, l], i) => (
                <div key={l} className={`p-4 ${i ? "border-l border-hairline" : ""}`}><p className="font-display text-[24px] font-bold text-bronze-dark">{v}</p><p className="text-[12px] text-muted">{l}</p></div>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/3] border border-hairline"><Image src="/images/engineers-site.jpg" alt="ทีมสถาปนิกและวิศวกรของ NATBUILD ที่หน้างาน" fill priority sizes="(max-width: 1024px) 100vw, 600px" className="object-cover" /></div>
        </div>
      </section>

      <section className="py-14">
        <div className="shell">
          <SectionHeading eyebrow="Our Services" title="บริการของเราครอบคลุมทุกขั้นตอนของการสร้างบ้าน" />
          <div className="mt-8 grid gap-px border border-hairline bg-hairline md:grid-cols-2 lg:grid-cols-4">
            {[["/plans", "home_work", "คลังแบบบ้าน 3D", "แบบมาตรฐานพร้อมยื่นขออนุญาต ราคาเริ่มต้น 15,900 บาท"], ["/custom-design", "architecture", "ออกแบบเฉพาะ", "ออกแบบตามที่ดินและไลฟ์สไตล์ พร้อมโมเดล BIM"], ["/boq", "table_view", "BOQ & ใบอนุญาต", "ถอดปริมาณวัสดุและรายการคำนวณโครงสร้าง"], ["/turnkey", "engineering", "รับเหมา & ตรวจบ้าน", "ก่อสร้าง Turnkey และตรวจรับบ้านโดยวิศวกร"]].map(([href, i, t, d]) => (
              <Link key={href} href={href} className="group bg-white p-6 hover:bg-wash">
                <Icon name={i} className="text-[28px] text-bronze-dark" />
                <h3 className="mt-3 text-[17px] font-bold">{t}</h3>
                <p className="mt-1 text-[13px] text-muted">{d}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-bold group-hover:text-bronze-dark">ดูรายละเอียด <Icon name="arrow_forward" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-hairline bg-white py-14">
        <div className="shell grid gap-10 lg:grid-cols-2">
          <div id="license" className="scroll-mt-28">
            <h2 className="text-[22px] font-bold">ข้อกำหนดการใช้งานแบบแปลนและลิขสิทธิ์ BIM</h2>
            <div className="prose-th mt-4 text-[13.5px] text-muted">
              <p>แบบแปลนทุกชุดเป็นลิขสิทธิ์ของ NATBUILD Co., Ltd. การสั่งซื้อ 1 ชุด อนุญาตให้ใช้ก่อสร้างอาคาร 1 หลัง บนที่ดินที่ระบุในการขออนุญาตเท่านั้น</p>
              <p>ห้ามทำซ้ำ ดัดแปลงเพื่อจำหน่าย หรือเผยแพร่ไฟล์ BIM / CAD ต่อบุคคลที่สาม ยกเว้นผู้รับเหมาและวิศวกรที่เกี่ยวข้องกับโครงการ</p>
              <p>ภาพ 3D และภาพถ่ายผลงานในเว็บไซต์ใช้เพื่อการนำเสนอ วัสดุและสีจริงอาจแตกต่างตามการเลือกของเจ้าของบ้านและผู้รับเหมา</p>
            </div>
          </div>
          <div id="privacy" className="scroll-mt-28">
            <h2 className="text-[22px] font-bold">นโยบายความเป็นส่วนตัว (PDPA)</h2>
            <div className="prose-th mt-4 text-[13.5px] text-muted">
              <p>ข้อมูลที่ท่านกรอกในแบบฟอร์ม (ชื่อ เบอร์โทรศัพท์ อีเมล LINE ID และรายละเอียดโครงการ) จะถูกจัดเก็บอย่างปลอดภัยในระบบฐานข้อมูลที่เข้ารหัส และใช้เพื่อการติดต่อกลับ เสนอราคา และให้บริการตามที่ท่านร้องขอเท่านั้น</p>
              <p>เราไม่ขายหรือเปิดเผยข้อมูลแก่บุคคลภายนอก ท่านสามารถขอเข้าถึง แก้ไข หรือลบข้อมูลได้ทุกเมื่อโดยติดต่อ {SITE.email}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="shell grid gap-6 md:grid-cols-2">
          {[["สำนักงานใหญ่ กรุงเทพฯ", SITE.address, SITE.phone, SITE.phoneHref], ["ศูนย์ปฏิบัติการภาคอีสาน ร้อยเอ็ด", SITE.roiEtAddress, SITE.roiEtPhone, `tel:${SITE.roiEtPhone.replace(/-/g, "")}`]].map(([t, a, p, h]) => (
            <div key={t} className="card p-6">
              <p className="eyebrow">Office</p>
              <h3 className="mt-2 text-[19px] font-bold">{t}</h3>
              <p className="mt-2 text-[13.5px] text-muted">{a}</p>
              <a href={h} className="mt-4 inline-flex items-center gap-2 font-bold hover:text-bronze-dark"><Icon name="call" className="text-bronze" />{p}</a>
              <p className="mt-1 flex items-center gap-2 text-[13px] text-muted"><Icon name="schedule" className="text-bronze" />{SITE.hours}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
