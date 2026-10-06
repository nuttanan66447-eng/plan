import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Field, LeadForm } from "@/components/LeadForm";
import { SectionHeading } from "@/components/SectionHeading";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "รับเหมาก่อสร้างบ้าน & ตรวจรับบ้านโดยวิศวกร ร้อยเอ็ด",
  description: "รับเหมาก่อสร้างบ้านแบบ Turnkey ครบวงจร และบริการตรวจบ้านก่อนรับโอนด้วยเครื่องมือวิศวกรรม Thermal Scan, Laser Level ครอบคลุมร้อยเอ็ดและ 5 จังหวัดใกล้เคียง",
};

const PACKAGES = [
  { id: "PKG 01", key: "pkg01", type: "บ้านเดี่ยว 1 ชั้น", area: "ไม่เกิน 150 ตร.ม.", price: "฿4,500", unit: "ราคาเหมาจ่าย 2 รอบ", items: ["ตรวจรอบแรก 1: ตรวจละเอียด 300+ จุด", "ตรวจรอบที่ 2: Re-check งานแก้ Defect ซ้ำ", "เครื่องมือวัดไฟ + เครื่องสแกนความชื้น", "รายงานดิจิทัล PDF ส่งใน 24 ชม."] },
  { id: "PKG 02", key: "pkg02", type: "บ้านเดี่ยว 2 ชั้น", area: "150 - 300 ตร.ม.", price: "฿6,500", unit: "ราคาเหมาจ่าย 2 รอบ", items: ["ตรวจครบระบบ + ตรวจงานหลังคาโดรน", "กล้องจับความร้อน Fluke Thermal Scan", "โหลดวิเคราะห์ระบบไฟฟ้าโดยวิศวกรไฟฟ้า", "ดูแลงานโครงสร้างใต้หลังคาอย่างละเอียด"], featured: true },
  { id: "PKG 03", key: "pkg03", type: "บ้านหรู / คฤหาสน์", area: "300 ตร.ม. ขึ้นไป", price: "ตามพื้นที่", unit: "เริ่มต้น 8,500 - 15,000 ฿", items: ["ทีมวิศวกร 2-3 ท่านเข้าตรวจพร้อมกัน", "ตรวจระบบสระว่ายน้ำ, โซลาร์เซลล์, EV", "สแกนรอยร้าวและสภาพแวดล้อมอาคาร", "ตรวจซ้ำ 2-3 รอบตามความต้องการ"] },
  { id: "PKG 04", key: "pkg04", type: "รับเหมาสร้าง TURNKEY", area: "สร้างจริงตามแบบ 100%", price: "13.5k - 18.5k", unit: "บาท / ตารางเมตร", items: ["ฟรีแบบบ้าน 3D เมื่อเซ็นสัญญา", "ฟรีรายการถอดวัสดุและแบบ BOQ", "ทีมควบคุมงานตลอดระยะเวลาก่อสร้าง", "รับประกันโครงสร้าง 10 ปี / หลังคา 2 ปี"], dark: true },
];

const ZONES = [
  ["1. จ.ร้อยเอ็ด", "ศูนย์บริการหลัก", "อ.เมือง, เสลภูมิ, โพนทอง, ธวัชบุรี, อาจสามารถ, เกษตรวิสัย, จตุรพักตรพิมาน, สุวรรณภูมิ", "0 - 45 นาที"],
  ["2. จ.มหาสารคาม", "ฟรีค่าเดินทาง", "อ.เมืองมหาสารคาม, กันทรวิชัย, บรบือ, วาปีปทุม, เชียงยืน, นาเชือก", "35 - 60 นาที"],
  ["3. จ.กาฬสินธุ์", "บริการทุกอำเภอ", "อ.เมืองกาฬสินธุ์, ยางตลาด, กมลาไสย, ร่องคำ, ฆ้องชัย, สหัสขันธ์", "40 - 65 นาที"],
  ["4. จ.ขอนแก่น", "โซนเศรษฐกิจหลัก", "อ.เมืองขอนแก่น, บ้านไผ่, เมืองพล, หนองสองห้อง, พระยืน", "60 - 90 นาที"],
  ["5. จ.ยโสธร", "บริการทุกอำเภอ", "อ.เมืองยโสธร, คำเขื่อนแก้ว, ทรายมูล, มหาชนะชัย, ค้อวัง", "50 - 75 นาที"],
  ["6. จ.มุกดาหาร", "นัดหมายล่วงหน้า", "อ.เมืองมุกดาหาร, นิคมคำสร้อย, หนองสูง, คำชะอี", "75 - 120 นาที"],
];

