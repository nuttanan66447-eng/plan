import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CoverImage, PriceTag } from "@/components/CatalogCards";
import { Icon } from "@/components/Icon";
import { Field, LeadForm } from "@/components/LeadForm";
import { getCourse } from "@/lib/data";
import { COURSE_FORMAT_LABEL, COURSE_LEVEL_LABEL, thaiDate } from "@/lib/format";
import { SITE } from "@/lib/site";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = await getCourse((await params).slug);
  return c ? { title: c.title, description: c.subtitle ?? c.description ?? undefined, openGraph: c.image ? { images: [c.image] } : undefined } : {};
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const c = await getCourse((await params).slug);
  if (!c) notFound();
  const f = COURSE_FORMAT_LABEL[c.format];
  const facts: [string, string, string | null][] = [
    [f.icon, "รูปแบบ", f.label],
    ["schedule", "ระยะเวลา", c.duration],
    ["menu_book", "จำนวนบทเรียน", c.lessons != null ? `${c.lessons} บท` : null],
    ["signal_cellular_alt", "ระดับ", COURSE_LEVEL_LABEL[c.level]],
    ["event", "วันเริ่มเรียน", c.start_date ? thaiDate(c.start_date, { day: "numeric", month: "long", year: "numeric" }) : c.format === "online" ? "เริ่มได้ทันที" : "แจ้งรอบเรียนทาง LINE"],
    ["location_on", "สถานที่", c.location],
    ["group", "รับจำนวน", c.seats != null ? `${c.seats} ที่นั่ง` : null],
  ];

  return (
    <>
      <div className="border-b border-hairline bg-wash">
        <div className="shell py-2.5 text-[12px] text-muted"><Link href="/courses" className="hover:text-ink">คอร์สเรียน</Link> / <span className="text-ink">{c.title}</span></div>
      </div>
      <section className="py-8">
        <div className="shell grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="min-w-0">
            <div className="relative aspect-[16/9] overflow-hidden bg-wash-2"><CoverImage src={c.image} alt={c.title} icon="school" sizes="(max-width: 1024px) 100vw, 860px" /></div>
            {c.category && <p className="eyebrow mt-6">{c.category}</p>}
            <h1 className="mt-2 text-[28px] font-bold leading-snug md:text-[34px]">{c.title}</h1>
            {c.subtitle && <p className="mt-2 text-[16px] text-muted">{c.subtitle}</p>}
            {c.description && <p className="mt-5 whitespace-pre-line text-[15px] leading-7 text-ink-3">{c.description}</p>}
            {c.syllabus.length > 0 && (
              <div className="mt-8">
                <h2 className="text-[20px] font-bold">เนื้อหาที่จะได้เรียน</h2>
                <ol className="mt-3 divide-y divide-hairline border border-hairline bg-white">
                  {c.syllabus.map((s, i) => (
                    <li key={i} className="flex items-center gap-4 px-4 py-3 text-[14px]">
                      <span className="font-display text-[18px] font-bold text-bronze">{String(i + 1).padStart(2, "0")}</span>{s}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            <p className="mt-6 flex items-center gap-2 text-[13px] text-muted"><Icon name="verified" className="text-bronze" /> ผู้สอน: {SITE.engineer} วิศวกรโยธา ใบอนุญาต {SITE.license}</p>
          </div>

          <aside className="space-y-4">
            <div className="card p-5">
              <PriceTag price={c.price} original={c.price_original} />
              <dl className="mt-4 space-y-2 border-t border-hairline pt-4 text-[13px]">
                {facts.filter(([, , v]) => v).map(([i, k, v]) => (
                  <div key={k} className="flex items-center gap-2"><Icon name={i} className="text-bronze-dark" /><dt className="w-28 shrink-0 text-muted">{k}</dt><dd className="font-semibold">{v}</dd></div>
                ))}
              </dl>
              <a href="#enroll" className="btn btn-bronze mt-5 w-full"><Icon name="how_to_reg" /> สมัครเรียน</a>
            </div>
            <div id="enroll" className="card scroll-mt-32 p-5">
              <h2 className="text-[18px] font-bold">สมัครเรียน</h2>
              <p className="mt-1 text-[12.5px] text-muted">ทีมงานจะติดต่อกลับเพื่อยืนยันรอบเรียนและส่งช่องทางชำระเงิน</p>
              <LeadForm type="course" hidden={{ course_slug: c.slug, service_package: c.title.slice(0, 80), estimate_thb: c.price }} submitLabel="ส่งใบสมัคร" successTitle="รับใบสมัครเรียบร้อย" className="mt-4">
                <div className="grid gap-3">
                  <Field name="name" label="ชื่อ-นามสกุล" required autoComplete="name" />
                  <Field name="phone" label="เบอร์โทรศัพท์" type="tel" required autoComplete="tel" />
                  <Field name="line_id" label="LINE ID" />
                  <Field name="email" label="อีเมล" type="email" autoComplete="email" />
                  <Field name="message" as="textarea" label="หมายเหตุ / จำนวนผู้เรียน" placeholder="เช่น สมัคร 2 คน" />
                </div>
              </LeadForm>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
