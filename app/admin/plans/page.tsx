import Link from "next/link";
import { Suspense } from "react";
import { Icon } from "@/components/Icon";
import { AdminNav } from "../AdminNav";
import { requireAdmin } from "../guard";
import { NotAdmin } from "../NotAdmin";
import { PlanTable, type AdminPlanRow } from "./PlanTable";

export const dynamic = "force-dynamic";

export default async function AdminPlans({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string }> }) {
  const { sb, user, isAdmin } = await requireAdmin();
  if (!isAdmin) return <NotAdmin userId={user.id} />;
  const { saved, deleted } = await searchParams;
  const { data } = await sb
    .from("plans")
    .select("id,code,name_en,name_th,series,style,storeys,area_sqm,bedrooms,price,image,model_url,floorplan_images,section_image,is_published,sort_order,created_at")
    .order("sort_order");
  const plans = (data ?? []) as AdminPlanRow[];

  return (
    <>
      <AdminNav email={user.email ?? ""} active="plans" />
      <section className="shell py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-bold">แบบบ้านทั้งหมด ({plans.length})</h1>
            <p className="text-[13px] text-muted">เพิ่ม แก้ไข ซ่อน หรือลบแบบบ้าน — หน้าเว็บอัปเดตทันทีหลังบันทึก</p>
          </div>
          <Link href="/admin/plans/new" className="btn btn-bronze"><Icon name="add" /> เพิ่มแบบบ้านใหม่</Link>
        </div>
        {saved && <p className="mt-4 flex items-center gap-2 border border-success/30 bg-[#f1f8f3] px-3 py-2 text-[13px] text-success"><Icon name="check_circle" /> เพิ่มแบบ {saved} เรียบร้อย</p>}
        {deleted != null && <p className="mt-4 flex items-center gap-2 border border-hairline bg-wash px-3 py-2 text-[13px]"><Icon name="delete" /> ลบแบบ {deleted} แล้ว</p>}
        <Suspense><PlanTable plans={plans} /></Suspense>
      </section>
    </>
  );
}
