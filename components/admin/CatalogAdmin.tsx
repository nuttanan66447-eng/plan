import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminNav } from "@/app/admin/AdminNav";
import { requireAdmin } from "@/app/admin/guard";
import { NotAdmin } from "@/app/admin/NotAdmin";
import { Icon } from "@/components/Icon";
import { CATALOG, type CatalogKind } from "@/lib/catalog";
import { baht } from "@/lib/format";
import { CatalogEditor } from "./CatalogEditor";

type Row = Record<string, unknown> & { id: string; slug: string; image: string | null; price: number; is_published: boolean };

const ACTIVE = { course: "courses", product: "products" } as const;

export async function CatalogListPage({ kind, searchParams }: { kind: CatalogKind; searchParams: Promise<{ saved?: string; deleted?: string }> }) {
  const cfg = CATALOG[kind];
  const { sb, user, isAdmin } = await requireAdmin();
  if (!isAdmin) return <NotAdmin userId={user.id} />;
  const { saved, deleted } = await searchParams;
  const { data } = await sb.from(cfg.table).select("*").order("sort_order");
  const rows = (data ?? []) as Row[];
  return (
    <>
      <AdminNav email={user.email ?? ""} active={ACTIVE[kind]} />
      <section className="shell py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-bold">{kind === "course" ? "คอร์สเรียน" : "สินค้าในร้านค้า"} ({rows.length})</h1>
            <p className="text-[13px] text-muted">แสดงที่หน้า <Link href={cfg.publicPath} target="_blank" className="text-bronze-dark underline">{cfg.publicPath}</Link> • {kind === "course" ? "ใบสมัครเข้ามาที่ “คำขอ / ลูกค้า” ประเภท “สมัครคอร์สเรียน”" : "คำสั่งซื้อเข้ามาที่ “คำขอ / ลูกค้า” พร้อมเลขที่คำสั่งซื้อและการติดตามจัดส่ง"}</p>
          </div>
          <Link href={`${cfg.adminPath}/new`} className="btn btn-bronze"><Icon name="add" /> เพิ่ม{cfg.label}</Link>
        </div>
        {saved && <p className="mt-4 flex items-center gap-2 border border-success/30 bg-[#f1f8f3] px-3 py-2 text-[13px] text-success"><Icon name="check_circle" /> เพิ่ม “{saved}” เรียบร้อย</p>}
        {deleted != null && <p className="mt-4 flex items-center gap-2 border border-hairline bg-wash px-3 py-2 text-[13px]"><Icon name="delete" /> ลบ “{deleted}” แล้ว</p>}
        <div className="mt-5 overflow-x-auto border border-hairline bg-white">
          <table className="w-full min-w-[640px] text-[13px]">
            <thead className="bg-wash text-left text-[11.5px] text-muted">
              <tr><th className="p-3">{cfg.label}</th><th className="p-3">หมวด</th><th className="p-3 text-right">ราคา</th><th className="p-3">สถานะ</th><th className="p-3" /></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-hairline hover:bg-wash/50">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative grid h-12 w-16 shrink-0 place-items-center bg-wash-2">
                        {r.image ? <Image src={r.image} alt="" fill sizes="64px" className="object-cover" /> : <Icon name={kind === "course" ? "school" : "inventory_2"} className="text-muted" />}
                      </div>
                      <div><p className="font-bold">{String(r[cfg.titleField])}</p><p className="text-[11.5px] text-muted">{cfg.publicPath}/{r.slug}</p></div>
                    </div>
                  </td>
                  <td className="p-3 text-muted">{String(r.category ?? "-")}</td>
                  <td className="p-3 text-right font-semibold">{r.price ? baht(r.price) : "ฟรี"}</td>
                  <td className="p-3">
                    {r.is_published ? <span className="bg-[#e9f5ee] px-2 py-0.5 text-[11px] font-semibold text-success">แสดงบนเว็บ</span> : <span className="bg-wash-3 px-2 py-0.5 text-[11px] font-semibold text-muted">ซ่อน</span>}
                    {kind === "product" && r.stock === 0 && <span className="ml-1 bg-[#ffe1dc] px-2 py-0.5 text-[11px] font-semibold text-danger">หมด</span>}
                  </td>
                  <td className="p-3 text-right"><Link href={`${cfg.adminPath}/${r.id}`} className="btn btn-primary btn-sm"><Icon name="edit" /> แก้ไข</Link></td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={5} className="p-10 text-center text-muted">ยังไม่มี{cfg.label}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export async function CatalogEditPage({ kind, id }: { kind: CatalogKind; id?: string }) {
  const cfg = CATALOG[kind];
  const { sb, user, isAdmin } = await requireAdmin();
  if (!isAdmin) return <NotAdmin userId={user.id} />;
  let item: Row | undefined;
  if (id) {
    const { data } = await sb.from(cfg.table).select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    item = data as Row;
  }
  return (
    <>
      <AdminNav email={user.email ?? ""} active={ACTIVE[kind]} />
      <section className="shell py-8">
        <Link href={cfg.adminPath} className="text-[13px] text-muted hover:text-ink">← กลับไปรายการ{cfg.label}</Link>
        <h1 className="mt-2 text-[24px] font-bold">{item ? `แก้ไข${cfg.label}: ${String(item[cfg.titleField])}` : `เพิ่ม${cfg.label}ใหม่`}</h1>
        <div className="mt-6"><CatalogEditor key={item?.id ?? "new"} kind={kind} item={item} /></div>
      </section>
    </>
  );
}
