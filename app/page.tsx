import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PlanCard } from "@/components/PlanCard";
import { QuickEstimator } from "@/components/QuickEstimator";
import { SectionHeading } from "@/components/SectionHeading";
import { featuredPlans, getPlan, planStats } from "@/lib/data";
import { baht, num } from "@/lib/format";

export const revalidate = 300;

const STYLES = [
  { key: "", label: "ทั้งหมด" },
  { key: "nordic", label: "Nordic Modern" },
  { key: "japandi", label: "Japandi Courtyard" },
  { key: "tropical", label: "Tropical Villa" },
  { key: "narrow", label: "ที่ดินหน้าแคบ", feature: true },
];

const STEPS = [
  { n: "01", icon: "view_in_ar", title: "เลือกแบบ & สำรวจ 3D", body: "สำรวจแบบบ้านผ่านระบบ 3D Viewer หมุนดูทุกมุม ตรวจสอบระยะ และความสูงฝ้าเพดานจริงก่อนตัดสินใจ", note: "สร้าง 3 มิติได้ 100% ไร้ข้อผิดพลาด" },
  { n: "02", icon: "edit_location_alt", title: "ส่งโฉนดที่ดินเพื่อปรับผัง", body: "สถาปนิกปรับผังบ้านให้เข้ากับที่ดิน (Site Plan) ทิศทางแดด ลม และระยะร่นตามกฎหมายของท้องถิ่นของคุณ", note: "ปรับผังที่ดินฟรีไม่มีค่าใช้จ่าย" },
  { n: "03", icon: "local_shipping", title: "รับเล่มแบบพิมพ์เขียว & BOQ", body: "รับเล่มแบบพิมพ์เขียว A3 จำนวน 5 ชุด พร้อมลายเซ็นสถาปนิก-วิศวกร จัดส่งถึงบ้านภายใน 3-5 วันทำการ", note: "จัดส่งด่วนทั่วประเทศ • ไม่มีค่าจัดส่ง" },
];

