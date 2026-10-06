import type { Metadata } from "next";
import Image from "next/image";
import { DesignEstimator } from "@/components/DesignEstimator";
import { Icon } from "@/components/Icon";
import { Field, LeadForm } from "@/components/LeadForm";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "รับออกแบบบ้านและเขียนแบบก่อสร้างเฉพาะบุคคล",
  description: "บริการรับเขียนแบบบ้านและออกแบบสถาปัตยกรรมเฉพาะคุณ คำนวณงบประมาณเบื้องต้นและจัดสเปกแบบบ้านออนไลน์ พร้อมโมเดล 3D BIM และนัดปรึกษาสถาปนิกฟรี",
};

const MATRIX: [string, string, React.ReactNode, React.ReactNode, React.ReactNode][] = [
  ["การวิเคราะห์ทิศทางแดดและลม", "Orientation & Solar-Wind Shadow Study", "จัดวางตามแปลนเดิม", "วิเคราะห์ตามที่ดินจริง", "วิเคราะห์ละเอียด + จำลองเงาตลอดปี"],
  ["การแก้ไขผังแปลนพื้นที่ใช้สอย", "Design Revisions & Spatial Iterations", "แก้ไขได้ 2 ครั้ง", "ปรับแก้แบบไม่จำกัด (3 รอบใหญ่)", "ไม่จำกัดจนแบบเสร็จสมบูรณ์"],
  ["โมเดล Interactive 3D BIM หมุนดูผ่านมือถือ / PC", "Interactive BIM / Revit 360 Walkthrough", "—", <Icon key="a" name="check_circle" className="text-bronze" />, <Icon key="b" name="check_circle" className="text-bronze" />],
  ["เล่มพิมพ์เขียวขนาด A3 สำหรับยื่นก่อสร้าง", "Architectural & Structural CAD Blueprint", "3 ชุด", "5 ชุด (ครบชุด)", "8 ชุด + ไฟล์ DWG ต้นฉบับ"],
  ["รายการคำนวณโครงสร้างวิศวกรโยธา (วศ.)", "Structural Engineering Calculation Book", "+ ฿12,000", "รวมในแพ็กเกจแล้ว", "รวมในแพ็กเกจแล้ว (วุฒิวิศวกร)"],
  ["ถอดปริมาณวัสดุ BOQ ละเอียด", "Bill of Quantities with Material Spec", "+ ฿8,000", "+ ฿8,000", "รวมในแพ็กเกจแล้ว (ละเอียดทุกชิ้น)"],
  ["ประสานงานยื่นขออนุญาต / อบต. / เทศบาล", "Municipal Authority Permit Liaison", "—", "ให้คำปรึกษาเอกสารฟรี", "ทีมงานดำเนินการยื่นแทนให้ 100%"],
];

