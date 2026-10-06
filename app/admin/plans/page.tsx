import Image from "next/image";
import Link from "next/link";
import { num } from "@/lib/format";
import type { Plan } from "@/lib/types";
import { updatePlan } from "../actions";
import { AdminNav } from "../AdminNav";
import { requireAdmin } from "../guard";
import { NotAdmin } from "../NotAdmin";

export const dynamic = "force-dynamic";

export default async function AdminPlans() {
  const { sb, user, isAdmin } = await requireAdmin();
  if (!isAdmin) return <NotAdmin userId={user.id} />;
  const { data } = await sb.from("plans").select("*").order("sort_order");
  const plans = (data ?? []) as (Plan & { is_published: boolean })[];

  return (
    <>
      <AdminNav email={user.email ?? ""} active="plans" />
      <section className="shell py-8">
        <h1 className="text-[22px] font-bold">จัดการแบบบ้าน ({plans.length})</h1>
        <p className="text-[13px] text-muted">ปรับราคาชุดแบบและสถานะการเผยแพร่ หน้าเว็บจะอัปเดตทันทีหลังบันทึก</p>
        <div className="mt-5 overflow-x-auto border border-hairline bg-white">
          <table className="w-full min-w-[760px] text-[13px]">
            <thead className="bg-wash text-left text-[11.5px] text-muted">
              <tr><th className="p-3">แบบ</th><th className="p-3">สเปก</th><th className="p-3">ราคาชุดแบบ (บาท)</th><th className="p-3">เผยแพร่</th><th className="p-3" /></tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id} className="border-t border-hairline">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-20 shrink-0"><Image src={p.image} alt="" fill sizes="80px" className="object-cover" /></div>
                      <div><Link href={`/plans/${p.code}`} className="font-bold hover:text-bronze-dark">{p.code}</Link><p className="text-[12px] text-muted">{p.name_en}</p></div>
                    </div>
                  </td>
                  <td className="p-3 text-muted">{num(p.area_sqm)} ตร.ม. • {p.bedrooms} นอน • {p.storeys} ชั้น</td>
                  <td className="p-3" colSpan={3}>
                    <form action={updatePlan} className="flex items-center gap-4">
                      <input type="hidden" name="id" value={p.id} />
                      <input name="price" type="number" min={1} defaultValue={p.price} className="input !w-32" aria-label={`ราคา ${p.code}`} />
                      <label className="flex items-center gap-2"><input type="checkbox" name="is_published" defaultChecked={p.is_published} className="check" /> แสดง</label>
                      <button className="btn btn-primary btn-sm ml-auto">บันทึก</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
