import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectEditor } from "@/components/admin/ProjectEditor";
import type { Project } from "@/lib/types";
import { AdminNav } from "../../AdminNav";
import { requireAdmin } from "../../guard";
import { NotAdmin } from "../../NotAdmin";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { sb, user, isAdmin } = await requireAdmin();
  if (!isAdmin) return <NotAdmin userId={user.id} />;
  const { id } = await params;
  const [{ data }, { data: plans }] = await Promise.all([
    sb.from("projects").select("*").eq("id", id).maybeSingle(),
    sb.from("plans").select("code,name_en").order("sort_order"),
  ]);
  if (!data) notFound();
  const project = data as Project & { is_published: boolean; sort_order: number };
  return (
    <>
      <AdminNav email={user.email ?? ""} active="projects" />
      <section className="shell py-8">
        <Link href="/admin/projects" className="text-[13px] text-muted hover:text-ink">← กลับไปรายการผลงาน</Link>
        <h1 className="mt-2 text-[24px] font-bold">แก้ไขผลงาน {project.code}</h1>
        <div className="mt-6"><ProjectEditor key={project.id} project={project} plans={plans ?? []} /></div>
      </section>
    </>
  );
}