export default function CustomDesignPage() {
  return (
    <>
      <div className="border-b border-hairline bg-wash">
        <div className="shell flex flex-col justify-between gap-1 py-2.5 text-[11px] font-semibold tracking-[0.06em] text-muted md:flex-row">
          <span>PROJECT CODE: <span className="text-ink">ARC-CUSTOM-SPEC-{new Date().getFullYear()}</span> • RESIDENTIAL CAD &amp; BIM ENGINEERING</span>
          <span className="flex items-center gap-1.5"><Icon name="verified" className="text-bronze" /> ใบอนุญาตประกอบวิชาชีพสถาปัตยกรรมควบคุม ภ-สถ. 5241/65</span>
        </div>
      </div>

      <section className="blueprint border-b border-hairline py-12">
        <div className="shell grid items-center gap-8 lg:grid-cols-[1fr_380px]">
          <div className="min-w-0">
            <span className="chip chip-dot !h-auto !whitespace-normal bg-white py-1">Bespoke BIM Architectural Drafting &amp; Engineering</span>
            <h1 className="mt-5 text-[32px] font-bold leading-snug md:text-[44px]">บริการรับเขียนแบบบ้านและ<br className="hidden md:block" />ออกแบบสถาปัตยกรรมเฉพาะคุณ</h1>
            <p className="mt-4 max-w-2xl text-muted">
              ออกแบบตามความต้องการ ขนาดที่ดินจริง และงบประมาณของคุณ พร้อมโมเดล 3 มิติ BIM ที่แม่นยำทุกมิติ ช่วยให้คุณเห็นทุกรายละเอียด
              ก่อนเริ่มก่อสร้างจริง ควบคุมโดยสถาปนิกและวิศวกรโครงสร้างใบอนุญาตระดับวุฒิ
            </p>
          </div>
          <div className="card p-5">
            <div className="flex justify-between label-tech text-muted"><span>Architectural Metrics</span><span className="text-bronze-dark">Live Update</span></div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="bg-wash p-3"><p className="font-display text-[26px] font-bold">1,240+</p><p className="text-[11px] text-muted">บ้านที่ออกแบบสำเร็จ</p></div>
              <div className="bg-wash p-3"><p className="font-display text-[26px] font-bold text-bronze-dark">100%</p><p className="text-[11px] text-muted">ผ่านการขออนุญาต</p></div>
            </div>
            <p className="mt-3 flex items-center gap-2 text-[12px] text-muted"><Icon name="architecture" className="text-bronze-dark" /> แบบก่อสร้างพิมพ์เขียว A3 + BIM + IFC + ไฟล์ CAD DWG</p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="shell">
          <SectionHeading eyebrow="Project Estimator & Briefing Matrix" title="คำนวณงบประมาณเบื้องต้น & จัดสเปกแบบบ้าน" />
          <div className="mt-6"><DesignEstimator /></div>
        </div>
      </section>

      <section className="border-y border-hairline bg-white py-12">
        <div className="shell">
          <SectionHeading align="center" eyebrow="Deliverables Matrix // ตารางเปรียบเทียบชุดเอกสาร" title="เลือกขอบเขตบริการที่สอดคล้องกับงบประมาณคุณ"
            desc="ไม่ว่าจะเป็นแบบบ้านสำเร็จรูปที่ปรับเปลี่ยนเล็กน้อย หรือการ Custom ออกแบบใหม่ทั้งหลังที่ตอบโจทย์ 100% พร้อมระบบวิศวกรรมครบถ้วน" />
          <div className="mt-8 overflow-x-auto border border-hairline">
            <table className="w-full min-w-[820px] border-collapse text-[13px]">
              <thead>
                <tr className="bg-wash text-left">
                  <th className="p-4 label-tech text-muted">รายการบริการและเอกสาร (Deliverables)</th>
                  <th className="border-l border-hairline p-4 text-center"><span className="label-tech block text-muted">Standard Plan</span><span className="text-[11px] font-normal text-muted">แบบบ้านสำเร็จรูปพร้อมสร้าง</span></th>
                  <th className="border-x-2 border-t-2 border-bronze bg-bronze-wash p-4 text-center"><span className="label-tech block text-bronze-dark">Custom Drafting</span><span className="text-[11px] font-normal">เขียนแบบใหม่ 100% (แนะนำ)</span></th>
                  <th className="border-l border-hairline p-4 text-center"><span className="label-tech block text-muted">Full-Turnkey BIM</span><span className="text-[11px] font-normal text-muted">ออกแบบ + ตกแต่งภายใน</span></th>
                </tr>
              </thead>
              <tbody>
                {MATRIX.map(([th, en, a, b, c]) => (
                  <tr key={th} className="border-t border-hairline">
                    <td className="p-4"><b className="block font-semibold">{th}</b><span className="text-[11.5px] text-muted">{en}</span></td>
                    <td className="border-l border-hairline p-4 text-center text-muted">{a}</td>
                    <td className="border-x-2 border-bronze bg-bronze-wash/50 p-4 text-center font-semibold">{b}</td>
                    <td className="border-l border-hairline p-4 text-center">{c}</td>
                  </tr>
                ))}
                <tr className="border-t border-hairline bg-wash">
                  <td className="p-4 font-bold">ประมาณการค่าบริการเริ่มต้น</td>
                  <td className="border-l border-hairline p-4 text-center"><b className="font-display text-[22px]">฿25,000</b><span className="block text-[11px] text-muted">ราคาเริ่มต้น</span></td>
                  <td className="border-x-2 border-b-2 border-bronze bg-bronze-wash p-4 text-center"><b className="font-display text-[22px] text-bronze-dark">฿65,000</b><span className="block text-[11px] text-muted">หรือ 220 บาท/ตร.ม.</span></td>
                  <td className="border-l border-hairline p-4 text-center"><b className="font-display text-[22px]">฿120,000</b><span className="block text-[11px] text-muted">หรือ 380 บาท/ตร.ม.</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="border-b border-hairline bg-wash-2">
        <div className="shell flex flex-col gap-3 py-5 md:flex-row md:items-center">
          <span className="grid h-12 w-12 shrink-0 place-items-center bg-ink text-bronze"><Icon name="shield" className="text-[26px]" /></span>
          <p className="flex-1"><b className="text-[16px]">การันตีใบอนุญาตก่อสร้าง (อ.1) ผ่านแน่นอน 100%</b> <span className="ml-1 bg-bronze px-1.5 text-[10px] font-bold text-ink">WARRANTY</span><br />
            <span className="text-[13px] text-muted">หากแบบของ NATBUILD ไม่ผ่านการพิจารณาจากหน่วยงานท้องถิ่น ทีมงานยินดีแก้ไขและยื่นใหม่จนผ่าน โดยไม่มีค่าใช้จ่ายเพิ่มเติม</span></p>
        </div>
      </div>

      <section id="booking" className="scroll-mt-28 py-14">
        <div className="shell grid gap-8 lg:grid-cols-[380px_1fr]">
          <div className="card self-start p-5">
            <div className="flex justify-between"><p className="label-tech text-bronze-dark">Lead Architect Profile</p><span className="bg-wash-2 px-2 text-[10px] font-semibold">ARCHI-STUDIO DIRECTOR</span></div>
            <div className="relative mt-4 aspect-[4/5] overflow-hidden">
              <Image src="/images/architect-portrait.jpg" alt="คุณพิมพ์ชนก สุวรรณวงศ์ สถาปนิกผู้อำนวยการ" fill sizes="380px" className="object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 p-4 text-white">
                <p className="label-tech text-bronze-light">Chief of Residential Design</p>
                <p className="text-[17px] font-bold">คุณพิมพ์ชนก สุวรรณวงศ์ (วส. 1420)</p>
                <p className="text-[11.5px] text-white/70">ผู้อำนวยการฝ่ายออกแบบสถาปัตยกรรม BIM 3D Architecture</p>
              </div>
            </div>
            <p className="mt-4 text-[13px] italic text-muted">“การออกแบบบ้านที่ดีไม่ได้มีแค่ความสวยงามภายนอก แต่ต้องสร้างสมดุลระหว่างงบประมาณ ความปลอดภัยของโครงสร้าง และคุณภาพชีวิตของผู้อยู่อาศัยตลอดระยะเวลาหลายสิบปี”</p>
            <ul className="mt-4 space-y-1 bg-wash p-3 text-[12px]">
              <li>• สถาปัตยกรรมศาสตรบัณฑิต จุฬาลงกรณ์มหาวิทยาลัย</li>
              <li>• สถาปนิกผู้ถือใบอนุญาตระดับวุฒิ (วส. 1420)</li>
              <li>• Autodesk Certified Professional: Revit Architecture BIM</li>
            </ul>
          </div>
          <div className="card p-6 md:p-8">
            <p className="eyebrow">Schedule a Design Discovery Session</p>
            <h2 className="mt-2 text-[26px] font-bold">นัดหมายปรึกษาสถาปนิกออนไลน์ ฟรี 30 นาที</h2>
            <p className="mt-1 text-[13.5px] text-muted">พูดคุยผ่าน Zoom หรือ LINE Video Call พร้อมแชร์หน้าจอโมเดล 3D ตัวอย่าง และวิเคราะห์ที่ดินเบื้องต้น</p>
            <LeadForm type="consult" submitLabel="ยืนยันนัดหมายปรึกษาฟรี" className="mt-6" successTitle="จองคิวปรึกษาเรียบร้อย">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field name="name" label="ชื่อ-นามสกุลผู้ติดต่อ" required autoComplete="name" placeholder="เช่น คุณสมศักดิ์ ใจดีทวีสุข" />
                <Field name="phone" label="เบอร์โทรศัพท์มือถือ" type="tel" required autoComplete="tel" placeholder="08x-xxx-xxxx" />
                <Field name="line_id" label="LINE ID (เพื่อส่งโมเดล 3D)" placeholder="ระบุ Line ID เพื่อส่งตัวอย่างแบบ" />
                <Field name="preferred_date" label="วันที่ต้องการนัด" type="date" required />
              </div>
              <fieldset className="mt-4">
                <legend className="field-label">ช่วงเวลาที่สะดวก / ประชุม ZOOM</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {["10:00 - 11:30 น.", "13:30 - 15:00 น.", "16:30 - 18:00 น."].map((s, i) => (
                    <label key={s} className="flex cursor-pointer items-center gap-2 border border-hairline bg-white p-3 text-[13px] has-[:checked]:border-ink">
                      <input type="radio" name="preferred_slot" value={s} defaultChecked={i === 0} className="radio" />{s}
                    </label>
                  ))}
                </div>
              </fieldset>
              <Field name="message" as="textarea" label="รายละเอียดหรือโจทย์ความต้องการเบื้องต้น" className="mt-4" placeholder="เช่น ที่ดินกว้าง 15 ม. ลึก 20 ม. ต้องการบ้าน 2 ชั้น 4 ห้องนอน ชอบสไตล์ Nordic เพดานสูง Double Volume..." />
            </LeadForm>
          </div>
        </div>
      </section>
    </>
  );
}
