import type { Metadata } from "next";
import { CategoryChips, CourseCard } from "@/components/CatalogCards";
import { Icon } from "@/components/Icon";
import { listCourses } from "@/lib/data";
import { SITE } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "คอร์สเรียนออกแบบ อ่านแบบ ถอดแบบ BOQ และตรวจบ้าน",
  description: "คอร์สเรียนจากวิศวกรโยธามีใบอนุญาต อ่านแบบก่อสร้าง ออกแบบบ้านด้วย SketchUp ถอดแบบประมาณราคา BOQ และตรวจรับบ้านด้วยตัวเอง ทั้งออนไลน์และเรียนที่ร้อยเอ็ด",
};

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams;
  const courses = await listCourses();
  const cats = [...new Set(courses.map((c) => c.category).filter((c): c is string => !!c))];
  const shown = cat ? courses.filter((c) => c.category === cat) : courses;

  return (
    <>
      <section className="blueprint border-b border-hairline py-12">
        <div className="shell">
          <span className="chip chip-dot bg-white">NATBUILD ACADEMY</span>
          <h1 className="mt-5 max-w-3xl text-[32px] font-bold leading-snug md:text-[44px]">คอร์สเรียนสร้างบ้าน <span className="text-bronze-dark">จากวิศวกรตัวจริง</span></h1>
          <p className="mt-3 max-w-2xl text-muted">อ่านแบบเป็น ออกแบบเองได้ คุมงบด้วย BOQ และตรวจรับบ้านอย่างมืออาชีพ — สอนโดย {SITE.engineer} วิศวกรโยธา ({SITE.license}) จากหน้างานจริงในร้อยเอ็ด</p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-ink-3">
            {[["verified", "สอนโดยวิศวกรมีใบอนุญาต"], ["description", "แบบและไฟล์ตัวอย่างจากงานจริง"], ["workspace_premium", "รับใบประกาศเมื่อเรียนจบ"], ["support_agent", "ถามตอบหลังเรียนทาง LINE"]].map(([i, t]) => (
              <span key={t} className="flex items-center gap-1.5"><Icon name={i} className="text-bronze-dark" />{t}</span>
            ))}
          </div>
        </div>
      </section>
      <section className="py-10">
        <div className="shell">
          <CategoryChips base="/courses" cats={cats} active={cat} />
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((c) => <CourseCard key={c.id} c={c} />)}
          </div>
          {!shown.length && <p className="card mt-6 p-10 text-center text-muted">ยังไม่มีคอร์สในหมวดนี้ — ติดตามคอร์สใหม่ได้ทาง LINE {SITE.line}</p>}
        </div>
      </section>
    </>
  );
}
