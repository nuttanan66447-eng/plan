import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { getPlans } from "@/lib/data";
import { baht, FEATURE_LABEL, num, STYLE_LABEL } from "@/lib/format";
import type { Plan } from "@/lib/types";

export const metadata: Metadata = { title: "เปรียบเทียบแบบบ้าน", robots: { index: false } };

const ROWS: { label: string; get: (p: Plan) => React.ReactNode; best?: (ps: Plan[]) => string | undefined }[] = [
  { label: "สไตล์", get: (p) => STYLE_LABEL[p.style] },
  { label: "จำนวนชั้น", get: (p) => `${p.storeys} ชั้น` },
  { label: "พื้นที่ใช้สอย", get: (p) => `${num(p.area_sqm)} ตร.ม.`, best: (ps) => ps.reduce((a, b) => (b.area_sqm > a.area_sqm ? b : a)).code },
  { label: "ห้องนอน / ห้องน้ำ", get: (p) => `${p.bedrooms} นอน / ${p.bathrooms} น้ำ` },
  { label: "ที่จอดรถ", get: (p) => `${p.parking} คัน` },
  { label: "ขนาดที่ดินขั้นต่ำ", get: (p) => (p.land_width ? `${p.land_width} x ${p.land_depth} ม. (${p.min_land_sqwa} ตร.ว.)` : "-"), best: (ps) => ps.reduce((a, b) => ((b.min_land_sqwa ?? 1e9) < (a.min_land_sqwa ?? 1e9) ? b : a)).code },
  { label: "งบก่อสร้างประเมิน", get: (p) => `${num(p.build_cost_min, 1)} - ${num(p.build_cost_max, 1)} ล้านบาท`, best: (ps) => ps.reduce((a, b) => (b.build_cost_min < a.build_cost_min ? b : a)).code },
  { label: "ค่าก่อสร้างต่อ ตร.ม. (เฉลี่ย)", get: (p) => baht(((p.build_cost_min + p.build_cost_max) / 2) * 1e6 / p.area_sqm), best: (ps) => ps.reduce((a, b) => ((b.build_cost_min + b.build_cost_max) / b.area_sqm < (a.build_cost_min + a.build_cost_max) / a.area_sqm ? b : a)).code },
  { label: "ราคาชุดแบบ + BOQ", get: (p) => <b className="text-bronze-dark">{baht(p.price)}</b>, best: (ps) => ps.reduce((a, b) => (b.price < a.price ? b : a)).code },
  { label: "จำนวนแผ่นแบบ", get: (p) => `${(p.pages_arch ?? 0) + (p.pages_struct ?? 0) + (p.pages_mep ?? 0)} แผ่น` },
  { label: "คุณสมบัติพิเศษ", get: (p) => (p.features.length ? p.features.map((f) => FEATURE_LABEL[f]?.label ?? f).join(", ") : "-") },
];

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ codes?: string }> }) {
  const { codes = "" } = await searchParams;
  const plans = await getPlans(codes.split(",").map((c) => c.trim()).filter(Boolean).slice(0, 3));

  return (
    <section className="py-10">
      <div className="shell">
        <p className="eyebrow">Plan Comparison Sheet</p>
        <h1 className="mt-2 text-[28px] font-bold md:text-[34px]">ตารางเปรียบเทียบแบบบ้าน</h1>
        {plans.length < 2 ? (
          <div className="card mt-6 flex flex-col items-center gap-3 p-12 text-center">
            <Icon name="compare_arrows" className="text-[40px] text-subtle" />
            <p className="text-[16px] font-bold">เลือกแบบบ้านอย่างน้อย 2 แบบเพื่อเปรียบเทียบ</p>
            <p className="text-[13.5px] text-muted">กดปุ่ม “เทียบ” บนการ์ดแบบบ้านในคลังแบบ (สูงสุด 3 แบบ)</p>
            <Link href="/plans" className="btn btn-primary btn-sm mt-2">ไปที่คลังแบบบ้าน</Link>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto border border-hairline bg-white">
            <table className="w-full min-w-[720px] border-collapse text-[13.5px]">
              <thead>
                <tr>
                  <th className="w-48 border-b border-hairline bg-wash p-4 text-left align-bottom label-tech text-muted">Specification</th>
                  {plans.map((p) => (
                    <th key={p.code} className="border-b border-l border-hairline p-4 text-left align-top font-normal">
                      <div className="relative aspect-[16/10] overflow-hidden"><Image src={p.image} alt={p.name_en} fill sizes="320px" className="object-cover" /></div>
                      <p className="mt-3 text-[16px] font-bold">{p.code}</p>
                      <p className="text-[12.5px] text-muted">{p.name_en}</p>
                      <Link href={`/plans/${p.code}`} className="btn btn-primary btn-sm mt-3 w-full">ดูรายละเอียด</Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => {
                  const best = r.best?.(plans);
                  return (
                    <tr key={r.label}>
                      <th scope="row" className="border-b border-hairline bg-wash p-4 text-left text-[12.5px] font-semibold text-ink-3">{r.label}</th>
                      {plans.map((p) => (
                        <td key={p.code} className={`border-b border-l border-hairline p-4 ${best === p.code ? "bg-bronze-wash" : ""}`}>
                          <span className="flex items-center gap-2">{r.get(p)}{best === p.code && <Icon name="star" fill className="text-bronze" />}</span>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="flex items-center gap-2 p-4 text-[12px] text-muted"><Icon name="star" fill className="text-bronze" /> ไฮไลต์ค่าที่คุ้มค่าที่สุดในแต่ละหัวข้อ</p>
          </div>
        )}
      </div>
    </section>
  );
}
