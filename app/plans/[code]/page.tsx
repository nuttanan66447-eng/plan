import type { Plan } from "@/lib/types";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CompareToggle } from "@/components/CompareControls";
import { Icon } from "@/components/Icon";
import { Field, LeadForm } from "@/components/LeadForm";
import { OrderForm } from "@/components/OrderForm";
import { PlanForms } from "@/components/PlanForms";
import { Panorama } from "@/components/Panorama";
import { PlanCard } from "@/components/PlanCard";
import { PlanViewer } from "@/components/PlanViewer";
import { Tabs } from "@/components/Tabs";
import { RatingSummary, ReviewCards } from "@/components/ReviewList";
import { ReviewForm } from "@/components/ReviewForm";
import { allPlanCodes, getPlan, listPlans, listReviews, projectsForPlan } from "@/lib/data";
import { baht, FEATURE_LABEL, num, STYLE_LABEL } from "@/lib/format";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await allPlanCodes()).map((p) => ({ code: p.code }));
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const plan = await getPlan((await params).code);
  if (!plan) return { title: "ไม่พบแบบบ้าน" };
  return {
    title: `${plan.code} ${plan.name_en} — ${plan.name_th}`,
    description: `${plan.name_th} ${plan.area_sqm} ตร.ม. ${plan.bedrooms} ห้องนอน ${plan.bathrooms} ห้องน้ำ ${plan.storeys} ชั้น ราคาชุดแบบ ${baht(plan.price)} พร้อม BOQ และไฟล์ 3D BIM`,
    openGraph: { images: [plan.image] },
  };
}

const DELIVERABLES = [
  ["print", "เล่มพิมพ์เขียวแบบก่อสร้าง A3 จำนวน 5 ชุด", "ครบงานสถาปัตย์ โครงสร้าง ระบบไฟฟ้า ประปา สุขาภิบาล พร้อมยื่นขออนุญาต"],
  ["assignment_turned_in", "เล่มรายการคำนวณโครงสร้างวิศวกร", "พร้อมเอกสารลงนามรับรองจากวุฒิวิศวกร (วศ.) และสามัญสถาปนิก (สถ.)"],
  ["table_view", "เอกสารรายการถอดแบบวัสดุและค่าแรง (BOQ)", "ไฟล์ Excel และ PDF ปรับใช้ประมูลงานผู้รับเหมาและยื่นกู้ธนาคารได้ 100%"],
  ["deployed_code", "ไฟล์ดิจิทัล BIM, SketchUp (.skp) และ AutoCAD (.dwg)", "เมื่อเลือกแพ็กเกจไฟล์ดิจิทัล ดาวน์โหลดได้ที่หน้า “ติดตามคำสั่งซื้อ” หลังชำระเงิน พร้อมไฟล์ 3D Render"],
];

interface Tile { img: string | null; label: string; icon: string; tag?: string; contain?: boolean }

/** Exterior, section, every floor plan, then the admin's extra sheets; placeholders fill the row up to four. */
function previewTiles(plan: Plan): Tile[] {
  const tiles: Tile[] = [
    { img: plan.gallery.find((g) => g !== plan.panorama && g !== plan.section_image) ?? plan.image, label: "ทัศนียภาพภายนอก", icon: "visibility" },
    { img: plan.section_image, label: "ภาพตัด 3D", icon: "splitscreen", tag: "SEC" },
    ...Array.from({ length: plan.storeys }, (_, f) => ({
      img: plan.floorplan_images?.[f] || null, label: `แปลนพื้นชั้น ${f + 1}`, icon: "architecture", tag: `A-0${f + 1}`, contain: true,
    })),
    ...(plan.sheet_images ?? []).map((s) => ({ img: s.url, label: s.label, icon: "description", tag: s.tag, contain: true })),
  ];
  const fillers: Tile[] = [
    { img: null, label: "ระบบไฟฟ้า-สุขาภิบาล", icon: "electrical_services", tag: "EE" },
    { img: null, label: "รูปด้านอาคาร", icon: "domain", tag: "A-EL" },
  ];
  for (const f of fillers) if (tiles.length < 4 && !tiles.some((t) => t.label === f.label)) tiles.push(f);
  return tiles.slice(0, 12);
}

