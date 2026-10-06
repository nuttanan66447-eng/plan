import type { Metadata } from "next";
import Link from "next/link";
import { BoqSheet } from "@/components/BoqSheet";
import { Icon } from "@/components/Icon";
import { Field, LeadForm } from "@/components/LeadForm";
import { SectionHeading } from "@/components/SectionHeading";
import { boqPlanCodes, getBoq } from "@/lib/data";
import { baht, num } from "@/lib/format";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "ตัวอย่างเอกสาร BOQ & รายการคำนวณวิศวกรรม",
  description: "ตัวอย่างเอกสาร BOQ ละเอียด 100% และรายการคำนวณวิศวกรรมโครงสร้าง พร้อมยื่นขออนุญาตก่อสร้าง ดาวน์โหลดไฟล์ Excel ได้ทันที",
};

const PERMIT = [
  ["รับเล่มแบบครบชุด", "รับเล่มพิมพ์เขียว 5 ชุด + ไฟล์รายการคำนวณจาก ArchiPlan (รับรองเซ็นสด)", "ระยะเวลา 1-3 วันทำการ"],
  ["เตรียมเอกสารบุคคล", "เตรียมสำเนาโฉนดที่ดิน บัตรประชาชน ทะเบียนบ้าน และหนังสือยินยอมผู้ถือกรรมสิทธิ์", "เจ้าของดำเนินการ"],
  ["ยื่นเรื่องที่ท้องถิ่น", "ยื่นขออนุญาตก่อสร้างที่กองช่าง อบต. หรือเทศบาล เจ้าหน้าที่ตรวจพื้นที่และแบบ", "ระยะเวลาพิจารณา 30-45 วัน"],
  ["รับใบ อ.1 ก่อสร้าง", "ได้รับใบอนุญาตก่อสร้าง (อ.1) เรียบร้อย พร้อมเริ่มดำเนินการเทฐานรากทันที", "ผ่านการอนุมัติ 100%"],
];

