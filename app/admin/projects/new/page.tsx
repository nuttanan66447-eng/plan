import Link from "next/link";
import { ProjectEditor } from "@/components/admin/ProjectEditor";
import { AdminNav } from "../../AdminNav";
import { requireAdmin } from "../../guard";
import { NotAdmin } from "../../NotAdmin";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const { sb, user, isAdmin } = await requireAdmin();
  if (!isAdmin) return <NotAdmin userId={user.id} />;
  const [{ data }, { data: reviews }] = await Promise.all([
    sb.from("plans").select("code,name_en").order("sort_order"),
    sb.from("reviews").select("id,name,role,body,rating,is_published,plan_code").order("created_at", { ascending: false }),
  ]);
  return (
    <>
      <AdminNav email={user.email ?? ""} active="projects" />
      <section className="shell py-8">
        <Link href="/admin/projects" className="text-[13px] text-muted hover:text-ink">← กลับไปรายการผลงาน</Link>
        <h1 className="mt-2 text-[24px] font-bold">เพิ่มผลงานใหม่</h1>
        <div className="mt-6"><ProjectEditor plans={data ?? []} reviews={reviews ?? []} /></div>
      </section>
    </>
  );
}
