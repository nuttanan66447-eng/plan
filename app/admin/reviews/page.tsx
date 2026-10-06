import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Stars } from "@/components/ReviewList";
import type { Review } from "@/lib/types";
import { moderateReview } from "../actions";
import { AdminNav } from "../AdminNav";
import { requireAdmin } from "../guard";
import { NotAdmin } from "../NotAdmin";

export const dynamic = "force-dynamic";

export default async function AdminReviews({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const { sb, user, isAdmin } = await requireAdmin();
  if (!isAdmin) return <NotAdmin userId={user.id} />;
  const { show = "pending" } = await searchParams;
  const { data } = await sb.from("reviews").select("*").order("created_at", { ascending: false });
  const all = (data ?? []) as Review[];
  const pending = all.filter((r) => !r.is_published);
  const list = show === "published" ? all.filter((r) => r.is_published) : show === "all" ? all : pending;
  const tabs = [["pending", `รอตรวจสอบ (${pending.length})`], ["published", `เผยแพร่แล้ว (${all.length - pending.length})`], ["all", "ทั้งหมด"]];

  return (
    <>
      <AdminNav email={user.email ?? ""} active="reviews" />
      <section className="shell py-8">
        <h1 className="text-[22px] font-bold">รีวิวจากลูกค้า</h1>
        <p className="text-[13px] text-muted">ลูกค้าเขียนรีวิวได้ที่หน้า “ผลงานที่สร้างจริง” และหน้าแบบบ้านแต่ละแบบ — รีวิวใหม่จะยังไม่แสดงจนกว่าจะกด “เผยแพร่”</p>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {tabs.map(([k, l]) => <Link key={k} href={`/admin/reviews?show=${k}`} className={`chip h-9 ${show === k ? "chip-active" : "hover:border-ink"}`}>{l}</Link>)}
        </div>
        <div className="mt-5 space-y-3">
          {list.map((r) => (
            <div key={r.id} className={`card grid gap-4 p-5 md:grid-cols-[1fr_auto] ${r.is_published ? "" : "border-bronze"}`}>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <Stars n={r.rating} />
                  <b>{r.name}</b>
                  <span className="text-[12px] text-muted">{[r.role, r.district, r.project_type, r.plan_code].filter(Boolean).join(" • ")}</span>
                  {!r.is_published && <span className="bg-bronze px-2 py-0.5 text-[10.5px] font-bold text-ink">รอตรวจสอบ</span>}
                </div>
                <p className="mt-2 whitespace-pre-line text-[13.5px] text-ink-3">{r.body}</p>
                {r.created_at && <p className="mt-2 text-[11px] text-subtle">ส่งเมื่อ {new Date(r.created_at).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" })}</p>}
              </div>
              <div className="flex items-start gap-2">
                <form action={moderateReview}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="op" value={r.is_published ? "hide" : "publish"} />
                  <button className={`btn btn-sm ${r.is_published ? "btn-ghost" : "btn-primary"}`}><Icon name={r.is_published ? "visibility_off" : "check"} /> {r.is_published ? "ซ่อน" : "เผยแพร่"}</button>
                </form>
                <form action={moderateReview}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="op" value="delete" />
                  <button className="btn btn-sm border-danger text-danger hover:bg-danger hover:text-white" aria-label="ลบรีวิว"><Icon name="delete" /></button>
                </form>
              </div>
            </div>
          ))}
          {!list.length && <p className="card p-10 text-center text-muted">ไม่มีรีวิวในหมวดนี้</p>}
        </div>
      </section>
    </>
  );
}
