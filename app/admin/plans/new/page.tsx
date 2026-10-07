import Link from "next/link";
import { PlanEditor } from "@/components/admin/PlanEditor";
import { AdminNav } from "../../AdminNav";
import { requireAdmin } from "../../guard";
import { NotAdmin } from "../../NotAdmin";

export const dynamic = "force-dynamic";

export default async function NewPlanPage() {
  const { sb, user, isAdmin } = await requireAdmin();
  if (!isAdmin) return <NotAdmin userId={user.id} />;
  // existing codes so the next free code (e.g. AP-MODERN-05) can be suggested
  const { data } = await sb.from("plans").select("code");
  return (
    <>
      <AdminNav email={user.email ?? ""} active="plans" />
      <section className="shell py-8">
        <Link href="/admin/plans" className="text-[13px] text-muted hover:text-ink">← กลับไปรายการแบบบ้าน</Link>
        <h1 className="mt-2 text-[24px] font-bold">เพิ่มแบบบ้านใหม่</h1>
        <div className="mt-6"><PlanEditor codes={(data ?? []).map((p) => p.code as string)} /></div>
      </section>
    </>
  );
}
