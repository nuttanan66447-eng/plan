import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BeforeAfter } from "@/components/BeforeAfter";
import { Icon } from "@/components/Icon";
import { Panorama } from "@/components/Panorama";
import { SectionHeading } from "@/components/SectionHeading";
import { RatingSummary, ReviewCards } from "@/components/ReviewList";
import { ReviewForm } from "@/components/ReviewForm";
import { allPlanCodes, listProjects, listReviews } from "@/lib/data";
import { num, thaiDate } from "@/lib/format";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "ผลงานบ้านสร้างจริง ตรงตามแบบ 3D และรีวิวเจ้าของบ้าน",
  description: "ผลงานบ้านสร้างเสร็จจริง 100% ตรงตามแบบ 3D BIM ในจังหวัดร้อยเอ็ดและภาคอีสาน พร้อมรีวิวจากเจ้าของบ้าน ภาพก่อน-หลังก่อสร้าง และทัวร์ 360°",
};


export default async function PortfolioPage({ searchParams }: { searchParams: Promise<{ district?: string }> }) {
  const { district } = await searchParams;
  const [projects, reviews, planCodes] = await Promise.all([listProjects(), listReviews(), allPlanCodes()]);
  const featured = projects.find((p) => p.featured) ?? projects[0];
  const districts = [...new Set(projects.map((p) => p.district))];
  const grid = projects.filter((p) => p.id !== featured?.id && (!district || p.district === district));

  return (
    <>
      <section className="blueprint-dark py-14 text-white">
        <div className="shell">
          <span className="chip border-white/20 bg-white/5 text-white"><span className="h-1.5 w-1.5 bg-bronze" />ARCHIPLAN FIELD RECORD // ROI ET &amp; ISAN REGION</span>
          <h1 className="mt-5 max-w-4xl text-[32px] font-bold leading-snug md:text-[46px]">
            ผลงานบ้านสร้างเสร็จจริง 100% <span className="text-bronze">ตรงตามแบบ 3D</span> และรีวิวจากเจ้าของบ้านใน จ.ร้อยเอ็ด
          </h1>
          <p className="mt-4 max-w-3xl text-white/65">รวมผลงานบ้านพักอาศัยที่ส่งมอบแล้ว ควบคุมงานโดยวิศวกรโยธา ตรวจสอบด้วยมาตรฐาน BOQ ไม่ทิ้งงาน ไม่เพิ่มเงินระหว่างทาง พร้อมรับประกันโครงสร้าง 10 ปีเต็ม</p>
          <div className="mt-8 grid grid-cols-2 gap-px border border-white/10 bg-white/10 lg:grid-cols-4">
            {[["100%", "ส่งมอบตรงเวลา", "On-Time Delivery", "VERIFIED"], ["0% Overrun", "งบไม่บานปลาย", "คุมงบประมาณตาม BOQ", "STRICT_BQ"], ["10 ปีเต็ม", "รับประกันโครงสร้าง", "ครอบคลุมเสาเข็ม ฐานราก คาน", "GUARANTEE"], ["48+ หลัง", "สร้างเสร็จใน จ.ร้อยเอ็ด", "กระจายทั่วทุกอำเภอ", "COMPLETED"]].map(([v, t, d, tag]) => (
              <div key={t} className="bg-ink p-5">
                <div className="flex flex-wrap-reverse items-start justify-between gap-x-2"><p className="font-display text-[22px] font-bold md:text-[26px]">{v}</p><span className="text-[9.5px] font-bold tracking-[0.1em] text-bronze">{tag}</span></div>
                <p className="text-[13px] font-semibold">{t}</p><p className="text-[11.5px] text-white/50">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {featured && (
        <section className="py-14">
          <div className="shell">
            <p className="eyebrow">Featured Real Completion // โครงการแนะนำล่าสุด</p>
            <div className="mt-2 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div><h2 className="text-[26px] font-bold md:text-[32px]">{featured.title} (รหัส {featured.code})</h2><p className="text-[13.5px] text-muted">{featured.district} • {featured.province} • ส่งมอบ {thaiDate(featured.handover_on, { month: "long", year: "numeric" })}</p></div>
              <span className="flex items-center gap-1.5 bg-[#e9f5ee] px-3 py-1.5 text-[12px] font-semibold text-success"><Icon name="verified" /> ส่งมอบสมบูรณ์ เข้าอยู่อาศัยแล้ว</span>
            </div>
            <div className="card mt-6 grid lg:grid-cols-[1.5fr_1fr]">
              {featured.before_image ? <BeforeAfter before={featured.before_image} after={featured.image} beforeLabel="งานโครงสร้าง คสล." afterLabel="สร้างเสร็จ 100%" /> :
                <div className="relative aspect-[16/10]"><Image src={featured.image} alt={featured.title} fill sizes="760px" className="object-cover" /></div>}
              <div className="flex flex-col p-6">
                <div className="grid grid-cols-2 gap-2">
                  {[["พื้นที่ใช้สอย", `${num(featured.area_sqm ?? 0)} ตร.ม.`], ["ห้องนอน / น้ำ", `${featured.bedrooms} นอน ${featured.bathrooms} น้ำ`], ["งบก่อสร้างจริง", `${featured.budget_million} ลบ.`], ["ไฮไลต์", featured.highlight ?? "-"]].map(([l, v]) => (
                    <div key={l} className="bg-wash p-3"><p className="text-[10.5px] text-muted">{l}</p><p className="text-[14.5px] font-bold">{v}</p></div>
                  ))}
                </div>
                <ul className="mt-4 space-y-2 text-[12.5px]">
                  {["สุ่มทดสอบคอนกรีต Slump Test ทุกงวด ผลกำลังอัด 280 ksc ผ่าน", "ตรวจระดับพื้นด้วย Laser Level ระนาบ 0 มม. ไร้คลื่นสะดุด", "ตรวจ Thermal Scan หาจุดรั่วซึมและความร้อนก่อนส่งมอบ"].map((t) => (
                    <li key={t} className="flex gap-2"><Icon name="check_circle" className="text-bronze" />{t}</li>
                  ))}
                </ul>
                {featured.quote && (
                  <blockquote className="mt-5 border-l-2 border-bronze bg-wash p-4">
                    <p className="text-bronze">★★★★★</p>
                    <p className="mt-1 text-[13px] italic">“{featured.quote}”</p>
                    <footer className="mt-2 text-[12px] font-semibold">— {featured.quote_by}</footer>
                  </blockquote>
                )}
                <div className="mt-auto flex gap-2 pt-5">
                  {featured.plan_code && <Link href={`/plans/${featured.plan_code}`} className="btn btn-primary btn-sm flex-1"><Icon name="view_in_ar" /> ดูแบบบ้าน {featured.plan_code}</Link>}
                  <a href="#tour" className="btn btn-outline btn-sm"><Icon name="360" /> ทัวร์ 360°</a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="border-y border-hairline bg-white py-14">
        <div className="shell">
          <SectionHeading eyebrow="Portfolio Archive // ภาคสนามร้อยเอ็ด" title="โครงการก่อสร้างจริงล่าสุดในอำเภอต่างๆ"
            desc="สร้างจริงโดย ArchiPlan Studio ทุกหลังผ่านการทดสอบคอนกรีตและการตรวจสอบความร้อนก่อนส่งมอบ"
            aside={
              <div className="flex flex-wrap gap-1.5">
                <Link href="/portfolio" scroll={false} className={`chip ${!district ? "chip-active" : "hover:border-ink"}`}>ทั้งหมด</Link>
                {districts.map((d) => <Link key={d} href={`/portfolio?district=${encodeURIComponent(d)}`} scroll={false} className={`chip ${district === d ? "chip-active" : "hover:border-ink"}`}>{d}</Link>)}
              </div>
            } />
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {grid.map((p) => (
              <article key={p.id} className="card card-hover flex flex-col">
                <div className="relative aspect-[16/10]">
                  <Image src={p.image} alt={p.title} fill sizes="(max-width: 768px) 100vw, 420px" className="object-cover" />
                  <span className="absolute left-3 top-3 flex items-center gap-1 bg-ink px-2 py-1 text-[10.5px] font-semibold text-white"><Icon name="location_on" className="text-bronze" />{p.district}</span>
                  <span className="absolute right-3 top-3 bg-success px-2 py-1 text-[10.5px] font-semibold text-white">สร้างเสร็จ 100%</span>
                  <span className="absolute bottom-3 right-3 bg-white/90 px-2 py-0.5 text-[10.5px] font-semibold">สไตล์ {p.style_label}</span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex justify-between text-[11px]"><span className="label-tech text-muted">รหัส: {p.code}</span><span className="font-semibold text-bronze-dark">{p.highlight}</span></div>
                  <h3 className="mt-2 text-[17px] font-bold">{p.title}</h3>
                  <p className="mt-1 text-[12.5px] text-muted">{p.description}</p>
                  <div className="tech-strip mt-4 bg-wash">
                    <div><p className="text-[10px] text-muted">พื้นที่ใช้สอย</p><p className="text-[14px] font-bold">{num(p.area_sqm ?? 0)} ตร.ม.</p></div>
                    <div><p className="text-[10px] text-muted">ห้องนอน / น้ำ</p><p className="text-[14px] font-bold">{p.bedrooms} นอน {p.bathrooms} น้ำ</p></div>
                    <div><p className="text-[10px] text-muted">งบก่อสร้างจริง</p><p className="text-[14px] font-bold">{p.budget_million} ลบ.</p></div>
                  </div>
                  {p.quote && <p className="mt-4 text-[12.5px] italic text-ink-3">“{p.quote}”<span className="mt-1 block not-italic text-muted">— {p.quote_by}</span></p>}
                  <div className="mt-auto flex items-center justify-between border-t border-hairline pt-3 text-[11.5px] mt-4">
                    <span className="text-muted">ตรวจรับมอบเมื่อ: {thaiDate(p.handover_on)}</span>
                    {p.plan_code && <Link href={`/plans/${p.plan_code}`} className="font-bold text-bronze-dark hover:underline">ดูแบบ {p.plan_code} →</Link>}
                  </div>
                </div>
              </article>
            ))}
            {!grid.length && <p className="card col-span-full p-8 text-center text-muted">ยังไม่มีผลงานในพื้นที่นี้</p>}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="shell">
          <SectionHeading align="center" eyebrow="เสียงจริงจากผู้พักอาศัยจริงในจังหวัดร้อยเอ็ด" title="รีวิวความประทับใจจากเจ้าของบ้าน"
            desc="ความสุขและความมั่นใจของลูกค้า คือตัวชี้วัดความสำเร็จในการควบคุมงานก่อสร้างของ ArchiPlan Studio" />
          {featured?.quote && (
            <div className="mt-8 grid overflow-hidden border border-ink bg-ink text-white md:grid-cols-[340px_1fr]">
              <div className="relative min-h-[280px]"><Image src="/images/happy-owners.jpg" alt="เจ้าของบ้านยืนหน้าบ้านที่สร้างเสร็จ" fill sizes="340px" className="object-cover" />
                <span className="absolute bottom-3 left-3 flex items-center gap-1 bg-bronze px-2 py-1 text-[10.5px] font-bold text-ink"><Icon name="key" /> ส่งมอบกุญแจเรียบร้อย</span></div>
              <div className="flex flex-col justify-center p-8">
                <p className="text-bronze">★★★★★ <span className="ml-1 text-[12px] text-white/60">10/10 คะแนนความพึงพอใจ</span></p>
                <p className="mt-3 text-[19px] font-semibold leading-relaxed md:text-[22px]">“{featured.quote}”</p>
                <p className="mt-5 font-bold">{featured.quote_by}</p>
                <p className="text-[12.5px] text-bronze-light">เจ้าของ{featured.title} ({featured.district})</p>
              </div>
            </div>
          )}
          <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
            <RatingSummary reviews={reviews} />
            <a href="#write-review" className="btn btn-outline btn-sm"><Icon name="rate_review" /> เขียนรีวิวของคุณ</a>
          </div>
          <div className="mt-5"><ReviewCards reviews={reviews} /></div>

          <div id="write-review" className="card mt-10 grid scroll-mt-28 gap-8 p-6 md:p-8 lg:grid-cols-[320px_1fr]">
            <div>
              <p className="eyebrow">Share Your Experience</p>
              <h3 className="mt-2 text-[22px] font-bold">เคยใช้บริการ ArchiPlan? เขียนรีวิวให้เราหน่อย</h3>
              <p className="mt-2 text-[13.5px] text-muted">รีวิวของคุณช่วยให้ครอบครัวอื่นตัดสินใจสร้างบ้านได้ง่ายขึ้น และช่วยให้เราพัฒนาบริการให้ดียิ่งขึ้น</p>
            </div>
            <ReviewForm plans={planCodes} />
          </div>
        </div>
      </section>

      <section id="tour" className="scroll-mt-28 border-y border-hairline bg-white py-14">
        <div className="shell">
          <SectionHeading eyebrow="360° Virtual Site Tour" title={`ภาพถ่ายหน้างานก่อสร้าง 360° ${featured?.code ?? ""}`} desc="บันทึกภาพถ่ายโดยวิศวกรโยธาประจำโครงการ ณ วันส่งมอบงาน - รับรองความตรงปก 100%" />
          <div className="mt-6"><Panorama src="/images/interior-360.jpg" label="ภาพถ่าย 360 องศาภายในบ้านที่ส่งมอบแล้ว" points={["ห้องโถง Living 360°", "โถงบันได & Double Volume", "ห้องนอนใหญ่ Master Bedroom", "ภายนอกรอบตัวบ้าน & สวน"]} /></div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[["window", "กระจกฉนวน Insulated Glass", "ตัดเสียงรบกวน 85% กันความร้อนเข้าสู่ห้องโถง"], ["foundation", "คาน คสล. ไร้รอยร้าว", "ตรวจสอบกำลังอัดคอนกรีตมาตรฐาน 28 วัน ผ่าน 100%"], ["straighten", "ตรวจระดับพื้น Laser Level", "ปูพื้นเอ็นจิเนียร์ไม้สักระนาบ 0 มม. ไร้คลื่นสะดุด"]].map(([i, t, d]) => (
              <div key={t} className="flex gap-3 border border-hairline p-4"><Icon name={i} className="text-[22px] text-bronze-dark" /><span><b className="block text-[13.5px]">{t}</b><span className="text-[12px] text-muted">{d}</span></span></div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="shell">
          <div className="grid items-center gap-6 border border-ink bg-bronze p-8 md:grid-cols-[1fr_auto]">
            <div>
              <span className="bg-ink px-2 py-1 text-[10.5px] font-bold tracking-[0.06em] text-white">นัดพบสถาปนิกที่สำนักงานร้อยเอ็ด หรือ ปรึกษาออนไลน์</span>
              <h2 className="mt-3 text-[26px] font-bold text-ink md:text-[32px]">มีที่ดินในร้อยเอ็ดหรืออีสาน? เริ่มต้นวางแผนสร้างบ้านอย่างถูกต้อง</h2>
              <p className="mt-2 text-[14px] text-ink/75">รับคำปรึกษาฟรีเรื่องการวางทิศทางแดดลม การประเมินงบประมาณก่อสร้างเบื้องต้น พร้อมตรวจสอบเงื่อนไขการขออนุญาตก่อสร้างกับเทศบาลหรือ อบต.</p>
            </div>
            <div className="flex flex-col gap-2">
              <a href={`tel:${SITE.roiEtPhone.replace(/-/g, "")}`} className="btn btn-primary"><Icon name="call" /> โทรคุยกับสถาปนิก {SITE.roiEtPhone}</a>
              <Link href="/turnkey#request" className="btn btn-outline">ขอประเมินราคาสร้างบ้าน</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