export default async function PlanPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const plan = await getPlan(decodeURIComponent(code));
  if (!plan) notFound();

  const [built, similar, reviews] = await Promise.all([projectsForPlan(plan.code), listPlans({ style: plan.style }), listReviews(plan.code)]);
  const others = similar.plans.filter((p) => p.code !== plan.code).slice(0, 3);
  const save = plan.price_original ? Math.round((1 - plan.price / plan.price_original) * 100) : 0;
  const pages = (plan.pages_arch ?? 0) + (plan.pages_struct ?? 0) + (plan.pages_mep ?? 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${plan.code} ${plan.name_en}`,
    description: plan.description,
    image: plan.image,
    sku: plan.code,
    brand: { "@type": "Brand", name: "NATBUILD" },
    offers: { "@type": "Offer", priceCurrency: "THB", price: plan.price, availability: "https://schema.org/InStock" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="border-b border-hairline bg-wash">
        <div className="shell flex flex-col justify-between gap-2 py-3 text-[11.5px] font-semibold tracking-[0.06em] md:flex-row md:items-center">
          <nav aria-label="breadcrumb" className="text-muted">
            <Link href="/" className="hover:text-ink">NATBUILD</Link> / <Link href="/plans" className="hover:text-ink">คลังแบบบ้าน 3D</Link> / <span className="text-bronze-dark">{plan.code}</span>
          </nav>
          <div className="flex flex-wrap gap-2">
            <span className="chip chip-dot bg-white">BIM LEVEL OF DETAIL: LOD 350</span>
            <span className="chip bg-white"><Icon name="verified" className="text-bronze" />เทศบาลผ่านการรับรอง 100%</span>
          </div>
        </div>
      </div>

      <section className="py-8">
        <div className="shell grid gap-6 lg:grid-cols-[1fr_400px]">
          <div className="min-w-0">
            <PlanViewer plan={plan} />
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
              <p className="label-tech text-muted">ภาพมุมมองและชุดแบบก่อสร้างในเล่ม (Preview Set)</p>
              {plan.sample_pdf ? (
                <a href={plan.sample_pdf} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[12px] font-semibold text-bronze-dark hover:underline">
                  <Icon name="picture_as_pdf" /> ดูตัวอย่างเล่มแบบ {pages} แผ่น (PDF)
                </a>
              ) : <p className="text-[12px] font-semibold text-bronze-dark">เล่มแบบ {pages} แผ่น (PDF)</p>}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
              {previewTiles(plan).map((t, i) => {
                const body = (
                  <>
                    <div className="relative aspect-[4/3] bg-wash-2">
                      {t.img ? <Image src={t.img} alt={t.label} fill sizes="200px" className={t.contain ? "bg-white object-contain p-1" : "object-cover"} /> : (
                        <div className="blueprint grid h-full place-items-center"><Icon name={t.icon} className="text-[38px] text-subtle" /></div>
                      )}
                      {t.tag && <span className="absolute bottom-1.5 right-1.5 bg-ink px-1.5 text-[9px] font-bold text-white">{t.tag}</span>}
                    </div>
                    <p className="flex items-center justify-between gap-2 p-2.5 text-[11.5px] font-semibold">{String(i + 1).padStart(2, "0")} {t.label} <Icon name={t.icon} className="shrink-0 text-muted" /></p>
                  </>
                );
                return t.img
                  ? <a key={i} href={t.img} target="_blank" rel="noopener noreferrer" className="card card-hover block">{body}</a>
                  : <div key={i} className="card">{body}</div>;
              })}
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="eyebrow">{STYLE_LABEL[plan.style]} • {plan.series}</p>
                <span className="shrink-0 bg-wash-2 px-2 py-1 text-[10.5px] font-semibold">พร้อมส่งมอบ</span>
              </div>
              <h1 className="mt-3 text-[30px] font-extrabold leading-tight">{plan.code}</h1>
              <p className="mt-1 text-[17px] text-ink-3">{plan.name_en} ({plan.name_th})</p>
              <div className="mt-5 bg-wash p-4">
                <p className="text-[11.5px] text-muted">ราคาชุดแบบพิมพ์เขียว &amp; CAD BIM</p>
                <div className="mt-1 flex items-end justify-between gap-3">
                  <p className="font-display text-[34px] font-extrabold leading-none">{num(plan.price)} <span className="text-[13px] font-semibold text-muted">THB (฿)</span></p>
                  {plan.price_original && (
                    <p className="text-right text-[11px]"><span className="block text-subtle line-through">ราคาปกติ {num(plan.price_original)} THB</span>
                      <span className="mt-1 inline-block bg-bronze-wash px-1.5 font-bold text-bronze-dark">SAVE {save}%</span></p>
                  )}
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-[12px] text-ink-3"><Icon name="check_circle" className="text-bronze" /> ฟรี! เล่มรายการคำนวณโครงสร้างลงนามวิศวกร + BOQ ถอดแบบวัสดุ</p>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between">
                <p className="label-tech text-muted">สเปกและมิติอาคาร</p><p className="label-tech text-muted">LOD 350 BIM CERTIFIED</p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                  ["พื้นที่ใช้สอยรวม", `${num(plan.area_sqm)} ตร.ม.`, plan.floor_areas.map((a, i) => `ชั้น ${i + 1}: ${a} ม²`).join(" / ")],
                  ["ฟังก์ชันการอยู่อาศัย", `${plan.bedrooms} นอน / ${plan.bathrooms} น้ำ`, `+ ${plan.parking} ที่จอดรถ • ${plan.storeys} ชั้น`],
                  ["ขนาดที่ดินขั้นต่ำ", plan.land_width ? `${plan.land_width} x ${plan.land_depth} ม.` : "-", plan.min_land_sqwa ? `เนื้อที่ ${plan.min_land_sqwa} ตารางวาขึ้นไป` : ""],
                  ["ประมาณการราคาก่อสร้าง", `${num(plan.build_cost_min, 1)} - ${num(plan.build_cost_max, 1)} ล้าน`, "อ้างอิงราคากลางไตรมาสปัจจุบัน"],
                ].map(([l, v, s], i) => (
                  <div key={l} className="bg-wash p-3">
                    <p className="text-[10.5px] text-muted">{l}</p>
                    <p className={`mt-1 text-[16px] font-bold ${i === 3 ? "text-bronze-dark" : ""}`}>{v}</p>
                    <p className="text-[10.5px] text-subtle">{s}</p>
                  </div>
                ))}
              </div>
              {plan.features.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {plan.features.map((f) => <span key={f} className="chip"><Icon name={FEATURE_LABEL[f]?.icon ?? "check"} className="text-bronze-dark" />{FEATURE_LABEL[f]?.label ?? f}</span>)}
                </div>
              )}
            </div>

            <div className="card p-5">
              <p className="label-tech text-muted">สิ่งที่ลูกค้าจะได้รับในชุดเล่มแบบมาตรฐาน</p>
              <ul className="mt-3 space-y-3">
                {DELIVERABLES.map(([i, t, d]) => (
                  <li key={t} className="flex gap-3"><Icon name={i} className="mt-0.5 text-[20px] text-bronze-dark" /><span><b className="block text-[13.5px]">{t}</b><span className="text-[12px] text-muted">{d}</span></span></li>
                ))}
              </ul>
            </div>

            <a href="#order" className="btn btn-bronze !py-4 text-[15px]"><Icon name="shopping_bag" /> สั่งซื้อชุดแบบก่อสร้างครบชุด ({num(plan.price)} THB)</a>
            <a href="#consult" className="btn btn-primary !py-4 text-[15px]"><Icon name="support_agent" /> นัดปรึกษาสถาปนิกปรับแปลนฟรี (30 นาที)</a>
            <div className="flex items-center justify-between text-[11px] text-subtle">
              <span className="flex items-center gap-1"><Icon name="local_shipping" /> จัดส่งฟรีทั่วประเทศใน 48 ชม.</span>
              <CompareToggle code={plan.code} area={plan.area_sqm} />
            </div>
          </aside>
        </div>
      </section>

      <section className="pb-10">
        <div className="shell">
          <div className="card p-6 md:p-8">
            <Tabs tabs={[
              { label: "รายละเอียดสเปกโครงสร้าง & งานวิศวกรรม", content: (
                <div className="grid gap-8 md:grid-cols-3">
                  {[["foundation", "งานฐานรากและเสาโครงสร้าง", "รองรับทั้งระบบเสาเข็มตอก คอนกรีตอัดแรง I-22 หรือเสาเข็มเจาะขนาด 0.35 ม. สำหรับพื้นที่ดินอ่อน คอนกรีตกำลังอัดทรงกระบอกไม่ต่ำกว่า 240 ksc เหล็กข้ออ้อยมาตรฐาน มอก. SD40"],
                    ["roofing", "โครงหลังคาและระบบกันความร้อน", "โครงสร้างเหล็กรูปพรรณกัลวาไนซ์ปลอดสนิม ชนิด High-Tensile เกรด G450 ออกแบบรองรับแรงลมปะทะสูงสุด 120 กม./ชม. พร้อมฟอยล์สะท้อนรังสีความร้อนและช่องระบายอากาศใต้สันหลังคา"],
                    ["bolt", "ระบบวิศวกรรมไฟฟ้า & สมาร์ทโฮม", "ระบบไฟ 1 เฟส หรือ 3 เฟส 30/100A รองรับการติดตั้ง EV Charger 22kW และท่อร้อยสายโซลาร์เซลล์ (Rooftop PV Ready) พร้อมระบบตู้คอนซูเมอร์แยกเบรกเกอร์กันดูด (RCBO) ทุกจุดเปียกชื้น"]].map(([i, t, d]) => (
                    <div key={t}><h3 className="flex items-center gap-2 text-[17px] font-bold"><Icon name={i} className="text-bronze-dark" />{t}</h3><p className="mt-2 text-[13.5px] text-muted">{d}</p></div>
                  ))}
                </div>) },
              { label: "ขั้นตอนการยื่นขออนุญาตก่อสร้าง", content: (
                <ol className="grid gap-4 md:grid-cols-4">
                  {[["รับเล่มแบบครบชุด", "เล่มพิมพ์เขียว 5 ชุด + เอกสารวิศวกร-สถาปนิก"], ["เตรียมเอกสารบุคคล", "โฉนด สำเนาบัตรประชาชน ทะเบียนบ้าน"], ["ยื่นเรื่องที่ อบต./เทศบาล", "เจ้าหน้าที่ตรวจแบบและพื้นที่ภายใน 45 วัน"], ["รับใบ อ.1 ก่อสร้าง", "เริ่มก่อสร้างได้ทันที • NATBUILD แก้ไขแบบฟรีหากถูกตีกลับ"]].map(([t, d], i) => (
                    <li key={t} className="border border-hairline p-4"><span className="font-display text-[26px] font-bold text-bronze">{String(i + 1).padStart(2, "0")}</span><b className="mt-1 block text-[14px]">{t}</b><span className="text-[12.5px] text-muted">{d}</span></li>
                  ))}
                </ol>) },
              { label: "การปรับแก้แปลน & เงื่อนไขลิขสิทธิ์", content: (
                <div className="prose-th max-w-3xl text-[14px] text-muted">
                  <p>ลูกค้าสามารถขอปรับกลับด้านผัง (Mirror) ย้ายทิศทางตามที่ดิน และขยายระยะเสาไม่เกิน 10% ได้ฟรี การปรับเปลี่ยนฟังก์ชันห้องหรือเพิ่มพื้นที่มากกว่านี้คิดค่าบริการตามขอบเขตงาน เริ่มต้น 3,000 บาท</p>
                  <p>สิทธิ์การใช้แบบเป็นแบบ 1 ชุด ต่อการก่อสร้าง 1 หลัง ห้ามนำไปทำซ้ำหรือจำหน่ายต่อ ไฟล์ BIM/CAD ใช้สำหรับการก่อสร้างและประสานงานผู้รับเหมาของโครงการเท่านั้น</p>
                </div>) },
            ]} />
            {plan.description && <p className="mt-8 border-t border-hairline pt-6 text-[14.5px] leading-7 text-ink-3">{plan.description}</p>}
          </div>
        </div>
      </section>

      {plan.panorama && (
        <section className="pb-10">
          <div className="shell">
            <p className="eyebrow">Interior Walkthrough</p>
            <h2 className="mt-2 text-[24px] font-bold">ทัวร์ภายในเสมือนจริง 360°</h2>
            <div className="mt-4"><Panorama src={plan.panorama} label={`ภาพ 360 องศาภายใน ${plan.code}`} points={["ห้องโถง Living", "โถงบันได Double Volume", "ห้องครัว & ทานอาหาร", "ทางออกสวน"]} /></div>
          </div>
        </section>
      )}

      <section id="order" className="scroll-mt-32 border-y border-hairline bg-white py-12">
        <span id="consult" className="block scroll-mt-32" aria-hidden="true" />
        <div className="shell">
          <PlanForms
            order={
              <>
                <p className="eyebrow">Order Blueprint Set</p>
                <h2 className="mt-2 text-[26px] font-bold">สั่งซื้อชุดแบบ {plan.code}</h2>
                <p className="mt-2 text-[13.5px] text-muted">กรอกข้อมูลเพื่อยืนยันคำสั่งซื้อ ทีมงานจะติดต่อกลับพร้อมรายละเอียดการชำระเงิน (โอน/บัตรเครดิต/ผ่อน 0%) และนัดหมายปรับผังที่ดิน</p>
                <div className="mt-5"><OrderForm code={plan.code} price={plan.price} area={plan.area_sqm} /></div>
              </>
            }
            consult={
              <>
                <p className="eyebrow">Free Consultation</p>
                <h2 className="mt-2 text-[26px] font-bold">นัดปรึกษาสถาปนิกปรับแปลนฟรี 30 นาที</h2>
                <p className="mt-2 text-[13.5px] text-muted">ส่งขนาดที่ดินและความต้องการ สถาปนิกจะประเมินความเป็นไปได้ในการปรับแบบให้ฟรี ผ่าน Zoom / LINE หรือที่สำนักงาน</p>
                <LeadForm type="consult" hidden={{ plan_code: plan.code }} submitLabel="ยืนยันนัดหมายปรึกษา" className="mt-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field name="name" label="ชื่อ-นามสกุล" required autoComplete="name" />
                    <Field name="phone" label="เบอร์โทรศัพท์" type="tel" required autoComplete="tel" />
                    <Field name="land_width" label="หน้ากว้างที่ดิน (ม.)" type="number" step="0.1" min="0" />
                    <Field name="land_depth" label="ความลึกที่ดิน (ม.)" type="number" step="0.1" min="0" />
                    <Field name="preferred_date" label="วันที่สะดวก" type="date" />
                    <Field name="preferred_slot" as="select" label="ช่วงเวลา" options={["10:00 - 11:30 น.", "13:30 - 15:00 น.", "16:30 - 18:00 น."]} />
                    <Field name="message" as="textarea" label="สิ่งที่ต้องการปรับ" className="sm:col-span-2" placeholder="เช่น ต้องการเพิ่มห้องนอนชั้นล่างสำหรับผู้สูงอายุ" />
                  </div>
                </LeadForm>
              </>
            }
          />
        </div>
      </section>

      {built.length > 0 && (
        <section className="py-12">
          <div className="shell">
            <p className="eyebrow">Built From This Plan</p>
            <h2 className="mt-2 text-[24px] font-bold">บ้านที่สร้างจริงจากแบบนี้</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {built.map((b) => (
                <Link key={b.id} href="/portfolio" className="card card-hover grid grid-cols-[160px_1fr] md:grid-cols-[220px_1fr]">
                  <div className="relative min-h-[140px]"><Image src={b.image} alt={b.title} fill sizes="220px" className="object-cover" /></div>
                  <div className="p-4"><p className="label-tech text-bronze-dark">{b.code} • {b.district}</p><p className="mt-1 font-bold">{b.title}</p>
                    <p className="mt-1 line-clamp-2 text-[12.5px] text-muted">“{b.quote}”</p><p className="mt-2 text-[12px] font-semibold">งบก่อสร้างจริง {b.budget_million} ลบ.</p></div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="reviews" className="scroll-mt-28 border-t border-hairline bg-white py-12">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Customer Reviews</p>
              <h2 className="mt-2 text-[24px] font-bold">รีวิวจากลูกค้าที่ใช้แบบ {plan.code}</h2>
            </div>
            <RatingSummary reviews={reviews} />
          </div>
          {reviews.length ? <div className="mt-5"><ReviewCards reviews={reviews} /></div>
            : <p className="mt-4 text-[13.5px] text-muted">ยังไม่มีรีวิวสำหรับแบบนี้ — เป็นคนแรกที่รีวิว</p>}
          <details className="card group mt-6">
            <summary className="flex cursor-pointer list-none items-center justify-between p-5 text-[15px] font-bold">
              <span className="flex items-center gap-2"><Icon name="rate_review" className="text-bronze-dark" /> เขียนรีวิวแบบ {plan.code}</span>
              <Icon name="expand_more" className="transition-transform group-open:rotate-180" />
            </summary>
            <div className="border-t border-hairline p-5"><ReviewForm planCode={plan.code} /></div>
          </details>
        </div>
      </section>

      {others.length > 0 && (
        <section className="pb-14 pt-4">
          <div className="shell">
            <h2 className="text-[22px] font-bold">แบบบ้านสไตล์เดียวกันที่คุณอาจสนใจ</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{others.map((p) => <PlanCard key={p.id} plan={p} />)}</div>
          </div>
        </section>
      )}
    </>
  );
}
