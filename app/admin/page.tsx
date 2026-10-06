import Link from "next/link";
import { Fragment } from "react";
import { Icon } from "@/components/Icon";
import { baht, LEAD_STATUS_LABEL, LEAD_TYPE_LABEL } from "@/lib/format";
import type { Lead } from "@/lib/types";
import { updateLead } from "./actions";
import { AdminNav } from "./AdminNav";
import { requireAdmin } from "./guard";
import { NotAdmin } from "./NotAdmin";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  new: "bg-bronze text-ink",
  contacted: "bg-[#dbe8ff] text-[#1b3f8a]",
  quoted: "bg-wash-3 text-ink",
  won: "bg-success text-white",
  lost: "bg-[#ffe1dc] text-danger",
};

export default async function AdminLeads({ searchParams }: { searchParams: Promise<{ status?: string; type?: string; q?: string }> }) {
  const { sb, user, isAdmin } = await requireAdmin();
  if (!isAdmin) return <NotAdmin userId={user.id} />;
  const { status, type, q } = await searchParams;

  let query = sb.from("leads").select("*").order("created_at", { ascending: false }).limit(200);
  if (status && status in LEAD_STATUS_LABEL) query = query.eq("status", status);
  if (type && type in LEAD_TYPE_LABEL) query = query.eq("type", type);
  if (q) {
    const t = q.replace(/[%,()]/g, " ").trim();
    if (t) query = query.or(`name.ilike.%${t}%,phone.ilike.%${t}%,plan_code.ilike.%${t}%,email.ilike.%${t}%`);
  }
  const [{ data }, { data: counts }] = await Promise.all([query, sb.from("leads").select("status")]);
  const leads = (data ?? []) as Lead[];
  const tally = (counts ?? []).reduce<Record<string, number>>((a, r) => ((a[r.status] = (a[r.status] ?? 0) + 1), a), {});
  const href = (p: Record<string, string | undefined>) => {
    const n = new URLSearchParams(Object.entries({ status, type, q, ...p }).filter(([, v]) => v) as [string, string][]);
    return `/admin${n.size ? `?${n}` : ""}`;
  };

  return (
    <>
      <AdminNav email={user.email ?? ""} active="leads" />
      <section className="shell py-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {Object.entries(LEAD_STATUS_LABEL).map(([k, l]) => (
            <Link key={k} href={href({ status: status === k ? undefined : k })} className={`card p-4 ${status === k ? "border-ink shadow-edge" : "hover:border-ink"}`}>
              <p className="text-[12px] text-muted">{l}</p><p className="font-display text-[26px] font-bold">{tally[k] ?? 0}</p>
            </Link>
          ))}
        </div>
        <form className="mt-5 flex flex-wrap gap-2" action="/admin">
          {status && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={q} placeholder="ค้นหาชื่อ เบอร์ อีเมล รหัสแบบ" className="input !w-auto flex-1" />
          <select name="type" defaultValue={type ?? ""} className="input !w-auto">
            <option value="">ทุกประเภท</option>
            {Object.entries(LEAD_TYPE_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
          <button className="btn btn-primary btn-sm">กรอง</button>
          {(status || type || q) && <Link href="/admin" className="btn btn-ghost btn-sm">ล้าง</Link>}
        </form>

        <div className="mt-5 space-y-3">
          {leads.map((l) => (
            <details key={l.id} className="card group">
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 p-4">
                <span className={`px-2 py-0.5 text-[11px] font-bold ${STATUS_STYLE[l.status]}`}>{LEAD_STATUS_LABEL[l.status]}</span>
                <span className="chip">{LEAD_TYPE_LABEL[l.type]}</span>
                <b className="text-[14.5px]">{l.name}</b>
                <a href={`tel:${l.phone}`} className="text-[13px] text-bronze-dark hover:underline">{l.phone}</a>
                {l.plan_code && <span className="text-[12px] text-muted">{l.plan_code}</span>}
                {l.estimate_thb != null && <span className="text-[12px] font-semibold">{baht(l.estimate_thb)}</span>}
                <span className="ml-auto text-[12px] text-muted">{new Date(l.created_at).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" })}</span>
                <Icon name="expand_more" className="transition-transform group-open:rotate-180" />
              </summary>
              <div className="grid gap-5 border-t border-hairline p-4 md:grid-cols-[1fr_320px]">
                <dl className="grid grid-cols-[140px_1fr] gap-x-3 gap-y-1.5 text-[13px]">
                  {([["อีเมล", l.email], ["LINE", l.line_id], ["จังหวัด", l.province], ["อำเภอ/ตำบล", l.district], ["แพ็กเกจ", l.service_package], ["ที่ดิน", l.land_width ? `${l.land_width} x ${l.land_depth} ม.` : null], ["พื้นที่", l.area_sqm ? `${l.area_sqm} ตร.ม.` : null], ["งบ/ข้อมูล", l.budget], ["วันนัด", l.preferred_date ? `${l.preferred_date} ${l.preferred_slot ?? ""}` : l.preferred_slot], ["ข้อความ", l.message]] as [string, string | null][])
                    .filter(([, v]) => v).map(([k, v]) => (<Fragment key={k}><dt className="text-muted">{k}</dt><dd className="whitespace-pre-wrap">{v}</dd></Fragment>))}
                  {Object.entries(l.meta ?? {}).map(([k, v]) => (<Fragment key={`m-${k}`}><dt className="text-muted">{k}</dt><dd>{String(v)}</dd></Fragment>))}
                </dl>
                <form action={updateLead} className="space-y-3 bg-wash p-4">
                  <input type="hidden" name="id" value={l.id} />
                  <div className="field"><label className="field-label" htmlFor={`s-${l.id}`}>สถานะ</label>
                    <select id={`s-${l.id}`} name="status" defaultValue={l.status} className="input">
                      {Object.entries(LEAD_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select></div>
                  <div className="field"><label className="field-label" htmlFor={`n-${l.id}`}>บันทึกภายใน</label>
                    <textarea id={`n-${l.id}`} name="admin_note" defaultValue={l.admin_note ?? ""} className="input min-h-[80px]" /></div>
                  <button className="btn btn-primary btn-sm w-full">บันทึก</button>
                </form>
              </div>
            </details>
          ))}
          {!leads.length && <p className="card p-10 text-center text-muted">ยังไม่มีคำขอที่ตรงกับเงื่อนไข</p>}
        </div>
      </section>
    </>
  );
}
