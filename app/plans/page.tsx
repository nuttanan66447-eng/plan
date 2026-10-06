import type { Metadata } from "next";
import Link from "next/link";
import { CatalogFilters, CatalogToolbar, SortSelect } from "@/components/CatalogFilters";
import { Icon } from "@/components/Icon";
import { PlanCard } from "@/components/PlanCard";
import { listPlans, PAGE_SIZE, planStats, type PlanFilters } from "@/lib/data";
import type { PlanStyle } from "@/lib/types";

export const metadata: Metadata = {
  title: "คลังแบบบ้าน 3D BIM พร้อมยื่นขออนุญาต",
  description: "ค้นหาแบบบ้านมาตรฐานพร้อมยื่นขออนุญาต กรองตามจำนวนชั้น พื้นที่ใช้สอย ห้องนอน ขนาดที่ดิน และงบประมาณ พร้อมโมเดล 3D และ BOQ",
};

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const STYLES: PlanStyle[] = ["nordic", "japandi", "tropical", "modern", "minimal"];
const SORTS = ["popular", "price_asc", "price_desc", "area_asc", "area_desc", "newest"] as const;

export default async function PlansPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const params = Object.fromEntries(Object.entries(sp).map(([k, v]) => [k, one(v)])) as Record<string, string | undefined>;

  const filters: PlanFilters = {
    q: params.q?.slice(0, 60),
    storeys: params.storeys?.split(",").map(Number).filter((n) => n >= 1 && n <= 3),
    style: STYLES.includes(params.style as PlanStyle) ? (params.style as PlanStyle) : undefined,
    areaMax: Number(params.area) || undefined,
    beds: Number(params.beds) || undefined,
    land: (["s", "m", "l"] as const).find((x) => x === params.land),
    budget: (["compact", "popular", "luxury", "mansion"] as const).find((x) => x === params.budget),
    features: params.features?.split(",").filter((f) => ["tour360", "dollhouse", "universal", "pool", "narrow"].includes(f)),
    sort: SORTS.find((s) => s === params.sort),
    page: Math.max(1, Number(params.page) || 1),
  };

  const [{ plans, total }, stats] = await Promise.all([listPlans(filters), planStats()]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(filters.page!, pages);
  const pageHref = (p: number) => {
    const n = new URLSearchParams(Object.entries(params).filter(([k, v]) => v && k !== "page") as [string, string][]);
    if (p > 1) n.set("page", String(p));
    return `/plans${n.size ? `?${n}` : ""}`;
  };

  return (
    <>
      <section className="border-b border-hairline bg-wash">
        <div className="shell py-6">
          <div className="flex flex-col justify-between gap-2 text-[11px] font-semibold tracking-[0.1em] text-muted md:flex-row">
            <p>ARCHIPLAN HUB / <span className="text-ink">3D BIM REPOSITORY &amp; PERMIT-READY DESIGNS</span></p>
            <p className="flex gap-5">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-bronze" />BIM MODEL IFC / DWG READY</span>
              <span className="flex items-center gap-1.5"><Icon name="verified" className="text-bronze" />วิศวกรเซ็นรับรองแบบ 100%</span>
            </p>
          </div>
          <div className="mt-5"><CatalogToolbar params={params} total={stats.total} /></div>
        </div>
      </section>

      <section className="py-10">
        <div className="shell grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="lg:sticky lg:top-[130px] lg:self-start">
            <CatalogFilters params={params} counts={stats.byStoreys} />
            <div className="mt-4 hidden border border-hairline bg-wash-2 p-5 lg:block">
              <p className="flex items-center gap-2 text-[14px] font-bold"><Icon name="help" className="text-bronze-dark" /> ต้องการปรับขนาดแปลน?</p>
              <p className="mt-2 text-[12.5px] text-muted">สถาปนิกสามารถปรับย่อ-ขยายระยะเสาให้พอดีกับที่ดินของท่าน พร้อมยื่นขออนุญาตได้ทันที</p>
              <Link href="/custom-design#booking" className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-bold text-bronze-dark hover:underline">ปรึกษาการปรับแบบทันที <Icon name="arrow_forward" /></Link>
            </div>
          </div>

          <div>
            <div className="card flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center">
              <div>
                <p className="eyebrow">Verified BIM Archives</p>
                <h1 className="mt-1 text-[20px] font-bold md:text-[22px]">
                  พบ <span className="text-bronze-dark">{total}</span> แบบบ้านมาตรฐานพร้อมยื่นขออนุญาต
                </h1>
                <p className="text-[12.5px] text-muted">เอกสารครบชุด: สถาปัตย์, วิศวกรรมโครงสร้าง, ไฟฟ้า, สุขาภิบาล และ BOQ แผ่นเปล่า</p>
              </div>
              <SortSelect params={params} />
            </div>

            {plans.length ? (
              <div className="mt-5 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                {plans.map((p, i) => <PlanCard key={p.id} plan={p} priority={i < 2} />)}
              </div>
            ) : (
              <div className="card mt-5 flex flex-col items-center gap-3 p-12 text-center">
                <Icon name="search_off" className="text-[40px] text-subtle" />
                <p className="text-[17px] font-bold">ไม่พบแบบบ้านที่ตรงกับเงื่อนไข</p>
                <p className="max-w-md text-[13.5px] text-muted">ลองปรับตัวกรอง หรือให้สถาปนิกออกแบบบ้านเฉพาะสำหรับที่ดินและงบประมาณของคุณ</p>
                <div className="mt-2 flex gap-2">
                  <Link href="/plans" className="btn btn-outline btn-sm">ล้างตัวกรอง</Link>
                  <Link href="/custom-design" className="btn btn-primary btn-sm">ออกแบบเฉพาะ</Link>
                </div>
              </div>
            )}

            <div className="mt-8 border border-hairline bg-wash-2 p-6">
              <p className="label-tech text-bronze-dark">มาตรฐานเอกสารพิมพ์เขียว 1 ชุด ประกอบด้วย</p>
              <h2 className="mt-1 text-[19px] font-bold">ครบถ้วนสำหรับการยื่นขออนุญาต อบต./เทศบาล และจัดซื้อวัสดุ</h2>
              <div className="mt-5 grid gap-px border border-hairline bg-hairline sm:grid-cols-2 xl:grid-cols-4">
                {[["description", "แบบสถาปัตย์ 5 ชุด", "ผังพื้น รูปด้าน รูปตัด แบบขยายประตู-หน้าต่าง"], ["foundation", "แบบวิศวกรรมโครงสร้าง", "รายการคำนวณรับรอง วศ. ฐานราก เสา คาน พื้น"], ["electrical_services", "งานระบบไฟฟ้า-สุขาภิบาล", "ผังแสงสว่าง ปลั๊ก เดินท่อน้ำดี-น้ำทิ้ง"], ["table_view", "เอกสาร BOQ ละเอียด", "รายการถอดปริมาณวัสดุ-ค่าแรง ทุกหมวดงาน"]].map(([i, t, d]) => (
                  <div key={t} className="flex gap-3 bg-white p-4">
                    <Icon name={i} className="text-[22px] text-bronze-dark" />
                    <span><b className="block text-[13.5px]">{t}</b><span className="text-[12px] text-muted">{d}</span></span>
                  </div>
                ))}
              </div>
            </div>

            <nav className="mt-8 flex flex-col items-center justify-between gap-4 md:flex-row" aria-label="แบ่งหน้า">
              <p className="text-[12px] text-muted">
                แสดงแบบบ้านที่ {total ? (page - 1) * PAGE_SIZE + 1 : 0} - {Math.min(page * PAGE_SIZE, total)} จากทั้งหมด {total} แบบ
              </p>
              {pages > 1 && (
                <div className="flex">
                  <Link href={pageHref(page - 1)} aria-disabled={page === 1} className={`grid h-10 place-items-center border border-hairline bg-white px-3 text-[12.5px] ${page === 1 ? "pointer-events-none text-subtle" : "hover:border-ink"}`}>← ก่อนหน้า</Link>
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <Link key={p} href={pageHref(p)} aria-current={p === page ? "page" : undefined}
                      className={`-ml-px grid h-10 w-10 place-items-center border text-[13px] ${p === page ? "border-ink bg-ink font-bold text-white" : "border-hairline bg-white hover:border-ink"}`}>{p}</Link>
                  ))}
                  <Link href={pageHref(page + 1)} aria-disabled={page === pages} className={`-ml-px grid h-10 place-items-center border border-hairline bg-white px-3 text-[12.5px] ${page === pages ? "pointer-events-none text-subtle" : "hover:border-ink"}`}>ถัดไป →</Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </section>
    </>
  );
}
