import Link from "next/link";
import { PlanEditor } from "@/components/admin/PlanEditor";
import { AdminNav } from "../../AdminNav";
import { requireAdmin } from "../../guard";
import { NotAdmin } from "../../NotAdmin";

export const dynamic = "force-dynamic";

export default async function NewPlanPage() {
  const { user, isAdmin } = await requireAdmin();
  if (!isAdmin) return <NotAdmin userId={user.id} />;
  return (
    <>
      <AdminNav email={user.email ?? ""} active="plans" />
      <section className="shell py-8">
        <Link href="/admin/plans" className="text-[13px] text-muted hover:text-ink">← กลับไปรายการแบบบ้าน</Link>
        <h1 className="mt-2 text-[24px] font-bold">เพิ่มแบบบ้านใหม่</h1>
        <div className="mt-6"><PlanEditor /></div>
      </section>
    </>
  );
}
