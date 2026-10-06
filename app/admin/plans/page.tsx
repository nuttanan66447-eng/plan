import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { baht, num, STYLE_LABEL } from "@/lib/format";
import type { Plan } from "@/lib/types";
import { AdminNav } from "../AdminNav";
import { requireAdmin } from "../guard";
import { NotAdmin } from "../NotAdmin";

export const dynamic = "force-dynamic";

export default async function AdminPlans({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string }> }) {
  const { sb, user, isAdmin } = await requireAdmin();
  if (!isAdmin) return <NotAdmin userId={user.id} />;
  const { saved, deleted } = await searchParams;
  const { data } = await sb.from("plans").select("*").order("sort_order");
  const plans = (data ?? []) as (Plan & { is_published: boolean; sort_order: number })[];

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
        <div className="mt-5 overflow-x-auto border border-hairline bg-white">
          <table className="w-full min-w-[760px] text-[13px]">
            <thead className="bg-wash text-left text-[11.5px] text-muted">
              <tr><th className="p-3">แบบ</th><th className="p-3">สไตล์ / สเปก</th><th className="p-3 text-right">ราคาชุดแบบ</th><th className="p-3">สถานะ</th><th className="p-3" /></tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id} className="border-t border-hairline hover:bg-wash/50">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-20 shrink-0 bg-wash-2"><Image src={p.image} alt="" fill sizes="80px" className="object-cover" /></div>
                      <div><p className="font-bold">{p.code}</p><p className="text-[12px] text-muted">{p.name_en} • {p.name_th}</p></div>
                    </div>
                  </td>
                  <td className="p-3 text-muted">{STYLE_LABEL[p.style]}<br />{num(p.area_sqm)} ตร.ม. • {p.bedrooms} นอน • {p.storeys} ชั้น</td>
                  <td className="p-3 text-right font-semibold">{baht(p.price)}</td>
                  <td className="p-3">{p.is_published ? <span className="bg-[#e9f5ee] px-2 py-0.5 text-[11px] font-semibold text-success">แสดงบนเว็บ</span> : <span className="bg-wash-3 px-2 py-0.5 text-[11px] font-semibold text-muted">ซ่อน</span>}</td>
                  <td className="p-3 text-right"><Link href={`/admin/plans/${p.id}`} className="btn btn-primary btn-sm"><Icon name="edit" /> แก้ไข</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
