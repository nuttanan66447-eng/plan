import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { PlanEditor } from "@/components/admin/PlanEditor";
import type { Plan } from "@/lib/types";
import { AdminNav } from "../../AdminNav";
import { requireAdmin } from "../../guard";
import { NotAdmin } from "../../NotAdmin";

export const dynamic = "force-dynamic";

export default async function EditPlanPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const { sb, user, isAdmin } = await requireAdmin();
  if (!isAdmin) return <NotAdmin userId={user.id} />;
  const { id } = await params;
  const { created } = await searchParams;
  const [{ data }, { count: boqCount }] = await Promise.all([
    sb.from("plans").select("*").eq("id", id).maybeSingle(),
    sb.from("boq_items").select("id", { count: "exact", head: true }).eq("plan_id", id),
  ]);
  if (!data) notFound();
  const plan = data as Plan & { is_published: boolean; sort_order: number };
  return (
    <>
      <AdminNav email={user.email ?? ""} active="plans" />
      <section className="shell py-8">
        <Link href="/admin/plans" className="text-[13px] text-muted hover:text-ink">← กลับไปรายการแบบบ้าน</Link>
        <h1 className="mt-2 text-[24px] font-bold">แก้ไขแบบ {plan.code}</h1>
        {created && (
          <p className="mt-3 flex items-center gap-2 border border-success/30 bg-[#f1f8f3] px-3 py-2 text-[13px] text-success">
            <Icon name="check_circle" /> เพิ่มแบบ {plan.code} เรียบร้อย — เพิ่มแปลน รูปภาพ หรือนำเข้า BOQ (หัวข้อ 4) ต่อได้เลย
          </p>
        )}
        <div className="mt-6"><PlanEditor key={plan.id} plan={plan} boqCount={boqCount ?? 0} /></div>
      </section>
    </>
  );
}
