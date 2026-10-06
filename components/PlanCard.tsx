import Image from "next/image";
import Link from "next/link";
import { baht, millions, num } from "@/lib/format";
import type { Plan } from "@/lib/types";
import { CompareToggle } from "./CompareControls";
import { Icon } from "./Icon";

export function PlanCard({ plan, priority = false }: { plan: Plan; priority?: boolean }) {
  const has3d = plan.features.includes("tour360");
  const dollhouse = plan.features.includes("dollhouse");
  return (
    <article className="card card-hover group flex flex-col">
      <Link href={`/plans/${plan.code}`} className="relative block aspect-[16/10] overflow-hidden bg-wash-2">
        <Image
          src={plan.image}
          alt={`${plan.code} ${plan.name_en}`}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 420px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
        {plan.badge && <span className="absolute left-3 top-3 bg-bronze px-2 py-1 text-[10px] font-bold tracking-[0.1em] text-ink">{plan.badge}</span>}
        {(has3d || dollhouse) && (
          <span className="absolute right-3 top-3 flex items-center gap-1.5 bg-ink px-2 py-1 text-[10px] font-semibold tracking-[0.08em] text-white">
            <Icon name={dollhouse ? "deployed_code" : "view_in_ar"} className="text-bronze" />
            {dollhouse ? "3D BIM CAD MODEL" : "หมุน 3D INTERACTIVE"}
          </span>
        )}
        <div className="absolute inset-x-4 bottom-3 text-white">
          <p className="label-tech text-bronze-light">{plan.series}</p>
          <h3 className="mt-0.5 text-[18px] font-bold leading-snug">
            {plan.code} <span className="font-medium text-white/85">({plan.name_en})</span>
          </h3>
        </div>
      </Link>
      <div className="tech-strip bg-wash">
        <div>
          <p className="text-[10px] text-muted">พื้นที่ใช้สอย</p>
          <p className="text-[16px] font-bold">{num(plan.area_sqm)} <span className="text-[11px] font-normal text-muted">ตร.ม.</span></p>
        </div>
        <div>
          <p className="text-[10px] text-muted">ห้องนอน/ห้องน้ำ</p>
          <p className="text-[16px] font-bold">{plan.bedrooms} นอน <span className="text-[11px] font-normal text-muted">/ {plan.bathrooms} น้ำ</span></p>
        </div>
        <div>
          <p className="text-[10px] text-muted">{plan.storeys} ชั้น • ที่ดินขั้นต่ำ</p>
          <p className="text-[16px] font-bold">{plan.min_land_sqwa ? num(plan.min_land_sqwa) : "-"} <span className="text-[11px] font-normal text-muted">ตร.ว.</span></p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-baseline justify-between text-[13px]">
          <span className="text-muted">ราคาค่าก่อสร้างประเมิน</span>
          <span className="font-semibold">{millions(plan.build_cost_min, plan.build_cost_max)}</span>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-[13px] text-muted">ค่าแบบแปลนพิมพ์เขียว + BOQ</span>
          <span className="text-right">
            <span className="block font-display text-[22px] font-bold text-bronze-dark">{baht(plan.price)}</span>
            <span className="block text-[10px] text-subtle">รวมภาษีมูลค่าเพิ่มแล้ว</span>
          </span>
        </div>
        <div className="mt-auto grid grid-cols-[1fr_auto] gap-2 pt-3">
          <Link href={`/plans/${plan.code}`} className="btn btn-primary btn-sm">
            <Icon name={dollhouse ? "deployed_code" : "visibility"} /> ดูแปลน &amp; โมเดล 3D
          </Link>
          <CompareToggle code={plan.code} area={plan.area_sqm} />
        </div>
      </div>
    </article>
  );
}
