import Link from "next/link";
import { notFound } from "next/navigation";
import { PlanEditor } from "@/components/admin/PlanEditor";
import type { Plan } from "@/lib/types";
import { AdminNav } from "../../AdminNav";
import { requireAdmin } from "../../guard";
import { NotAdmin } from "../../NotAdmin";

export const dynamic = "force-dynamic";

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { sb, user, isAdmin } = await requireAdmin();
  if (!isAdmin) return <NotAdmin userId={user.id} />;
  const { id } = await params;
  const { data } = await sb.from("plans").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const plan = data as Plan & { is_published: boolean; sort_order: number };
  return (
    <>
      <AdminNav email={user.email ?? ""} active="plans" />
      <section className="shell py-8">
        <Link href="/admin/plans" className="text-[13px] text-muted hover:text-ink">← กลับไปรายการแบบบ้าน</Link>
        <h1 className="mt-2 text-[24px] font-bold">แก้ไขแบบ {plan.code}</h1>
        <div className="mt-6"><PlanEditor key={plan.id} plan={plan} /></div>
      </section>
    </>
  );
}