export default async function TurnkeyPage({ searchParams }: { searchParams: Promise<{ pkg?: string }> }) {
  const { pkg } = await searchParams;
  const selected = PACKAGES.find((p) => p.key === pkg);

  return (
    <>
      <div className="border-b border-hairline bg-wash">
        <div className="shell flex flex-col justify-between gap-1 py-2.5 text-[11px] font-semibold tracking-[0.06em] text-muted md:flex-row">
          <span className="flex items-center gap-2 text-ink"><span className="h-1.5 w-1.5 bg-bronze" />ARCHIPLAN NORTHEAST ENGINEERING DIVISION // ROI ET OPERATIONAL HUB</span>
          <span>รหัสวิศวกรผู้ควบคุม: ภ-วฟ. 15420 • ใบอนุญาต สถ. / วศ. ครบถ้วน 100%</span>
        </div>
      </div>

      <section className="blueprint border-b border-hairline py-12">
        <div className="shell grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="chip chip-dot bg-white">โซนร้อยเอ็ด ขอนแก่น มหาสารคาม กาฬสินธุ์ ยโสธร มุกดาหาร</span>
            <h1 className="mt-5 text-[32px] font-bold leading-snug md:text-[42px]">รับเหมาก่อสร้างบ้านมาตรฐานสถาปัตย์ &amp; ตรวจรับมอบบ้านโดยวิศวกรโครงสร้าง</h1>
            <p className="mt-4 text-muted">เปลี่ยนแบบแปลน 3D และ BOQ สู่ความจริงที่ไร้ปัญหางบบานปลาย สัญญาถูกต้องตามเนื้องานจริง พร้อมบริการตรวจบ้านก่อนโอนด้วยเครื่องมือวิศวกรรมเลเซอร์และกล้องถ่ายภาพความร้อน Fluke Thermal Imaging ครบ 300+ รายการ</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#request" className="btn btn-primary"><Icon name="request_quote" /> ประเมินราคา &amp; จองคิวตรวจหน้างาน</a>
              <a href="#pricing" className="btn btn-outline"><Icon name="price_change" /> ดูแพ็กเกจบริการ</a>
            </div>
            <dl className="mt-8 grid grid-cols-2 border border-hairline bg-white sm:grid-cols-4">
              {[["100%", "ราคาตามสัญญา", "ไม่มีงบบานปลาย"], ["0", "เคสทิ้งงาน", "วิศวกรคุมหน้างานเอง"], ["300+", "เกณฑ์ตรวจ วศ.", "รายงาน Defect ใน 48 ชม."], ["6", "จังหวัดบริการ", "รัศมีบริการ 120 กม."]].map(([v, t, d], i) => (
                <div key={t} className={`flex flex-col p-4 ${i ? "border-l border-hairline" : ""} ${i === 2 ? "max-sm:border-l-0 max-sm:border-t" : ""} ${i === 3 ? "max-sm:border-t" : ""}`}>
                  <dd className="font-display text-[26px] font-bold text-bronze-dark">{v}</dd><dt className="order-2 text-[12px] font-semibold">{t}<span className="block font-normal text-muted">{d}</span></dt>
                </div>
              ))}
            </dl>
          </div>
          <div className="card relative">
            <div className="relative aspect-[4/3]"><Image src="/images/engineers-site.jpg" alt="วิศวกรและสถาปนิกตรวจแบบที่หน้างานก่อสร้าง" fill priority sizes="(max-width: 1024px) 100vw, 600px" className="object-cover" /></div>
            <span className="absolute right-3 top-3 flex items-center gap-1.5 bg-ink px-2 py-1 text-[10px] font-semibold tracking-[0.08em] text-white"><span className="h-1.5 w-1.5 animate-pulse bg-bronze" />LIVE ON-SITE AUDIT</span>
            <div className="grid grid-cols-[1fr_auto] bg-ink text-white">
              <div className="p-4"><p className="label-tech text-bronze-light">Field Inspection Log // Roi Et Site #104</p><p className="text-[13px] font-semibold">การตรวจรับงานเหล็กเสริมฐานรากและคานโครงสร้าง</p></div>
              <div className="border-l border-white/10 p-4 text-right"><p className="label-tech text-white/50">Engineering Status</p><p className="text-[15px] font-bold text-bronze">PASSED (C30/37)</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="shell">
          <SectionHeading eyebrow="01 // Architectural & Engineering Services" title="2 บริการแกนหลักเพื่อความอุ่นใจของเจ้าของบ้าน"
            aside={<p className="max-w-md text-[13px] text-muted">ไม่ว่าคุณต้องการสร้างบ้านใหม่ตามแบบอย่างแม่นยำ หรือต้องการตรวจสอบคุณภาพบ้านจากโครงการจัดสรร เรามีวิศวกรเฉพาะทางพร้อมดูแล</p>} />
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="card flex flex-col p-6">
              <div className="flex justify-between"><p className="label-tech text-muted">Service Cluster A</p><span className="bg-bronze-wash px-2 text-[10.5px] font-bold text-bronze-dark">รับประกันโครงสร้าง 10 ปี</span></div>
              <h3 className="mt-3 text-[22px] font-bold">รับเหมาก่อสร้างแบบ Turnkey ครบวงจร</h3>
              <p className="mt-1 text-[13.5px] text-muted">สร้างบ้านจากแบบ 3D และ BIM 100% ควบคุมงานโดยวิศวกรโยธาประจำไซต์ ไม่มีเหมาช่วงเถื่อน</p>
              <ul className="mt-5 space-y-3">
                {[["คุมงานโดยวิศวกรโยธาโดยตรง", "ตรวจสอบเหล็กเสริม เทคอนกรีต ทดสอบ Slump Test และแรงอัดทุกครั้ง"], ["รายงานความคืบหน้ารายสัปดาห์ (Weekly Log)", "อัปเดตผ่าน LINE ภาพถ่ายหน้างาน พร้อมเทียบสัดส่วนงาน 360 องศา"], ["สเปกวัสดุตามแบบ BOQ ชั้นนำ", "เลือกใช้แบรนด์ SCG, CPAC, TOA, COTTO, TPI ไม่เปลี่ยนสเปกโดยไม่แจ้ง"], ["สัญญาแบ่งงวดจ่ายเงินตามงานจริง 6-8 งวด", "จ่ายตามผลงานที่เสร็จจริง ไม่มีการเรียกเก็บเงินล่วงหน้าเกินงาน"]].map(([t, d]) => (
                  <li key={t} className="flex gap-3"><Icon name="check_circle" className="mt-0.5 text-bronze" /><span><b className="block text-[14px]">{t}</b><span className="text-[12.5px] text-muted">{d}</span></span></li>
                ))}
              </ul>
              <div className="mt-5 grid grid-cols-2 gap-2 text-[12px]">
                <div className="bg-wash p-3"><span className="text-muted">โครงสร้างหลัก</span><b className="block">รับประกัน 10 ปีเต็ม</b></div>
                <div className="bg-wash p-3"><span className="text-muted">งานหลังคาและรั่วซึม</span><b className="block">รับประกัน 2 ปี + เซอร์วิสฟรี</b></div>
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-hairline pt-4 mt-6">
                <span className="text-[13px] font-semibold">ค่าก่อสร้างเริ่มต้น 13,500 - 18,500 ฿/ตร.ม.</span>
                <Link href="/turnkey?pkg=pkg04#request" className="flex items-center gap-1 text-[13px] font-bold text-bronze-dark hover:underline">ปรึกษางานก่อสร้าง <Icon name="arrow_forward" /></Link>
              </div>
            </div>
            <div className="card flex flex-col p-6">
              <div className="flex justify-between"><p className="label-tech text-muted">Service Cluster B</p><span className="bg-bronze-wash px-2 text-[10.5px] font-bold text-bronze-dark">ตรวจละเอียด 300+ รายการ</span></div>
              <h3 className="mt-3 text-[22px] font-bold">บริการตรวจบ้านและอาคารก่อนรับมอบ</h3>
              <p className="mt-1 text-[13.5px] text-muted">ตรวจรับมอบโครงการหมู่บ้านจัดสรร หรือบ้านสร้างเอง โดยวิศวกรประจำ 1 ท่านพร้อมเครื่องมือวิศวกรรมระดับห้องปฏิบัติการ</p>
              <div className="relative mt-5 aspect-[16/8] overflow-hidden"><Image src="/images/inspector.jpg" alt="วิศวกรตรวจบ้านด้วยกล้องถ่ายภาพความร้อน" fill sizes="600px" className="object-cover" />
                <span className="absolute bottom-2 left-2 bg-ink px-2 py-1 text-[10px] font-semibold tracking-[0.06em] text-white">FLIR/FLUKE THERMAL SCAN &amp; 360° LASER PLUMB AUDIT</span></div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[["electrical_services", "ระบบไฟฟ้า & กราวด์", "ตรวจเช็กขั้วไฟ เบรกเกอร์ RCBO ค่าความต้านทาน"], ["water_drop", "ระบบประปา & รั่วซึม", "ทดสอบแรงดันน้ำ รั่วซึมใต้พื้น ท่อระบายน้ำทิ้ง"], ["format_paint", "สถาปัตย์ & ผิวงาน", "เลเซอร์วัดระนาบพื้น-ผนัง ระยะฉากประตูหน้าต่าง"], ["foundation", "ใต้หลังคา & โครงสร้าง", "ตรวจโครงหลังคาเหล็ก การยึดน็อต ฉนวนกันความร้อน"]].map(([i, t, d]) => (
                  <div key={t} className="flex gap-2"><Icon name={i} className="mt-0.5 text-bronze-dark" /><span><b className="block text-[13px]">{t}</b><span className="text-[11.5px] text-muted">{d}</span></span></div>
                ))}
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-hairline pt-4 mt-6">
                <span className="text-[13px] font-semibold">ตรวจบ้าน 2 รอบ เริ่มต้นเพียง 4,500 ฿</span>
                <a href="#pricing" className="flex items-center gap-1 text-[13px] font-bold text-bronze-dark hover:underline">ดูตารางราคาแพ็กเกจ <Icon name="arrow_forward" /></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-hairline bg-white py-14">
        <div className="shell">
          <SectionHeading eyebrow="02 // Scientific Instrumentation & Standards" title="เครื่องมือวิศวกรรมเฉพาะทางที่เราใช้ปฏิบัติงานจริง"
            desc="เราไม่ตรวจด้วยสายตาเพียงอย่างเดียว แต่วิเคราะห์ด้วยเครื่องมือมาตรฐานอุตสาหกรรมตามเกณฑ์มาตรฐานวิศวกรรมสถานแห่งประเทศไทย (วสท.)" />
          <div className="mt-8 grid grid-cols-2 gap-px border border-hairline bg-hairline md:grid-cols-3 lg:grid-cols-5">
            {[["straighten", "เลเซอร์ 360 องศา", "วัดระดับความลาดเอียงของพื้น ผนัง และฝ้าเพดาน", "TOLERANCE ±1.0MM"], ["thermostat", "กล้องจับความร้อน", "Fluke Thermal Camera ตรวจจับการรั่วซึมของน้ำและจุดร้อนในระบบไฟฟ้า", "INFRARED THERMOGRAPHY"], ["power", "Digital Socket Tester", "ตรวจขั้วปลั๊กไฟ สายดิน และทดสอบเครื่องตัดไฟรั่ว (RCD/RCBO 30mA)", "ELECTRICAL TRIP SAFETY"], ["humidity_percentage", "เครื่องวัดความชื้น", "Pinless Moisture Meter ตรวจความชื้นสะสมใต้พื้นไม้ลามิเนตและผนัง", "DEEP SUB-SURFACE SCAN"], ["flight", "โดรน 4K สำรวจหลังคา", "บินสำรวจหลังคาและรางน้ำ สภาพกระเบื้อง และความเสียหายที่มองไม่เห็นจากพื้น", "AERIAL ROOF DIAGNOSTIC"]].map(([i, t, d, tag]) => (
              <div key={t} className="flex flex-col bg-white p-5">
                <span className="grid h-10 w-10 place-items-center bg-ink text-bronze"><Icon name={i} /></span>
                <b className="mt-4 text-[15px]">{t}</b>
                <p className="mt-1 flex-1 text-[12.5px] text-muted">{d}</p>
                <p className="mt-3 label-tech text-subtle">{tag}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="shell">
          <SectionHeading eyebrow="03 // Operational Jurisdiction & Coverage" title="พื้นที่ให้บริการโซนร้อยเอ็ด และ 5 จังหวัดใกล้เคียง"
            aside={<span className="chip bg-white">ศูนย์ปฏิบัติการหลัก: อ.เมือง จ.ร้อยเอ็ด (ฟรีค่าเดินทาง 50 กม. แรก)</span>} />
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
            <div className="card p-4">
              <div className="flex justify-between label-tech"><span className="text-muted">Regional Hub: 16.0538° N, 103.6520° E</span><span className="text-bronze-dark">Active Deployment Zone</span></div>
              <svg viewBox="0 0 400 300" className="mt-3 w-full bg-wash-2" role="img" aria-label="แผนที่พื้นที่ให้บริการ">
                <defs><pattern id="mg" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#1e232a" strokeOpacity=".06" /></pattern></defs>
                <rect width="400" height="300" fill="url(#mg)" />
                <circle cx="200" cy="160" r="120" fill="#c59b27" fillOpacity=".07" stroke="#c59b27" strokeDasharray="4 4" />
                <circle cx="200" cy="160" r="60" fill="#c59b27" fillOpacity=".1" />
                {[["ขอนแก่น", 70, 80], ["กาฬสินธุ์", 190, 60], ["มุกดาหาร", 330, 75], ["มหาสารคาม", 100, 165], ["ยโสธร", 300, 240]].map(([n, x, y]) => (
                  <g key={n as string}><rect x={(x as number) - 4} y={(y as number) - 4} width="8" height="8" fill="#1e232a" /><text x={(x as number) + 8} y={(y as number) + 4} fontSize="11" fill="#1e232a">{n}</text></g>
                ))}
                <rect x="150" y="148" width="100" height="24" fill="#1e232a" /><rect x="156" y="157" width="6" height="6" fill="#c59b27" />
                <text x="168" y="164" fontSize="10.5" fill="#fff" fontWeight="700">ร้อยเอ็ด (HQ)</text>
              </svg>
              <p className="mt-3 flex items-center justify-between text-[12px] text-muted">ทีมวิศวกรพร้อมเดินทางถึงหน้างานภายใน 24 ชม. <span className="font-bold text-bronze-dark">NO HIDDEN DISPATCH FEE</span></p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {ZONES.map(([p, tag, d, t]) => (
                <div key={p} className="card p-4">
                  <div className="flex items-center justify-between"><b className="text-[15px]">{p}</b><span className="bg-wash-2 px-1.5 text-[10px] font-semibold">{tag}</span></div>
                  <p className="mt-2 text-[12.5px] text-muted">{d}</p>
                  <p className="mt-3 text-[11px] text-subtle">ระยะเดินทาง {t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-28 border-y border-hairline bg-white py-14">
        <div className="shell">
          <SectionHeading eyebrow="04 // Standardized Pricing Matrix" title="อัตราค่าบริการตรวจบ้าน & แพ็กเกจรับเหมาสร้างบ้าน"
            desc="ราคาโปร่งใสตามขนาดพื้นที่ ตรวจสอบครอบคลุม 2 รอบ (รอบตรวจจริง + รอบตรวจเก็บงาน Defect) พร้อมเอกสารรายงานฉบับสมบูรณ์" />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {PACKAGES.map((p) => (
              <div key={p.id} className={`relative flex flex-col border p-5 ${p.dark ? "border-ink bg-ink text-white" : p.featured ? "border-2 border-bronze bg-white" : "border-hairline bg-white"}`}>
                {p.featured && <span className="absolute -top-3 left-5 bg-bronze px-2 py-0.5 text-[10px] font-bold tracking-[0.1em] text-ink">RECOMMENDED BY ARCHITECT</span>}
                <p className={`label-tech ${p.dark ? "text-bronze-light" : "text-muted"}`}>{p.id} // {p.type}</p>
                <p className={`mt-3 text-[11px] ${p.dark ? "text-white/60" : "text-muted"}`}>พื้นที่ใช้สอย</p>
                <p className="text-[19px] font-bold">{p.area}</p>
                <p className={`mt-4 font-display text-[34px] font-extrabold leading-none ${p.featured ? "text-bronze-dark" : ""}`}>{p.price}</p>
                <p className={`text-[11.5px] ${p.dark ? "text-white/60" : "text-muted"}`}>{p.unit}</p>
                <ul className={`mt-5 flex-1 space-y-2 border-t pt-4 text-[12.5px] ${p.dark ? "border-white/15" : "border-hairline"}`}>
                  {p.items.map((it) => <li key={it} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 bg-bronze" />{it}</li>)}
                </ul>
                <Link href={`/turnkey?pkg=${p.key}#request`} scroll={false} className={`btn btn-sm mt-5 ${p.dark ? "btn-bronze" : p.featured ? "btn-bronze" : "btn-primary"}`}>
                  {p.dark ? "ประเมินราคาสร้างบ้าน" : `จองคิวตรวจ ${p.id}`}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="request" className="scroll-mt-28 py-14">
        <div className="shell grid gap-8 lg:grid-cols-[360px_1fr]">
          <div className="flex flex-col gap-4">
            <div className="card p-5">
              <p className="label-tech text-bronze-dark">Northeast Direct Dispatch</p>
              <h3 className="mt-1 text-[19px] font-bold">ติดต่อด่วนกับวิศวกรผู้ดูแลประจำศูนย์ร้อยเอ็ด</h3>
              <p className="mt-1 text-[12.5px] text-muted">ต้องการปรึกษาด่วนเรื่องรอยร้าว ดินทรุด หรือต้องการให้วิศวกรประเมินราคาหน้างาน</p>
              <ul className="mt-4 space-y-3 text-[13px]">
                <li className="flex gap-3"><Icon name="engineering" className="text-bronze-dark" /><span>สายตรงวิศวกรควบคุม (คุณวรวิทย์ วศ.)<b className="block">{SITE.mobile}</b></span></li>
                <li className="flex gap-3"><Icon name="call" className="text-bronze-dark" /><span>ศูนย์บริการลูกค้าสำนักงานใหญ่<b className="block">{SITE.roiEtPhone} (ร้อยเอ็ด)</b></span></li>
                <li className="flex gap-3"><Icon name="chat" className="text-bronze-dark" /><span>LINE Official ส่งรูปหน้างาน<a href={SITE.lineHref} className="block font-bold text-bronze-dark hover:underline">{SITE.line}</a></span></li>
              </ul>
            </div>
            <div className="border border-hairline bg-wash-2 p-5">
              <p className="flex items-center gap-2 text-[14px] font-bold"><Icon name="policy" className="text-bronze-dark" />นโยบายมาตรฐานวิศวกรรม ArchiPlan</p>
              <p className="mt-2 text-[12.5px] text-muted">ทุกงานตรวจสอบและงานควบคุมการก่อสร้าง ดำเนินการโดยวิศวกรที่มีใบอนุญาตประกอบวิชาชีพวิศวกรรมควบคุม (กว.) ถูกต้องตามกฎหมาย มีประกันความรับผิดชอบวิชาชีพสูงสุด 1 ล้านบาท</p>
            </div>
          </div>
          <div className="card p-6 md:p-8">
            <h2 className="text-[22px] font-bold">ฟอร์มประเมินราคา &amp; ขอนัดหมายเข้าตรวจหน้างาน</h2>
            <p className="text-[13px] text-muted">กรอกข้อมูลเพื่อให้วิศวกรประเมินราคาและจัดคิวทีมงานภายใน 12 ชั่วโมงทำการ</p>
            {selected && <p className="mt-3 flex items-center gap-2 border border-bronze/40 bg-bronze-wash px-3 py-2 text-[13px]"><Icon name="inventory_2" className="text-bronze-dark" /> แพ็กเกจที่เลือก: <b>{selected.id} — {selected.type}</b></p>}
            <LeadForm type={selected?.key === "pkg04" ? "turnkey" : "inspection"} hidden={{ service_package: selected ? `${selected.id} ${selected.type}` : null }} submitLabel="ส่งข้อมูลเพื่อประเมินราคาและตรวจสอบคิวว่างทันที" className="mt-6" successTitle="ได้รับคำขอแล้ว">
              <fieldset>
                <legend className="field-label">1. เลือกประเภทบริการที่ต้องการ *</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {["ตรวจบ้านก่อนรับโอน", "ตรวจระหว่างก่อสร้าง", "รับเหมาก่อสร้าง Turnkey"].map((s, i) => (
                    <label key={s} className="flex cursor-pointer items-center gap-2 border border-hairline bg-white p-3 text-[13px] has-[:checked]:border-ink">
                      <input type="radio" name="service_type" value={s} defaultChecked={selected?.key === "pkg04" ? i === 2 : i === 0} className="radio" />{s}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field name="province" as="select" label="2. จังหวัดที่ตั้งโครงการ" required options={["ร้อยเอ็ด (ฟรีค่าเดินทาง)", "มหาสารคาม", "กาฬสินธุ์", "ขอนแก่น", "ยโสธร", "มุกดาหาร", "อื่นๆ"]} />
                <Field name="district" label="อำเภอ / ตำบล" placeholder="เช่น อ.เสลภูมิ, โครงการ..." />
                <Field name="area_sqm" label="พื้นที่ใช้สอยโดยประมาณ (ตร.ม.)" type="number" min="0" placeholder="เช่น 180" />
                <Field name="house_status" as="select" label="สถานะแบบบ้าน" options={["มีแบบสถาปัตย์และ BOQ พร้อมแล้ว", "มีแบบแล้ว ยังไม่มี BOQ", "ยังไม่มีแบบ ต้องการให้ออกแบบ", "บ้านสร้างเสร็จแล้ว (ตรวจรับ)"]} />
                <Field name="name" label="ชื่อ-นามสกุล" required autoComplete="name" placeholder="คุณสมชาย..." />
                <Field name="phone" label="เบอร์โทรศัพท์มือถือ" type="tel" required autoComplete="tel" placeholder="08x-xxx-xxxx" />
                <Field name="line_id" label="LINE ID (สำหรับส่งรายงาน)" placeholder="Line ID ของท่าน" />
                <Field name="preferred_date" label="วันที่ต้องการให้เข้าตรวจหน้างาน" type="date" />
              </div>
            </LeadForm>
          </div>
        </div>
      </section>
    </>
  );
}