export default async function BoqPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan: requested } = await searchParams;
  const codes = await boqPlanCodes();
  const code = requested && codes.includes(requested) ? requested : codes[0] ?? "AP-NORDIC-08";
  const { plan, items } = await getBoq(code);
  const total = items.reduce((s, i) => s + i.qty * (i.material_rate + i.labor_rate), 0) * 1.07;

  return (
    <>
      <div className="border-b border-hairline bg-wash">
        <div className="shell flex justify-between gap-4 py-3 text-[11.5px] font-semibold text-muted">
          <nav><Link href="/" className="hover:text-ink">หน้าแรก</Link> / ตรวจสอบรายการ BOQ &amp; ใบขออนุญาต / <span className="text-bronze-dark">ตัวอย่างเอกสารถอดแบบและคำนวณโครงสร้าง</span></nav>
          <span className="hidden md:block">อัปเดตราคากลางวัสดุล่าสุด: ไตรมาส {Math.floor(new Date().getMonth() / 3) + 1}/{new Date().getFullYear() + 543}</span>
        </div>
      </div>

      <section className="blueprint border-b border-hairline py-12">
        <div className="shell grid gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="chip chip-dot bg-white">มาตรฐานกรมบัญชีกลาง (BIT Standard)</span>
              <span className="chip bg-white">LOD 350 Precision Estimation Model</span>
              <span className="chip bg-white">พ.ร.บ. ควบคุมอาคาร พ.ศ. 2522</span>
            </div>
            <h1 className="mt-5 text-[32px] font-bold leading-snug md:text-[44px]">
              ตัวอย่างเอกสาร BOQ ละเอียด 100% <span className="text-bronze-dark">และรายการคำนวณวิศวกรรมโครงสร้าง</span> พร้อมยื่นขออนุญาต
            </h1>
            <p className="mt-4 max-w-2xl text-muted">
              โปร่งใสทุกตารางเมตร ควบคุมงบประมาณก่อสร้างได้จริง เอกสารรับรองโดยวุฒิวิศวกรโยธา (วศ.) และสามัญสถาปนิก (สถ.) พร้อมไฟล์ Excel และ PDF
              ปรับใช้ประมูลงานผู้รับเหมา ยื่นกู้ธนาคาร และยื่นเทศบาลได้ทันที
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#sheet" className="btn btn-bronze"><Icon name="table_view" /> เปิดดู Interactive Spreadsheet ออนไลน์</a>
              <a href="#quote" className="btn btn-outline"><Icon name="engineering" /> ขอถอด BOQ จากแบบของคุณ</a>
            </div>
          </div>
          {plan && (
            <div className="card self-start p-5">
              <div className="flex items-center justify-between border-b border-hairline pb-3">
                <p className="label-tech text-muted">Project Specification</p>
                <span className="bg-bronze px-2 py-0.5 text-[10px] font-bold text-ink">READY TO PERMIT</span>
              </div>
              <dl className="mt-3 space-y-2 text-[13px]">
                {[["รหัสโมเดลอ้างอิง", plan.code], ["พื้นที่ใช้สอยรวม", `${num(plan.area_sqm)} ตารางเมตร`], ["ประเภทอาคาร", `ค.ส.ล. ${plan.storeys} ชั้น (พักอาศัย)`], ["งบประมาณประเมิน BOQ", baht(plan.build_cost_max * 1e6 * 0.86)], ["วิศวกรผู้คำนวณ", "วุฒิวิศวกรโยธา (วศ. 4182)"]].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3"><dt className="text-muted">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>
                ))}
              </dl>
              <div className="mt-4 h-1.5 bg-wash-2"><div className="h-full w-full bg-bronze" /></div>
              <p className="mt-1 flex justify-between text-[11px] text-muted"><span>ความครบถ้วนเอกสาร</span><span>100% Approved</span></p>
            </div>
          )}
        </div>
      </section>

      <section className="border-b border-hairline bg-white">
        <div className="shell grid grid-cols-2 lg:grid-cols-4">
          {[["< 2%", "ความคลาดเคลื่อน BOQ", "ถอดแบบจากโมเดล 3D BIM แม่นยำทุกชิ้นส่วน"], ["100%", "ผ่านการตรวจเทศบาล / เขต", "รับประกันแก้ไขแบบฟรีหากไม่ผ่าน อ.1"], ["SCG / TOA", "สเปกวัสดุแบรนด์ชั้นนำ", "ระบุยี่ห้อ รุ่น ป้องกันการเปลี่ยนสเปก"], ["สภาวิศวกร", "เซ็นรับรองถูกต้องตามกฎหมาย", "วุฒิวิศวกร (วศ.) และสามัญสถาปนิก (สถ.)"]].map(([v, t, d], i) => (
            <div key={t} className={`p-5 ${i % 2 ? "border-l" : ""} ${i > 1 ? "border-t lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""} border-hairline`}>
              <p className="font-display text-[28px] font-bold text-bronze-dark">{v}</p>
              <p className="text-[14px] font-bold">{t}</p>
              <p className="text-[12px] text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="sheet" className="scroll-mt-28 py-12">
        <div className="shell">
          <SectionHeading eyebrow="Live Spreadsheet & Blueprint Viewer" title="คลังเอกสารและเล่มคำนวณเสมือนจริง"
            desc="คลิกหัวหมวดเพื่อย่อ/ขยาย ค้นหารายการ หรือดาวน์โหลดเป็นไฟล์ Excel (CSV)"
            aside={codes.length > 1 ? (
              <div className="flex flex-wrap gap-2">{codes.map((c) => <Link key={c} href={`/boq?plan=${c}#sheet`} className={`chip ${c === code ? "chip-active" : "hover:border-ink"}`}>{c}</Link>)}</div>
            ) : undefined} />
          <div className="mt-6">
            {plan && items.length ? <BoqSheet items={items} planCode={plan.code} title={`${plan.name_th} (${plan.code}) • ${num(plan.area_sqm)} ตร.ม.`} /> : <p className="card p-8 text-center text-muted">ยังไม่มีข้อมูล BOQ</p>}
          </div>
          <p className="mt-3 text-[12px] text-subtle">* ตัวอย่างบางส่วนจากเล่ม BOQ ฉบับเต็ม (เล่มจริงมี 180+ รายการ ครอบคลุมทุกหมวดงาน) ยอดประมาณการตัวอย่าง {baht(total)}</p>
        </div>
      </section>

      <section className="border-y border-hairline bg-white py-12">
        <div className="shell grid gap-8 lg:grid-cols-2">
          <div className="card p-6">
            <h2 className="flex items-center gap-2 text-[20px] font-bold"><Icon name="inventory_2" className="text-bronze-dark" />สิ่งที่ได้รับในแพ็กเกจเอกสาร BOQ &amp; วิศวกรรม</h2>
            <ol className="mt-5 space-y-3">
              {[["เล่มพิมพ์เขียว A3 ฉบับสมบูรณ์ 5 ชุด", "ลงลายมือชื่อสถาปนิกและวิศวกรผู้ออกแบบ 3 ชุด และสำเนาสำรอง 2 ชุด"], ["เล่มรายการคำนวณโครงสร้าง พ.ร.บ. 2522", "ฉบับปรุงแต่ง A4 เข้าเล่มสันกาว + ไฟล์ PDF แสดงการรับน้ำหนัก"], ["ไฟล์ต้นฉบับ Excel (.xlsx) ผูกสูตรอัตโนมัติ", "ปรับราคาวัสดุตามร้านค้าในพื้นที่ คำนวณยอดรวมใหม่ทันที"], ["ชุดแบบฟอร์ม ข.1 และหนังสือมอบอำนาจ", "กรอกข้อมูลเอกสารยื่นขออนุญาตพร้อมใช้งาน"]].map(([t, d], i) => (
                <li key={t} className="flex gap-4 border border-hairline p-4"><span className="grid h-8 w-8 shrink-0 place-items-center bg-ink text-[13px] font-bold text-white">{i + 1}</span><span><b className="block text-[14px]">{t}</b><span className="text-[12.5px] text-muted">{d}</span></span></li>
              ))}
            </ol>
          </div>
          <div className="card p-6">
            <h2 className="flex items-center gap-2 text-[20px] font-bold"><Icon name="shield" className="text-bronze-dark" />ทำไมต้องมี BOQ ArchiPlan ก่อนจ้างช่าง?</h2>
            <p className="mt-2 text-[13.5px] text-muted">เจ้าของบ้านกว่า 80% ประสบปัญหางบบานปลายเพราะไม่มี “ราคากลางอ้างอิง” ที่เป็นมาตรฐาน</p>
            <ul className="mt-5 space-y-3">
              {[["ป้องกันปัญหางบบานปลาย (Budget Overrun)", "มีราคากลางวัสดุและค่าแรงที่ชัดเจน ลดการเพิ่มงานระหว่างก่อสร้าง"], ["ส่ง Blank BOQ ให้ผู้รับเหมาแข่งราคาอย่างโปร่งใส", "ผู้รับเหมาทุกรายเสนอราคาบนปริมาณเดียวกัน เปรียบเทียบได้ตรงตัว"], ["ใช้ตรวจรับงานงวดงานได้จริง", "แบ่งสัดส่วนงวดเงินตามปริมาณงานที่เสร็จจริง ไม่จ่ายเงินล่วงหน้าเกินงาน"], ["อนุมัติสินเชื่อกู้สร้างบ้านกับธนาคารได้ 100%", "รองรับเงื่อนไขธนาคาร ธอส. กสิกร ไทยพาณิชย์ กรุงไทย"]].map(([t, d], i) => (
                <li key={t} className="border-l-2 border-bronze bg-wash p-4"><b className="block text-[14px]">{i + 1}. {t}</b><span className="text-[12.5px] text-muted">{d}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="shell">
          <SectionHeading eyebrow="Roadmap to Building Permit" title="4 ขั้นตอนยื่นขออนุญาตก่อสร้าง (อ.1) ให้ผ่านฉลุย" />
          <ol className="mt-8 grid gap-px border border-hairline bg-hairline md:grid-cols-4">
            {PERMIT.map(([t, d, n], i) => (
              <li key={t} className="bg-white p-5"><span className="font-display text-[30px] font-bold text-bronze">{String(i + 1).padStart(2, "0")}</span><b className="mt-1 block text-[15px]">{t}</b><p className="mt-1 text-[12.5px] text-muted">{d}</p><p className="mt-3 label-tech text-bronze-dark">{n}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section id="quote" className="blueprint-dark scroll-mt-28 py-14 text-white">
        <div className="shell grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="bg-bronze px-2 py-1 text-[10.5px] font-bold tracking-[0.1em] text-ink">NO-SURPRISE CONSTRUCTION BUDGET</span>
            <h2 className="mt-4 text-[28px] font-bold leading-snug md:text-[34px]">มีที่ดินแล้ว หรือมีแบบแปลนที่ต้องการถอด BOQ และคำนวณโครงสร้างหรือไม่?</h2>
            <p className="mt-3 text-white/65">ส่งไฟล์แบบสถาปัตยกรรมของคุณมาให้วิศวกร ArchiPlan ประเมินงานเบื้องต้นฟรี หรือดาวน์โหลดตัวอย่างไฟล์ Excel ไปใช้ประเมินราคาก่อสร้าง</p>
            <div className="mt-6 border border-white/15 p-5">
              <p className="label-tech text-bronze-light">สายด่วนวิศวกร &amp; ให้คำปรึกษา</p>
              <a href={SITE.phoneHref} className="mt-1 block font-display text-[26px] font-bold">โทร. {SITE.phone}</a>
              <p className="text-[12.5px] text-white/60">เจ้าหน้าที่ฝ่ายวิศวกรรมพร้อมบริการ {SITE.hours}</p>
            </div>
          </div>
          <div className="bg-white p-6 text-ink">
            <h3 className="text-[18px] font-bold">ขอใบเสนอราคาถอด BOQ</h3>
            <LeadForm type="boq" hidden={{ plan_code: code }} submitLabel="ส่งไฟล์แบบประเมินราคา BOQ ฟรี" className="mt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field name="name" label="ชื่อ-นามสกุล" required autoComplete="name" />
                <Field name="phone" label="เบอร์โทรศัพท์" type="tel" required autoComplete="tel" />
                <Field name="email" label="อีเมล (ส่งไฟล์แบบกลับ)" type="email" autoComplete="email" />
                <Field name="area_sqm" label="พื้นที่ใช้สอยโดยประมาณ (ตร.ม.)" type="number" min="0" />
                <Field name="message" as="textarea" label="รายละเอียดแบบ / ลิงก์ไฟล์ (Google Drive, Dropbox)" className="sm:col-span-2" />
              </div>
            </LeadForm>
          </div>
        </div>
      </section>
    </>
  );
}