export default async function Home() {
  const [plans, stats, hero] = await Promise.all([featuredPlans(3), planStats(), getPlan("AP-MODERN-04")]);

  return (
    <>
      {/* Project sheet strip */}
      <div className="border-b border-hairline bg-wash">
        <div className="shell flex gap-8 overflow-x-auto py-2.5 text-[10.5px] font-semibold tracking-[0.1em] text-muted scrollbar-none">
          <span className="flex shrink-0 items-center gap-2 text-ink"><span className="h-1.5 w-1.5 bg-bronze" />PROJECT SHEET: MASTER CATALOG {new Date().getFullYear()}</span>
          <span className="shrink-0">SCALE 1:100 / METRIC BIM v4.2</span>
          <span className="shrink-0">AUTODESK REVIT • IFC • PDF A3 STAMPED</span>
          <span className="shrink-0 text-bronze-dark">STATUS: PERMIT READY (100% PASS)</span>
        </div>
      </div>

      {/* Hero */}
      <section className="blueprint border-b border-hairline">
        <div className="shell grid items-center gap-10 py-12 lg:grid-cols-[1.05fr_1fr] lg:py-16">
          <div className="animate-fade-up">
            <p className="chip"><Icon name="view_in_ar" className="text-bronze" /> ระบบจำลองอาคาร 3 มิติ Interactive Real-Time</p>
            <h1 className="mt-5 text-[34px] font-bold leading-[1.25] tracking-tight md:text-[48px]">
              แบบบ้านโมเดิร์นมาตรฐาน <span className="text-bronze-dark">พร้อมยื่นขออนุญาต</span>ก่อสร้าง และพรีวิว 3 มิติ หมุนสำรวจได้ 360 องศา
            </h1>
            <p className="mt-5 max-w-xl text-[15.5px] leading-7 text-muted">
              ชุดเอกสารเขียนแบบก่อสร้างฉบับสมบูรณ์ ประกอบด้วยแบบสถาปัตยกรรมครบชุด รายการคำนวณและแบบวิศวกรรมโครงสร้างโดยวุฒิวิศวกร (วศ.)
              งานระบบสุขาภิบาล-ไฟฟ้า (MEP) พร้อมเล่มถอดรายการวัสดุและประมาณราคา BOQ อัปเดตราคาตลาดปัจจุบัน
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/plans" className="btn btn-primary"><Icon name="view_in_ar" /> ดูแบบบ้าน 3D ทั้งหมด</Link>
              <Link href="/custom-design" className="btn btn-outline"><Icon name="edit_note" /> ประเมินราคารับเขียนแบบใหม่</Link>
            </div>
            <dl className="mt-9 grid max-w-lg grid-cols-3 border border-hairline bg-white">
              {[
                ["450+", "บ้านสร้างจริงทั่วไทย"],
                ["100%", "รับรองผ่านขออนุญาต"],
                ["สถ. / วศ.", "วิศวกร-สถาปนิกเซ็นสด"],
              ].map(([v, l], i) => (
                <div key={l} className={`flex flex-col p-4 ${i ? "border-l border-hairline" : ""}`}>
                  <dt className="order-2 text-[11px] text-muted">{l}</dt>
                  <dd className="font-display text-[22px] font-bold text-bronze-dark">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {hero && (
            <div className="card relative animate-fade-up">
              <div className="flex items-center justify-between bg-ink px-4 py-2 text-[10.5px] font-semibold tracking-[0.08em] text-white">
                <span>MODEL {hero.code} (PREMIUM BIM)</span>
                <span className="text-white/60">ROTATION: 045° NE • ELEV: +1.20M</span>
              </div>
              <Link href={`/plans/${hero.code}`} className="group relative block aspect-[16/10] overflow-hidden">
                <Image src={hero.image} alt={hero.name_en} fill priority sizes="(max-width: 1024px) 100vw, 640px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute right-3 top-3 flex items-center gap-1.5 bg-ink/90 px-2 py-1 text-[10px] font-semibold tracking-[0.08em] text-white">
                  <Icon name="view_in_ar" className="text-bronze" /> 3D CAD / BIM INTERACTIVE
                </span>
                <span className="absolute left-3 top-3 flex flex-col gap-1 text-[10px] font-semibold">
                  {hero.floor_areas.map((a, i) => <span key={i} className="bg-white/90 px-2 py-1">FL {i + 1} : {a} SQ.M.</span>)}
                </span>
              </Link>
              <div className="grid grid-cols-2 md:grid-cols-4">
                {[
                  ["พื้นที่ใช้สอย", `${num(hero.area_sqm)} ตร.ม.`],
                  ["ห้องนอน / น้ำ", `${hero.bedrooms} นอน • ${hero.bathrooms} น้ำ`],
                  ["ที่ดินขั้นต่ำ", `${hero.land_width} x ${hero.land_depth} ม.`],
                ].map(([l, v]) => (
                  <div key={l} className="border-r border-t border-hairline p-3">
                    <p className="text-[10px] text-muted">{l}</p>
                    <p className="text-[14px] font-bold">{v}</p>
                  </div>
                ))}
                <div className="border-t border-hairline bg-bronze p-3">
                  <p className="text-[10px] text-ink/70">ราคาชุดแบบพิมพ์เขียว</p>
                  <p className="text-[16px] font-bold">{baht(hero.price)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Catalogue preview */}
      <section className="py-16">
        <div className="shell">
          <SectionHeading
            eyebrow="Architectural Blueprint Collections"
            title="คลังแบบบ้านสถาปัตยกรรมพร้อมก่อสร้าง"
            desc="คัดสรรแบบบ้านพักอาศัยที่คำนึงถึงทิศทางลม แดด และโครงสร้างประหยัดพลังงาน ผ่านการคำนวณมาตรฐานวิศวกรรมสถาน"
            aside={
              <div className="flex flex-wrap gap-2">
                {STYLES.map((s) => (
                  <Link key={s.label} href={s.key ? `/plans?${s.feature ? "features" : "style"}=${s.key}` : "/plans"} className={`chip hover:border-ink ${!s.key ? "chip-active" : ""}`}>
                    {s.label}{!s.key && ` (${stats.total})`}
                  </Link>
                ))}
              </div>
            }
          />
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((p, i) => <PlanCard key={p.id} plan={p} priority={i < 2} />)}
          </div>
          <div className="mt-6 flex flex-col items-start justify-between gap-4 border border-hairline bg-white p-5 md:flex-row md:items-center">
            <p className="flex items-start gap-3 text-[14px]">
              <span className="grid h-10 w-10 shrink-0 place-items-center bg-bronze-wash text-bronze-dark"><Icon name="verified_user" /></span>
              <span><b>การันตีแบบผ่านการอนุญาต ยินดีปรับแก้แบบฟรี 100%</b><br />
                <span className="text-muted">หากแบบมีปัญหาไม่ผ่านการพิจารณาของ อบต./เทศบาล ทีมสถาปนิกพร้อมปรับแก้และยื่นใหม่ให้โดยไม่มีค่าใช้จ่าย</span></span>
            </p>
            <Link href="/plans" className="btn btn-primary btn-sm shrink-0">ดูแบบบ้านทั้งหมด <Icon name="arrow_forward" /></Link>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="border-y border-hairline bg-white py-16">
        <div className="shell grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Smart BIM Accuracy</p>
            <h2 className="mt-3 text-[28px] font-bold leading-snug md:text-[36px]">ทำไมแบบบ้าน NATBUILD จึงประหยัดงบก่อสร้างได้จริง</h2>
            <p className="mt-4 text-muted">
              เราใช้กระบวนการออกแบบด้วยระบบ BIM (Building Information Modeling) เพื่อตรวจสอบจุดขัดแย้งระหว่างงานโครงสร้างและงานระบบก่อนเริ่มสร้างจริง
              ลดการทุบรื้อแก้ไขหน้างาน ถอดปริมาณวัสดุได้แม่นยำ
            </p>
            <ul className="mt-6 space-y-3">
              {[
                ["ลูกค้าไม่ต้องทุบงานแก้ไขโครงสร้าง (Zero Clash)", "โมเดลตรวจจุดชนระหว่างคาน ท่อ และสายไฟก่อนก่อสร้าง"],
                ["ถอดปริมาณวัสดุแม่นยำถึง 99.5%", "เล่ม BOQ ใช้เปรียบเทียบใบเสนอราคาผู้รับเหมาได้ทันที"],
                ["ดีไซน์ประหยัดพลังงานระยะยาว", "วางผังตามทิศแดด-ลม ลดภาระเครื่องปรับอากาศ"],
              ].map(([t, d]) => (
                <li key={t} className="flex gap-3 border border-hairline bg-wash p-4">
                  <Icon name="check_circle" className="text-[22px] text-bronze" />
                  <span><b className="block text-[14.5px]">{t}</b><span className="text-[13px] text-muted">{d}</span></span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="relative aspect-[16/10] overflow-hidden border border-hairline">
              <Image src="/images/section-cutaway.jpg" alt="ภาพตัด 3D แสดงโครงสร้างภายในบ้าน" fill sizes="(max-width: 1024px) 100vw, 640px" className="object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-5 text-white">
                <span className="bg-bronze px-2 py-0.5 text-[10px] font-bold tracking-widest text-ink">SECTION DETAIL</span>
                <p className="mt-2 text-[16px] font-bold">มุมมองผ่าตัดโครงสร้างชั้นและระดับฝ้าเพดานจริง</p>
                <p className="text-[12px] text-white/70">ระยะความสูงฝ้า Clear Height ชั้นล่าง 3.00 ม. ชั้นบน 2.80 ม.</p>
              </div>
            </div>
            <div className="grid grid-cols-3 border-x border-b border-hairline">
              {[["approval", "พร้อมยื่น อ.1", "เอกสารครบตามกฎหมายควบคุมอาคาร"], ["receipt_long", "เล่ม BOQ ละเอียด", "แยกค่าวัสดุและค่าแรงทุกรายการ"], ["3d_rotation", "3D ผ่านมือถือ", "เปิดดูโมเดลได้ทุกที่ ทุกเวลา"]].map(([i, t, d], k) => (
                <div key={t} className={`p-4 ${k ? "border-l border-hairline" : ""}`}>
                  <Icon name={i} className="text-[22px] text-bronze-dark" />
                  <p className="mt-2 text-[13.5px] font-bold">{t}</p>
                  <p className="text-[11.5px] text-muted">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="blueprint-dark py-16 text-white">
        <div className="shell">
          <SectionHeading dark eyebrow="Step-by-step workflow" title="ขั้นตอนสั่งซื้อแบบและดำเนินการยื่นขออนุญาต"
            aside={<p className="max-w-sm text-[13px] text-white/60">กระบวนการรวดเร็ว มาตรฐานวิชาชีพ ได้รับเล่มแบบพร้อมลายเซ็นสถาปนิกและวิศวกรภายใน 3-5 วันทำการ</p>} />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="border border-white/10 bg-white/[0.03] p-6">
                <div className="flex items-start justify-between">
                  <span className="font-display text-[34px] font-bold text-bronze">{s.n}</span>
                  <Icon name={s.icon} className="text-[24px] text-white/40" />
                </div>
                <h3 className="mt-3 text-[18px] font-bold">{s.title}</h3>
                <p className="mt-2 text-[13.5px] text-white/60">{s.body}</p>
                <p className="mt-5 flex items-center gap-2 text-[11px] font-semibold text-bronze-light"><span className="h-1.5 w-1.5 bg-bronze" /> {s.note}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-6 text-[12px] text-white/70">
            {[["verified", "สภาสถาปนิก (Architect Council of Thailand)"], ["engineering", "สภาวิศวกร (Council of Engineers)"], ["thumb_up", "คะแนนความพึงพอใจลูกค้า 4.9/5 (รีวิว 380+ รายการ)"], ["gavel", "ถูกต้องตาม พ.ร.บ. ควบคุมอาคาร 2522"]].map(([i, t]) => (
              <span key={t} className="flex items-center gap-2"><Icon name={i} className="text-bronze" />{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Custom design + estimator */}
      <section className="py-16">
        <div className="shell grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Custom Architectural Service</p>
            <h2 className="mt-3 text-[28px] font-bold leading-snug md:text-[36px]">มีที่ดินเฉพาะ หรือต้องการออกแบบบ้านใหม่ตามฟังก์ชันของคุณ?</h2>
            <p className="mt-4 text-muted">
              ทีมสถาปนิก NATBUILD ให้บริการออกแบบบ้านเฉพาะบุคคล (Custom House Design) วางผังตามขนาดที่ดิน งบประมาณ และไลฟ์สไตล์ พร้อมพรีวิวโมเดล 3 มิติ
              และทัวร์เสมือนจริงก่อนเริ่มเขียนแบบก่อสร้าง
            </p>
            <ul className="mt-6 space-y-2 text-[14px]">
              <li className="flex items-center gap-2"><Icon name="schedule" className="text-bronze-dark" /> ระยะเวลาออกแบบ 30-45 วัน รวมการแก้ไขแบบ 3 ครั้ง</li>
              <li className="flex items-center gap-2"><Icon name="video_call" className="text-bronze-dark" /> ประชุมออนไลน์ผ่าน Zoom พร้อมแชร์โมเดล 3D</li>
            </ul>
            <Link href="/custom-design" className="btn btn-outline mt-7">ดูแพ็กเกจรับออกแบบ <Icon name="arrow_forward" /></Link>
          </div>
          <QuickEstimator />
        </div>
      </section>
    </>
  );
}
